import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'libs/dtos/base.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { EROUTETYPE } from 'libs/common/constants/common.constant';
import { Type } from 'class-transformer';
import { BaseQueryReq } from 'libs/dtos/base.req';

export class WorkingScheduleContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  dispatch_no: string;

  @ApiProperty()
  working_date: Date;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  license_plate: number;

  @ApiProperty()
  route_id: number;

  @ApiProperty()
  driver: number;

  @ApiProperty()
  backup_driver: number;

  @ApiProperty()
  field_agent_1: number;

  @ApiProperty()
  backup_field_agent_1: number;

  @ApiProperty()
  field_agent_2: number;

  @ApiProperty()
  backup_field_agent_2: number;
}

export class CreateWorkingScheduleRes extends BaseDto {
  @ApiProperty({ type: WorkingScheduleContent })
  data: WorkingScheduleContent;
}

export class CreateWorkingScheduleReq {
  @ApiProperty({ required: true, example: 'YYYY-MM-DD' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  working_date: Date;

  @ApiProperty({ required: true, enum: EROUTETYPE })
  @IsNotEmpty()
  @IsEnum(EROUTETYPE)
  purpose: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  vehicle_id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  route_id: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  driver: number;

  // @ApiProperty({ required: true })
  // @IsOptional()
  // @IsInt()
  backup_driver?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  field_agent_1: number;

  // @ApiProperty({ required: true })
  // @IsOptional()
  // @IsInt()
  backup_field_agent_1?: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  field_agent_2: number;

  // @ApiProperty({ required: true })
  // @IsOptional()
  // @IsInt()
  backup_field_agent_2?: number;
}

export class UpdateWorkingScheduleReq {
  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  vehicle_id?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  backup_vehicle_id?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  route_id?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  driver?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  backup_driver?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  field_agent_1?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  backup_field_agent_1?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  field_agent_2?: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
  backup_field_agent_2?: number;

  working_date?: Date;
}

export class DeleteWorkingScheduleReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];
}

export class SearchWorkingScheduleReq extends BaseQueryReq {
  @ApiProperty({ required: false, type: Date, format: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  working_date?: Date;

  @ApiProperty({ required: false, type: 'number' })
  @IsOptional()
  route_id?: number;

  @ApiProperty({ enum: EROUTETYPE, required: false })
  @IsEnum(EROUTETYPE)
  @IsOptional()
  purpose?: EROUTETYPE;

  statistic?: boolean;

  schema?: string;
}
