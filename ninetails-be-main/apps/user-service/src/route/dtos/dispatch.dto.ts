import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { EROUTETYPE } from 'libs/common/constants/common.constant';
import { RouteManageQuery } from 'libs/dtos/base.req';

export class DispatchCreateDto {
  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsInt()
  route_id: number;

  @ApiProperty()
  @IsEnum(EROUTETYPE)
  route_type: EROUTETYPE;

  @ApiProperty()
  @IsInt()
  vehicle_id: number;

  @ApiProperty()
  @IsInt()
  driver_id: number;

  @ApiProperty()
  @IsInt()
  crew1_id: number;

  @ApiProperty()
  @IsInt()
  crew2_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  alt_vehicle_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  alt_driver_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  alt_crew1_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  alt_crew2_id: number;
}

export class DispatchUpdateDto extends DispatchCreateDto {
  @ApiProperty()
  @IsInt()
  updateId: number;
}

export enum DISPATCHCOLUMN {
  DATE = 'date',
  ROUTE_ID = 'route_id',
  ROUTE_TYPE = 'route_type',
  ID = 'id',
}

export class DispatchQueryDto extends RouteManageQuery {
  @ApiProperty({ required: false, enum: DISPATCHCOLUMN })
  @IsOptional()
  @IsEnum(DISPATCHCOLUMN)
  column: DISPATCHCOLUMN;
}
