import {
  IS_NUMBER,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SegmentInfoData {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}
export class SegmentInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;
  @IsNotEmpty()
  @IsString()
  @Matches(/^segment_info_REQ$/)
  @ApiProperty({ example: 'segment_info_REQ' })
  topic: 'segment_info_REQ';
  @ApiProperty({ example: '1.002' })
  @IsNotEmpty()
  @IsString()
  version: string;
  @ApiProperty()
  @ValidateNested()
  @Type(() => SegmentInfoData)
  data: SegmentInfoData;
}
