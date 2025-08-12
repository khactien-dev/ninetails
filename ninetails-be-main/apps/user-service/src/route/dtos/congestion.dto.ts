import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class CongestionCreateDto {
  @ApiProperty()
  @IsNumber()
  code: number;

  @ApiProperty()
  @IsString()
  description: string;
}

export class CongestionCreateDtoArrDto {
  @ApiProperty({ type: [CongestionCreateDto] })
  @IsArray()
  @Type(() => CongestionCreateDto)
  @ValidateNested({ each: true })
  data: CongestionCreateDto[];
}

export class CongestionUpdateDto extends CongestionCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class CongestionUpdateArrDto {
  @ApiProperty({ type: [CongestionUpdateDto] })
  @IsArray()
  @Type(() => CongestionUpdateDto)
  @ValidateNested({ each: true })
  data: CongestionUpdateDto[];
}

export enum CONGESTIONCOLUMN {
  CODE = 'code',
  DESCRIPTION = 'description',
}

export class CongestionQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: CONGESTIONCOLUMN })
  @IsOptional()
  @IsEnum(CONGESTIONCOLUMN)
  column: CONGESTIONCOLUMN;
}

export class CongestionQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [CongestionQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CongestionQueryDto)
  @ValidateNested({ each: true })
  query: CongestionQueryDto[];

  @ApiProperty()
  @IsOptional()
  @IsEnum(CONGESTIONCOLUMN)
  sortField?: string;
}

export class CongestionCodesDto {
  @ApiProperty()
  @IsArray()
  codes: number[];
}

export class CongestionContent extends CongestionUpdateDto {}

export class CongestionListRes extends BaseDto {
  @ApiProperty({ type: [CongestionContent] })
  data: CongestionContent[];
}
