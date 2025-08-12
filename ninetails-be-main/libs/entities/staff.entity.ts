import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import {
  StaffStatus,
  DriverLicense,
  JobContract,
} from '../common/constants/common.constant';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { AbsenceStaffEntity } from 'libs/entities/absence-staff.entity';

@Entity({ name: 'staff' })
export class StaffEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'timestamp', nullable: true })
  age: Date;

  @Column({ type: 'varchar', nullable: true })
  driver_license: DriverLicense;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', nullable: true })
  job_contract: JobContract;

  @Column({ type: 'varchar', nullable: true })
  status: StaffStatus;

  @Column({ type: 'varchar', nullable: true })
  note: string;

  @OneToMany(() => AbsenceStaffEntity, (a) => a.absence_staff, {
    createForeignKeyConstraints: false,
  })
  absence_staff: AbsenceStaffEntity[];

  @OneToMany(() => AbsenceStaffEntity, (a) => a.replacer_staff, {
    createForeignKeyConstraints: false,
  })
  replacer_staff: AbsenceStaffEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsDriver, {
    createForeignKeyConstraints: false,
  })
  dStaff: WorkingScheduleEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsBackupDriver, {
    createForeignKeyConstraints: false,
  })
  bdStaff: WorkingScheduleEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsFieldAgent1, {
    createForeignKeyConstraints: false,
  })
  a1Staff: WorkingScheduleEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsBackupFieldAgent1, {
    createForeignKeyConstraints: false,
  })
  ba1Staff: WorkingScheduleEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsFieldAgent2, {
    createForeignKeyConstraints: false,
  })
  a2Staff: WorkingScheduleEntity;

  @OneToMany(() => WorkingScheduleEntity, (v) => v.wsBackupFieldAgent2, {
    createForeignKeyConstraints: false,
  })
  ba2Staff: WorkingScheduleEntity;
}
