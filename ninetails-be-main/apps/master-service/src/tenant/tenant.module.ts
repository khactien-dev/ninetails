import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { UserMasterModule } from '../user-master/user-master.module';
import { HttpModule } from '@nestjs/axios';
import { OtpModule } from '../otp/otp.module';
import { MailModule } from '../mail/mail.module';
import { ContractEntity } from 'libs/entities/contract.entity';
import { BackupService } from './backup.service';
import { FileModule } from '../file/file.module';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { BackupEntity } from 'libs/entities/backup.entity';
import {PermissionEntity} from "libs/entities/permission.entity";
import { EncryptDataService } from 'libs/utils/encrypt-data';
import { TenantManageService } from './manage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, ContractEntity, BackupEntity, PermissionEntity]),
    UserMasterModule,
    HttpModule,
    OtpModule,
    MailModule,
    FileModule,
  ],
  providers: [
    TenantService,
    BackupService,
    {
      provide: 'OpenSearchClient',
      useFactory: async (configService: ConfigService) => {
        return new Client({
          node: configService.get<string>('OPENSEARCH_SERVER'),
          ssl: {
            rejectUnauthorized: false,
          },
        });
      },
      inject: [ConfigService],
    },
    EncryptDataService,
    TenantManageService,
  ],
  controllers: [TenantController],
})
export class TenantModule {}
