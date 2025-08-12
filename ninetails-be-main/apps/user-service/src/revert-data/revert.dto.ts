import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ETABLEROUTEMANAGE } from 'libs/common/constants/common.constant';
import { BaseQueryReq } from 'libs/dtos/base.req';

export class StorageQueryDto extends BaseQueryReq {
  @ApiProperty()
  @IsString()
  table: string;
}

export class ActionRevertDto {
  @ApiProperty()
  @IsInt()
  @IsOptional()
  id: number;

  @ApiProperty()
  @IsEnum(ETABLEROUTEMANAGE)
  @IsOptional()
  table: ETABLEROUTEMANAGE;
}
