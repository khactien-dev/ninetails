import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../../libs/dtos/base.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  DriverLicense,
  JobContract,
  StaffStatus,
} from '../../../../libs/common/constants/common.constant';
import { BaseQueryReq } from '../../../../libs/dtos/base.req';
import { ESORTSTAFF } from 'libs/enums/common.enum';
import { IsAfter, IsBefore } from 'libs/utils/validator.util';
import { AbsenceStaffData } from '../absence-staff/absence-staff.dto';

export class StaffContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  age: Date;

  @ApiProperty()
  driver_license: string;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  job_contract: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  absence_staff_id: number;
}

export class CreateStaffReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: true, default: '084123456789' })
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^(0|\+)\d{8,14}$/, { message: 'Please enter a valid phone number' })
  phone_number: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format yyyy-mm-dd',
  })
  age: string;

  @ApiProperty()
  @IsEnum(DriverLicense)
  @IsNotEmpty()
  driver_license: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  @IsBefore('end_date', {
    message: 'The start date cannot exceed the end date. Please try again!',
  })
  start_date: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('start_date', {
    message: 'The end date cannot be before the start date. Please try again!',
  })
  end_date: Date;

  @ApiProperty()
  @IsEnum(JobContract)
  @IsNotEmpty()
  job_contract: string;

  @ApiProperty()
  @IsEnum(StaffStatus)
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  note: string;
}

export class UpdateStaffReq {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ required: true, default: '084123456789' })
  @IsOptional()
  @MaxLength(50)
  @Matches(/^(0|\+)\d{9,14}$/, { message: 'Please enter a valid phone number' })
  phone_number?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in the format yyyy-mm-dd',
  })
  age?: string;

  @ApiProperty()
  @IsEnum(DriverLicense)
  @IsOptional()
  driver_license?: string;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsBefore('end_date', {
    message: 'The start date cannot exceed the end date. Please try again!',
  })
  start_date?: Date;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfter('start_date', {
    message: 'The end date cannot be before the start date. Please try again!',
  })
  end_date?: Date;

  @ApiProperty()
  @IsEnum(JobContract)
  @IsOptional()
  job_contract?: string;

  @ApiProperty()
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  note?: string;
}

export class CreateStaffRes extends BaseDto {
  @ApiProperty({ type: StaffContent })
  data: StaffContent;
}

export class SearchStaffReq extends BaseQueryReq {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: DriverLicense })
  @IsOptional()
  driver_license?: string;

  @ApiProperty({ required: false, enum: StaffStatus })
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false, enum: JobContract, isArray: true })
  @IsOptional()
  job_contract?: string[];

  @ApiProperty({ required: false, enum: ESORTSTAFF })
  @IsEnum(ESORTSTAFF)
  @IsOptional()
  sortField?: string;
}

export class DeleteStaffReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];

  @ApiProperty()
  @IsString()
  password?: string;
}
