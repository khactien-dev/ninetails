import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import {
  VehicleCreateMiddleware,
  VehicleDeleteMiddleware,
  VehicleReadMiddleware,
  VehicleUpdateMiddleware
} from "../guards/vehicle.middleware";

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity, WorkingScheduleEntity])],
  providers: [VehicleService, ...DataSourceProvider],
  controllers: [VehicleController],
  exports: [VehicleService],
})
export class VehicleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(VehicleController);
    consumer.apply(VehicleReadMiddleware)
        .forRoutes(
            { path: 'vehicle', method: RequestMethod.GET },
            { path: 'vehicle/:id', method: RequestMethod.GET }
        );
    consumer.apply(VehicleUpdateMiddleware).forRoutes(
        { path: 'vehicle/:id', method: RequestMethod.PUT },
        { path: 'vehicle/update-many', method: RequestMethod.PUT }
    );
    consumer.apply(VehicleCreateMiddleware).forRoutes({ path: 'vehicle/create', method: RequestMethod.POST });
    consumer.apply(VehicleDeleteMiddleware).forRoutes(
        { path: 'vehicle/:id', method: RequestMethod.DELETE },
        { path: 'vehicle/delete-many', method: RequestMethod.DELETE }
    );
  }
}
