import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { DataSource, Repository } from 'typeorm';
import {
  SegmentRouteCreateDto,
  SegmentRouteUpdateDto,
  SegRouteQueryDto,
} from '../dtos/segment-route.dto';
import { RouteEntity } from 'libs/entities/route.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { RevertDataService } from '../../revert-data/revert.service';
import { IPaginate } from 'libs/common/common.interface';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { SectionEntity } from 'libs/entities/section.entity';

@Injectable()
export class SegmentRouteMapService {
  constructor(
    @Inject('SEGMENT_ROUTE_REPO')
    private segmentRouteEntity: Repository<SegmentRouteMapEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: SegmentRouteCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const segRoutes = [];
      for (const data of datas) {
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
        const section = await manage.findOne(SectionEntity, {
          where: { id: data.section_id },
        });
        if (!section) throw new BadRequestException('Section not found');
        const segRoute = await manage.save(
          this.segmentRouteEntity.create(data),
        );
        await this.revertService.createWithTransaction(
          {
            table: 'segment_route',
            new_data: segRoute,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        segRoutes.push(segRoute);
      }
      await queryRunner.commitTransaction();
      return segRoutes;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: SegRouteQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, value, operator } = obj;
        const logical = obj.logical || 'AND';
        if (column && isNaN(+value)) {
          return { list: [], total: 0 };
        }
        if (operator === EOPERATOR.LIKE) {
          where +=
            (where ? ` ${logical} ` : '') +
            `${column} ${operator} '%${value}%'`;
        } else {
          where +=
            (where ? ` ${logical} ` : '') + `${column} ${operator} ${value}`;
        }
      }
    }
    const builder = this.segmentRouteEntity.createQueryBuilder();
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

  async updateMany(datas: SegmentRouteUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const segRoute = await manage.findOne(SegmentRouteMapEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!segRoute) throw new BadRequestException('Segment route not found');
        if (data.route_id > 0 && data.route_id !== segRoute.route_id) {
          const route = await manage.findOne(RouteEntity, {
            where: { id: data.route_id },
          });
          if (!route) throw new BadRequestException('Route not found');
        }
        if (data.segment_id && data.segment_id !== segRoute.segment_id) {
          const segment = await manage.findOne(SegmentEntity, {
            where: { id: data.segment_id },
          });
          if (!segment) throw new BadRequestException('Segment not found');
        }
        if (data.section_id && data.section_id !== segRoute.section_id) {
          const section = await manage.findOne(SectionEntity, {
            where: { id: data.section_id },
          });
          if (!section) throw new BadRequestException('Section not found');
        }
        await manage.update(SegmentRouteMapEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'segment_route',
            new_data: data,
            old_data: segRoute,
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
        const segRoute = await manage.findOne(SegmentRouteMapEntity, {
          where: { id },
        });
        if (!segRoute) throw new BadRequestException('Segment Route Not Found');
        await manage.softDelete(SegmentRouteMapEntity, { id });
        await this.revertService.createWithTransaction(
          {
            table: 'segment_route',
            new_data: null,
            old_data: segRoute,
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

  async manualCollectDistance(routeId: number) {
    const sum = await this.segmentRouteEntity.query(
      `SELECT coalesce(sum(s.distance), 0) FROM toacic.segment_route sr 
      left join toacic.segment s on s.id = sr.segment_id 
      where sr.route_id = ${routeId} and s.manual_collect = true;`,
    );
    return sum[0].coalesce;
  }
}
