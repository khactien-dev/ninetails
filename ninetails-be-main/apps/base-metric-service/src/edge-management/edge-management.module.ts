import { Module } from '@nestjs/common';
import { EdgeManagementService } from './edge-management.service';
import { EdgeManagementController } from './edge-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeServeEntity } from 'libs/entities/edge-serve.entity';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { EdgeStateService } from './edge-state.service';
import { Client } from '@opensearch-project/opensearch';
import { ConfigService } from '@nestjs/config';
import { EdgeStateController } from './edge-state.controller';
import {
  EdgeState1DayEntity,
  EdgeState1HourEntity,
  EdgeStateRawEntity,
} from 'libs/entities/edge-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EdgeServeEntity,
      EdgeStateRawEntity,
      EdgeState1HourEntity,
      EdgeState1DayEntity,
    ]),
  ],
  controllers: [EdgeManagementController, EdgeStateController],
  providers: [
    EdgeManagementService,
    EdgeStateService,
    ...DataSourceProvider,
    {
      provide: 'OpenSearchClient',
      useFactory: async (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('OPENSEARCH_SERVER'),
          ssl: {
            rejectUnauthorized: false,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [EdgeManagementService],
})
export class EdgeManagementModule {}
