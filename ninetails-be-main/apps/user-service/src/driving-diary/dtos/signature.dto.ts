import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString } from 'class-validator';
import { BaseDto } from 'libs/dtos/base.dto';

export class SignatureCreateDto {
  master_id: number;

  @ApiProperty()
  @IsString()
  url: string;

  schema?: string;
}

export class SignDto {
  @ApiProperty()
  @IsInt()
  vehicle_id: number;
}

export class SignatureResDto extends BaseDto {
  @ApiProperty()
  data: SignatureCreateDto;
}

export class GetSignedDto extends SignDto {
  @ApiProperty()
  @IsDateString()
  date: Date;
}
