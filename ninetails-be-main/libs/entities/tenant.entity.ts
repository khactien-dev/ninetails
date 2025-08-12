import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserMasterEntity } from './user-master.entity';
import { ContractEntity } from './contract.entity';
import { PermissionEntity } from 'libs/entities/permission.entity';

@Entity({ name: 'tenant' })
export class TenantEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  organization: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  operator: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  proof1: string;

  @Column({ type: 'text', nullable: true })
  filename_proof1: string;

  @Column({ type: 'text', nullable: true })
  proof2: string;

  @Column({ type: 'text', nullable: true })
  filename_proof2: string;

  @Column({ nullable: true })
  schema: string;

  @Column({ type: 'text', nullable: true })
  token: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_time: Date;

  @Column({ type: 'boolean', default: false, nullable: true })
  send_mail_at: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_backup: boolean;

  @OneToMany(() => UserMasterEntity, (u) => u.tenant, {
    createForeignKeyConstraints: false,
  })
  users: UserMasterEntity[];

  @OneToMany(() => ContractEntity, (c) => c.tenant, {
    createForeignKeyConstraints: false,
  })
  contracts: ContractEntity[];

  @OneToMany(() => PermissionEntity, (p) => p.tenant, {
    createForeignKeyConstraints: false,
  })
  permissions: PermissionEntity[];
}
