import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'landfill_record' })
export class LandfillRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  vehicle_id: number;

  @Column({ type: 'integer', nullable: true })
  serial: number;

  @Column({ type: 'float', nullable: true })
  loading_weight: number;

  @Column({ type: 'float', nullable: true })
  empty_weight: number;

  @Column({ type: 'timestamp', nullable: true })
  entrance_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  exit_time: Date;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  filename: string;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;
}
