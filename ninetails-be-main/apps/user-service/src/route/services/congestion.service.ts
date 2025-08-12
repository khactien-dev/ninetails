import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RevertDataService } from '../../revert-data/revert.service';
import { IPaginate } from 'libs/common/common.interface';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';
import {
  CONGESTIONCOLUMN,
  CongestionCreateDto,
  CongestionQueryDto,
  CongestionUpdateDto,
} from '../dtos/congestion.dto';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { SectionEntity } from 'libs/entities/section.entity';

@Injectable()
export class CongestionService {
  constructor(
    @Inject('CONGESTION_REPO')
    private congestionEntity: Repository<CongestionCodeEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: CongestionCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const congestions = [];
      for (const data of datas) {
        const check = await manage.findOne(CongestionCodeEntity, {
          where: { code: data.code },
        });
        if (check) throw new BadRequestException('code must be unique');
        const congestion = await manage.save(
          this.congestionEntity.create(data),
        );
        await this.revertService.createWithTransaction(
          {
            table: 'congestion_code',
            new_data: congestion,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        congestions.push(congestion);
      }
      await queryRunner.commitTransaction();
      return congestions;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: CongestionQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let value = obj.value;
        const logical = obj.logical || 'AND';
        if (column === 'code') {
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
            column === CONGESTIONCOLUMN.DESCRIPTION
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
    const builder = this.congestionEntity.createQueryBuilder();
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

  async updateMany(datas: CongestionUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const congestion = await manage.findOne(CongestionCodeEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!congestion) {
          throw new BadRequestException('Congestion code not found');
        }
        if (+data.code !== congestion.code) {
          const check = await manage.findOne(CongestionCodeEntity, {
            where: { code: data.code },
          });
          if (check) {
            throw new BadRequestException('Code is exists');
          }
        }
        await manage.update(CongestionCodeEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'congestion_code',
            new_data: data,
            old_data: congestion,
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
        const congestion = await manage.findOne(CongestionCodeEntity, {
          where: { id },
        });
        if (!congestion) {
          throw new BadRequestException('Core Section Not Found');
        }
        const checkSegment = await manage.findOne(SegmentEntity, {
          where: { congestion: congestion.code },
        });
        if (checkSegment) {
          throw new BadRequestException(
            'Congestion Code in use at Segment table',
          );
        }
        const checkSection = await manage.findOne(SectionEntity, {
          where: { congestion: congestion.code },
        });
        if (checkSection) {
          throw new BadRequestException(
            'Congestion Code in use at Section table',
          );
        }
        await manage.softDelete(CongestionCodeEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'congestion_code',
            new_data: null,
            old_data: congestion,
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
