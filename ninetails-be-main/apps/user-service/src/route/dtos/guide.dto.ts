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

export class GuideCreateDto {
  @ApiProperty()
  @IsInt()
  @IsOptional()
  route_id: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  point_index: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  point_count: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  type: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  instructions: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  distance: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty({
    example: [
      [
        [1, 2],
        [2, 3],
      ],
    ],
  })
  @IsArray()
  bbox: any;
}

export class GuideCodeCreateDto {
  @ApiProperty()
  @IsInt()
  code: number;

  @ApiProperty()
  @IsString()
  description: string;
}

export class GuideCreateArrDto {
  @ApiProperty({ type: [GuideCreateDto] })
  @IsArray()
  @Type(() => GuideCreateDto)
  @ValidateNested({ each: true })
  data: GuideCreateDto[];
}

export class GuideCodeCreateArrDto {
  @ApiProperty({ type: [GuideCodeCreateDto] })
  @IsArray()
  data: GuideCodeCreateDto[];
}

export class GuideUpdateDto extends GuideCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class GuideUpdateArrDto {
  @ApiProperty({ type: [GuideUpdateDto] })
  @IsArray()
  @Type(() => GuideUpdateDto)
  @ValidateNested({ each: true })
  data: GuideUpdateDto[];
}

export class GuideCodeUpdateDto extends GuideCodeCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}

export class GuideCodeUpdateArrDto {
  @ApiProperty({ type: [GuideCodeUpdateDto] })
  @IsArray()
  @Type(() => GuideCodeUpdateDto)
  @ValidateNested({ each: true })
  data: GuideCodeUpdateDto[];
}

export enum GUIDECOLUMN {
  ID = 'id',
  ROUTE_ID = 'route_id',
  POINT_INDEX = 'point_index',
  TYPE = 'type',
  INSTRUCTIONS = 'instructions',
  DISTANCE = 'distance',
  DURATION = 'duration',
}

enum GUIDESORT {
  ID = 'id',
}

export class GuideQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: GUIDECOLUMN })
  @IsOptional()
  @IsEnum(GUIDECOLUMN)
  column: GUIDECOLUMN;
}

export class GuideQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [GuideQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => GuideQueryDto)
  @ValidateNested({ each: true })
  query: GuideQueryDto[];

  @ApiProperty()
  @IsOptional()
  @IsEnum(GUIDESORT)
  sortField?: string;
}

export enum GUIDECODECOLUMN {
  CODE = 'code',
  DESCRIPTION = 'description',
}

export class GuideCodeQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: GUIDECODECOLUMN })
  @IsOptional()
  @IsEnum(GUIDECODECOLUMN)
  column: GUIDECODECOLUMN;
}

export class GuideCodeQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [GuideCodeQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => GuideCodeQueryDto)
  @ValidateNested({ each: true })
  query: GuideCodeQueryDto[];
}

export class GuideCodeDto {
  @ApiProperty({ example: [1, 2] })
  @IsArray()
  codes: number[];
}

export class GuideContent extends GuideUpdateDto {}

export class GuideListRes extends BaseDto {
  @ApiProperty({ type: [GuideContent] })
  data: GuideContent[];
}

export class GuideCodeContent extends GuideCodeUpdateDto {}

export class GuideCodeListRes extends BaseDto {
  @ApiProperty({ type: [GuideCodeContent] })
  data: GuideCodeContent[];
}
