import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('contact_request')
export class ContactRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizational_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column({ type: 'text' })
  request_quotation: string;

  @Column({ default: true })
  is_agree: boolean;
}
