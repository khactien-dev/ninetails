import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsDefined,
  NotEquals,
  Length,
} from 'class-validator';
import {
  ESTATUS,
  SORT_REGISTER,
  SORT_TENANT,
} from 'libs/common/constants/common.constant';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { CONTRACTYPE } from 'libs/enums/common.enum';

export class TenantCreateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  organization: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  department: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  operator: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  position: string;

  @ApiProperty()
  @IsString()
  otp: string;

  @ApiProperty()
  @IsNumberString()
  @MaxLength(50)
  phone: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  proof1: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  proof2: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  filename_proof1: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsString()
  filename_proof2: string;

  schema: string;

  token: string;

  email: string;
}

export class TenantUserUpdateBaseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @MaxLength(200)
  @IsNotEmpty()
  organization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  operator?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  position?: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  proof1?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  filename_proof1?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  proof2?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  filename_proof2?: string;

  logo?: {
    image?: string;
    name?: string;
  };
}

export class TenantUserUpdateDto extends TenantUserUpdateBaseDto {
  @ApiProperty({ required: true, example: '비밀번호@12345' })
  @IsNotEmpty()
  @IsDefined()
  @NotEquals(null)
  password?: string;
}

export class TenantUpdateDto extends TenantUserUpdateDto {
  @ApiProperty()
  @IsOptional()
  @IsDateString()
  contractStartDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  contractEndDate?: Date;

  @ApiProperty()
  @IsEnum(ESTATUS)
  @IsOptional()
  contractStatus?: ESTATUS;

  @ApiProperty()
  @IsEnum(CONTRACTYPE)
  @IsOptional()
  contractType?: CONTRACTYPE;

  is_backup?: boolean;

  schema?: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(64)
  email: string;
}

export class ConfirmVerifyEmailDto {
  @ApiProperty()
  @IsString()
  otp: string;
}

export class TenantLoginDto extends VerifyEmailDto {
  @ApiProperty()
  @IsString()
  password: string;
}

export class TenantListReq extends BaseQueryReq {
  email?: string;

  @ApiProperty({ required: false, enum: SORT_REGISTER })
  @IsEnum(SORT_REGISTER)
  @IsOptional()
  sortField?: string;
}

export class TenantManagementReq extends TenantListReq {
  @ApiProperty({ required: false, enum: SORT_TENANT })
  @IsEnum(SORT_TENANT)
  @IsOptional()
  sortField?: string;
}

export class ApproveReqDto {
  @ApiProperty()
  @Matches(/^[A-Za-z][A-Za-z0-9_-]*$/, {
    message: 'Invalid Customer ID. Please try again!',
  })
  @Length(3)
  customerId: string;
}
