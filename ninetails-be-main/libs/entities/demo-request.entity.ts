import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('demo_request')
export class DemoRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizational_name: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column({ type: 'text' })
  request_quotation: string;

  @Column({ default: true })
  is_agree: boolean;
}
