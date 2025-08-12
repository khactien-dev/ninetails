import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDto } from '../../../../libs/dtos/base.dto';
import {
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_REGEX,
  UserStatus,
} from '../../../../libs/common/constants/common.constant';
import {
  ESORTUSER,
  EUpdateUserRole,
  EUserRole,
} from '../../../../libs/enums/common.enum';
import { BaseQueryReq } from '../../../../libs/dtos/base.req';
import {PermissionEntity} from "libs/entities/permission.entity";

export class LoginContent {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  expired_access: string;

  @ApiProperty()
  @IsString()
  expired_refresh: string;
}

export class LoginResponse extends BaseDto {
  @ApiProperty({ type: LoginContent })
  data: LoginContent;
}

export class RefreshTokenReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid characters. Please try again!',
  })
  password: string;

  @IsNotEmpty()
  @MaxLength(30)
  email: string;

  @IsEnum(EUserRole)
  role: EUserRole;
}

export class UserContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: bigint;

  @ApiProperty()
  role: string;

  @ApiProperty()
  staff_id: string;
}

export class CreateUserReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @ApiProperty()
  // @IsNotEmpty()
  // @MinLength(6)
  // @Matches(PASSWORD_REGEX, {
  //   message:
  //     'Invalid characters. Please try again!',
  // })
  // password: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  department: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  position: number;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: number;

  @IsNumber()
  @IsOptional()
  staff_id?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  permission_id: number;

  master_id?: number;
  tenant_id?: number;
}

export class CreateUserDependOnCompanyReq extends CreateUserReq {
  @ApiProperty()
  @IsString()
  schema: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateUserReq {
  @ApiProperty()
  @IsString()
  @IsOptional()
  full_name?: string;

  // @ApiProperty()
  // @IsEnum(EUpdateUserRole)
  // @IsOptional()
  // role?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  department?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty()
  @IsEnum(UserStatus)
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  staff_id?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  permission_id?: number;
}

export class UpdateUserInfoReq {
  @ApiProperty()
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  department?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class UpdateUserDependOnCompanyReq extends UpdateUserReq {
  @ApiProperty()
  @IsString()
  schema: string;
}

export class CreateUserRes extends BaseDto {
  @ApiProperty({ type: UserContent })
  data: UserContent;
}

export class Email {
  email?: string;
}

export class SearchUserReq extends BaseQueryReq {
  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, enum: ESORTUSER })
  @IsEnum(ESORTUSER)
  @IsOptional()
  sortField?: string;

  schema?: string;
  tenant_id?: number;
}

export class DeleteUserReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];
}

export class UpdateStatusUsersReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserStatus)
  @IsNumber()
  status: number;
}

export class SendOTP {
  @ApiProperty({ example: '01091256260' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsOptional()
  otp?: string;
}

export class PermissionRes extends BaseDto {
  @ApiProperty({ type: PermissionEntity })
  data: PermissionEntity[];
}