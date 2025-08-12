import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'libs/common/common.interface';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { DataSource, In, Repository } from 'typeorm';
import {
  SEGMENTCOLUMN,
  SegmentCreateDto,
  SegmentQueryDto,
  SegmentUpdateDto,
} from '../dtos/segment.dto';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { PointEntity } from 'libs/entities/point.entity';
import { RevertDataService } from '../../revert-data/revert.service';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';

@Injectable()
export class SegmentService {
  constructor(
    @Inject('SEGMENT_REPO') private segmentEntity: Repository<SegmentEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: SegmentCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const segments = [];
      for (const data of datas) {
        const check = await manage.findOne(SegmentEntity, {
          where: { name: data.name },
        });
        if (check) throw new BadRequestException('Segment name is exists');
        if (data.congestion) {
          const congestion = await manage.findOne(CongestionCodeEntity, {
            where: { code: data.congestion },
          });
          if (!congestion) {
            throw new BadRequestException('Congestion is not exists');
          }
        }
        if (data.segment_line) {
          data.segment_line = {
            type: 'LineString',
            coordinates: data.segment_line,
          };
        }
        const segment = await manage.save(
          SegmentEntity,
          this.segmentEntity.create(data),
        );
        await this.revertService.createWithTransaction(
          {
            table: 'segment',
            new_data: segment,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        segment.segment_line = segment.segment_line?.coordinates || null;
        segments.push(segment);
      }
      await queryRunner.commitTransaction();
      return segments;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: SegmentQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (
          [
            SEGMENTCOLUMN.COLLECT_COUNT,
            SEGMENTCOLUMN.CONGESTION,
            SEGMENTCOLUMN.ID,
            SEGMENTCOLUMN.SPEED,
            SEGMENTCOLUMN.DISTANCE,
          ].includes(column)
        ) {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
        }
        if (
          [SEGMENTCOLUMN.MANUAL_COLLECT, SEGMENTCOLUMN.MUST_PASS].includes(
            column,
          ) &&
          typeof value !== 'boolean'
        ) {
          return { list: [], total: 0 };
        }
        if (
          column === 'name' &&
          (typeof value !== 'string' ||
            (operator !== EOPERATOR.EQUALS && operator !== EOPERATOR.LIKE))
        ) {
          return { list: [], total: 0 };
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          if (operator === EOPERATOR.EQUALS && column === 'name') {
            where +=
              (where ? ` ${logical} ` : '') +
              `${column} ${operator} '${value}'`;
          } else if (column === 'segment_line') {
            if (operator !== EOPERATOR.EQUALS) {
              return { list: [], total: 0 };
            }
            where +=
              (where ? ` ${logical} ` : '') +
              `${column} @> '${JSON.stringify(value)}'::jsonb`;
          } else {
            where +=
              (where ? ` ${logical} ` : '') + `${column} ${operator} ${value}`;
          }
        }
      }
    }
    const builder = this.segmentEntity.createQueryBuilder();
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
        segment_line: l.segment_line?.coordinates || null,
        collect_volume: +l.collect_volume,
        congestion: +l.congestion,
        distance: +l.distance,
        duration: +l.duration,
      })),
      total,
    };
  }

  async findOne(id: number) {
    const segment = await this.segmentEntity.findOne({
      where: { id },
    });
    if (!segment) throw new BadRequestException('Segment Not Found');
    segment.segment_line = segment.segment_line?.coordinates;
    return segment;
  }

  async updateMany(datas: SegmentUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const segment = await manage.findOne(SegmentEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!segment) throw new BadRequestException('Segment Not Found');
        if (data.name && segment.name !== data.name) {
          const check = await manage.findOne(SegmentEntity, {
            where: { name: data.name },
          });
          if (check) throw new BadRequestException('Segment name is exists');
        }
        if (data.congestion && data.congestion !== segment.congestion) {
          const congestion = await manage.findOne(CongestionCodeEntity, {
            where: { code: data.congestion },
          });
          if (!congestion) {
            throw new BadRequestException('Congestion Not Found');
          }
        }
        if (data.segment_line) {
          data.segment_line = {
            type: 'LineString',
            coordinates: data.segment_line,
          };
        }
        await manage.update(SegmentEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'segment',
            new_data: data,
            old_data: segment,
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
    const segments = await this.segmentEntity.find({
      where: { id: In(ids) },
    });
    if (segments.length < 1) {
      throw new BadRequestException('Segments Not Found');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const id of ids) {
        const segment = manage.findOne(SegmentEntity, {
          where: { id },
        });
        if (!segment) throw new BadRequestException('Segment Not Found');
        const segRouteMap = await manage.findOne(SegmentRouteMapEntity, {
          where: { segment_id: id },
        });
        if (segRouteMap) {
          await Promise.all([
            this.revertService.createWithTransaction(
              {
                table: 'segment_route',
                new_data: null,
                old_data: segRouteMap,
                type: 'delete',
              },
              manage,
            ),
            manage.softDelete(SegmentRouteMapEntity, { segment_id: id }),
          ]);
        }
        const coreSection = await manage.findOne(CoreSectionEntity, {
          where: { segment_id: id },
        });
        if (coreSection) {
          await Promise.all([
            this.revertService.createWithTransaction(
              {
                table: 'core_section',
                new_data: null,
                old_data: coreSection,
                type: 'delete',
              },
              manage,
            ),
            manage.softDelete(CoreSectionEntity, { segment_id: id }),
          ]);
        }
        const point = await manage.findOne(PointEntity, {
          where: { segment_id: id },
        });
        if (point) {
          await Promise.all([
            this.revertService.createWithTransaction(
              {
                table: 'point',
                new_data: null,
                old_data: point,
                type: 'delete',
              },
              manage,
            ),
            manage.softDelete(PointEntity, { segment_id: id }),
          ]);
        }
        const remove = await manage.softDelete(SegmentEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'segment',
            new_data: null,
            old_data: remove,
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
