import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'libs/dtos/base.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class ComboBoxContent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  field: string;

  @ApiProperty()
  data: string;
}

export class CreateComboBoxRes extends BaseDto {
  @ApiProperty({ type: ComboBoxContent })
  data: ComboBoxContent;
}

export class SearchComboBoxReq {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  field: string;
}

export class CreateComboBoxReq {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  field: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  data: string;
}

export class UpdateComboBoxReq {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  data: string;
}
