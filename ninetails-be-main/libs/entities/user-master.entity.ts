import { Exclude } from 'class-transformer';
import { TenantEntity } from './tenant.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import {PermissionEntity} from "libs/entities/permission.entity";

@Entity({ name: 'users_master' })
export class UserMasterEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  full_name: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'integer', nullable: true })
  tenant_id: number;

  @Column({ type: 'integer', nullable: true })
  permission_id: number;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @ManyToOne(() => TenantEntity, (t) => t.users, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @ManyToOne(() => PermissionEntity, (p) => p.users, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
