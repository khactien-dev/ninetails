import { BaseEntity } from './base.entity';
import { OTPTYPE } from '../enums/common.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'otp' })
export class OtpEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({nullable: true})
  email: string;

  @Column({nullable: true})
  phone_number: string;

  @Column({ type: 'varchar' })
  type: OTPTYPE;

  @Column({ default: false })
  is_resend: boolean;
}
