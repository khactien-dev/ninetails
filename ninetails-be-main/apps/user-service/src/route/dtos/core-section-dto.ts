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
import {
  ECORESECTIONTYPE,
  EROUTETYPE,
} from 'libs/common/constants/common.constant';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq, RouteManageQuery } from 'libs/dtos/base.req';

export class CoreSectionCreateDto {
  @ApiProperty()
  @IsInt()
  segment_id: number;

  @ApiProperty()
  @IsInt()
  route_id: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  point_index: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'GARAGE' })
  @IsEnum(ECORESECTIONTYPE)
  type: ECORESECTIONTYPE;

  @ApiProperty({ example: 'C' })
  @IsEnum(EROUTETYPE)
  route_type: EROUTETYPE;
}

export class CoreSectionCreateDtoArrDto {
  @ApiProperty({ type: [CoreSectionCreateDto] })
  @IsArray()
  @Type(() => CoreSectionCreateDto)
  @ValidateNested({ each: true })
  data: CoreSectionCreateDto[];
}

export class CoreSectionUpdateDto extends CoreSectionCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export class CoreSectionUpdateArrDto {
  @ApiProperty({ type: [CoreSectionUpdateDto] })
  @IsArray()
  @Type(() => CoreSectionUpdateDto)
  @ValidateNested({ each: true })
  data: CoreSectionUpdateDto[];
}

export enum CORESECTIONCOLUMN {
  SEGMENT_ID = 'segment_id',
  ROUTE_ID = 'point_index',
  ID = 'id',
  NAME = 'name',
}

export class CoreSectionQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: CORESECTIONCOLUMN })
  @IsOptional()
  @IsEnum(CORESECTIONCOLUMN)
  column: CORESECTIONCOLUMN;
}

export class CoreSectionQueryArrDto extends BaseQueryReq {
  @ApiProperty({ required: false, type: [CoreSectionQueryDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CoreSectionQueryDto)
  @ValidateNested({ each: true })
  query: CoreSectionQueryDto[];
}

export class CoreSectionContent extends CoreSectionUpdateDto {}

export class CoreSectionListRes extends BaseDto {
  @ApiProperty({ type: [CoreSectionContent] })
  data: CoreSectionContent[];
}
