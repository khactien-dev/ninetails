import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class BaseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: any;
}

export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  last_page: number;

  @ApiProperty()
  per_page: number;

  @ApiProperty()
  current_page: number;
}

export class IdsDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  ids: number[];
}

export class ImportDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file: any;
}
