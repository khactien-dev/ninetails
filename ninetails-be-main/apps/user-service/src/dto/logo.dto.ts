import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseDto } from '../../../../libs/dtos/base.dto';

class LogoContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image: string;
}

export class LgoRes extends BaseDto {
  @ApiProperty({ type: [LogoContent] })
  data: LogoContent[];
}

export class LogoReq {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  image?: any;

  name?: string;
}
