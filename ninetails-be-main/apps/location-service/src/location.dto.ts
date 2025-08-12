import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../libs/dtos/base.dto';
import {
  ArrayNotEmpty, IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {situation} from "../../../libs/enums/common.enum";

export class LocationContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  region_name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  explanation: string;

  @ApiProperty()
  line_version: string;

  @ApiProperty()
  average_collection_amount: number;

  @ApiProperty()
  average_collection_time: number;

  @ApiProperty()
  movement_distance: number;

  @ApiProperty()
  update_time: Date;

  @ApiProperty()
  situation: situation;
}

export class CreateLocationReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  line_version: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  average_collection_amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  average_collection_time: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  movement_distance: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  update_time: Date;

  @ApiProperty()
  @IsEnum(situation)
  @IsNotEmpty()
  situation: number;
}

export class UpdateLocationReq {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  line_version: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  average_collection_amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  average_collection_time: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  movement_distance: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  update_time: Date;

  @ApiProperty()
  @IsEnum(situation)
  @IsNotEmpty()
  situation: number;
}

export class DetailLocationRes extends BaseDto {
  @ApiProperty({ type: LocationContent })
  data: LocationContent;
}

export class ListLocationRes extends BaseDto {
  @ApiProperty({ type: [LocationContent] })
  data: [LocationContent];
}

export class DeleteLocationReq {
  @ApiProperty({ type: [Number], example: [1, 2] })
  @ArrayNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  id?: number[];
}
