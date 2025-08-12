import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class MetadataCreateDto {
  @ApiProperty()
  @IsString()
  table_name: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  version: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  updated_by: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  update_time: string;
}

export class MetadataCreateArrDto {
  @ApiProperty({ type: [MetadataCreateDto] })
  @IsArray()
  @Type(() => MetadataCreateDto)
  @ValidateNested({ each: true })
  data: MetadataCreateDto[];
}

export class MetadataUpdateDto extends MetadataCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class MetadataUpdateArrDto {
  @ApiProperty({ type: [MetadataUpdateDto] })
  @IsArray()
  @Type(() => MetadataUpdateDto)
  @ValidateNested({ each: true })
  data: MetadataUpdateDto[];
}

export enum METADATACOLUMN {
  TABLE_NAME = 'table_name',
  VERSION = 'version',
  UPDATED_BY = 'updated_by',
}

export class MetadataQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: METADATACOLUMN })
  @IsOptional()
  @IsEnum(METADATACOLUMN)
  column: METADATACOLUMN;
}

export class MetadataQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [MetadataQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => MetadataQueryDto)
  @ValidateNested({ each: true })
  query: MetadataQueryDto[];
}

export class TableNameArrDto {
  @ApiProperty()
  @IsArray()
  table_name: string[];
}

export class MetadataContent extends MetadataUpdateDto {}

export class MetadataListRes extends BaseDto {
  @ApiProperty({ type: [MetadataContent] })
  data: MetadataContent[];
}
