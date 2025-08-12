import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'libs/common/common.interface';
import { DataSource, Repository } from 'typeorm';
import { SectionEntity } from 'libs/entities/section.entity';
import {
  SECTIONCOLUMN,
  SectionCreateDto,
  SectionQueryDto,
  SectionUpdateDto,
} from '../dtos/section.dto';
import { RouteEntity } from 'libs/entities/route.entity';
import { RevertDataService } from '../../revert-data/revert.service';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';

@Injectable()
export class SectionService {
  constructor(
    @Inject('SECTION_REPO') private sectionEntity: Repository<SectionEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: SectionCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const sections = [];
      for (const data of datas) {
        if (data.route_id > 0) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route not found');
        }
        const check = await manage.findOne(SectionEntity, {
          where: { name: data.name },
        });
        if (check) throw new BadRequestException('Section name is exists');
        if (data.congestion) {
          const congestion = await manage.findOne(CongestionCodeEntity, {
            where: { code: data.congestion },
          });
          if (!congestion) {
            throw new BadRequestException('Congestion is not exists');
          }
        }
        const section = await manage.save(this.sectionEntity.create(data));
        await this.revertService.createWithTransaction(
          {
            table: 'section',
            new_data: section,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        sections.push(section);
      }
      await queryRunner.commitTransaction();
      return sections;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: SectionQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (column === SECTIONCOLUMN.NAME && typeof value !== 'string') {
          return { list: [], total: 0 };
        }
        if (column !== SECTIONCOLUMN.NAME) {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          if (operator === EOPERATOR.EQUALS && column === SECTIONCOLUMN.NAME) {
            where +=
              (where ? ` ${logical} ` : '') +
              `${column} ${operator} '${value}'`;
          } else {
            where +=
              (where ? ` ${logical} ` : '') + `${column} ${operator} ${value}`;
          }
        }
      }
    }
    const builder = this.sectionEntity.createQueryBuilder();
    if (where) builder.where(where);
    const [list, total] = await builder
      .take(paginate.take)
      .skip(paginate.skip)
      .orderBy(
        Object.keys(paginate.order)[0],
        Object.values(paginate.order)[0] as any,
      )
      .getManyAndCount();
    return {
      list: list.map((l) => ({
        ...l,
        collect_volume: +l.collect_volume,
        duration: +l.duration,
        distance: +l.distance,
        congestion: +l.congestion,
      })),
      total,
    };
  }

  async updateMany(datas: SectionUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const section = await manage.findOne(SectionEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!section) throw new BadRequestException('Section Not Found');
        if (data.route_id > 0 && data.route_id !== section.route_id) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route Not Found');
        }
        if (data.name && section.name !== data.name) {
          const check = await manage.findOne(SectionEntity, {
            where: { name: data.name },
          });
          if (check) throw new BadRequestException('Section name is exists');
        }
        if (data.congestion && data.congestion !== section.congestion) {
          const congestion = await manage.findOne(CongestionCodeEntity, {
            where: { code: data.congestion },
          });
          if (!congestion) {
            throw new BadRequestException('Congestion Not Found');
          }
        }
        await manage.update(SectionEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'section',
            new_data: data,
            old_data: section,
            type: 'update',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteMany(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const id of ids) {
        const section = await manage.findOne(SectionEntity, {
          where: { id },
        });
        if (!section) throw new BadRequestException('Point Not Found');
        await manage.softDelete(SectionEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'section',
            new_data: null,
            old_data: section,
            type: 'delete',
          },
          manage,
        );
      }
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
