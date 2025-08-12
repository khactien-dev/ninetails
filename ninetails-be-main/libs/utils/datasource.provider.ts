import { Provider, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { StaffEntity } from 'libs/entities/staff.entity';
import { UserEntity } from 'libs/entities/user.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { DataSource } from 'typeorm';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { NotificationEntity } from 'libs/entities/notification.entity';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { SegmentRouteMapEntity } from 'libs/entities/segment-route-map.entity';
import { GuideEntity } from 'libs/entities/guide.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { CongestionCodeEntity } from 'libs/entities/congestion-code.entity';
import { GuideCodeEntity } from 'libs/entities/guide-code.entity';
import { PointEntity } from 'libs/entities/point.entity';
import { StorageDataEntity } from 'libs/entities/storage-data.entity';
import { LogoEntity } from 'libs/entities/logo.entity';
import { MetadataEntity } from 'libs/entities/metadata.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { SignatureEntity } from 'libs/entities/signature.entity';
import { DrivingRecordEntity } from 'libs/entities/driving-record.entity';
import { LandfillRecordEntity } from 'libs/entities/landfill-record.entity';
import { SignHistoryEntity } from 'libs/entities/sign-history.entity';
import { ConfigWeightEntity } from 'libs/entities/config-weight.entity';
import { DrivingDiaryEntity } from 'libs/entities/driving-diary.entity';
import { MetricWeightEntity } from 'libs/entities/metric-weight.entity';
import { DailyCollectMetricsEntity } from 'libs/entities/daily-collect-metrics.entity';
import { DailyEcoscoreMetricsEntity } from 'libs/entities/daily-ecoscore-metrics.entity';
import { DailyRollupETCEntity } from 'libs/entities/daily-rollup-etc.entity';
import { EdgeState1DayEntity, EdgeState1HourEntity, EdgeStateRawEntity } from 'libs/entities/edge-state.entity';

export const DataSourceProvider: Provider[] = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (request) => {
      if (!request?.headers['schema']) {
        throw new UnauthorizedException(
          '이 차량 를 삭제할 수 없습니다. 다른 항목을 시도해 주세요!',
        );
      }
      const dataSource = new DataSource({
        type: process.env.DATABASE_TYPE as any,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        schema: request?.headers['schema'],
        entities: [
          StaffEntity,
          VehicleEntity,
          UserEntity,
          ComboBoxEntity,
          SettingNotificationEntity,
          NotificationEntity,
          WorkingScheduleEntity,
          EdgeServeEntity,
          RouteEntity,
          SegmentEntity,
          SectionEntity,
          SegmentRouteMapEntity,
          CoreSectionEntity,
          GuideEntity,
          CongestionCodeEntity,
          GuideCodeEntity,
          StorageDataEntity,
          PointEntity,
          LogoEntity,
          MetadataEntity,
          AbsenceVehicleEntity,
          AbsenceStaffEntity,
          SignatureEntity,
          DrivingRecordEntity,
          LandfillRecordEntity,
          SignHistoryEntity,
          ConfigWeightEntity,
          DrivingDiaryEntity,
          MetricWeightEntity,
          DailyCollectMetricsEntity,
          DailyEcoscoreMetricsEntity,
          DailyRollupETCEntity,
          EdgeStateRawEntity,
          EdgeState1HourEntity,
          EdgeState1DayEntity,
        ],
        synchronize: request?.headers['sync'] === 'false' ? false : true,
      });
      return await dataSource.initialize();
    },
    inject: [REQUEST],
  },
  {
    provide: 'USER_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STAFF_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StaffEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VEHICLE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(VehicleEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COMBO_BOX_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ComboBoxEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'NOTIFICATION_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(NotificationEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SETTING_NOTIFICATION_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SettingNotificationEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'WORKING_SCHEDULE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(WorkingScheduleEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'EDGE_SERVE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EdgeServeEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROUTE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RouteEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SEGMENT_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SegmentEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SECTION_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SectionEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SEGMENT_ROUTE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SegmentRouteMapEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'GUIDE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(GuideEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CORE_SECTION_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CoreSectionEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'POINT_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PointEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CONGESTION_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CongestionCodeEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'GUIDE_CODE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(GuideCodeEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'METADATA_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MetadataEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STORAGE_DATA_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(StorageDataEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LOGO_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LogoEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ABSENCE_VEHICLE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AbsenceVehicleEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ABSENCE_STAFF_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AbsenceStaffEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SIGNATURE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SignatureEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DRIVING_RECORD_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(DrivingRecordEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LANDFILL_RECORD_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LandfillRecordEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SIGN_HISTORY_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SignHistoryEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CONFIG_WEIGHT_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ConfigWeightEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'DRIVING_DIARY_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(DrivingDiaryEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'METRIC_WEIGHT_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(MetricWeightEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'EDGE_STATE_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EdgeStateRawEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'EDGE_STATE_1HOUR_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EdgeState1HourEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'EDGE_STATE_1DAY_REPO',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(EdgeState1DayEntity),
    inject: ['DATA_SOURCE'],
  },
];
