import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {SettingNotificationEntity} from "libs/entities/setting-notification.entity";
import {UpdateSettingNotificationReq} from "../dto/setting-notification.dto";

@Injectable()
export class SettingNotificationService {
  constructor(
    @Inject('SETTING_NOTIFICATION_REPO')
    private SettingNotificationEntity: Repository<SettingNotificationEntity>,
  ) {}

  async update(userId: number, input: UpdateSettingNotificationReq) {
    let data = await this.SettingNotificationEntity.findOneBy({user_id: userId});
    if (!data) {
      throw new BadRequestException('Not found setting-notification. Please try again!');
    }

    if (input.start_other_operations == false && input.end_other_operations == true) {
      throw new BadRequestException('Data error: start_other_operations needs to be opened. Please try again!');
    }

    if (input.start_standby_state == false && input.end_standby_state == true) {
      throw new BadRequestException('Data error: start_standby_state needs to be opened. Please try again!');
    }

    if (input.lost_signal == false && input.reconnect_signal == true) {
      throw new BadRequestException('Data error: lost_signal needs to be opened. Please try again!');
    }

    return await this.SettingNotificationEntity.update(data.id, input);
  }

  async detail(userId) {
    let data = await this.SettingNotificationEntity.findOneBy({user_id: userId});
    if (!data) {
      return await this.SettingNotificationEntity.save({user_id: userId});
    }

    return data;
  }
}
