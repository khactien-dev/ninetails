import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';

export class DemoRequestForm {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsString()
  @MaxLength(200)
  organizational_name: string;

  @ApiProperty({ required: true })
  @IsEmail(undefined, { message: 'Please enter a valid email address' })
  @MaxLength(100)
  @IsNotEmpty({ message: 'This field is required.' })
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @MaxLength(30)
  name: string;

  @ApiProperty({ required: true, default: '084123456789' })
  @IsNotEmpty({ message: 'This field is required.' })
  @MaxLength(50)
  @Matches(/^(0|\+)\d{9,14}$/, { message: 'Please enter a valid phone number' })
  phone_number: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'This field is required.' })
  @MaxLength(1000)
  request_quotation: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  is_agree: boolean;
}

export class DemoRequestData {
  @ApiProperty()
  id: number;
  @ApiProperty()
  organizational_name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  request_quotation: string;
  @ApiProperty()
  is_agree: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  deletedAt: Date;
}

export class DemoRequestRes extends BaseDto {
  @ApiProperty({ type: DemoRequestData })
  data: DemoRequestData;
}
