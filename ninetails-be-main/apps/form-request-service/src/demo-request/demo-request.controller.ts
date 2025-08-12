import { Body, Controller, Post } from '@nestjs/common';
import { DemoRequestService } from './demo-request.service';
import { DemoRequestForm, DemoRequestRes } from './demo-request.dto';
import { responseHelper } from 'libs/utils/helper.util';
import { MailService } from '../mail/mail.service';
import { SubscriptionService } from './subscription.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('demo-request')
@ApiTags('Request')
export class DemoRequestController {
  constructor(
    private readonly demoRequestService: DemoRequestService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
  ) {}

  @Post('')
  @ApiOkResponse({ type: DemoRequestRes })
  async create(@Body() input: DemoRequestForm) {
    const demoRequest = await this.demoRequestService.create(input);
    if (input.is_agree) {
      await this.subscriptionService.save(input.email);
    }
    this.mailService.sendEmailDemoRequest(demoRequest);

    return responseHelper(
      demoRequest,
      true,
      200,
      'Your demo request has been received.\nWe will contact you as soon as possible!',
    );
  }
}
