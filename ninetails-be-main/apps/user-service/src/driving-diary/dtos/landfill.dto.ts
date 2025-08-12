import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';
import { BaseQueryReq } from 'libs/dtos/base.req';

export class LandfillCreateDto {
  @ApiProperty()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsOptional()
  filename: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  serial: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  loading_weight: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  empty_weight: number;

  @ApiProperty()
  @IsOptional()
  entrance_time: Date;

  @ApiProperty()
  @IsOptional()
  exit_time: Date;

  @ApiProperty()
  @IsDateString()
  date: Date;
}

export class LandfillQueryDto extends BaseQueryReq {
  @ApiProperty()
  @IsDateString()
  date: Date;
}

class LandfillContent extends LandfillCreateDto {
  @ApiProperty()
  id: number;
}

export class LandfillRes extends BaseDto {
  @ApiProperty()
  data: LandfillContent;
}
