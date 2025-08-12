import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeServeService } from './edge-serve.service';
import { EdgeServeController } from './edge-serve.controller';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { AuthMiddleware } from '../guards/auth.middleware';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import { ConfigWeightEntity } from 'libs/entities/config-weight.entity';
import { ConfigWeightController } from './config-weight.controller';
import {
  EdgeServerCreateMiddleware,
  EdgeServerDeleteMiddleware,
  EdgeServerReadMiddleware,
  EdgeServerUpdateMiddleware,
} from '../guards/edge_server.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([EdgeServeEntity, ConfigWeightEntity])],
  providers: [EdgeServeService, ...DataSourceProvider],
  controllers: [EdgeServeController, ConfigWeightController],
  exports: [EdgeServeService],
})
export class EdgeServeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(EdgeServeController);
    consumer.apply(AuthMiddleware).forRoutes(ConfigWeightController);
    consumer
      .apply(EdgeServerReadMiddleware)
      .forRoutes({ path: 'edge-serve/', method: RequestMethod.GET });
    consumer
      .apply(EdgeServerCreateMiddleware)
      .forRoutes({ path: 'edge-serve/create', method: RequestMethod.ALL });
    consumer.apply(EdgeServerUpdateMiddleware).forRoutes(
      {
        path: 'edge-serve/*',
        method: RequestMethod.PUT,
      },
      {
        path: 'edge-serve/update-many',
        method: RequestMethod.PUT,
      },
    );
    consumer.apply(EdgeServerDeleteMiddleware).forRoutes({
      path: 'edge-serve/delete-many',
      method: RequestMethod.ALL,
    });
  }
}
