import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'congestion_codes' })
export class CongestionCodeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: 'numeric', default: 0 })
  code: number;

  @Column({ name: 'description', nullable: true })
  description: string;
}
