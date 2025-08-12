import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { ComboBoxService } from './combo-box.service';
import { ComboBoxController } from './combo-box.controller';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import {
  RoleBackUpMiddleware,
  RoleOpMiddleware,
} from '../guards/role.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([ComboBoxEntity])],
  providers: [ComboBoxService, ...DataSourceProvider],
  controllers: [ComboBoxController],
  exports: [ComboBoxService],
})
export class ComboBoxModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(ComboBoxController)
      .apply(RoleOpMiddleware)
      .forRoutes({ path: '/delete/*', method: RequestMethod.ALL });
  }
}
