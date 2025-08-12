import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'driving_record' })
export class DrivingRecordEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  vehicle_id: number;

  @Column({ type: 'float', nullable: true })
  distance_yesterday: number;

  @Column({ type: 'float', nullable: true })
  fuel_yesterday: number;

  @Column({ type: 'float', nullable: true })
  distance_today: number;

  @Column({ type: 'float', nullable: true })
  fuel_today: number;

  @Column({ type: 'float', nullable: true })
  fuel_volumn: number;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;
}
