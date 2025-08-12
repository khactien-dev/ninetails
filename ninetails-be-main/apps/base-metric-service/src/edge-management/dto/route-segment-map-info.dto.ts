import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Matches, ValidateNested } from "class-validator";

class RouteSegmentMapInfo {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}

export class RouteSegmentMapInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^route_segment_map_info_REQ$/)
  @ApiProperty({ example: 'route_segment_map_info_REQ' })
  topic: 'route_segment_map_info_REQ';

  @ApiProperty({ example: '1.002' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => RouteSegmentMapInfo)
  data: RouteSegmentMapInfo;
}