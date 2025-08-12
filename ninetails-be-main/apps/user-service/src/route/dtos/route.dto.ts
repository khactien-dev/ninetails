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
import { EROUTETYPE } from 'libs/common/constants/common.constant';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';
import { SegmentCreateDto } from './segment.dto';
import { SectionCreateDto } from './section.dto';
import { GuideCreateDto } from './guide.dto';
import { CongestionCreateDto } from './congestion.dto';
import { CoreSectionCreateDto } from './core-section-dto';
import { SegmentRouteCreateDto } from './segment-route.dto';

export class RouteCreateDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'C' })
  @IsOptional()
  @IsEnum(EROUTETYPE)
  type: string;

  @ApiProperty({ example: [1, 2] })
  @IsArray()
  start: any;

  @ApiProperty({ example: [1, 2] })
  @IsArray()
  goal: any;

  @ApiProperty()
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsInt()
  collect_volume: number;

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

  @ApiProperty({
    example: [
      [1, 2],
      [2, 3],
    ],
  })
  @IsArray()
  path: any;

  @ApiProperty()
  @IsInt()
  collect_count: number;

  @ApiProperty()
  @IsNumber()
  distance: number;
}

export class RouteCreateArrDto {
  @ApiProperty({ type: [RouteCreateDto] })
  @IsArray()
  @Type(() => RouteCreateDto)
  @ValidateNested({ each: true })
  data: RouteCreateDto[];
}

enum ROUTESORT {
  ID = 'id',
}

export enum ROUTECOLUMN {
  ID = 'id',
  NAME = 'name',
  START = 'start',
  GOAL = 'goal',
  DISTANCE = 'distance',
  DURATION = 'duration',
  BBOX = 'bbox',
  PATH = 'path',
  COLLECT_COUNT = 'collect_count',
}

export class RouteQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: ROUTECOLUMN })
  @IsOptional()
  @IsEnum(ROUTECOLUMN)
  column: ROUTECOLUMN;
}

export class RouteQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [RouteQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => RouteQueryDto)
  @ValidateNested({ each: true })
  query: RouteQueryDto[];

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROUTESORT)
  sortField?: string;
}

export class IdReqDto {
  @ApiProperty()
  id: number;
}

export class RouteUpdateDto extends RouteCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class RouteUpdateArrDto {
  @ApiProperty({ type: [RouteUpdateDto] })
  @IsArray()
  @Type(() => RouteUpdateDto)
  @ValidateNested({ each: true })
  data: RouteUpdateDto[];
}

export class RouteContent extends RouteUpdateDto {}

export class RouteListRes extends BaseDto {
  @ApiProperty({ type: [RouteContent] })
  data: RouteContent[];
}

enum FILE_EXAMPLE {
  CSV = 'example-csv',
  TXT = 'example-txt',
  XLSX = 'example-xlsx',
  XML = 'example-xml',
}

export class FileExampleDto {
  @ApiProperty({ enum: FILE_EXAMPLE })
  @IsEnum(FILE_EXAMPLE)
  type: string;
}

export class SaveAllRouteManageDto {
  @ApiProperty({ type: [RouteCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => RouteCreateDto)
  @ValidateNested({ each: true })
  routes?: RouteCreateDto[];

  @ApiProperty({ type: [SegmentCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SegmentCreateDto)
  @ValidateNested({ each: true })
  segments?: SegmentCreateDto[];

  @ApiProperty({ type: [SectionCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SectionCreateDto)
  @ValidateNested({ each: true })
  sections?: SectionCreateDto[];

  @ApiProperty({ type: [GuideCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => GuideCreateDto)
  @ValidateNested({ each: true })
  guides?: GuideCreateDto[];

  @ApiProperty({ type: [CongestionCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CongestionCreateDto)
  @ValidateNested({ each: true })
  congestions?: CongestionCreateDto[];

  @ApiProperty({ type: [CoreSectionCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CoreSectionCreateDto)
  @ValidateNested({ each: true })
  coreSections?: CoreSectionCreateDto[];

  @ApiProperty({ type: [SegmentRouteCreateDto] })
  @IsOptional()
  @IsArray()
  @Type(() => SegmentRouteCreateDto)
  @ValidateNested({ each: true })
  routeSegmentMap?: SegmentRouteCreateDto[];
}
