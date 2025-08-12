import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { IllegalDischargeData } from '../fake-metric/fake-metric.dto';

export class IllegalDischargeSearchInput {
  @ApiProperty({ required: true, default: '2023-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'start_date': string;

  @ApiProperty({ required: true, default: '2025-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'end_date': string;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  'route_name': string;
}

export class IllegalDischargeSearchData {
  @ApiProperty({ type: [IllegalDischargeData] })
  items: any;
  @ApiProperty({ default: { max: 2, min: 1, avg: 1.5 } })
  aggregate_hour: object;
  @ApiProperty({
    default: {
      all: {
        within_1_week: 1,
        within_2_week: 2,
        more_than_2_week: 3,
        classifications: [
          { count: 11, key: 1 },
          { count: 22, key: 2 },
          { count: 33, key: 3 },
          { count: 44, key: 4 },
        ],
      },
      collection: {
        within_1_week: 1,
        within_2_week: 2,
        more_than_2_week: 3,
        classifications: [
          { count: 11, key: 1 },
          { count: 22, key: 2 },
          { count: 33, key: 3 },
          { count: 44, key: 4 },
        ],
      },
      produce: {
        within_1_week: 1,
        within_2_week: 2,
        more_than_2_week: 3,
        classifications: [
          { count: 11, key: 1 },
          { count: 22, key: 2 },
          { count: 33, key: 3 },
          { count: 44, key: 4 },
        ],
      },
    },
  })
  count: any;
}

export class AddressInput {
  @ApiProperty({ required: true, default: 126.978388 })
  @IsNumber()
  @IsNotEmpty()
  'gps_x': number;

  @ApiProperty({ required: true, default: 37.56661 })
  @IsNumber()
  @IsNotEmpty()
  'gps_y': number;
}

export class IllegalDischargeSearchRes extends BaseDto {
  @ApiProperty({ type: IllegalDischargeSearchData })
  data: object;
}
