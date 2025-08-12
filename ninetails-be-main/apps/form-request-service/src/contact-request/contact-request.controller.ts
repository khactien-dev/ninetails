import { Body, Controller, Post } from '@nestjs/common';
import { ContactRequestService } from './contact-request.service';
import { ContactRequestForm, ContactRequestRes } from './contact-request.dto';
import { responseHelper } from 'libs/utils/helper.util';
import { MailService } from '../mail/mail.service';
import { SubscriptionService } from '../demo-request/subscription.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('contact-request')
@ApiTags('Request')
export class ContactRequestController {
  constructor(
    private readonly contactRequestService: ContactRequestService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: MailService,
  ) {}

  @Post('')
  @ApiOkResponse({ type: ContactRequestRes })
  async create(@Body() input: ContactRequestForm) {
    const contactRequest = await this.contactRequestService.create(input);
    if (input.is_agree) {
      await this.subscriptionService.save(input.email);
    }
    this.mailService.sendEmailContactRequest(contactRequest);

    return responseHelper(
      contactRequest,
      true,
      200,
      'Your inquiry has been received.\nWe will contact you as soon as possible!',
    );
  }
}
