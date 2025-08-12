import { Module, Scope } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationEntity } from 'libs/entities/location.entity';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ElasticsearchRequestInterceptor } from 'libs/common/logger/opensearch-logger.interceptor';
import { ExceptionHandleError } from 'libs/utils/http-exception.interceptor';
import { OpenSearchLoggerModule } from 'libs/common/logger/opensearch-logger.module';
import { ROLLING_INDEX_MODE } from 'libs/common/logger/opensearch-logger.utilities';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [LocationEntity],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([LocationEntity]),
    OpenSearchLoggerModule.forRoot({
      indexPrefix: 'location-api-service',
      rollingOffsetMode: ROLLING_INDEX_MODE.MONTHLY,
      name: 'location-api-service',
      stdout: true,
      openSearchClientOptions: {
        node: process.env.OPENSEARCH_SERVER ?? 'http://opensearch:9300',
        ssl: { rejectUnauthorized: false },
      },
    }),
  ],
  controllers: [LocationController],
  providers: [
    LocationService,
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
export class LocationModule {}
