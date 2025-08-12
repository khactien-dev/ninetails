import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'sign_history' })
export class SignHistoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  op_master_id: number;

  @Column({ type: 'integer', nullable: true })
  dispatch_master_id: number;

  @Column({ type: 'text', nullable: true })
  op_master_url: string;

  @Column({ type: 'text', nullable: true })
  dispatch_master_url: string;

  @Column({ type: 'integer', nullable: true })
  vehicle_id: number;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;
}
