import { Body, Controller, Get, Headers, Put, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { responseHelper } from 'libs/utils/helper.util';
import { SettingNotificationService } from './setting-notification.service';
import {
  SettingNotificationRes,
  UpdateSettingNotificationReq,
} from '../dto/setting-notification.dto';

@ApiTags('Notification')
@Controller('setting-notification')
@ApiBearerAuth()
export class SettingNotificationController {
  constructor(
    private readonly SettingNotificationService: SettingNotificationService,
  ) {}

  @Get('detail')
  @ApiOkResponse({ type: SettingNotificationRes })
  async detail(@Request() req: { auth: { id: number } }, @Headers() header) {
    const id = header['opid'] ? header['opid'] : req.auth.id;
    const data = await this.SettingNotificationService.detail(id);
    return responseHelper(data);
  }

  @Put('update')
  @ApiOkResponse({ type: SettingNotificationRes })
  async update(
    @Request() req: { auth: { id: number } },
    @Body() input: UpdateSettingNotificationReq,
    @Headers() header,
  ) {
    const id = header['opid'] ? header['opid'] : req.auth.id;
    const data = await this.SettingNotificationService.update(id, input);
    return responseHelper(
      data,
      true,
      200,
      'The setting-notification has been updated successfully!',
    );
  }
}
