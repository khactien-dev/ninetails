import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Scope,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OtpEntity } from 'libs/entities/otp.entity';
import { MailModule } from './mail/mail.module';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { AuthMiddleware } from './guards/auth.middleware';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { UserMasterModule } from './user-master/user-master.module';
import { TenantModule } from './tenant/tenant.module';
import { FileModule } from './file/file.module';
import { ContractEntity } from 'libs/entities/contract.entity';
import { OpenSearchLoggerModule } from 'libs/common/logger/opensearch-logger.module';
import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticsearchRequestInterceptor } from 'libs/common/logger/opensearch-logger.interceptor';
import { ExceptionHandleError } from 'libs/utils/http-exception.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupEntity } from 'libs/entities/backup.entity';
import {PermissionModule} from "./permission/permission.module";
import {PermissionEntity} from "libs/entities/permission.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [
        OtpEntity,
        UserMasterEntity,
        TenantEntity,
        ContractEntity,
        BackupEntity,
        PermissionEntity,
      ],
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    UserMasterModule,
    TenantModule,
    PermissionModule,
    FileModule,
    ScheduleModule.forRoot(),
    OpenSearchLoggerModule.forRoot({
      indexPrefix: 'master-api-service',
      rollingOffsetMode: ROLLING_INDEX_MODE.MONTHLY,
      name: 'master-api-service',
      stdout: true,
      openSearchClientOptions: {
        node: process.env.OPENSEARCH_SERVER ?? 'http://opensearch:9300',
        ssl: { rejectUnauthorized: false },
      },
    }),
  ],
  providers: [
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
})
export class MasterServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'user-master/*', method: RequestMethod.ALL },
        { path: 'user-master/', method: RequestMethod.ALL },
        { path: 'tenant/approve/*', method: RequestMethod.ALL },
        { path: 'tenant/manage/*', method: RequestMethod.ALL },
        { path: 'tenant/update/*', method: RequestMethod.ALL },
        { path: 'tenant/list/', method: RequestMethod.ALL },
        { path: 'tenant/detail/*', method: RequestMethod.ALL },
        { path: 'tenant/management/', method: RequestMethod.ALL },
        { path: 'tenant/change-info/', method: RequestMethod.ALL },
        { path: 'tenant/detail-by-op/', method: RequestMethod.ALL },
        { path: 'tenant/delete/*', method: RequestMethod.ALL },
        { path: 'tenant/backup-accept/', method: RequestMethod.ALL },
        { path: 'permission/*', method: RequestMethod.ALL },
      );
  }
}
