import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RouteInfoDataDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}

export class RouteInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^route_info_REQ$/)
  @ApiProperty({ example: 'route_info_REQ' })
  topic: 'route_info_REQ';
  @ApiProperty({ example: '1.002' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => RouteInfoDataDto)
  data: RouteInfoDataDto;
}

export class RouteInfoDtoRes {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  customer_id: string;
  @ApiProperty({ example: 'route_info_RES' })
  topic: 'route_info_RES';
  @ApiProperty()
  data: any;
}
