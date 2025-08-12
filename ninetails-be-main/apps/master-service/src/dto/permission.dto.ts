import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsIn, IsEnum
} from 'class-validator';
import { BaseDto } from '../../../../libs/dtos/base.dto';
import {PERMISSION, FULL, UX, RX, CRUD, RUX, RU, RCUX} from "libs/enums/common.enum";

export class CreatePermissionReq {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tenant_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  @IsIn([PERMISSION.READ], { each: true })
  dashboard: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(FULL, { each: true })
  work_shift: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RX, { each: true })
  realtime_activity: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RUX, { each: true })
  operation_analysis: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RX, { each: true })
  illegal_disposal: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RCUX, { each: true })
  driving_diary: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RU, { each: true })
  notification: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(CRUD, { each: true })
  user_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(CRUD, { each: true })
  staff_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(CRUD, { each: true })
  vehicle_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(CRUD, { each: true })
  absence_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn(RU, { each: true })
  company_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn([PERMISSION.READ], { each: true })
  route_management: string[];

  @ApiProperty()
  @IsArray()
  @IsIn([PERMISSION.READ], { each: true })
  updater_application_management: string[];
}

export class PermissionContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tenant_id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  dashboard: string;

  @ApiProperty()
  work_shift: string;

  @ApiProperty()
  realtime_activity: string;

  @ApiProperty()
  operation_analysis: string;

  @ApiProperty()
  illegal_disposal: string;

  @ApiProperty()
  driving_diary: string;

  @ApiProperty()
  notification: string;

  @ApiProperty()
  user_management: string;

  @ApiProperty()
  company_management: string;

  @ApiProperty()
  staff_management: string;

  @ApiProperty()
  vehicle_management: string;

  @ApiProperty()
  updater_application_management: string;

  @ApiProperty()
  route_management: string;

  @ApiProperty()
  absence_management: string;
}

export class PermissionRes extends BaseDto {
  @ApiProperty({ type: PermissionContent })
  data: PermissionContent;
}
