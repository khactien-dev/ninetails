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
import {
  IsAfter,
  IsBefore,
  ValidateDaysBasedOnRepeat,
} from 'libs/utils/validator.util';
import { StaffEntity } from 'libs/entities/staff.entity';
import { StaffContent } from '../dto/staff.dto';
import { ABSENCETYPE, REPEAT } from 'libs/common/constants/common.constant';

export class AbsenceStaffData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  absence_staff: number;

  @ApiProperty()
  absence_type: string;

  @ApiProperty()
  replacer_staff: number;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  period: string;

  @ApiProperty()
  repeat: string;

  @ApiProperty()
  repeat_days_week: string;

  @ApiProperty()
  repeat_days_month: string;
}

export class AbsenceStaffCreateForm {
  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  absence_staff: StaffEntity;

  @ApiProperty()
  @IsEnum(ABSENCETYPE)
  @IsNotEmpty()
  absence_type: string;

  @ApiProperty({ required: true, default: { id: 1 } })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsObject()
  replacer_staff: StaffEntity;

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

  @ApiProperty()
  @IsNotEmpty()
  period: string;

  @ApiProperty()
  @IsEnum(REPEAT)
  @IsNotEmpty()
  repeat: string;

  @ApiProperty({ default: [] })
  @ValidateDaysBasedOnRepeat()
  days: string[];

  @ApiProperty()
  @IsOptional()
  other?: string;
}

export class AbsenceStaffUpdateForm {
  @ApiProperty({ required: true, default: { id: 1 } })
  @IsOptional()
  @IsObject()
  replacer_staff: StaffEntity;

  @ApiProperty()
  @IsEnum(ABSENCETYPE)
  @IsOptional()
  absence_type: string;

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

  @ApiProperty()
  @IsOptional()
  period: string;

  @ApiProperty()
  @IsEnum(REPEAT)
  @IsOptional()
  repeat: string;

  @ApiProperty({ default: [] })
  @ValidateDaysBasedOnRepeat()
  days: string[];

  @ApiProperty()
  @IsOptional()
  other?: string;
}

export class AbsenceStaffList {
  @ApiProperty()
  data: [];
  @ApiProperty()
  pagination: BasePagination;
}

export class AbsenceStaffListRes extends BaseDto {
  @ApiProperty({ type: AbsenceStaffList })
  data: AbsenceStaffList;
}

export class AbsenceStaffRes extends BaseDto {
  @ApiProperty({ type: AbsenceStaffData })
  data: AbsenceStaffData;
}

export class AbsenceStaffDeleteRes extends BaseDto {
  @ApiProperty({ type: Boolean })
  data: boolean;
}

export class AbsenceStaffSearchForm extends BaseQueryReq {
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
  staff_id: string;
}

export class AbsenceStaffSearchReturnToWork {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsDateString({ strict: true })
  date: Date;
}

export class AbsenceStaffDeleteManyForm {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  ids: [];
}
