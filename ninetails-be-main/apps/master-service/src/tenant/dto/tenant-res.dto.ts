import { ApiProperty } from '@nestjs/swagger';
import { BaseDto, PaginationDto } from 'libs/dtos/base.dto';
import { TenantCreateDto } from './tenant-req.dto';

class TenantResDto extends TenantCreateDto {
  @ApiProperty()
  id: number;
}

export class TenantResponseDto extends BaseDto {
  @ApiProperty({ type: TenantResDto })
  data: TenantResDto;
}

export class VerifyEmailResDto extends BaseDto {
  @ApiProperty()
  otp: string;
}

export class ListTenantDto {
  @ApiProperty({ type: [TenantResDto] })
  data: TenantResDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ListResTenantDto extends BaseDto {
  @ApiProperty({ type: ListTenantDto })
  data: ListTenantDto;
}
