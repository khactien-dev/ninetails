import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'libs/common/common.interface';
import { DataSource, Repository } from 'typeorm';
import {
  POINTCOLUMN,
  PointCreateDto,
  PointQueryDto,
  PointUpdateDto,
} from '../dtos/point.dto';
import { PointEntity } from 'libs/entities/point.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { RevertDataService } from '../../revert-data/revert.service';
import { EOPERATOR } from 'libs/common/constants/common.constant';

@Injectable()
export class PointService {
  constructor(
    @Inject('POINT_REPO') private pointEntity: Repository<PointEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: PointCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const points = [];
      for (const data of datas) {
        const segment = await manage.findOne(SegmentEntity, {
          where: { id: data.segment_id },
        });
        if (!segment) throw new BadRequestException('Segment is not exists');
        const check = await manage.findOne(PointEntity, {
          where: { name: data.name },
        });
        if (check) throw new BadRequestException('Point name is exists');
        const point = await manage.save(this.pointEntity.create(data));
        await this.revertService.createWithTransaction(
          {
            table: 'point',
            new_data: point,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        points.push(point);
      }
      await queryRunner.commitTransaction();
      return points;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: PointQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (column === POINTCOLUMN.NAME && typeof value !== 'string') {
          return { list: [], total: 0 };
        }
        if (['point_index', 'segment_id', 'id'].includes(column)) {
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
          if (operator === EOPERATOR.EQUALS && column === POINTCOLUMN.NAME) {
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
    const builder = this.pointEntity.createQueryBuilder();
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

  async updateMany(datas: PointUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const point = await manage.findOne(PointEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!point) throw new BadRequestException('Point Not Found');
        if (data.name && data.name !== point.name) {
          const check = await manage.findOne(PointEntity, {
            where: { name: data.name },
          });
          if (check) throw new BadRequestException('Point name is exists');
        }
        if (data.segment_id && data.segment_id !== point.segment_id) {
          const segment = await manage.findOne(SegmentEntity, {
            where: { id: data.segment_id },
          });
          if (!segment) throw new BadRequestException('Segment Not Found');
        }
        await manage.update(PointEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'point',
            new_data: data,
            old_data: point,
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
        const point = await manage.findOne(PointEntity, {
          where: { id },
        });
        if (!point) throw new BadRequestException('Point Not Found');
        await manage.softDelete(PointEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'point',
            new_data: null,
            old_data: point,
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
