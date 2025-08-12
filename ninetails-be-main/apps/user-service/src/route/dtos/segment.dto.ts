import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class SegmentCreateDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  congestion: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  must_pass: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  manual_collect: boolean;

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

  @ApiProperty({
    example: [
      [1, 2],
      [2, 3],
    ],
  })
  @IsArray()
  segment_line: any;
}

export class SegmentCreateArrDto {
  @ApiProperty({ type: [SegmentCreateDto] })
  @IsArray()
  @Type(() => SegmentCreateDto)
  @ValidateNested({ each: true })
  data: SegmentCreateDto[];
}

export class SegmentUpdateDto extends SegmentCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export enum SEGMENTCOLUMN {
  ID = 'id',
  NAME = 'name',
  CONGESTION = 'congestion',
  SPEED = 'speed',
  MUST_PASS = 'must_pass',
  MANUAL_COLLECT = 'manual_collect',
  DISTANCE = 'distance',
  COLLECT_COUNT = 'collect_count',
  SEGMENT_LINE = 'segment_line',
}

export class SegmentUpdateArrDto {
  @ApiProperty({ type: [SegmentUpdateDto] })
  @IsArray()
  @Type(() => SegmentUpdateDto)
  @ValidateNested({ each: true })
  data: SegmentUpdateDto[];
}

export class SegmentQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: SEGMENTCOLUMN })
  @IsOptional()
  @IsEnum(SEGMENTCOLUMN)
  column: SEGMENTCOLUMN;
}

export class SegmentQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [SegmentQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SegmentQueryDto)
  @ValidateNested({ each: true })
  query: SegmentQueryDto[];
}

export class SegmentContent extends SegmentUpdateDto {}

export class SegmentListRes extends BaseDto {
  @ApiProperty({ type: [SegmentContent] })
  data: SegmentContent[];
}
