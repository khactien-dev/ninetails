import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApproveReqDto,
  ConfirmVerifyEmailDto,
  TenantCreateDto,
  TenantListReq,
  TenantManagementReq,
  TenantUpdateDto,
  TenantUserUpdateBaseDto,
  TenantUserUpdateDto,
  VerifyEmailDto,
} from './dto/tenant-req.dto';
import { handlePaginate, responseHelper } from 'libs/utils/helper.util';
import {
  ListResTenantDto,
  TenantResponseDto,
  VerifyEmailResDto,
} from './dto/tenant-res.dto';
import { OtpService } from '../otp/otp.service';
import { OTPTYPE } from 'libs/enums/common.enum';
import { MailService } from '../mail/mail.service';
import { AuthenAdminGuard, AuthenOperatorGuard } from '../guards/auth.guard';
import { UserMasterService } from '../user-master/user-master.service';
import { compare } from 'bcrypt';
import { BackupService } from './backup.service';
import { TenantManageService } from './manage.service';

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  constructor(
    private tenantService: TenantService,
    private otpService: OtpService,
    private mailService: MailService,
    private userMasterService: UserMasterService,
    private backupService: BackupService,
    private manageService: TenantManageService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register Tenant' })
  @ApiOkResponse({ type: TenantResponseDto })
  async createTenant(@Body() body: TenantCreateDto) {
    const otp = await this.otpService.findOneOTP({
      code: body.otp,
      type: OTPTYPE.REGISTER,
    });
    await this.otpService.deleteOTPBy({
      email: otp.email,
      type: OTPTYPE.REGISTER,
    });
    body.email = otp.email;
    const tenant = await this.tenantService.create(body);
    this.mailService.sendRegisterTenant({
      email: otp.email,
      link:
        process.env.APP_URL +
        '/auth/register/membership/confirm?token=' +
        tenant.token,
      operator: tenant.operator,
      organization: tenant.organization,
    });
    return responseHelper(tenant);
  }

  @Get('list')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ListResTenantDto })
  @UseGuards(AuthenAdminGuard)
  async getListTenant(@Query() query: TenantListReq) {
    const handleQuery = handlePaginate(query);
    const { list, total } = await this.manageService.findAndCount(
      query,
      handleQuery,
    );
    return responseHelper({
      data: list,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: +query.pageSize,
        current_page: +query.page,
      },
    });
  }

  @Get('management')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ListResTenantDto })
  @UseGuards(AuthenAdminGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async managementTenant(@Query() query: TenantManagementReq) {
    const handleQuery = handlePaginate(query);
    const { list, total } = await this.manageService.findAndCount(
      query,
      handleQuery,
      true,
    );
    return responseHelper({
      data: list,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: +query.pageSize,
        current_page: +query.page,
      },
    });
  }

  @Get('detail/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: TenantResponseDto })
  @UseGuards(AuthenAdminGuard)
  async getDetail(@Param('id') id: number) {
    if (!Number.isInteger(+id)) {
      throw new BadRequestException('id must be integer');
    }
    return responseHelper(
      await this.tenantService.findOneWithContract({ id: +id }),
    );
  }

  @Get('detail-by-op')
  @ApiBearerAuth()
  @ApiOkResponse({ type: TenantResponseDto })
  async getDetailByOp(
    @Request()
    req: {
      auth: { tenant_id: number };
      headers: { schema: string };
    },
  ) {
    if (!req.headers.schema && !req.auth.tenant_id) {
      throw new BadRequestException('schema or tenant_id must be provide');
    }
    const cond: { id?: number; schema?: string } = {};
    if (req.auth.tenant_id) {
      const id = +req.auth.tenant_id;
      if (!Number.isInteger(id)) {
        throw new BadRequestException('id must be integer');
      }
      cond.id = id;
    }
    if (req.headers.schema) {
      cond.schema = req.headers.schema;
    }
    return responseHelper(await this.tenantService.findOneWithContract(cond));
  }

  @Get('view/:token')
  @ApiOkResponse({ type: TenantResponseDto })
  @ApiOperation({ summary: 'view' })
  async detailTenant(@Param('token') token: string) {
    const tenant = await this.tenantService.findOne({ token });
    if (tenant.approved_time) {
      throw new BadRequestException('Registration request has been approved');
    }
    return responseHelper(tenant);
  }

  @Put('update/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SuperAdmin Update Tenant' })
  @ApiOkResponse({ type: TenantResponseDto })
  @UseGuards(AuthenAdminGuard)
  async updateTenant(
    @Param('id') id: number,
    @Body() body: TenantUserUpdateDto,
    @Request() req: Request,
  ) {
    const userId = req['auth']?.id;
    const user = await this.userMasterService.findOne({ id: userId });
    const check = await compare(body.password, user.password);
    if (!check) {
      throw new BadRequestException(
        // 'Incorrect Password. Please try again!'
        '비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }
    return responseHelper(await this.tenantService.update({ id: +id }, body));
  }

  @Put('update-by-token/:token')
  @ApiOperation({ summary: 'Update Tenant By Token' })
  @ApiOkResponse({ type: TenantResponseDto })
  async updateTenantByToken(
    @Param('token') token: string,
    @Body() body: TenantUserUpdateBaseDto,
  ) {
    const tenant = await this.tenantService.findOne({ token });
    const update = await this.tenantService.update({ id: tenant.id }, body);
    this.mailService.sendUpdateTenant({
      email: tenant.email,
      link:
        process.env.APP_URL +
        '/auth/register/membership/confirm?token=' +
        tenant.token,
      operator: update.operator,
      organization: update.organization,
    });
    return responseHelper(update);
  }

  @Put('manage/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Management Tenant' })
  @UseGuards(AuthenAdminGuard)
  @ApiOkResponse({ type: TenantResponseDto })
  async manageTenant(
    @Param('id') id: number,
    @Body() body: TenantUpdateDto,
    @Request() req: Request,
  ) {
    const userId = req['auth']?.id;
    const user = await this.userMasterService.findOne({ id: userId });
    const check = await compare(body.password, user.password);
    if (!check) {
      throw new BadRequestException(
        // 'Incorrect Password. Please try again!'
        '비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
      );
    }
    const update = await this.tenantService.update({ id: +id }, body, true);
    return responseHelper(update);
  }

  @Put('approve/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'approve tenant' })
  @ApiOkResponse({ type: TenantResponseDto })
  @UseGuards(AuthenAdminGuard)
  async approveTenant(@Param('id') id: number, @Body() body: ApproveReqDto) {
    const user = await this.tenantService.approve(
      +id,
      body.customerId.toLowerCase(),
    );
    return responseHelper(
      user,
      true,
      200,
      'The Customer has been created successfully!',
    );
  }

  @Post('verify-email')
  @ApiOkResponse({ type: VerifyEmailResDto })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const tenant = await this.tenantService.checkEmailExist(body.email);
    if (tenant) {
      throw new BadRequestException(
        // 'This email is already taken. Please use a different one.',
        '이 이메일은 이미 사용 중입니다. 다른 이메일을 사용해 주세요.',
      );
    }
    const check = await this.otpService.findOneOTP(
      {
        email: body.email.toLocaleLowerCase(),
        type: OTPTYPE.VERIFY_EMAIL,
      },
      false,
    );
    if (check) {
      const current = new Date().getTime();
      if (current - check.createdAt.getTime() < 5 * 60 * 1000) {
        throw new BadRequestException(
          // 'You must wait at least 5 minutes before requesting another verification code.',
          '다음 인증 코드를 요청하기까지 최소 5분을 기다려야 합니다.',
        );
      }
    }
    const otp = await this.otpService.createOTP({
      email: body.email,
      type: OTPTYPE.VERIFY_EMAIL,
    });
    this.mailService.sendOtpVerifyEmail(body.email, otp.code);
    return responseHelper({ email: body.email });
  }

  @Post('confirm-verify-email')
  @ApiOkResponse({ type: VerifyEmailResDto })
  async confirmVerify(@Body() body: ConfirmVerifyEmailDto) {
    const otp = await this.otpService.findOneOTP({
      code: body.otp,
      type: OTPTYPE.VERIFY_EMAIL,
    });
    if (otp) {
      const current = new Date().getTime();
      if (current - otp.createdAt.getTime() > 5 * 60 * 1000) {
        throw new BadRequestException(
          // 'Verification code has expired.'
          '인증 코드가 만료되었습니다.',
        );
      }
    }
    await this.otpService.deleteOTPBy({
      email: otp.email,
      type: OTPTYPE.VERIFY_EMAIL,
    });
    const newOtp = await this.otpService.createOTP({
      email: otp.email,
      type: OTPTYPE.REGISTER,
    });
    return { otp: newOtp.code };
  }

  @Put('/change-info')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Operator update Tenant' })
  @ApiOkResponse({ type: TenantResponseDto })
  @UseGuards(AuthenOperatorGuard)
  async changeInfoByOp(
    @Body() body: TenantUserUpdateBaseDto,
    @Request()
    req: {
      auth: { tenant_id: number };
      headers: { schema: string };
    },
  ) {
    if (!req.headers.schema && !req.auth.tenant_id) {
      throw new BadRequestException('schema or tenant_id must be provide');
    }
    const cond: { id?: number; schema?: string } = {};
    if (req.auth.tenant_id) {
      const id = +req.auth.tenant_id;
      if (!Number.isInteger(id)) {
        throw new BadRequestException('id must be integer');
      }
      cond.id = id;
    } else if (req.headers.schema) {
      cond.schema = req.headers.schema;
    }
    return responseHelper(await this.tenantService.update(cond, body));
  }

  @Post('/backup-accept')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'OP accept backup' })
  @UseGuards(AuthenOperatorGuard)
  async backupAccept(@Request() req: { auth: { tenant_id: number } }) {
    const id = +req.auth.tenant_id;
    const tenant = await this.tenantService.findOne({ id });
    return responseHelper(
      await this.tenantService.update({ id: tenant.id }, { is_backup: true }),
    );
  }

  @Post('/test-remind')
  @ApiOperation({ summary: 'Test backup end contract' })
  async testRemind() {
    return responseHelper(await this.backupService.remindBackup());
  }

  @Post('/test-backup-end')
  @ApiOperation({ summary: 'Test backup end contract' })
  async testBackup() {
    return responseHelper(await this.backupService.backupDataByEndDate());
  }

  @Post('/test-backup-per-year')
  @ApiOperation({ summary: 'Test backup per year' })
  async testBackupPerYear() {
    return responseHelper(await this.backupService.backupDataPerYear());
  }

  @Delete('/delete/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin hard delete Tenant' })
  @UseGuards(AuthenAdminGuard)
  async deleteTenant(@Param('id') id: number) {
    return responseHelper(await this.manageService.hardDeleteTenant(id));
  }
}
