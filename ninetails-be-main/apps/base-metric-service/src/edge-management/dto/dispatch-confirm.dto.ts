import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class DispatchConfirmDataDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '97서 2976' })
  vehicle_id: string;

  @ApiProperty()
  @IsDateString()
  date: string;
}

class DispatchConfirmDataDtoRes {
  @ApiProperty()
  dispatch_no?: string;
  @ApiProperty()
  route_id?: number;
  @ApiProperty()
  route_name?: string;
  @ApiProperty()
  driver_name?: string;
  @ApiProperty()
  crew1_name?: string;
  @ApiProperty()
  crew2_name?: string;
  @ApiProperty()
  alt_driver_name?: string;
  @ApiProperty()
  alt_crew1_name?: string;
  @ApiProperty()
  alt_crew2_name?: string;
  @ApiProperty()
  date: string;
  @ApiProperty()
  route_type: string;
  @ApiProperty()
  vehicle_id: string;

  @ApiProperty()
  message?: string;
}

class DispatchConfirmDataNoMatchDtoRes {
  status: 'no_match';
  message: '요청하신 배차정보가 검색되지 않았습니다.';
}

export class DispatchConfirmDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @ApiProperty({ example: 'dispatch_confirm_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^dispatch_confirm_REQ$/)
  topic: 'dispatch_confirm_REQ';
  @ValidateNested({ each: true })
  @Type(() => DispatchConfirmDataDtoReq)
  @ApiProperty()
  data: DispatchConfirmDataDtoReq;
}

export class DispatchConfirmDtoRes {
  @ApiProperty()
  customer_id: string;
  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^dispatch_confirm_RES$/)
  topic: 'dispatch_confirm_RES';
  @ApiProperty()
  data: DispatchConfirmDataDtoRes | DispatchConfirmDataNoMatchDtoRes | any;

  @ApiProperty()
  status?: string;
}
