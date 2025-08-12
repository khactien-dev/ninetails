import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';

export class CollectMetricSearchInput {
  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'start_date': string;

  @ApiProperty({ required: true, default: '2024-05-31T06:53:00' })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  'end_date': string;

  @ApiProperty({ required: true, default: 'Area' })
  @IsString()
  @IsNotEmpty()
  'area': string;
}

export class CollectMetricSearchData {
  @ApiProperty()
  aggregations: any;
  @ApiProperty()
  data: any;
}

export class CollectMetricSearchRes extends BaseDto {
  @ApiProperty({ type: CollectMetricSearchData })
  data: CollectMetricSearchData;
}
