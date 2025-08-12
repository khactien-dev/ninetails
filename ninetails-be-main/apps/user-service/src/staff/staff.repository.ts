import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';

@Injectable()
export class StaffRepository extends Repository<StaffRepository> {
  constructor(private dataSource: DataSource) {
    super(TenantEntity, dataSource.createEntityManager());
  }
}
