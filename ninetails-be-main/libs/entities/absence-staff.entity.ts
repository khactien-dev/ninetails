import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { StaffEntity } from './staff.entity';

@Entity('absence_staff')
export class AbsenceStaffEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  absence_type: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  repeat: string;

  @Column({ nullable: true })
  repeat_days_week: string;

  @Column({ nullable: true })
  repeat_days_month: string;

  @Column({ nullable: true, type: 'integer' })
  absence_staff_id: number;

  @Column({ nullable: true, type: 'integer' })
  replacer_staff_id: number;

  @Column({ nullable: true })
  other: string;

  @ManyToOne(() => StaffEntity, (s) => s.absence_staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'absence_staff_id' })
  absence_staff: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.replacer_staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'replacer_staff_id' })
  replacer_staff: StaffEntity;
}
