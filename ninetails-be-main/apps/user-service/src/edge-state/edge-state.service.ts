import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Between, DataSource, EntityTarget, MoreThan } from 'typeorm';
import {
  EdgeState1DayEntity,
  EdgeState1HourEntity,
  EdgeStateRawEntity,
} from 'libs/entities/edge-state.entity';
import { Cron } from '@nestjs/schedule';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { UserEntity } from 'libs/entities/user.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { StaffEntity } from 'libs/entities/staff.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { IOpenSearchResult } from 'libs/common/constants/common.constant';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class EdgeStateService {
  constructor(
    private dataSource: DataSource,
    @Inject('OpenSearchClient') private readonly openSearch: Client,
  ) {}

  async fetchFromDynamicSchema<T>(schemaName: string, entity: EntityTarget<T>) {
    if (!schemaName) {
      throw new BadRequestException('schemaName can not be falsy');
    }
    const AppDataSource = new DataSource({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      schema: schemaName,
      entities: [
        WorkingScheduleEntity,
        EdgeStateRawEntity,
        EdgeState1HourEntity,
        EdgeState1DayEntity,
        VehicleEntity,
        ComboBoxEntity,
        UserEntity,
        AbsenceVehicleEntity,
        StaffEntity,
        RouteEntity,
        SectionEntity,
        CoreSectionEntity,
        SegmentRouteMapEntity,
        SegmentEntity,
        AbsenceStaffEntity,
      ],
      synchronize: true,
    });
    const dataSource = await AppDataSource.initialize();
    return dataSource.manager.getRepository(entity);
  }

  @Cron('0 0 * * *')
  async saveEdgeState1Day() {
    const schemas = await this.dataSource.query(
      `select schema from public.tenant t where t.deleted_at is null and t.approved_time is not null`,
    );
    for (const item of schemas) {
      const schema = item.schema;
      const edgeStateRawEntity = await this.fetchFromDynamicSchema(
        schema,
        EdgeStateRawEntity,
      );
      const dispatchesEntity = await this.fetchFromDynamicSchema(
        schema,
        WorkingScheduleEntity,
      );
      const dispatches = await dispatchesEntity.find({
        where: {
          working_date: moment()
            .startOf('day')
            .format('YYYY-MM-DD 00:00:00') as any,
        },
      });
      for (const dispatch of dispatches) {
        const edgeRaws = await edgeStateRawEntity.find({
          where: {
            date: MoreThan(
              moment()
                .startOf('day')
                .subtract(1, 'day')
                .format('YYYY-MM-DD 00:00:00') as any,
            ),
            route_id: dispatch.route_id,
          },
        });
        const edgeRawsLength = edgeRaws.length;
        const alpha = 0.3;
        const ewm = edgeRaws[0];
        for (let i = 1; i < edgeRawsLength; i++) {
          const edgeRaw = edgeRaws[i];
          for (const edgeRawItem in edgeRaw) {
            if (
              [
                'id',
                'createdAt',
                'updatedAt',
                'deletedAt',
                'route_id',
                'date',
              ].includes(edgeRawItem)
            ) {
              continue;
            }
            ewm[edgeRawItem] =
              alpha * edgeRaw[edgeRawItem] + (1 - alpha) * ewm[edgeRawItem];
          }
        }
        const edgeState1DayRepo = await this.fetchFromDynamicSchema(
          schema,
          EdgeState1DayEntity,
        );
        await edgeState1DayRepo.save(edgeState1DayRepo.create(ewm));
      }
    }
  }

  @Cron('*/5 * * * *')
  async saveEdgeStateRaw() {
    const now = new Date();
    console.log('5m', now);
    // Xác định mốc pack đã kết thúc
    const current = new Date(now.getTime());
    current.setSeconds(0, 0); // loại bỏ giây, ms
    const minute = current.getMinutes();
    const flooredMin = Math.floor(minute / 5) * 5;
    current.setMinutes(flooredMin);

    const packEnd = new Date(current.getTime() - 1000); // pack vừa xong (trừ 1 giây)
    const packStart = new Date(packEnd.getTime() - 5 * 60 * 1000 + 1000);
    const schemas = await this.dataSource.query(
      `select schema from public.tenant t where t.deleted_at is null and t.approved_time is not null`,
    );
    for (const item of schemas) {
      const schema = item.schema;
      const range = {
        'data.timestamp': {
          gte: packStart.toISOString(),
          lte: packEnd.toISOString(),
          format: 'strict_date_optional_time',
        },
      };
      const edgeStateRawEntity = await this.fetchFromDynamicSchema(
        schema,
        EdgeStateRawEntity,
      );
      const dispatchesEntity = await this.fetchFromDynamicSchema(
        schema,
        WorkingScheduleEntity,
      );
      const dispatches = await dispatchesEntity.find({
        where: {
          working_date: moment()
            .startOf('day')
            .format('YYYY-MM-DD 00:00:00') as any,
        },
      });
      for (const dispatch of dispatches) {
        const data: IOpenSearchResult = await this.openSearch.search({
          index: `${schema}.edge_state_metrics`,
          body: {
            query: {
              bool: {
                filter: [
                  {
                    match_phrase: {
                      'data.route_id': dispatch.route_id,
                    },
                  },
                  { range },
                ],
              },
            },
          },
        });
        const result = data.body.hits.hits;
        const length = result.length;
        if (length < 1) continue;
        const edgeState = result.reduce(
          (p, c, i) => {
            const edgeStateData = {
              route_id: p.route_id,
              cpu_avg_degree:
                p.cpu_avg_degree + c._source.data.temperature.cpu_avg_degree,
              gpu_avg_degree:
                p.gpu_avg_degree + c._source.data.temperature.gpu_avg_degree,
              soc_avg_degree:
                p.soc_avg_degree + c._source.data.temperature.soc_avg_degree,
              'cpu_avg_%':
                p['cpu_avg_%'] + c._source.data.utilization['cpu_avg_%'],
              'gpu_avg_%':
                p['gpu_avg_%'] + c._source.data.utilization['gpu_avg_%'],
              'mem_avg_%':
                p['mem_avg_%'] + c._source.data.utilization['mem_avg_%'],
              'disk_avg_%':
                p['disk_avg_%'] + c._source.data.utilization['disk_avg_%'],
              lte_in_total_byte:
                p.lte_in_total_byte + c._source.data.data_io.lte_in_total_byte,
              lte_out_total_byte:
                p.lte_out_total_byte +
                c._source.data.data_io.lte_out_total_byte,
              camera_total_byte:
                p.camera_total_byte + c._source.data.data_io.camera_total_byte,
              dtg_total_byte:
                p.dtg_total_byte + c._source.data.data_io.dtg_total_byte,
              disk_total_byte:
                p.disk_total_byte + c._source.data.data_io.disk_total_byte,
            };
            if (i === length - 1) {
              edgeStateData.cpu_avg_degree =
                edgeStateData.cpu_avg_degree / length;
              edgeStateData.gpu_avg_degree =
                edgeStateData.gpu_avg_degree / length;
              edgeStateData.soc_avg_degree =
                edgeStateData.soc_avg_degree / length;
              edgeStateData['cpu_avg_%'] = edgeStateData['cpu_avg_%'] / length;
              edgeStateData['gpu_avg_%'] = edgeStateData['gpu_avg_%'] / length;
              edgeStateData['mem_avg_%'] = edgeStateData['mem_avg_%'] / length;
              edgeStateData['disk_avg_%'] =
                edgeStateData['disk_avg_%'] / length;
            }
            return edgeStateData;
          },
          {
            route_id: dispatch.route_id,
            cpu_avg_degree: 0,
            gpu_avg_degree: 0,
            soc_avg_degree: 0,
            'cpu_avg_%': 0,
            'gpu_avg_%': 0,
            'mem_avg_%': 0,
            'disk_avg_%': 0,
            lte_in_total_byte: 0,
            lte_out_total_byte: 0,
            camera_total_byte: 0,
            dtg_total_byte: 0,
            disk_total_byte: 0,
          },
        );

        await edgeStateRawEntity.save(
          edgeStateRawEntity.create({
            ...edgeState,
            date: packStart,
          }),
        );
      }
    }
  }

  @Cron('0 * * * *')
  async saveEdgeState1Hour() {
    const now = new Date();
    console.log('1h', now);
    now.setSeconds(0, 0);
    now.setMinutes(0); // làm tròn về đầu giờ

    const packEnd = new Date(now.getTime() - 1000); // giờ vừa kết thúc
    const packStart = new Date(packEnd.getTime() - 60 * 60 * 1000 + 1000);
    const schemas = await this.dataSource.query(
      `select schema from public.tenant t where t.deleted_at is null and t.approved_time is not null`,
    );
    for (const item of schemas) {
      const schema = item.schema;
      const edgeStateRepo = await this.fetchFromDynamicSchema(
        schema,
        EdgeStateRawEntity,
      );
      const dispatchesEntity = await this.fetchFromDynamicSchema(
        schema,
        WorkingScheduleEntity,
      );
      const edgeState1HourRepo = await this.fetchFromDynamicSchema(
        schema,
        EdgeState1HourEntity,
      );
      const dispatches = await dispatchesEntity.find({
        where: {
          working_date: moment()
            .startOf('day')
            .format('YYYY-MM-DD 00:00:00') as any,
        },
      });
      for (const dispatch of dispatches) {
        const edgeRaws = await edgeStateRepo.find({
          where: {
            route_id: dispatch.route_id,
            date: Between(packStart, packEnd),
          },
        });
        const edgeRawsLength = edgeRaws.length;
        if (edgeRawsLength > 0) {
          const alpha = 0.3;
          const ewm = edgeRaws[0];
          for (let i = 1; i < edgeRawsLength; i++) {
            const edgeRaw = edgeRaws[i];
            for (const edgeRawItem in edgeRaw) {
              if (
                [
                  'id',
                  'createdAt',
                  'updatedAt',
                  'deletedAt',
                  'route_id',
                  'date',
                ].includes(edgeRawItem)
              ) {
                continue;
              }
              ewm[edgeRawItem] =
                alpha * edgeRaw[edgeRawItem] + (1 - alpha) * ewm[edgeRawItem];
            }
          }
          delete ewm.id;
          delete ewm.createdAt;
          delete ewm.updatedAt;
          delete ewm.deletedAt;
          ewm.date = packStart as any;
          await edgeState1HourRepo.save(edgeState1HourRepo.create(ewm));
        }
      }
    }
  }
}
