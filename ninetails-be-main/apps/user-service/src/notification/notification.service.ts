import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { NotificationEntity } from 'libs/entities/notification.entity';
import { BaseQueryReq } from 'libs/dtos/base.req';
import { UserEntity } from 'libs/entities/user.entity';
import { addDays, format } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_REPO')
    private notificationEntity: Repository<NotificationEntity>,
    @Inject('USER_REPO')
    private userEntity: Repository<UserEntity>,
  ) {}

  async get(query: BaseQueryReq, masterId) {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const [items, total] = await this.notificationEntity
      .createQueryBuilder()
      .where({
        user_id: masterId,
        createdAt: Between(
          format(today, 'y-MM-dd'),
          format(tomorrow, 'y-MM-dd'),
        ),
      })
      .take(query.pageSize)
      .skip((query.page - 1) * query.pageSize)
      .orderBy(
        `${query.sortField ?? 'id'}`,
        query.sortBy.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      )
      .getManyAndCount();

    const countUnRead = await this.notificationEntity
      .createQueryBuilder()
      .where({
        user_id: masterId,
        read_at: IsNull(),
        createdAt: Between(
          format(today, 'y-MM-dd'),
          format(tomorrow, 'y-MM-dd'),
        ),
      })
      .getCount();

    return { items, total, countUnRead };
  }

  async detail(id: number) {
    return await this.findOne(id);
  }

  async findOne(id: number) {
    const entity = await this.notificationEntity.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Notification Not Found');
    }
    return entity;
  }

  async markRead(id: number) {
    await this.findOne(id);
    await this.notificationEntity.update(
      { id },
      { read_at: format(new Date(), 'y-MM-dd H:i:s') },
    );
    return await this.findOne(id);
  }

  async markReadAll(masterId) {
    const count = await this.notificationEntity
      .createQueryBuilder()
      .update()
      .set({ read_at: format(new Date(), 'y-MM-dd H:i:s') })
      .where({ user_id: masterId, read_at: IsNull() })
      .execute();
    return count.affected;
  }

  async delete(id: number) {
    await this.notificationEntity.delete(id);
    return true;
  }
}
