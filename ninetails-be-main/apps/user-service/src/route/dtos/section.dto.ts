import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class SectionCreateDto {
  @ApiProperty()
  @IsInt()
  route_id: number;

  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  point_index: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  point_count: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  congestion: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  distance: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  collect_count: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  collect_volume: number;
}

export class SectionCreateArrDto {
  @ApiProperty({ type: [SectionCreateDto] })
  @IsArray()
  @Type(() => SectionCreateDto)
  @ValidateNested({ each: true })
  data: SectionCreateDto[];
}

export enum SECTIONCOLUMN {
  ID = 'id',
  ROUTE_ID = 'route_id',
  NAME = 'name',
  POINT_INDEX = 'point_index',
  POINT_COUNT = 'point_count',
  DISTANCE = 'distance',
  CONGESTION = 'congestion',
  SPEEND = 'speed',
  COLLECT_COUNT = 'collect_count',
}

export class SectionQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: SECTIONCOLUMN })
  @IsOptional()
  @IsEnum(SECTIONCOLUMN)
  column: SECTIONCOLUMN;
}

export class SectionQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [SectionQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SectionQueryDto)
  @ValidateNested({ each: true })
  query: SectionQueryDto[];
}

export class SectionUpdateDto extends SectionCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class SectionUpdateArrDto {
  @ApiProperty({ type: [SectionUpdateDto] })
  @IsArray()
  @Type(() => SectionUpdateDto)
  @ValidateNested({ each: true })
  data: SectionUpdateDto[];
}

export class SectionContent extends SectionUpdateDto {}

export class SectionListRes extends BaseDto {
  @ApiProperty({ type: [SectionContent] })
  data: SectionContent[];
}
