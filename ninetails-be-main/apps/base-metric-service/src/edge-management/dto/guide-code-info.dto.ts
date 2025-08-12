import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Matches, ValidateNested } from "class-validator";

class GuideCodeInfo {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}

export class GuideCodeInfoDtoReq {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'GS0' })
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^guide_code_info_REQ$/)
  @ApiProperty({ example: 'guide_code_info_REQ' })
  topic: 'guide_code_info_REQ';

  @ApiProperty({ example: '1.002' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GuideCodeInfo)
  data: GuideCodeInfo;
}