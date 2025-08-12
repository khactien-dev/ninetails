import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'setting_notification' })
export class SettingNotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'boolean', nullable: true, default: true })
  start_operate: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  end_operate: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  to_trash_collection_point: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  to_landfill: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  complete_route: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  back_to_parking: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  start_other_operations: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  end_other_operations: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  start_standby_state: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  end_standby_state: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  lost_signal: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  reconnect_signal: boolean;

  @Column({ type: 'integer', nullable: true })
  user_id: number;
}
