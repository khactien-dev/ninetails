import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import {PermissionEntity} from "libs/entities/permission.entity";
import {UserMasterEntity} from "libs/entities/user-master.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, PermissionEntity, UserMasterEntity]),
  ],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}
