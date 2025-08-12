import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Scope,
  OnModuleInit,
} from '@nestjs/common';
import { BaseMetricService } from './base-metric.service';
import { BaseMetricController } from './base-metric.controller';
import { HttpModule } from '@nestjs/axios';
import { OpensearchService } from './opensearch/opensearch.service';
import { Client } from '@opensearch-project/opensearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollectMetricController } from './collect-metric/collect_metric.controller';
import { CollectMetricService } from './collect-metric/collect_metric.service';
import { CollectMetricOpensearch } from './collect-metric/collect_metric.opensearch';
import { RabbitmqService } from './rabbitmq.service';
import { IllegalDischargeService } from './illegal-discharge/illegal_discharge.service';
import { IllegalDischargeOpensearch } from './illegal-discharge/illegal_discharge.opensearch';
import { IllegalDischargeController } from './illegal-discharge/illegal_discharge.controller';
import { DriveMetricService } from './drive-metric/drive-metric.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticsearchRequestInterceptor } from 'libs/common/logger/opensearch-logger.interceptor';
import { ExceptionHandleError } from 'libs/utils/http-exception.interceptor';
import { OpenSearchLoggerModule } from 'libs/common/logger/opensearch-logger.module';
import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';
import { EdgeManagementModule } from './edge-management/edge-management.module';
import { AuthMiddleware } from './guards/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAdminMiddleware } from './guards/role.middleware';
import { EdgeManagementController } from './edge-management/edge-management.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { FakeMetricController } from './fake-metric/fake-metric.controller';
import { FakeMetricService } from './fake-metric/fake-metric.service';
import { FakeMetricOpensearch } from './fake-metric/fake-metric.opensearch';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { ContractEntity } from 'libs/entities/contract.entity';
import { PermissionEntity } from 'libs/entities/permission.entity';
import { DashboardController } from 'apps/base-metric-service/src/dashboard/dashboard.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { ManualCollectService } from './datasource-service/manual-collect.service';
import { RealtimeActivityService } from './realtime-activity/realtime-activity.service';
import { ZScoreService } from './z-score/z-score.service';
import { RouteInfoService } from './datasource-service/route-info.service';
import { VehicleInfoService } from './datasource-service/vehicle-info.service';
import { WorkingScheduleService } from './datasource-service/working-schedule.service';
import { OperationAnalysisService } from './operation-analysis/operation-analysis.service';
import { WidgetDatasetService } from './operation-analysis/widget-dataset/widget-dataset.service';
import { CoreDatasetService } from './operation-analysis/core-dataset/core-dataset.service';
import { ModuleDatasetService } from './operation-analysis/module-dataset/module-dataset.service';
import { DrivingRouteService } from './operation-analysis/power-graph/driving-route-graph/driving-route-graph.service';
import { CollectCountGraphService } from './operation-analysis/power-graph/collect-count-graph/collect-count-graph.service';
import { CustomGraphService } from './operation-analysis/power-graph/custom-graph/custom-graph.service';
import { SingleIngestService } from './opensearch/singleIngest.service';
import { CoreSectionService } from './datasource-service/core-section.service';
import { DashboardReadMiddleware } from 'apps/user-service/src/guards/dashboard.middleware';
import { DailyRollupService } from './roll-up/daily-rollup.service';
import { DailyEcoscoreMetricsService } from './roll-up/services/daily-ecoscore-metrics.service';
import { DailyRollupETCService } from './roll-up/services/daily-rollup-etc.service';
import { ZScoreRollupService } from './roll-up/zscore-rollup.service';
import { DailyCollectMetricsService } from './roll-up/services/daily-collect-metrics.service';
import { MetricWeightService } from './datasource-service/metric-weight.service';
import { EdgeManagementService } from './edge-management/edge-management.service';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: (process.env.DATABASE_TYPE as any) ?? 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [
        TenantEntity,
        UserMasterEntity,
        ContractEntity,
        PermissionEntity,
      ],
      poolSize: 5,
    }),
    TypeOrmModule.forFeature([
      TenantEntity,
      UserMasterEntity,
      ContractEntity,
      PermissionEntity,
    ]),
    OpenSearchLoggerModule.forRoot({
      indexPrefix: 'metric-api-service',
      rollingOffsetMode: ROLLING_INDEX_MODE.MONTHLY,
      name: 'metric-api-service',
      stdout: true,
      openSearchClientOptions: {
        node: process.env.OPENSEARCH_SERVER ?? 'http://opensearch:9300',
        ssl: { rejectUnauthorized: false },
      },
    }),
    EdgeManagementModule,
  ],
  providers: [
    BaseMetricService,
    OpensearchService,
    CollectMetricService,
    CollectMetricOpensearch,
    IllegalDischargeService,
    IllegalDischargeOpensearch,
    DriveMetricService,
    RabbitmqService,
    ZScoreRollupService,
    // EdgeManagementModule,
    FakeMetricOpensearch,
    FakeMetricService,
    ...DataSourceProvider,
    ManualCollectService,
    RealtimeActivityService,
    ZScoreService,
    RouteInfoService,
    VehicleInfoService,
    WorkingScheduleService,
    OperationAnalysisService,
    WidgetDatasetService,
    CoreDatasetService,
    ModuleDatasetService,
    DrivingRouteService,
    CollectCountGraphService,
    CustomGraphService,
    SingleIngestService,
    CoreSectionService,
    DailyEcoscoreMetricsService,
    DailyRollupETCService,
    DailyCollectMetricsService,
    DailyRollupService,
    MetricWeightService,
    // EdgeManagementService,
    {
      provide: 'Open_Search_JS_Client',
      useFactory: async (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('OPENSEARCH_SERVER'),
          ssl: {
            rejectUnauthorized: false,
          },
        }); 
      },
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: ElasticsearchRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionHandleError,
    },
  ],
  controllers: [
    BaseMetricController,
    CollectMetricController,
    IllegalDischargeController,
    FakeMetricController,
    DashboardController,
  ],
  exports: ['Open_Search_JS_Client', CoreDatasetService],
})
export class BaseMetricModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes(EdgeManagementController);
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'illegal-discharge/search/',
        method: RequestMethod.GET,
      },
      {
        path: '/',
        method: RequestMethod.GET,
      },
      {
        path: 'operation-analysis/',
        method: RequestMethod.GET,
      },
      {
        path: 'route-list/',
        method: RequestMethod.GET,
      },
      {
        path: 'widget-dataset/',
        method: RequestMethod.GET,
      },
      {
        path: 'core-dataset/',
        method: RequestMethod.GET,
      },
      {
        path: 'module-dataset/',
        method: RequestMethod.POST,
      },
      {
        path: 'driving-route-graph/',
        method: RequestMethod.GET,
      },
      {
        path: 'collect-count-graph/',
        method: RequestMethod.GET,
      },
      {
        path: 'metric-weight/',
        method: RequestMethod.GET,
      },
      {
        path: 'metric-weight/',
        method: RequestMethod.PUT,
      },
      {
        path: 'custom-graph/',
        method: RequestMethod.POST,
      },
      {
        path: 'section-list/',
        method: RequestMethod.GET,
      },
      {
        path: 'edge-state/*',
        method: RequestMethod.ALL,
      },
    );
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'dashboard/', method: RequestMethod.GET });
    consumer
      .apply(DashboardReadMiddleware)
      .forRoutes({ path: 'dashboard/', method: RequestMethod.GET });
    // consumer
    //   .apply(RoleAdminMiddleware)
    //   .forRoutes(
    //     { path: 'edge-management/create/', method: RequestMethod.POST },
    //     { path: 'edge-management/update/*', method: RequestMethod.PATCH },
    //     { path: 'edge-management/delete/*', method: RequestMethod.DELETE },
    //   );
  }
}
