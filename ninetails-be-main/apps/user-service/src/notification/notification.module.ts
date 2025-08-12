import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceProvider } from 'libs/utils/datasource.provider';
import { NotificationEntity } from 'libs/entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuthMiddleware } from '../guards/auth.middleware';
import { SettingNotificationService } from './setting-notification.service';
import { SettingNotificationController } from './setting-notification.controller';
import { SettingNotificationEntity } from 'libs/entities/setting-notification.entity';
import {NotificationReadMiddleware, NotificationUpdateMiddleware} from '../guards/notification.middleware';
import { RoleDispatchMiddleware } from '../guards/role.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, SettingNotificationEntity]),
  ],
  providers: [
    NotificationService,
    SettingNotificationService,
    ...DataSourceProvider,
  ],
  controllers: [NotificationController, SettingNotificationController],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(NotificationController);
    consumer.apply(AuthMiddleware).forRoutes(SettingNotificationController);
    consumer.apply(NotificationUpdateMiddleware).forRoutes({ path: 'setting-notification/detail', method: RequestMethod.GET });
    consumer.apply(NotificationUpdateMiddleware).forRoutes({ path: 'setting-notification/update', method: RequestMethod.PUT });
    consumer.apply(NotificationReadMiddleware).forRoutes(NotificationController);
  }
}
