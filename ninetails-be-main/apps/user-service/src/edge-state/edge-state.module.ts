import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { EdgeStateService } from './edge-state.service';
import {
  EdgeStateRawEntity,
  EdgeState1HourEntity,
} from 'libs/entities/edge-state.entity';
import { Client } from '@opensearch-project/opensearch';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkingScheduleEntity,
      EdgeStateRawEntity,
      EdgeState1HourEntity,
    ]),
  ],
  providers: [
    EdgeStateService,
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
})
export class EdgeStateModule {}
