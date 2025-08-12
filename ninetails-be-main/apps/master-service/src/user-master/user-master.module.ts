import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpEntity } from 'libs/entities/otp.entity';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { UserMasterService } from './user-master.service';
import { AuthController } from './auth.controller';
import { OtpModule } from '../otp/otp.module';
import { AdminSeed } from '../seeds/admin.seed';
import { TokenService } from '../token/token.service';
import { JwtModule } from '@nestjs/jwt';
import { UserMasterController } from './user-master.controller';
import { UserFixService } from './user.fix';
import {HttpModule} from "@nestjs/axios";
import {PermissionEntity} from "libs/entities/permission.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpEntity, UserMasterEntity, TenantEntity, PermissionEntity]),
    OtpModule,
    JwtModule,
    HttpModule,
  ],
  providers: [UserMasterService, AdminSeed, TokenService, UserFixService],
  controllers: [AuthController, UserMasterController],
  exports: [UserMasterService],
})
export class UserMasterModule {}
