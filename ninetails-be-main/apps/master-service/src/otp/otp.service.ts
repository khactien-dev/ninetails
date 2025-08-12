import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpCreateDto, OtpCriteriaDto } from '../dto/reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpEntity } from 'libs/entities/otp.entity';
import { Repository } from 'typeorm';
import { OTPTYPE } from 'libs/enums/common.enum';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpEntity) private otpEntity: Repository<OtpEntity>,
  ) {}

  async createOTP(data: OtpCreateDto) {
    const digits =
      data.type === OTPTYPE.RESET_PASSWORD
        ? 'abcdefghABCDEFGH0123456789'
        : '0123456789';
    const length = data.type === OTPTYPE.RESET_PASSWORD ? 42 : 6;
    let OTP = '';
    let check = false;
    while (check === false) {
      for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
      }
      const code = await this.otpEntity.findOne({
        where: {
          code: OTP,
          type: data.type,
          email: data.email,
        },
      });
      if (code) {
        OTP = '';
      } else {
        check = true;
      }
    }
    if (data.type === OTPTYPE.VERIFY_USER) {
      OTP = data.token_verify;
    }
    return await this.otpEntity.save(
      this.otpEntity.create({
        ...data,
        code: OTP,
      }),
    );
  }

  async deleteOTPBy(data: OtpCriteriaDto) {
    await this.otpEntity.delete(data);
  }

  async deleteAndCreateByType(email: string, type = OTPTYPE.FORGOT_PASSWORD) {
    await this.deleteOTPBy({ email, type });
    return await this.createOTP({
      email,
      type,
      is_resend: true,
    });
  }

  async findOneOTP(data: OtpCriteriaDto, err = true) {
    const otp = await this.otpEntity.findOne({
      where: data,
      order: { id: 'DESC' },
    });

    if (!otp && err) {
      throw new BadRequestException(
        // 'Please enter a valid verification code'
        '유효한 인증 코드를 입력해 주세요',
      );
    }

    return otp;
  }

  async softDelete(id: number) {
    return await this.otpEntity.softDelete(id);
  }
}
