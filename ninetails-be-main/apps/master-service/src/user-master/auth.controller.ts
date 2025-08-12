import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequest } from '../dto/login.dto';
import { responseHelper } from 'libs/utils/helper.util';
import { LoginResponse } from '../dto/user.dto';
import {
  AuthResetPasswordDto,
  ForgetPasswordReq,
  VerifyForgetPasswordReq,
} from '../dto/reset-password.dto';
import { EUserRole, OTPTYPE } from 'libs/enums/common.enum';
import { MailService } from '../mail/mail.service';
import { AdminSeed } from '../seeds/admin.seed';
import { OtpService } from '../otp/otp.service';
import { UserMasterService } from './user-master.service';
import { TokenService } from '../token/token.service';
import {CreateUserRes, RefreshTokenReq, SendOTP} from 'apps/user-service/src/dto/user.dto';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(
    private userMasterService: UserMasterService,
    private mailService: MailService,
    private adminSeedService: AdminSeed,
    private otpService: OtpService,
    private tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiCreatedResponse({ type: LoginResponse })
  async login(@Body() body: LoginRequest) {
    const user = await this.userMasterService.findOne({
      email: body.email,
    });
    if (user.role !== EUserRole.ADMIN) {
      await this.userMasterService.checkAvailableByEmail(body.email);
    }
    const userInfo = await this.userMasterService.findByEmailAndPassword(
      body.email,
      body.password,
    );
    const signRes = await this.tokenService.createLoginToken(userInfo);
    return responseHelper({
      ...signRes,
      role: userInfo.role,
      contractEndDate: userInfo.contractEndDate,
      permission: userInfo.permission,
    });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgetPasswordReq) {
    let dataQueryUserMaster: any = await this.userMasterService.getPhoneOrEmailByOption(body);
    const user = await this.userMasterService.findOne(dataQueryUserMaster);
    if (user.role !== EUserRole.ADMIN) {
      await this.userMasterService.checkAvailableByEmail(user.email);
    }
    dataQueryUserMaster.type = OTPTYPE.FORGOT_PASSWORD;
    const checkOtp = await this.otpService.findOneOTP(
        dataQueryUserMaster,
      false,
    );

    if (checkOtp) {
      const current = new Date().getTime();
      if (current - checkOtp.createdAt.getTime() <= 1000 * 60 * 5) {
        throw new BadRequestException(
          // 'You must wait at least 5 minutes before requesting another verification code.',
          '다음 인증 코드를 요청하기까지 최소 5분을 기다려야 합니다.',
        );
      }
    }

    const otp = await this.userMasterService.sendAndCheckResetPass(body);
    if (body.option == 'email') {
      await this.mailService.sendMailResetPass(otp.email, otp.code);
      return responseHelper({}, true, 200);
    }
    let tenant = await this.userMasterService.getTenantById(user.tenant_id);
    let userByTenant = await this.userMasterService.getUserByTenant(tenant.schema, user.email);
    return await this.userMasterService.sendSMS(userByTenant.phone_number, otp.code, "Forgot Password");
  }

  @Post('verify-forgot-password')
  async verifyAccountForgotPassword(@Body() body: VerifyForgetPasswordReq) {
    const otp = await this.userMasterService.verifyAccountForgotPassword(body);
    return responseHelper(otp, true, 200);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: AuthResetPasswordDto) {
    const { password, code } = body;
    const checkOtp = await this.otpService.findOneOTP({
      code: code,
      type: OTPTYPE.RESET_PASSWORD,
    });
    if (!checkOtp) {
      throw new BadRequestException(
        // 'Please enter a valid verification code.'
        '유효한 인증 코드를 입력해 주세요',
      );
    }

    const dateNow = new Date();
    if (dateNow.getTime() - checkOtp.createdAt.getTime() > 1000 * 7200) {
      throw new BadRequestException(
        // 'Verification code has expired.'
        '인증 코드가 만료되었습니다.',
      );
    }

    await this.userMasterService.resetPassword(checkOtp, password);
    await this.otpService.deleteOTPBy({
      code: code,
    });
    return responseHelper({}, true, 200);
  }

  @Get('check-email')
  async checkEmail(@Query() query: ForgetPasswordReq) {
    const data = await this.userMasterService.checkFullName(query);
    return responseHelper(data, true, 200);
  }

  @Post('init-data')
  async initData() {
    return await this.adminSeedService.create();
  }

  @Post('/refresh-token')
  @ApiOkResponse({ type: LoginResponse })
  async refreshNewToken(@Body() body: RefreshTokenReq) {
    return await this.userMasterService.checkRefreshToken(body.refreshToken);
  }

  @Post('/test-sms')
  @ApiOkResponse({ type: CreateUserRes })
  async testSMS(@Body() body: SendOTP) {
    return await this.userMasterService.sendSMS(body.phone, body.otp, "Test Send SMS");
  }
}
