import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RouteEntity } from 'libs/entities/route.entity';
import { DataSource, In, Repository } from 'typeorm';
import {
  ROUTECOLUMN,
  RouteCreateDto,
  RouteQueryDto,
  RouteUpdateDto,
  SaveAllRouteManageDto,
} from '../dtos/route.dto';
import { SectionEntity } from 'libs/entities/section.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { IPaginate } from 'libs/common/common.interface';
import { RevertDataService } from '../../revert-data/revert.service';
import { EOPERATOR } from 'libs/common/constants/common.constant';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { GuideEntity } from 'libs/entities/guide.entity';
import { GuideCodeEntity } from 'libs/entities/guide-code.entity';

@Injectable()
export class RouteService {
  constructor(
    @Inject('ROUTE_REPO') private routeEntity: Repository<RouteEntity>,
    @Inject('CONGESTION_REPO')
    private congestionEntity: Repository<CongestionCodeEntity>,
    @Inject('CORE_SECTION_REPO')
    private coreSectionEntity: Repository<CoreSectionEntity>,
    @Inject('GUIDE_REPO') private guideEntity: Repository<GuideEntity>,
    @Inject('GUIDE_CODE_REPO')
    private guideCodeEntity: Repository<GuideCodeEntity>,
    @Inject('SEGMENT_ROUTE_REPO')
    private segmentRouteEntity: Repository<SegmentRouteMapEntity>,
    @Inject('SECTION_REPO') private sectionEntity: Repository<SectionEntity>,
    @Inject('SEGMENT_REPO') private segmentEntity: Repository<SegmentEntity>,
    @Inject('DATA_SOURCE') private dataSource: DataSource,
    private revertService: RevertDataService,
  ) {}

  async create(datas: RouteCreateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      const routes = [];
      for (const data of datas) {
        const check = await manage.findOne(RouteEntity, {
          where: { name: data.name },
        });
        if (check) throw new BadRequestException('Route Name is exists');
        if (data.bbox) {
          data.bbox = {
            type: 'Polygon',
            coordinates: data.bbox,
          };
        }
        if (data.start) {
          data.start = {
            type: 'Point',
            coordinates: data.start,
          };
        }
        if (data.goal) {
          data.goal = {
            type: 'Point',
            coordinates: data.goal,
          };
        }
        if (data.path) {
          data.path = {
            type: 'LineString',
            coordinates: data.path,
          };
        }
        const route = await manage.save(
          RouteEntity,
          this.routeEntity.create(data),
        );
        await this.revertService.createWithTransaction(
          {
            table: 'route',
            new_data: route,
            old_data: null,
            type: 'insert',
          },
          manage,
        );
        route.start = route.start?.coordinates;
        route.goal = route.goal?.coordinates;
        route.bbox = route.bbox?.coordinates;
        route.path = route.path?.coordinates;
        routes.push(route);
      }
      await queryRunner.commitTransaction();
      return routes;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAndCount(criteria: RouteQueryDto[], paginate: IPaginate) {
    let where = '';
    if (criteria?.length) {
      for (const obj of criteria) {
        const { column, operator } = obj;
        let { value } = obj;
        const logical = obj.logical || 'AND';
        if (
          [
            ROUTECOLUMN.ID,
            ROUTECOLUMN.DISTANCE,
            ROUTECOLUMN.DURATION,
            ROUTECOLUMN.COLLECT_COUNT,
          ].includes(column)
        ) {
          if (isNaN(+value)) {
            return { list: [], total: 0 };
          } else {
            value = +value as any;
          }
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
          } else if (['start', 'goal', 'bbox', 'path'].includes(column)) {
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
    const builder = this.routeEntity.createQueryBuilder();
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
        bbox: l.bbox?.coordinates || null,
        start: l.start?.coordinates || null,
        goal: l.goal?.coordinates || null,
        path: l.path?.coordinates || null,
        distance: +l.distance,
        duration: +l.duration,
        collect_volume: +l.collect_volume,
      })),
      total,
    };
  }

  async findOne(id: number) {
    const route = await this.routeEntity.findOne({
      where: { id },
    });
    if (!route) throw new BadRequestException('Route Not Found');
    route.start = route.start?.coordinates || null;
    route.goal = route.goal?.coordinates || null;
    route.path = route.path?.coordinates || null;
    route.bbox = route.bbox?.coordinates || null;
    return route;
  }

  async updateMany(datas: RouteUpdateDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      for (const data of datas) {
        const updateId = data.updateId;
        delete data.updateId;
        const route = await manage.findOne(RouteEntity, {
          where: { id: updateId },
          select: ['id', ...(Object.keys(data) as any)],
        });
        if (!route) throw new BadRequestException('Route Not Found');
        if (data.bbox) {
          data.bbox = {
            type: 'Polygon',
            coordinates: data.bbox,
          };
        }
        if (data.start) {
          data.start = {
            type: 'Point',
            coordinates: data.start,
          };
        }
        if (data.goal) {
          data.goal = {
            type: 'Point',
            coordinates: data.goal,
          };
        }
        if (data.path) {
          data.path = {
            type: 'LineString',
            coordinates: data.path,
          };
        }
        await manage.update(RouteEntity, { id: updateId }, data);
        await this.revertService.createWithTransaction(
          {
            table: 'route',
            new_data: data,
            old_data: route,
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
        const route = await manage.findOne(RouteEntity, {
          where: { id },
        });
        if (!route) {
          throw new BadRequestException('Routes Not Found');
        }
        const segRouteMap = await manage.findOne(SegmentRouteMapEntity, {
          where: { route_id: id },
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
            manage.softDelete(SegmentRouteMapEntity, { route_id: id }),
          ]);
        }
        const coreSection = await manage.findOne(CoreSectionEntity, {
          where: { route_id: id },
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
            manage.softDelete(CoreSectionEntity, { route_id: id }),
          ]);
        }
        const section = await manage.findOne(SectionEntity, {
          where: { route_id: In(ids) },
        });
        if (section) {
          await Promise.all([
            this.revertService.createWithTransaction(
              {
                table: 'section',
                new_data: null,
                old_data: section,
                type: 'delete',
              },
              manage,
            ),
            manage.softDelete(SectionEntity, { route_id: id }),
          ]);
        }
        await this.revertService.createWithTransaction(
          {
            table: 'route',
            new_data: null,
            old_data: route,
            type: 'delete',
          },
          manage,
        );
        await manage.softDelete(RouteEntity, { id });
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

  async routeSimulation(routeId: number) {
    const route = await this.findOne(routeId);
    return route;
  }

  async saveAllRouteManage(allData: SaveAllRouteManageDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const routes = [];
      const manage = queryRunner.manager;
      if (allData.routes) {
        const datas = allData.routes;
        for (const data of datas) {
          const check = await manage.findOne(RouteEntity, {
            where: { name: data.name },
          });
          if (check) throw new BadRequestException('Route Name is exists');
          if (data.bbox) {
            data.bbox = {
              type: 'Polygon',
              coordinates: data.bbox,
            };
          }
          if (data.start) {
            data.start = {
              type: 'Point',
              coordinates: data.start,
            };
          }
          if (data.goal) {
            data.goal = {
              type: 'Point',
              coordinates: data.goal,
            };
          }
          if (data.path) {
            data.path = {
              type: 'LineString',
              coordinates: data.path,
            };
          }
          const route = await manage.save(
            RouteEntity,
            this.routeEntity.create(data),
          );
          await this.revertService.createWithTransaction(
            {
              table: 'route',
              new_data: route,
              old_data: null,
              type: 'insert',
            },
            manage,
          );
          route.start = route.start?.coordinates;
          route.goal = route.goal?.coordinates;
          route.bbox = route.bbox?.coordinates;
          route.path = route.path?.coordinates;
          routes.push(route);
        }
      }
      const congestions = [];
      if (allData.congestions) {
        const datas = allData.congestions;
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
      }
      const sections = [];
      if (allData.sections) {
        const datas = allData.sections;
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
      }
      const segments = [];
      if (allData.segments) {
        const datas = allData.segments;
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
      }
      const coreSections = [];
      if (allData.coreSections) {
        const datas = allData.coreSections;
        for (const data of datas) {
          const check = await manage.findOne(CoreSectionEntity, {
            where: { name: data.name },
          });
          if (check)
            throw new BadRequestException('core section name is exists');
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
      }
      const guides = [];
      if (allData.guides) {
        const datas = allData.guides;
        for (const data of datas) {
          if (data.route_id > 0) {
            const route = await manage.findOne(RouteEntity, {
              where: { id: data.route_id },
            });
            if (!route) throw new BadRequestException('Route not found');
          }
          if (data.type) {
            const guideCode = await manage.findOne(GuideCodeEntity, {
              where: { code: data.type },
            });
            if (!guideCode)
              throw new BadRequestException('Guide Code not found');
          }
          if (data.bbox) {
            data.bbox = {
              type: 'Polygon',
              coordinates: data.bbox,
            };
          }
          const guide = await manage.save(this.guideEntity.create(data));
          await this.revertService.createWithTransaction(
            {
              table: 'guide',
              new_data: guide,
              old_data: null,
              type: 'insert',
            },
            manage,
          );
          guide.bbox = guide.bbox.coordinates || null;
          guides.push(guide);
        }
      }
      const segRoutes = [];
      if (allData.routeSegmentMap) {
        const datas = allData.routeSegmentMap;
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
      }
      await queryRunner.commitTransaction();
      return {
        routes,
        congestions,
        sections,
        segments,
        coreSections,
        guides,
        routeSegmentMap: segRoutes,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
