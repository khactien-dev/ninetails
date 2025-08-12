import { Injectable, Logger } from '@nestjs/common';
import { logError, logInfo } from '../../../../libs/utils/helper.util';
import { EUserRole } from '../../../../libs/enums/common.enum';
import { UserMasterService } from '../user-master/user-master.service';
import { DataSource } from 'typeorm';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_DEFAULT_PASSWORD = process.env.SUPER_ADMIN_DEFAULT_PASSWORD;

@Injectable()
export class AdminSeed {
  private readonly logger = new Logger(AdminSeed.name);
  constructor(
    private readonly userMasterService: UserMasterService,
    private dataSource: DataSource,
  ) {}

  async create() {
    try {
      logInfo('SEEDING', '---------------Start Seeding!---------------');

      const existedAdmin = await this.userMasterService.findByRole(
        EUserRole.ADMIN,
      );
      logInfo('existed admin', existedAdmin);

      const isNewAdmin =
        existedAdmin && existedAdmin.email !== SUPER_ADMIN_EMAIL;

      if (isNewAdmin) {
        await this.userMasterService.update(
          { id: existedAdmin.id },
          {
            deletedAt: new Date(),
          },
        );
        logInfo(`remove old ${EUserRole.ADMIN}`, existedAdmin);
      }

      if (!existedAdmin || isNewAdmin) {
        const admin = await this.userMasterService.saveAdmin({
          password: SUPER_ADMIN_DEFAULT_PASSWORD,
          email: SUPER_ADMIN_EMAIL,
          role: EUserRole.ADMIN,
          full_name: 'admin',
        });

        logInfo('create admin successfully', admin);
      }
      logInfo('SEEDING', '---------Seed Done!-----------');

      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

      return true;
    } catch (error) {
      logError('SEEDING error', error);
    }
  }
}
