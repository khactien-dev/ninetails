import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  NotEquals,
  MaxLength,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class LoginRequest {
  @ApiProperty({ required: true, example: '아이디@gmail.com' })
  @IsNotEmpty()
  @MaxLength(100)
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, example: '비밀번호@12345' })
  @IsNotEmpty()
  @MaxLength(30)
  @IsDefined()
  @NotEquals(null)
  password: string;
}
