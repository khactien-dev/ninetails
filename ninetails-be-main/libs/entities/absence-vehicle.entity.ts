import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { VehicleEntity } from './vehicle.entity';
import { ABSENCE_VEHICLE_TYPE } from 'libs/enums/common.enum';

@Entity('absence_vehicle')
export class AbsenceVehicleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'absence_vehicle' })
  absence_vehicle: VehicleEntity;

  @ManyToOne(() => VehicleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'replacement_vehicle' })
  replacement_vehicle: VehicleEntity;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  absence_type: ABSENCE_VEHICLE_TYPE;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;
}
