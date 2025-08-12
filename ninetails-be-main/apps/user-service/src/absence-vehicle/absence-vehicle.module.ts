import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceVehicleService } from './absence-vehicle.service';
import { AbsenceVehicleController } from './absence-vehicle.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import {
  AbsenceManagementCreateMiddleware,
  AbsenceManagementDeleteMiddleware,
  AbsenceManagementReadMiddleware,
  AbsenceManagementUpdateMiddleware,
} from '../guards/absence_management.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([AbsenceVehicleEntity, VehicleEntity])],
  providers: [AbsenceVehicleService, ...DataSourceProvider],
  controllers: [AbsenceVehicleController],
  exports: [],
})
export class AbsenceVehicleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AbsenceVehicleController);
    consumer
      .apply(AbsenceManagementReadMiddleware)
      .forRoutes({ path: 'absence-vehicle/list', method: RequestMethod.ALL });
    consumer
      .apply(AbsenceManagementCreateMiddleware)
      .forRoutes({ path: 'absence-vehicle/create', method: RequestMethod.ALL });
    consumer.apply(AbsenceManagementUpdateMiddleware).forRoutes({
      path: 'absence-vehicle/update/*',
      method: RequestMethod.ALL,
    });
    consumer
      .apply(AbsenceManagementDeleteMiddleware)
      .forRoutes(
        { path: 'absence-vehicle/delete/*', method: RequestMethod.ALL },
        { path: 'absence-vehicle/delete-many', method: RequestMethod.ALL },
      );
  }
}
