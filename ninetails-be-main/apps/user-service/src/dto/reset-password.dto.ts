import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  IsOptional,
} from 'class-validator';
import { OTPTYPE } from '../../../../libs/enums/common.enum';
import { Transform } from 'class-transformer';

export class ForgetPasswordReq {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Transform((data) => data?.value?.toLowerCase())
  email: string;

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

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Transform((data) => data?.value?.toLowerCase())
  email: string;

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
