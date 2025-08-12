import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { VehicleEntity } from './vehicle.entity';

@Entity('edge_serve')
export class EdgeServeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  edge_name: string;

  @OneToOne(() => VehicleEntity, {
    nullable: true,
    onDelete: 'SET NULL',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'vehicle_id' })
  @Index({ unique: true })
  vehicle: VehicleEntity;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, unique: true })
  mac_address: string;

  @Column({ nullable: true, default: null })
  hw_version: string;

  @Column({ nullable: true, default: null })
  os_version: string;

  @Column({ nullable: true, default: null })
  kernel_version: string;

  @Column({ nullable: true, default: null })
  jetpack_version: string;

  @Column({ nullable: true, default: null })
  docker_version: string;

  @Column({ nullable: true, type: 'integer' })
  edge_metrics: number;

  @Column({ default: false })
  edge_metrics_checkbox: boolean;

  @Column({ nullable: true, type: 'integer' })
  collection_metrics: number;

  @Column({ default: false })
  collection_metrics_checkbox: boolean;

  @Column({ nullable: true, type: 'integer' })
  operation_metrics: number;

  @Column({ default: false })
  operation_metrics_checkbox: boolean;

  @Column({ nullable: true })
  operation_status_ui: boolean;

  @Column({ default: false })
  operation_status_ui_checkbox: boolean;

  @Column({ nullable: true })
  collection_status_ui: boolean;

  @Column({ default: false })
  collection_status_ui_checkbox: boolean;

  @Column({ nullable: true })
  volume_analysis_ui: boolean;

  @Column({ default: false })
  volume_analysis_ui_checkbox: boolean;

  @Column({ nullable: true })
  quantity_analysis_ui: boolean;

  @Column({ default: false })
  quantity_analysis_ui_checkbox: boolean;

  @Column({ nullable: true })
  video_ui: boolean;

  @Column({ default: false })
  video_ui_checkbox: boolean;

  @Column({ nullable: true, type: 'decimal' })
  edge_setting_version: number;

  @Column({ nullable: true })
  status: boolean;

  @Column({ nullable: true, name: 'last_auth', default: null })
  last_auth?: Date;
}
