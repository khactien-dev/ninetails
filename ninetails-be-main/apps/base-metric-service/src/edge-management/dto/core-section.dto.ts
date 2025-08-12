import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CoreSectionDataDtoReq {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  route_id: number;
}

export class CoreSectionDtoReq {
  @ApiProperty({ example: 'GS0' })
  @IsNotEmpty()
  @IsString()
  customer_id: string;
  @ApiProperty({ example: 'core_section_info_REQ' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^core_section_info_REQ$/)
  topic: 'core_section_info_REQ';

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  version: string;
  @ApiProperty({ type: CoreSectionDataDtoReq })
  @ValidateNested()
  @Type(() => CoreSectionDataDtoReq)
  data: CoreSectionDataDtoReq;
}

export class CoreSectionDtoRes {
  @ApiProperty()
  customer_id: string;
  @ApiProperty({ example: 'core_section_info_RES' })
  topic: 'core_section_info_RES';
  @ApiProperty()
  data:
    | {
        version: string;
        section: { location: number[]; name: string }[];
      }
    | { status: 'up_to_date' };
}
