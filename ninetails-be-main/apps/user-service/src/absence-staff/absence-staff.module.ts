import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceStaffService } from './absence-staff.service';
import { AbsenceStaffController } from './absence-staff.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { RoleBackUpMiddleware } from '../guards/role.middleware';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';
import { StaffModule } from '../staff/staff.module';
import {
  AbsenceManagementCreateMiddleware,
  AbsenceManagementDeleteMiddleware,
  AbsenceManagementReadMiddleware,
  AbsenceManagementUpdateMiddleware,
} from '../guards/absence_management.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([AbsenceStaffEntity]), StaffModule],
  providers: [AbsenceStaffService, ...DataSourceProvider],
  controllers: [AbsenceStaffController],
  exports: [],
})
export class AbsenceStaffModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AbsenceStaffController);
    consumer
      .apply(AbsenceManagementReadMiddleware)
      .forRoutes({ path: 'absence-staff/list', method: RequestMethod.ALL });
    consumer
      .apply(AbsenceManagementCreateMiddleware)
      .forRoutes({ path: 'absence-staff/create', method: RequestMethod.ALL });
    consumer
      .apply(AbsenceManagementUpdateMiddleware)
      .forRoutes({ path: 'absence-staff/update/*', method: RequestMethod.ALL });
    consumer
      .apply(AbsenceManagementDeleteMiddleware)
      .forRoutes(
        { path: 'absence-staff/delete/*', method: RequestMethod.ALL },
        { path: 'absence-staff/delete-many', method: RequestMethod.ALL },
      );
  }
}
