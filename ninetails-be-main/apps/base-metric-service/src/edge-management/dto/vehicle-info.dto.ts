import { IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class VehicleInfoDataDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '97서 2976' })
  vehicle_id: string;
}

export class VehicleInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @ApiProperty({ example: 'vehicle_info_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^vehicle_info_REQ$/)
  topic: 'vehicle_info_REQ';

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1.002' })
  version: string;

  @ValidateNested()
  @Type(() => VehicleInfoDataDto)
  @ApiProperty({ type: VehicleInfoDataDto })
  data: VehicleInfoDataDto;
}

class VehicleInfoDataDtoRes {
  @ApiProperty()
  version: string;
  @ApiProperty()
  vehicle_id: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  model: string;
  @ApiProperty()
  vendor: string;
  @ApiProperty()
  capacity_m3: number;
  @ApiProperty()
  capacity_kg: number;
  @ApiProperty()
  operation_start: Date;
  @ApiProperty()
  operation_end: string;
  @ApiProperty()
  dispatch_status: string;
  @ApiProperty()
  last_maintenance: Date;
  @ApiProperty()
  next_maintenance: Date;
  @ApiProperty()
  usage: string;
  @ApiProperty()
  note: string;
}

export class VehicleInfoDtoRes {
  @ApiProperty()
  customer_id: string;
  @ApiProperty({ example: 'vehicle_info_RES' })
  @IsNotEmpty()
  @Matches(/^vehicle_info_RES$/)
  topic: 'vehicle_info_RES';
  @ApiProperty({ type: VehicleInfoDataDtoRes })
  data: VehicleInfoDataDtoRes | { status: 'up_to_date' };
}
