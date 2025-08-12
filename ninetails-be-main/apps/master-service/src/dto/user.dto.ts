import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { BaseDto } from '../../../../libs/dtos/base.dto';

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
import { EUserRole } from '../../../../libs/enums/common.enum';
import { BaseQueryReq } from '../../../../libs/dtos/base.req';

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

  full_name?: string;
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
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: number;

  @ApiProperty()
  @IsEnum(EUserRole)
  @IsNotEmpty()
  role: string;

  @IsNumber()
  @IsOptional()
  staff_id?: number;

  @IsNumber()
  @IsOptional()
  master_id?: number;
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

  @ApiProperty()
  @IsEnum(EUserRole)
  @IsOptional()
  role?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  position?: string;

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

  password?: string;

  deletedAt?: Date;
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

  schema?: string;
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

export class UpdatePasswordReq {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid characters. Please try again!',
  })
  password: string;
}

export class UpdateInformationReq {
  @ApiProperty()
  @IsString()
  @IsOptional()
  full_name: string;

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
}

export class ChangePasswordReq {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^\S*$/, {
    message: 'Password should not contain spaces',
  })
  passwordOld: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/^\S*$/, {
    message: 'Password should not contain spaces',
  })
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid characters. Please try again!',
  })
  passwordNew: string;
}

export class ResetMultiPasswordReq {
  @ApiProperty({ default: [1, 2] })
  @IsArray()
  @ArrayNotEmpty()
  id: [];
}
