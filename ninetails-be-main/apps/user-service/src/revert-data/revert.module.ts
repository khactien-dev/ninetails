import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RevertDataService } from './revert.service';
import { RevertDataController } from './revert.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';

@Module({
  providers: [RevertDataService, ...DataSourceProvider],
  exports: [RevertDataService],
  controllers: [RevertDataController],
})
export class RevertDataModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(RevertDataController);
  }
}
