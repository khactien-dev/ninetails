import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RouteEntity } from 'libs/entities/route.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { RevertDataService } from '../../revert-data/revert.service';
import { IPaginate } from 'libs/common/common.interface';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import {
  CORESECTIONCOLUMN,
  CoreSectionCreateDto,
  CoreSectionQueryDto,
  CoreSectionUpdateDto,
} from '../dtos/core-section-dto';

@Injectable()
export class CoreSectionService {
  constructor(
    @Inject('CORE_SECTION_REPO')
    private coreSectionEntity: Repository<CoreSectionEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: CoreSectionCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const coreSections = [];
      for (const data of datas) {
        const check = await manage.findOne(CoreSectionEntity, {
          where: { name: data.name },
        });
        if (check) throw new BadRequestException('core section name is exists');
        const segment = await manage.findOne(SegmentEntity, {
          where: { id: data.segment_id },
        });
        if (!segment) throw new BadRequestException('Segment not found');
        if (data.route_id > 0) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route not found');
        }
        const coreSection = await manage.save(
          this.coreSectionEntity.create(data),
        );
        await this.revertService.createWithTransaction(
          {
            table: 'core_section',
            new_data: coreSection,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        coreSections.push(coreSection);
      }
      await queryRunner.commitTransaction();
      return coreSections;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: CoreSectionQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let value = obj.value;
        const logical = obj.logical || 'AND';
        if (column !== 'name') {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          }
          value = +value as any;
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          if (
            operator === EOPERATOR.EQUALS &&
            column === CORESECTIONCOLUMN.NAME
          ) {
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
    const builder = this.coreSectionEntity.createQueryBuilder();
    if (where) builder.where(where);
    const [list, total] = await builder
      .take(paginate.take)
      .skip(paginate.skip)
      .orderBy(
        Object.keys(paginate.order)[0],
        Object.values(paginate.order)[0] as any,
      )
      .getManyAndCount();
    return { list, total };
  }

  async updateMany(datas: CoreSectionUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const coreSection = await manage.findOne(CoreSectionEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!coreSection) {
          throw new BadRequestException('Core section not found');
        }
        if (data.route_id > 0 && data.route_id !== coreSection.route_id) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route not found');
        }
        if (data.segment_id && data.segment_id !== coreSection.segment_id) {
          const segment = await manage.findOne(SegmentEntity, {
            where: { id: data.segment_id },
          });
          if (!segment) throw new BadRequestException('Segment not found');
        }
        if (data.name && data.name !== coreSection.name) {
          const check = await manage.findOne(CoreSectionEntity, {
            where: { name: data.name },
          });
          if (check) {
            throw new BadRequestException('core section name is exists');
          }
        }
        await manage.update(CoreSectionEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'core_section',
            new_data: data,
            old_data: coreSection,
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
        const coreSection = await manage.findOne(CoreSectionEntity, {
          where: { id },
        });
        if (!coreSection) {
          throw new BadRequestException('Core Section Not Found');
        }
        await manage.softDelete(CoreSectionEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'core_section',
            new_data: null,
            old_data: coreSection,
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
