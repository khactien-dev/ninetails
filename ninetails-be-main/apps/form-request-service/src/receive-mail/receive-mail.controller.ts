import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReceiveMailService } from './receive-mail.service';
import { ReceiveMailCreateDto, ReceiveMailReq } from './receive-mail.dto';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { ApiTags } from '@nestjs/swagger';
import { MailService } from '../mail/mail.service';

@Controller()
@ApiTags('Request')
export class ReceiveMailController {
  constructor(
    private receiveMailService: ReceiveMailService,
    private readonly mailService: MailService,
  ) {}

  @Post('submit-mail')
  async submitMail(@Body() body: ReceiveMailCreateDto) {
    const receiveMail = await this.receiveMailService.create(body);
    this.mailService.sendEmailNewsRequest(receiveMail);

    return responseHelper(
      receiveMail,
      true,
      200,
      'Your email has been registered. We will come back with the news!',
    );
  }

  @Get('list-submit-mail')
  async getList(@Query() query: ReceiveMailReq) {
    const handleQuery = setDefaultQuerySearchValues(query);
    const [list, total] = await this.receiveMailService.findAndCount(
      query,
      handleQuery,
    );
    return responseHelper({
      data: list,
      pagination: {
        total,
        last_page: Math.ceil(total / +query.pageSize),
        per_page: query.pageSize,
        current_page: query.page,
      },
    });
  }
}
