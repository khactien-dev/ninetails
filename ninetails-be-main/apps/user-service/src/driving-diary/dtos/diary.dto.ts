import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { ESORTDIARY } from 'libs/enums/common.enum';
import { ExportReqCommon } from '../../route/dtos/export.dto';

export class DiaryQueryDto extends BaseQueryReq {
  @ApiProperty({ example: '341가5678' })
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  routeId?: string;

  @ApiProperty({ example: '2024-10-14T07:07:47.254Z' })
  @IsDateString()
  date?: Date;

  schema: string;

  tenant_id: number;

  @ApiProperty()
  @IsEnum(ESORTDIARY)
  sortField?: string;

  sortBy? = null;
}

export class DiaryListRes extends BaseDto {}

export class ExportReqDiary extends ExportReqCommon {
  @ApiProperty({ example: '2024-10-14T07:07:47.254Z' })
  @IsDateString()
  date?: Date;

  @ApiProperty({ example: 1 })
  @IsInt()
  routeId?: string;
}
