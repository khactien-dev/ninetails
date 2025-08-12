import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { StaffModule } from './staff/staff.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticsearchRequestInterceptor } from 'libs/common/logger/opensearch-logger.interceptor';
import { OpenSearchLoggerModule } from 'libs/common/logger/opensearch-logger.module';
import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';
import { ExceptionHandleError } from 'libs/utils/http-exception.interceptor';
import { ComboBoxModule } from './combo-box/combo-box.module';
import { NotificationModule } from './notification/notification.module';
import { WorkingScheduleModule } from './working-schedule/working-schedule.module';
import { EdgeServeModule } from './edge-serve/edge-serve.module';
import { RouteModule } from './route/route.module';
import { RevertDataModule } from './revert-data/revert.module';
import { AbsenceVehicleModule } from './absence-vehicle/absence-vehicle.module';
import { AbsenceStaffModule } from './absence-staff/absence-staff.module';
import { DrivingDiaryModule } from './driving-diary/driving-diary.module';
import { BackupEntity } from 'libs/entities/backup.entity';
import { EdgeStateModule } from './edge-state/edge-state.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      poolSize: 5,
      entities: [BackupEntity],
    }),
    OpenSearchLoggerModule.forRoot({
      indexPrefix: 'user-api-service',
      rollingOffsetMode: ROLLING_INDEX_MODE.MONTHLY,
      name: 'user-api-service',
      stdout: true,
      openSearchClientOptions: {
        node: process.env.OPENSEARCH_SERVER ?? 'http://opensearch:9300',
        ssl: { rejectUnauthorized: false },
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailModule,
    StaffModule,
    UserModule,
    VehicleModule,
    EdgeServeModule,
    ComboBoxModule,
    NotificationModule,
    WorkingScheduleModule,
    RouteModule,
    RevertDataModule,
    AbsenceVehicleModule,
    AbsenceStaffModule,
    DrivingDiaryModule,
    EdgeStateModule,
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
export class AppModule {}
