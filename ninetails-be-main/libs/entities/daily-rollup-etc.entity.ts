import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('daily_rollup_etc')
export class DailyRollupETCEntity extends BaseEntity {
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
  driveMode: number;

  @Column({ type: 'varchar', nullable: true })
  sectionName: string;

  @Column({ type: 'timestamp', nullable: true })
  dateTime: Date;
}
