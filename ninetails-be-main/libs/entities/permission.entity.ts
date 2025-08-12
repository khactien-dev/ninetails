import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TenantEntity } from './tenant.entity';
import {PERMISSION_TYPE} from "libs/enums/common.enum";
import {UserMasterEntity} from "libs/entities/user-master.entity";

@Entity({ name: 'permission' })
export class PermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  tenant_id: number;

  @Column({ type: 'varchar', nullable: true })
  type: PERMISSION_TYPE;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  dashboard: string;

  @Column({ type: 'varchar', nullable: true })
  work_shift: string;

  @Column({ type: 'varchar', nullable: true })
  realtime_activity: string;

  @Column({ type: 'varchar', nullable: true })
  operation_analysis: string;

  @Column({ type: 'varchar', nullable: true })
  illegal_disposal: string;

  @Column({ type: 'varchar', nullable: true })
  driving_diary: string;

  @Column({ type: 'varchar', nullable: true })
  notification: string;

  @Column({ type: 'varchar', nullable: true })
  user_management: string;

  @Column({ type: 'varchar', nullable: true })
  company_management: string;

  @Column({ type: 'varchar', nullable: true })
  staff_management: string;

  @Column({ type: 'varchar', nullable: true })
  vehicle_management: string;

  @Column({ type: 'varchar', nullable: true })
  updater_application_management: string;

  @Column({ type: 'varchar', nullable: true })
  route_management: string;

  @Column({ type: 'varchar', nullable: true })
  absence_management: string;

  @ManyToOne(() => TenantEntity, (t) => t.permissions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @OneToMany(() => UserMasterEntity, (u) => u.permission, {
    createForeignKeyConstraints: false,
  })
  users: UserMasterEntity[];
}
