import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { NUMBER_PAGE } from 'libs/common/constants/common.constant';
import { BaseDto } from 'libs/dtos/base.dto';

class BaseQueryReq {
  @ApiProperty({ required: false })
  @Transform((params) =>
    params.value === '' ? NUMBER_PAGE.PAGE : +params.value,
  )
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false })
  @Transform((params) =>
    params.value === '' ? NUMBER_PAGE.PAGE_SIZE : +params.value,
  )
  @IsOptional()
  pageSize?: number = 10;
}

export class EdgeStateQueryDto extends BaseQueryReq {
  schema: string;

  @ApiProperty({ example: '5m' })
  @IsIn(['5m', '30m', '1h', '1d'])
  timeRange: string;

  @ApiProperty({ example: 1 })
  @IsNumberString()
  routeId: number;

  @ApiProperty({ example: '2025-05-12' })
  @IsDateString()
  date: Date;
}

export class LastEdgeStateQueryDto {
  @ApiProperty({ example: '2025-05-12' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 1 })
  @IsNumberString()
  routeId: number;
}

export class EdgeStateRes {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  routeId: number;

  @ApiProperty()
  cpu_avg_degree: number;

  @ApiProperty()
  gpu_avg_degree: number;

  @ApiProperty()
  soc_avg_degree: number;

  @ApiProperty()
  'cpu_avg_%': number;

  @ApiProperty()
  'gpu_avg_%': number;

  @ApiProperty()
  'mem_avg_%': number;

  @ApiProperty()
  'disk_avg_%': number;

  @ApiProperty()
  lte_in_total_byte: number;

  @ApiProperty()
  lte_out_total_byte: number;

  @ApiProperty()
  camera_total_byte: number;

  @ApiProperty()
  dtg_total_byte: number;

  @ApiProperty()
  disk_total_byte: number;
}

export class EdgeStateResDto extends BaseDto {
  @ApiProperty({ type: EdgeStateRes })
  data: EdgeStateRes;
}
