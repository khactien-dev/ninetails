import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { TenantEntity } from './tenant.entity';
import { CONTRACTYPE } from 'libs/enums/common.enum';

@Entity({ name: 'contract' })
export class ContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  tenant_id: number;

  @Column({ type: 'text', nullable: true })
  start_date: Date;

  @Column({ type: 'text', nullable: true })
  end_date: Date;

  @Column({ nullable: true, type: 'text' })
  type: CONTRACTYPE;

  @Column({ nullable: true, type: 'integer', default: 0 })
  status: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_remind: boolean;

  @ManyToOne(() => TenantEntity, (t) => t.contracts, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}
