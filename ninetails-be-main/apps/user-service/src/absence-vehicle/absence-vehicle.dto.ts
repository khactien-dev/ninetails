import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BasePagination, BaseQueryReq } from 'libs/dtos/base.req';
import { IsAfter, IsBefore } from 'libs/utils/validator.util';
import { VehicleData } from '../vehicle/vehicle.dto';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import {
  ABSENCE_VEHICLE_TYPE,
  ESORT_ABSENCE_VEHICLE,
} from 'libs/enums/common.enum';

export class AbsenceVehicleData {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: VehicleData })
  absence_vehicle: VehicleData;
  @ApiProperty({ type: VehicleData })
  replacement_vehicle: VehicleData;
  @ApiProperty()
  absence_type: string;
  @ApiProperty()
  start_date: Date;
  @ApiProperty()
  end_date: Date;
}

export class AbsenceVehicleCloset extends BaseQueryReq {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  end_date: Date;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  vehicle_id: string;
}

export class AbsenceVehicleSearchForm extends BaseQueryReq {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  start_date: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  end_date: Date;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  vehicle_id: string;

  @ApiProperty({ required: false, enum: ESORT_ABSENCE_VEHICLE })
  @IsOptional()
  @IsEnum(ESORT_ABSENCE_VEHICLE)
  sortField?: string;
}

export class AbsenceVehicleCreateForm {
  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  absence_vehicle: VehicleEntity;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  replacement_vehicle: VehicleEntity;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsEnum(ABSENCE_VEHICLE_TYPE)
  absence_type: ABSENCE_VEHICLE_TYPE;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString({ strict: true })
  @IsBefore('end_date', { message: 'Please select a valid time period' })
  start_date: Date;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsDateString({ strict: true })
  @IsAfter('start_date', { message: 'Please select a valid time period' })
  end_date: Date;
}

export class AbsenceVehicleUpdateForm {
  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty()
  @IsObject()
  absence_vehicle: VehicleEntity;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty()
  @IsObject()
  replacement_vehicle: VehicleEntity;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsEnum(ABSENCE_VEHICLE_TYPE)
  absence_type: ABSENCE_VEHICLE_TYPE;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsBefore('end_date', { message: 'Please select a valid time period' })
  start_date: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('start_date', { message: 'Please select a valid time period' })
  end_date: Date;
}

export class AbsenceVehicleDeleteManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];
}

export class AbsenceVehicleList {
  @ApiProperty({ type: [AbsenceVehicleData] })
  data: [];
  @ApiProperty()
  pagination: BasePagination;
}

export class AbsenceVehicleListRes extends BaseDto {
  @ApiProperty({ type: AbsenceVehicleList })
  data: AbsenceVehicleList;
}

export class AbsenceVehicleRes extends BaseDto {
  @ApiProperty({ type: AbsenceVehicleData })
  data: AbsenceVehicleData;
}

export class AbsenceVehicleDeleteRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class AbsenceVehicleDeleteManyRes extends BaseDto {
  @ApiProperty({ type: Number })
  data: number;
}
