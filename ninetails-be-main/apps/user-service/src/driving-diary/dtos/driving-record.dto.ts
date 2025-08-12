import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional } from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';

export class DrivingRecordDto {
  @ApiProperty()
  @IsNumber()
  distance_yesterday: number;

  @ApiProperty()
  @IsNumber()
  fuel_yesterday: number;

  @ApiProperty()
  @IsNumber()
  distance_today: number;

  @ApiProperty()
  @IsNumber()
  fuel_today: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fuel_volumn: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  vehicle_id: number;
}

export class DrivingRecordSaveDto extends DrivingRecordDto {
  date?: string;
}

export class DrivingRecordQuery {
  @ApiProperty()
  @IsNumber()
  vehicle_id: number;

  @ApiProperty()
  @IsDateString()
  date: Date;
}

export class DrivingRecordRes extends BaseDto {
  @ApiProperty()
  data: DrivingRecordSaveDto;
}
