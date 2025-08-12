import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notification')
export class NotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  route_name: string;

  @Column({ type: 'text', nullable: true })
  vehicle_number: string;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;
}
