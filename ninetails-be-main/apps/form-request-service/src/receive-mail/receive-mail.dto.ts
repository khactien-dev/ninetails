import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';
import { BaseQueryReq } from 'libs/dtos/base.req';

export class ReceiveMailCreateDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ReceiveMailReq extends BaseQueryReq {
  @ApiProperty({ required: false })
  @IsOptional()
  email: string;
}
