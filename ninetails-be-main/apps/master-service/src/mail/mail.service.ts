import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMailResetPass(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password for NineTails',
      template: './reset_password',
      context: {
        code: code,
        assetUrl: process.env.ASSET_URL,
      },
    });

    return 'success';
  }

  async sendPasswordWhenApprove(data: {
    email: string;
    newPass: string;
    organization: string;
    operator: string;
  }) {
    const { email, newPass, organization, operator } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: 'New Password for NineTails',
      template: './approve_tenant',
      context: {
        newPass: newPass,
        assetUrl: process.env.ASSET_URL,
        link: process.env.APP_URL,
        organization,
        operator,
      },
    });

    return 'success';
  }

  async sendOtpVerifyEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify email for register tenant',
      template: './verify_email',
      context: {
        code: code,
        assetUrl: process.env.ASSET_URL,
      },
    });

    return 'success';
  }

  async sendRegisterTenant(data: {
    email: string | string[];
    organization: string;
    operator: string;
    link: string;
  }) {
    const { email, organization, operator, link } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Send register tenant confirm',
      template: './register_tenant',
      context: {
        organization,
        operator,
        link,
        assetUrl: process.env.ASSET_URL,
      },
    });
    await this.mailerService.sendMail({
      to: process.env.SUPER_ADMIN_EMAIL,
      subject: 'New registration request has just been received',
      template: './register_tenant_admin',
      context: {
        organization,
        operator,
        assetUrl: process.env.ASSET_URL,
      },
    });
    return 'success';
  }

  async sendUpdateTenant(data: {
    email: string;
    organization: string;
    operator: string;
    link: string;
  }) {
    const { email, organization, operator, link } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: '[SuperBucket] Your registration request is updated',
      template: './update_tenant',
      context: {
        organization,
        operator,
        link,
        assetUrl: process.env.ASSET_URL,
      },
    });
    await this.mailerService.sendMail({
      to: process.env.SUPER_ADMIN_EMAIL,
      subject: 'New update on this registration information',
      template: './update_tenant_admin',
      context: {
        organization,
        operator,
        assetUrl: process.env.ASSET_URL,
      },
    });
    return 'success';
  }

  async sendRemindBackup(data: {
    email: string | string[];
    link: string;
    operator: string;
    endDate: string;
  }) {
    const { email, link, operator, endDate } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: '[SuperBucket] Contract Expiration & Data Backup Reminder',
      template: './remind_backup',
      context: {
        operator,
        link,
        assetUrl: process.env.ASSET_URL,
        endDate,
      },
    });
    return 'success';
  }

  async sendBackupUrl(data: {
    email: string | string[];
    link: string;
    operator: string;
    endDate: string;
    startDate: string;
  }) {
    const { email, link, operator, endDate, startDate } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: '[SuperBucket] Data Backup Successfully',
      template: './backup_complete',
      context: {
        link,
        assetUrl: process.env.ASSET_URL,
        operator,
        startDate,
        endDate,
      },
    });
    return 'success';
  }
}
