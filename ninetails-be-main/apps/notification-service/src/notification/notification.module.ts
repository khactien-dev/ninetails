import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompleteRouteEntity } from 'libs/entities/complete-route.entity';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { ContractEntity } from 'libs/entities/contract.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {PermissionEntity} from "libs/entities/permission.entity";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      CompleteRouteEntity,
      TenantEntity,
      UserMasterEntity,
      ContractEntity,
      PermissionEntity
    ]),
    EventEmitterModule.forRoot(),
  ],
  providers: [NotificationService, EventEmitter2, ConfigService],
  controllers: [NotificationController],
  exports: [],
})
export class NotificationModule {}
