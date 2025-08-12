import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  DeleteNotificationRes,
  DetailNotificationRes,
  ListNotificationRes,
  MarkReadAllNotificationRes,
} from './notification.dto';
import {
  responseHelper,
  setDefaultQuerySearchValues,
} from 'libs/utils/helper.util';
import { BaseQueryReq } from 'libs/dtos/base.req';

@ApiTags('Notification')
@Controller('notification')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOkResponse({ type: ListNotificationRes })
  async get(
    @Query() query: BaseQueryReq,
    @Request() req: { auth: { id: number } },
    @Headers() header,
  ) {
    const handleQuery = setDefaultQuerySearchValues(query);
    const id = header['opid'] ? header['opid'] : req.auth.id;
    const { items, total, countUnRead } = await this.notificationService.get(
      handleQuery,
      id,
    );
    const data = {
      data: items,
      pagination: {
        total: total,
        current_page: Number(query.page),
        per_page: Number(query.pageSize),
        last_page: Math.ceil(total / Number(query.pageSize)),
      },
      count_unread: countUnRead,
    };
    return responseHelper(data);
  }

  @Get(':id')
  @ApiOkResponse({ type: DetailNotificationRes })
  async detail(@Param('id') id: number) {
    const location = await this.notificationService.detail(id);
    return responseHelper(location);
  }

  @Post('mark-read/:id')
  @ApiOkResponse({ type: DetailNotificationRes })
  async markRead(@Param('id') id: number) {
    const entity = await this.notificationService.markRead(id);
    return responseHelper(entity);
  }

  @Post('mark-read-all')
  @ApiOkResponse({ type: MarkReadAllNotificationRes })
  async markReadAll(
    @Request() req: { auth: { id: number } },
    @Headers() header,
  ) {
    const id = header['opid'] ? header['opid'] : req.auth.id;
    const count = await this.notificationService.markReadAll(id);
    return responseHelper(count);
  }

  @Delete('delete/:id')
  @ApiOkResponse({ type: DeleteNotificationRes })
  async delete(@Param('id') id: number) {
    const location = await this.notificationService.delete(id);
    return responseHelper(location);
  }
}
