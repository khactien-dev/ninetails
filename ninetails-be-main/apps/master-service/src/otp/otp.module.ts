import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from 'libs/entities/otp.entity';
import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpEntity])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
