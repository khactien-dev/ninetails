import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConfigWeightData {
  @ApiProperty()
  id: number;
  @ApiProperty()
  '5L_gen': number;
  @ApiProperty()
  '10L_gen': number;
  @ApiProperty()
  '10L_reu': number;
  @ApiProperty()
  '20L_gen': number;
  @ApiProperty()
  '20L_reu': number;
  @ApiProperty()
  '30L_gen': number;
  @ApiProperty()
  '50L_gen': number;
  @ApiProperty()
  '50L_pub': number;
  @ApiProperty()
  '75L_gen': number;
  @ApiProperty()
  '75L_pub': number;
  @ApiProperty()
  'ext': number;
  @ApiProperty()
  'etc': number;
}

export class ConfigWeightForm {
  @ApiProperty({ required: true, default: 3.14 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '5L_gen': number;

  @ApiProperty({ required: true, default: 5.22 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '10L_gen': number;

  @ApiProperty({ required: true, default: 5.73 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '10L_reu': number;

  @ApiProperty({ required: true, default: 11.54 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '20L_gen': number;

  @ApiProperty({ required: true, default: 12.32 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '20L_reu': number;

  @ApiProperty({ required: true, default: 15.45 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '30L_gen': number;

  @ApiProperty({ required: true, default: 30.41 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '50L_gen': number;

  @ApiProperty({ required: true, default: 26.98 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '50L_pub': number;

  @ApiProperty({ required: true, default: 30.04 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '75L_gen': number;

  @ApiProperty({ required: true, default: 32.74 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  '75L_pub': number;

  @ApiProperty({ required: true, default: 27.32 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  'ext': number;

  @ApiProperty({ required: true, default: 18.41 })
  @IsNotEmpty({ message: 'This field is required.' })
  @IsNumber()
  'etc': number;
}
