import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantEntity } from 'libs/entities/tenant.entity';
import { UserMasterEntity } from 'libs/entities/user-master.entity';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class UserFixService {
  constructor(
    @InjectRepository(TenantEntity)
    private tenantEntity: Repository<TenantEntity>,
    @InjectRepository(UserMasterEntity)
    private userMasterEntity: Repository<UserMasterEntity>,
    private dataSource: DataSource,
  ) {}

  async fixTenantNull() {
    const users = await this.userMasterEntity.find({
      where: { tenant_id: IsNull(), role: Not('ADMIN') },
    });
    const tenants = await this.tenantEntity.find();
    for (const user of users) {
      for (const tenant of tenants) {
        try {
          const check = await this.dataSource.query(
            `select id from "${tenant.schema.toUpperCase()}".users u where u.email = '${user.email}'`,
          );
          if (check[0]?.id) {
            await this.userMasterEntity.update(
              { id: user.id },
              { tenant_id: tenant.id },
            );
          }
        } catch (error) {}
      }
    }
    return await this.userMasterEntity.find({
      where: { id: In(users.map((u) => u.id)) },
    });
  }

  async encryptData() {
    // `DROP EXTENSION pgcrypto;`;
    `CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
    `INSERT INTO public."hashedEntity" (email) VALUES (
        PGP_SYM_ENCRYPT('abc@gmail.com','thisisverystrongkey')
    );`;
    `SELECT 
    PGP_SYM_DECRYPT(email::bytea, 'thisisverystrongkey') as email
    FROM public."hashedEntity" where (PGP_SYM_DECRYPT(email::bytea, 'thisisverystrongkey') = 'abc@gmail.com') 
    order by email desc;`;
  }

  async syncUserFromMaster() {
    const schemas = await this.dataSource.query(
      "select nspname from pg_namespace where nspname not in ('pg_toast', 'pg_catalog', 'information_schema');",
    );
    const schemaArr = schemas.map((schema) => schema.nspname);
    const tenants = await this.tenantEntity.find({
      where: { schema: In(schemaArr) },
    });
    await this.dataSource.query(
      `update public."users_master" set 
      phone_number = pgp_sym_encrypt(phone_number, '${process.env.ENCRYPT_KEY}'), 
      full_name = pgp_sym_encrypt(full_name, '${process.env.ENCRYPT_KEY}')`,
    );
    for (const tenant of tenants) {
      const master = await this.userMasterEntity.findOne({
        where: { role: 'OP', tenant_id: tenant.id },
      });
      if (!master) continue;
      await this.tenantEntity.update(
        { id: tenant.id },
        {
          operator: master.full_name,
          phone: master.phone_number,
        },
      );
      await Promise.all([
        this.dataSource.query(
          `update "${tenant.schema}"."users" set 
          full_name = '${master.full_name}', phone_number = '${master.phone_number}' where role = 'OP'`,
        ),
        this.dataSource.query(
          `update "${tenant.schema}"."combo_box" set data = pgp_sym_encrypt(data, '${process.env.ENCRYPT_KEY}')`,
        ),
      ]);
      const users = await this.userMasterEntity.find({
        where: { role: Not(In(['OP', 'ADMIN'])), tenant_id: tenant.id },
      });
      for (const user of users) {
        await Promise.all([
          this.dataSource.query(
            `update "${tenant.schema}"."users" set 
            full_name = '${user.full_name}', phone_number = '${user.phone_number}' where master_id = ${user.id}`,
          ),
          this.dataSource.query(
            `update "${tenant.schema}"."signature" set url = pgp_sym_encrypt(url, '${process.env.ENCRYPT_KEY}')`,
          ),
        ]);
      }
    }
    return true;
  }
}
