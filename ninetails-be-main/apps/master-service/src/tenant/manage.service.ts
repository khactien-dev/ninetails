import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TenantManagementReq } from './dto/tenant-req.dto';
import { IPaginate } from 'libs/common/common.interface';
import * as moment from 'moment';
import { TenantService } from './tenant.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { SORT_TENANT } from 'libs/common/constants/common.constant';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TenantManageService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    private dataSource: DataSource,
    private tenantService: TenantService,
    private configService: ConfigService,
  ) {}

  async findAndCount(
    criteria: TenantManagementReq,
    paginate: IPaginate,
    isManagement = false,
  ) {
    let whereStr = '';
    if (criteria.email) {
      whereStr += `t.email like '%${criteria.email}%')`;
    }
    const queryBuilder = this.tenantEntity
      .createQueryBuilder('t')
      .addSelect(
        `PGP_SYM_DECRYPT(t.phone::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'phone',
      )
      .addSelect(
        `PGP_SYM_DECRYPT(t.operator::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
        'operator',
      );

    if (isManagement) {
      queryBuilder
        .addSelect(
          `PGP_SYM_DECRYPT(c.start_date::bytea, '${this.configService.get('ENCRYPT_KEY')}')::timestamp`,
          'start_date',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(c.end_date::bytea, '${this.configService.get('ENCRYPT_KEY')}')::timestamp`,
          'end_date',
        )
        .addSelect(
          `PGP_SYM_DECRYPT(c.type::bytea, '${this.configService.get('ENCRYPT_KEY')}')`,
          'type',
        )
        .leftJoinAndSelect('t.users', 'um', "role = 'OP'")
        .leftJoinAndSelect('t.contracts', 'c');
      whereStr += (whereStr ? ' AND ' : '') + 'approved_time is not null';
      if (criteria.sortField === SORT_TENANT.CONTRACTSTATUS) {
        queryBuilder.orderBy(
          'status',
          ['DESC', 'desc'].includes(criteria.sortBy) ? 'ASC' : 'DESC',
          ['DESC', 'desc'].includes(criteria.sortBy)
            ? 'NULLS LAST'
            : 'NULLS FIRST',
        );
      }
      if (criteria.sortField === SORT_TENANT.LASTLOGIN) {
        queryBuilder.orderBy(
          'last_login',
          ['DESC', 'desc'].includes(criteria.sortBy) ? 'ASC' : 'DESC',
          ['DESC', 'desc'].includes(criteria.sortBy)
            ? 'NULLS LAST'
            : 'NULLS FIRST',
        );
      }
      if (criteria.sortField === SORT_TENANT.CONTRACTENDDATE) {
        queryBuilder.orderBy(
          'end_date',
          criteria.sortBy.toUpperCase() as 'ASC' | 'DESC',
          criteria.sortBy.toUpperCase() === 'DESC'
            ? 'NULLS LAST'
            : 'NULLS FIRST',
        );
      }
      if (criteria.sortField === SORT_TENANT.CONTRACTSTARTDATE) {
        queryBuilder.orderBy(
          'start_date',
          criteria.sortBy.toUpperCase() as 'ASC' | 'DESC',
          criteria.sortBy.toUpperCase() === 'DESC'
            ? 'NULLS LAST'
            : 'NULLS FIRST',
        );
      }
      if (criteria.sortField === SORT_TENANT.CONTRACTYPE) {
        queryBuilder.orderBy(
          'type',
          criteria.sortBy.toUpperCase() as 'ASC' | 'DESC',
        );
      }
      if (criteria.sortField === SORT_TENANT.PHONE) {
        queryBuilder.orderBy(
          'phone',
          criteria.sortBy.toUpperCase() as 'ASC' | 'DESC',
        );
      }
      if (criteria.sortField === SORT_TENANT.OPERATOR) {
        queryBuilder.orderBy(
          'operator',
          criteria.sortBy.toUpperCase() as 'ASC' | 'DESC',
        );
      }
    }
    if (
      !criteria.sortField ||
      ['id', 'email', 'organization'].includes(criteria.sortField)
    ) {
      queryBuilder.orderBy(
        `t.${criteria.sortField || 'id'}`,
        criteria.sortBy.toUpperCase() as any,
      );
    }
    const [{ entities, raw }, total] = await Promise.all([
      queryBuilder
        .where(whereStr)
        .take(paginate.take)
        .skip(paginate.skip)
        .getRawAndEntities(),
      this.dataSource.query(
        `SELECT COUNT(*) FROM tenant ${whereStr ? 'where ' + whereStr : ''};`,
      ),
    ]);
    const mappedList = await Promise.all(
      entities.map(async (item) => {
        const rawItem = raw.find((r) => r.t_id === item.id);
        item.phone = rawItem?.phone;
        item.operator = rawItem?.operator;
        if (item.contracts && item.contracts.length > 0) {
          item.contracts[0].start_date = rawItem?.start_date;
          item.contracts[0].end_date = rawItem?.end_date;
          item.contracts[0].type = rawItem?.type;
          if (item.contracts[0].start_date) {
            item.contracts[0].start_date = moment(item.contracts[0].start_date)
              .utc()
              .format('YYYY-MM-DD') as any;
          }
          if (item.contracts[0].end_date) {
            item.contracts[0].end_date = moment(item.contracts[0].end_date)
              .utc()
              .format('YYYY-MM-DD') as any;
          }
        }

        const department =
          !isNaN(Number(item.department)) && item.schema !== null
            ? await this.tenantService.findSchemaComboboxById(
                item.schema,
                parseInt(item.department, 10),
              )
            : item.department ? (await this.dataSource.query(
              `select pgp_sym_decrypt('${item.department}'::bytea, '${this.configService.get('ENCRYPT_KEY')}') as department`,
            ))[0].department : null;

        const position =
          !isNaN(Number(item.position)) && item.schema !== null
            ? await this.tenantService.findSchemaComboboxById(
                item.schema,
                parseInt(item.position, 10),
              )
            : item.position ? (await this.dataSource.query(
              `select pgp_sym_decrypt('${item.position}'::bytea, '${this.configService.get('ENCRYPT_KEY')}') as position`,
            ))[0].position : null;

        item.department = department;
        item.position = position;
        return item;
      }),
    );
    return { list: mappedList, total: +total[0].count };
  }

  async hardDeleteTenant(id: number) {
    const tenant = await this.tenantService.findOne({ id });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manage = queryRunner.manager;
      await manage.delete(UserMasterEntity, { tenant_id: id });
      await manage.delete(TenantEntity, { id });
      await queryRunner.dropSchema(tenant.schema, true, true);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
