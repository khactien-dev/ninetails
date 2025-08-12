import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('daily_collect_metrics')
export class DailyCollectMetricsEntity extends BaseEntity {
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
  distance: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'integer', nullable: true })
  collectCount: number;

  @Column({ type: 'integer', nullable: true })
  collectVolume: number;

  @Column({ type: 'timestamp', nullable: true })
  dateTime: Date;
}
