import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Matches, ValidateNested } from "class-validator";

class CongestionCodeInfo {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}

export class CongestionCodeInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^congestion_code_info_REQ$/)
  @ApiProperty({ example: 'congestion_code_info_REQ' })
  topic: 'congestion_code_info_REQ';

  @ApiProperty({ example: '1.002' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CongestionCodeInfo)
  data: CongestionCodeInfo;
}