import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { DemoRequestEntity } from 'libs/entities/demo-request.entity';
import { ContactRequestEntity } from 'libs/entities/contact-request.entity';
import { ReceiveMailEntity } from 'libs/entities/receive-mail.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  sendEmailDemoRequest(demoRequest: DemoRequestEntity) {
    this.mailerService.sendMail({
      to: demoRequest.email,
      subject: '아래와 같이 데모 신청이 접수되었습니다.',
      template: './demo_request',
      context: {
        demoRequest: demoRequest,
        assetUrl: process.env.ASSET_URL,
      },
    });
    this.mailerService.sendMail({
      to: process.env.SUPER_ADMIN_EMAIL,
      subject: 'New demo request has just been received',
      template: './demo_request_admin',
      context: {
        demoRequest: demoRequest,
        assetUrl: process.env.ASSET_URL,
      },
    });
    return 'success';
  }

  sendEmailContactRequest(contactRequest: ContactRequestEntity) {
    this.mailerService.sendMail({
      to: contactRequest.email,
      subject: '아래와 같이 문의 내용이 접수되었습니다.',
      template: './contact_request',
      context: {
        contactRequest: contactRequest,
        assetUrl: process.env.ASSET_URL,
      },
    });
    this.mailerService.sendMail({
      to: process.env.SUPER_ADMIN_EMAIL,
      subject: 'New inquiry has just been received',
      template: './contact_request_admin',
      context: {
        contactRequest: contactRequest,
        assetUrl: process.env.ASSET_URL,
      },
    });

    return 'success';
  }

  sendEmailNewsRequest(receiveMail: ReceiveMailEntity) {
    this.mailerService.sendMail({
      to: receiveMail.email,
      subject: '슈퍼버킷 뉴스레터 가입이 완료되었습니다.',
      template: './news_request',
      context: {
        receiveMail: receiveMail,
        assetUrl: process.env.ASSET_URL,
      },
    });

    return 'success';
  }
}
