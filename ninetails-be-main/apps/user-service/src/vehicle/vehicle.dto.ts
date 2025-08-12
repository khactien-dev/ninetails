import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BasePagination, BaseQueryReq } from 'libs/dtos/base.req';
import { ComboBoxEntity } from 'libs/entities/combo-box.entity';
import { ESORTVEHICLE, VEHICLE_PURPOSE, VEHICLE_STATUS } from 'libs/enums/common.enum';
import { IsAfter, IsBefore } from 'libs/utils/validator.util';

export class VehicleData {
  @ApiProperty()
  id: number;
  @ApiProperty()
  vehicle_number: string;
  @ApiProperty()
  vehicle_type: ComboBoxEntity;
  @ApiProperty()
  vehicle_model: ComboBoxEntity;
  @ApiProperty()
  manufacturer: ComboBoxEntity;
  @ApiProperty()
  operation_start_date: Date;
  @ApiProperty()
  operation_end_date: Date;
  @ApiProperty()
  capacity: ComboBoxEntity;
  @ApiProperty()
  max_capacity: ComboBoxEntity;
  @ApiProperty()
  recent_maintenance: Date;
  @ApiProperty()
  next_maintenance: Date;
  @ApiProperty()
  special_features: ComboBoxEntity;
  @ApiProperty()
  purpose: string;
  @ApiProperty()
  note: string;
  @ApiProperty()
  status: string;
}

export class VehicleCreateForm {
  @ApiProperty({ required: true, default: '341가5678' })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  // @Matches(
  //   /^\d{3}(가|나|다|라|마|거|너|더|러|머|버|서|어|저|고|노|도|로|모|보|소|오|조|구|누|두|루|무|부|수|우|주)\d{4}$/,
  //   {
  //     message:
  //       'Please enter a valid vehicle license number such as “NNN가NNNN”. The Hangul character used in the middle section can vary',
  //   },
  // )
  vehicle_number: string;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle_type: ComboBoxEntity;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle_model: ComboBoxEntity;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  manufacturer: ComboBoxEntity;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  @IsBefore('operation_end_date', {
    message: 'The start date cannot exceed the end date. Please try again!',
  })
  operation_start_date: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('operation_start_date', {
    message: 'The end date cannot be before the start date. Please try again!',
  })
  operation_end_date: Date;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  capacity: ComboBoxEntity;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  max_capacity: ComboBoxEntity;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsBefore('next_maintenance', {
    message:
      'The recent maintenance date cannot exceed the next one. Please try again!',
  })
  recent_maintenance: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('recent_maintenance', {
    message:
      'The next maintenance date cannot be before the recent one. Please try again!',
  })
  next_maintenance: Date;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsOptional()
  @IsObject()
  special_features: ComboBoxEntity;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsEnum(VEHICLE_PURPOSE)
  purpose: VEHICLE_PURPOSE;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({ required: true })
  @IsEnum(VEHICLE_STATUS)
  status: VEHICLE_STATUS;
}

export class VehicleUpdateForm {
  @ApiProperty({ default: '341가5678' })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  // @Matches(
  //   /^\d{3}(가|나|다|라|마|거|너|더|러|머|버|서|어|저|고|노|도|로|모|보|소|오|조|구|누|두|루|무|부|수|우|주)\d{4}$/,
  //   {
  //     message:
  //       'Please enter a valid vehicle license number such as “NNN가NNNN”. The Hangul character used in the middle section can vary',
  //   },
  // )
  vehicle_number: string;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle_type: ComboBoxEntity;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  vehicle_model: ComboBoxEntity;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  manufacturer: ComboBoxEntity;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  @IsBefore('operation_end_date', {
    message: 'The start date cannot exceed the end date. Please try again!',
  })
  operation_start_date: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('operation_start_date', {
    message: 'The end date cannot be before the start date. Please try again!',
  })
  operation_end_date: Date;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  capacity: ComboBoxEntity;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  max_capacity: ComboBoxEntity;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsBefore('next_maintenance', {
    message:
      'The recent maintenance date cannot exceed the next one. Please try again!',
  })
  recent_maintenance: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('recent_maintenance', {
    message:
      'The next maintenance date cannot be before the recent one. Please try again!',
  })
  next_maintenance: Date;

  @ApiProperty({ default: { id: 1 } })
  @IsOptional()
  @IsObject()
  special_features: ComboBoxEntity;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty({ message: 'This field is required.' })
  @IsEnum(VEHICLE_PURPOSE)
  purpose: VEHICLE_PURPOSE;

  @ApiProperty()
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(VEHICLE_STATUS)
  status: VEHICLE_STATUS;
}

export class VehicleUpdateManyInput {
  @ApiProperty()
  @IsOptional()
  @IsEnum(VEHICLE_STATUS)
  status: VEHICLE_STATUS;
}

export class VehicleUpdateManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];

  @ApiProperty()
  @IsObject()
  input: VehicleUpdateManyInput;
}

export class VehicleDeleteManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];
}

export class VehicleListData {
  @ApiProperty({ type: [VehicleData] })
  data: [];
  @ApiProperty()
  pagination: BasePagination;
}

export class VehicleSaveRes extends BaseDto {
  @ApiProperty({ type: VehicleData })
  data: VehicleData;
}

export class VehicleDeleteRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class VehicleListRes extends BaseDto {
  @ApiProperty({ type: VehicleListData })
  data: VehicleListData;
}

export class VehicleUpdateManyRes extends BaseDto {
  @ApiProperty({ type: [VehicleData] })
  data: [];
}
export class VehicleDeleteManyRes extends BaseDto {
  @ApiProperty({ type: Number })
  data: number;
}

export class SearchValueVehicleReq extends BaseQueryReq {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({ required: false, enum: ESORTVEHICLE })
  @IsOptional()
  @IsEnum(ESORTVEHICLE)
  sortField?: ESORTVEHICLE;
}
