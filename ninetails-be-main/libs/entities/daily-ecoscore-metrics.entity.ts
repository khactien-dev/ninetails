import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('daily_ecoscore_metrics')
export class DailyEcoscoreMetricsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  routeId: number;

  @Column({ type: 'integer', nullable: true })
  sectionId: number;

  @Column({ type: 'integer', nullable: true })
  segmentId: number;

  @Column({ type: 'jsonb', nullable: true })
  locations: number[];

  @Column({ type: 'integer', nullable: true })
  ecoScore: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'integer', nullable: true })
  distance: number;

  @Column({ type: 'integer', nullable: true })
  speeding: number;

  @Column({ type: 'integer', nullable: true })
  idlingStop: number;

  @Column({ type: 'integer', nullable: true })
  suddenAccel: number;

  @Column({ type: 'integer', nullable: true })
  suddenBreak: number;

  @Column({ type: 'integer', nullable: true })
  offControl: number;

  @Column({ type: 'integer', nullable: true })
  endOperation: number;

  @Column({ type: 'varchar', nullable: true })
  sectionName: string;

  @Column({ type: 'timestamp', nullable: true })
  dateTime: Date;
}
