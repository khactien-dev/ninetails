import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { VehicleEntity } from 'libs/entities/vehicle.entity';
import { StaffEntity } from 'libs/entities/staff.entity';
import { RouteEntity } from './route.entity';

@Entity({ name: 'dispatches' })
export class WorkingScheduleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  dispatch_no: string;

  @Column({ nullable: true, name: 'date' })
  working_date: Date;

  @Column({ nullable: true, name: 'route_type' })
  purpose: string;

  @Column({ nullable: true, type: 'integer' })
  vehicle_id: number;

  @Column({ nullable: true, type: 'integer', name: 'alt_vehicle_id' })
  backup_vehicle_id: number;

  @Column({ nullable: true, name: 'route_id' })
  route_id: number;

  @Column({ nullable: true, name: 'driver_id' })
  driver: number;

  @Column({ nullable: true, name: 'alt_driver_id' })
  backup_driver: number;

  @Column({ nullable: true, name: 'crew1_id' })
  field_agent_1: number;

  @Column({ nullable: true, name: 'alt_crew1_id' })
  backup_field_agent_1: number;

  @Column({ nullable: true, name: 'crew2_id' })
  field_agent_2: number;

  @Column({ nullable: true, name: 'alt_crew2_id' })
  backup_field_agent_2: number;

  @Column({ nullable: true })
  operation_metrics: number; //interval time iot send data
  // thoi gian iot gui interval (seconds)

  @ManyToOne(() => VehicleEntity, (v) => v.wsVehicle, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: VehicleEntity;

  @ManyToOne(() => VehicleEntity, (v) => v.wsVehicle, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'alt_vehicle_id' })
  wsBackupVehicle: VehicleEntity;

  @ManyToOne(() => StaffEntity, (s) => s.dStaff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'driver_id' })
  wsDriver: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.bdStaff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'alt_driver_id' })
  wsBackupDriver: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.a1Staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'crew1_id' })
  wsFieldAgent1: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.ba1Staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'alt_crew1_id' })
  wsBackupFieldAgent1: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.a2Staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'crew2_id' })
  wsFieldAgent2: StaffEntity;

  @ManyToOne(() => StaffEntity, (s) => s.ba2Staff, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'alt_crew2_id' })
  wsBackupFieldAgent2: StaffEntity;

  @ManyToOne(() => RouteEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'route_id' })
  route: RouteEntity;
}
