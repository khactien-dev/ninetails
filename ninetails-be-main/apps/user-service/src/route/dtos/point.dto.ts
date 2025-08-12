import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class PointCreateDto {
  @ApiProperty()
  @IsInt()
  segment_id: number;

  @ApiProperty()
  @IsInt()
  point_index: number;

  @ApiProperty()
  @IsString()
  name: string;
}

export class PointCreateArrDto {
  @ApiProperty({ type: [PointCreateDto] })
  @IsArray()
  @Type(() => PointCreateDto)
  @ValidateNested({ each: true })
  data: PointCreateDto[];
}

export class PointUpdateDto extends PointCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class PointUpdateArrDto {
  @ApiProperty({ type: [PointUpdateDto] })
  @IsArray()
  @Type(() => PointUpdateDto)
  @ValidateNested({ each: true })
  data: PointUpdateDto[];
}

export enum POINTCOLUMN {
  SEGMENT_ID = 'segment_id',
  POINT_INDEX = 'point_index',
  NAME = 'name',
  ID = 'id',
}

export class PointQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: POINTCOLUMN })
  @IsOptional()
  @IsEnum(POINTCOLUMN)
  column: POINTCOLUMN;
}

export class PointQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [PointQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => PointQueryDto)
  @ValidateNested({ each: true })
  query: PointQueryDto[];
}

export class PointContent extends PointUpdateDto {}

export class PointListRes extends BaseDto {
  @ApiProperty({ type: [PointContent] })
  data: PointContent[];
}
