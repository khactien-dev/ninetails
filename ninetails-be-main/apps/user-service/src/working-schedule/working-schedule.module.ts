import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { WorkingScheduleService } from './working-schedule.service';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { WorkingScheduleController } from './working-schedule.controller';
import { VehicleModule } from '../vehicle/vehicle.module';
import { StaffModule } from '../staff/staff.module';
import {
  RoleDispatchMiddleware,
  RoleOpMiddleware,
} from '../guards/role.middleware';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { AbsenceVehicleEntity } from 'libs/entities/absence-vehicle.entity';
import { StatisticService } from './statistic.service';
import {
  WorkingScheduleCreateMiddleware,
  WorkingScheduleDeleteMiddleware,
  WorkingScheduleReadMiddleware,
  WorkingScheduleUpdateMiddleware,
} from '../guards/working_shedule.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkingScheduleEntity,
      VehicleEntity,
      AbsenceVehicleEntity,
    ]),
    VehicleModule,
    StaffModule,
  ],
  providers: [WorkingScheduleService, ...DataSourceProvider, StatisticService],
  controllers: [WorkingScheduleController],
  exports: [WorkingScheduleService],
})
export class WorkingScheduleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(WorkingScheduleController);
    consumer
      .apply(WorkingScheduleReadMiddleware)
      .forRoutes(
        { path: 'working-schedule', method: RequestMethod.ALL },
        { path: 'working-schedule/statistic', method: RequestMethod.ALL },
        { path: 'working-schedule/*', method: RequestMethod.ALL },
      );
    consumer.apply(WorkingScheduleCreateMiddleware).forRoutes({
      path: 'working-schedule/create',
      method: RequestMethod.ALL,
    });
    consumer.apply(WorkingScheduleUpdateMiddleware).forRoutes({
      path: 'working-schedule/update/*',
      method: RequestMethod.ALL,
    });
    consumer.apply(WorkingScheduleDeleteMiddleware).forRoutes({
      path: 'working-schedule/delete',
      method: RequestMethod.ALL,
    });
  }
}
