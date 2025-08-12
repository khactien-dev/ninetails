import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class SegmentRouteCreateDto {
  @ApiProperty()
  @IsInt()
  segment_id: number;

  @ApiProperty()
  @IsInt()
  route_id: number;

  @ApiProperty()
  @IsInt()
  section_id: number;
}

export class SegmentRouteCreateArrDto {
  @ApiProperty({ type: [SegmentRouteCreateDto] })
  @IsArray()
  @Type(() => SegmentRouteCreateDto)
  @ValidateNested({ each: true })
  data: SegmentRouteCreateDto[];
}

export class SegmentRouteUpdateDto extends SegmentRouteCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class SegmentRouteUpdateArrDto {
  @ApiProperty({ type: [SegmentRouteUpdateDto] })
  @IsArray()
  @Type(() => SegmentRouteUpdateDto)
  @ValidateNested({ each: true })
  data: SegmentRouteUpdateDto[];
}

export enum SEGMENTROUTECOLUMN {
  SEGMENT_ID = 'segment_id',
  ROUTE_ID = 'route_id',
  SECTION_ID = 'section_id',
  ID = 'id',
}

export class SegRouteQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: SEGMENTROUTECOLUMN })
  @IsOptional()
  @IsEnum(SEGMENTROUTECOLUMN)
  column: SEGMENTROUTECOLUMN;
}

export class SegRouteQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [SegRouteQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SegRouteQueryDto)
  @ValidateNested({ each: true })
  query: SegRouteQueryDto[];
}

export class SegmentRouteContent extends SegmentRouteUpdateDto {}

export class SegmentRouteListRes extends BaseDto {
  @ApiProperty({ type: [SegmentRouteContent] })
  data: SegmentRouteContent[];
}
