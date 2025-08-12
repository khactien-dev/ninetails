import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'driving_diary' })
export class DrivingDiaryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  route_id: number;

  @Column({ nullable: true })
  section_name: string;

  @Column({ type: 'integer', nullable: true })
  drive_mode: number;

  @Column({ type: 'timestamp', nullable: true })
  timestamp: Date;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'float', nullable: true })
  total_trip_distance: number;

  @Column({ type: 'integer', nullable: true })
  collect_amount: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'numeric', default: 0, nullable: true })
  duration_seconds: number;

  @Column({ type: 'integer', nullable: true })
  segment_id: number;

  @Column({ type: 'integer', nullable: true })
  section_id: number;
}
