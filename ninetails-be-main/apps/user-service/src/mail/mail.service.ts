import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMailResetPass(email, code) {
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

  async sendPasswordWhenCreateUser(data: {
    email: string;
    newPass: string;
    organization: string;
    operator: string;
  }) {
    const { email, newPass, organization, operator } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Create new User for NineTails',
      template: './create_user',
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

  async sendPasswordWhenApprove(email: string, newPass: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[SuperBucket] This is your new temporary password',
      template: './new_password',
      context: {
        newPass: newPass,
        assetUrl: process.env.ASSET_URL,
        link: process.env.APP_URL,
      },
    });

    return 'success';
  }
}
