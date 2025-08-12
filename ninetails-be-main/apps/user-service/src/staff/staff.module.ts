import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffEntity } from 'libs/entities/staff.entity';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { ComboBoxModule } from '../combo-box/combo-box.module';
import {
  StaffCreateMiddleware,
  StaffDeleteMiddleware,
  StaffReadMiddleware,
  StaffUpdateMiddleware,
} from '../guards/staff.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity]), ComboBoxModule],
  providers: [StaffService, ...DataSourceProvider],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(StaffController);
    consumer
      .apply(StaffReadMiddleware)
      .forRoutes(
        { path: 'staff', method: RequestMethod.ALL },
        { path: 'staff/*', method: RequestMethod.ALL },
      );
    consumer
      .apply(StaffCreateMiddleware)
      .forRoutes({ path: 'staff/create', method: RequestMethod.ALL });

    consumer
      .apply(StaffUpdateMiddleware)
      .forRoutes({ path: 'staff/update/*', method: RequestMethod.ALL });
    consumer
      .apply(StaffDeleteMiddleware)
      .forRoutes({ path: 'staff/delete', method: RequestMethod.ALL });
  }
}
