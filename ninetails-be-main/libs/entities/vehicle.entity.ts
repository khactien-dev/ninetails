import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkingScheduleEntity } from 'libs/entities/working-schedule.entity';
import { ComboBoxEntity } from './combo-box.entity';
import { AbsenceVehicleEntity } from './absence-vehicle.entity';
import { VEHICLE_PURPOSE, VEHICLE_STATUS } from 'libs/enums/common.enum';

@Entity('vehicle')
export class VehicleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  vehicle_number: string;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'vehicle_type' })
  vehicle_type: ComboBoxEntity;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'vehicle_model' })
  vehicle_model: ComboBoxEntity;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'manufacturer' })
  manufacturer: ComboBoxEntity;

  @Column({ type: 'timestamp', nullable: true })
  operation_start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  operation_end_date: Date;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'capacity' })
  capacity: ComboBoxEntity;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'max_capacity' })
  max_capacity: ComboBoxEntity;

  @Column({ type: 'timestamp', nullable: true })
  recent_maintenance: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_maintenance: Date;

  @ManyToOne(() => ComboBoxEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'special_features' })
  special_features: ComboBoxEntity;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  purpose: VEHICLE_PURPOSE;

  @Column({ nullable: true })
  note: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  status: VEHICLE_STATUS;

  @OneToMany(() => AbsenceVehicleEntity, (v) => v.absence_vehicle, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  absence: AbsenceVehicleEntity[];

  @OneToMany(() => AbsenceVehicleEntity, (v) => v.replacement_vehicle, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  replace: AbsenceVehicleEntity[];

  @OneToMany(() => WorkingScheduleEntity, (v) => v.vehicle, {
    createForeignKeyConstraints: false,
  })
  wsVehicle: WorkingScheduleEntity[];
}
