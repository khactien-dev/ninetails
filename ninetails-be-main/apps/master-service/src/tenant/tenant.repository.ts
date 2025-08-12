import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';

@Injectable()
export class TenantRepository extends Repository<TenantEntity> {
  constructor(private dataSource: DataSource) {
    super(TenantEntity, dataSource.createEntityManager());
  }
}
