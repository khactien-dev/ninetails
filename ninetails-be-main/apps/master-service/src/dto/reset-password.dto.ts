import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  IsOptional, IsIn,
} from 'class-validator';
import { OTPTYPE } from '../../../../libs/enums/common.enum';
import { Transform } from 'class-transformer';

export class ForgetPasswordReq {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform((data) => data?.value?.toLowerCase())
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform((data) => data?.value?.toLowerCase())
  phone_number: string;

  @ApiProperty({ required: true, example: 'phone || email' })
  @IsNotEmpty()
  @IsString()
  @Transform((data) => data?.value?.toLowerCase())
  @IsIn(['phone', 'email'])
  option: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  full_name: string;
}

export class OtpCreateDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @Transform((data) => data?.value?.toLowerCase())
  email: string;

  @ApiProperty({ type: OTPTYPE })
  @IsEnum(OTPTYPE)
  type: OTPTYPE;

  is_resend?: boolean;
  token_verify?: string;
}

export class OtpCriteriaDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  @Transform((data) => data?.value?.toLowerCase())
  email?: string;

  @ApiProperty()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ type: OTPTYPE })
  @IsEnum(OTPTYPE)
  @IsOptional()
  type?: OTPTYPE;

  @ApiProperty()
  @IsOptional()
  is_resend?: boolean;
}

export class VerifyForgetPasswordReq {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform((data) => data?.value?.toLowerCase())
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform((data) => data?.value?.toLowerCase())
  phone_number: string;

  @ApiProperty({ required: true, example: 'phone || email' })
  @IsNotEmpty()
  @IsString()
  @Transform((data) => data?.value?.toLowerCase())
  @IsIn(['phone', 'email'])
  option: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  full_name: string;
}

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  password: string;
}
