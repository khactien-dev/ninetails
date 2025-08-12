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
} from 'class-validator';
import {
  StaffRole,
  StaffStatus,
} from '../../../../libs/common/constants/common.constant';
import { BaseQueryReq } from '../../../../libs/dtos/base.req';

export class StaffContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  department: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  start_date: Date;

  @ApiProperty()
  end_date: Date;

  @ApiProperty()
  contract_work: string;

  @ApiProperty()
  transport: string;

  @ApiProperty()
  exception: string;
}

export class CreateStaffReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsEnum(StaffStatus)
  @IsNotEmpty()
  status: number;

  @ApiProperty()
  @IsEnum(StaffRole)
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contract_work: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transport: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  exception: string;
}

export class UpdateStaffReq {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  department: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  position: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone_number: string;

  @ApiProperty()
  @IsEnum(StaffStatus)
  @IsOptional()
  status: number;

  @ApiProperty()
  @IsEnum(StaffRole)
  @IsOptional()
  role: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  start_date: Date;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  end_date: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contract_work: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transport: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  exception: string;
}

export class CreateStaffRes extends BaseDto {
  @ApiProperty({ type: StaffContent })
  data: StaffContent;
}

export class SearchStaffReq extends BaseQueryReq {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;
}

export class DeleteStaffReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];
}

export class UpdateStatusStaffReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(StaffStatus)
  @IsNumber()
  status: number;
}
