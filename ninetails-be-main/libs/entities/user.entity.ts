import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { EUserRole } from '../enums/common.enum';
import { UserStatus } from '../common/constants/common.constant';
import { ComboBoxEntity } from './combo-box.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, type: 'varchar' })
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  phone_number: string;

  @Column({ nullable: true, type: 'varchar' })
  role: EUserRole | string;

  @Column({ type: 'integer', nullable: true })
  department: number;

  @Column({ type: 'integer', nullable: true })
  position: number;

  @Column({ type: 'integer', nullable: true })
  status: UserStatus;

  @Column({ nullable: true, type: 'int' })
  staff_id: number;

  @Column({ type: 'integer', nullable: true })
  master_id: number;

  @ManyToOne(() => ComboBoxEntity, (c) => c.departmentUsers, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'department' })
  comboboxDepartment: ComboBoxEntity;

  @ManyToOne(() => ComboBoxEntity, (c) => c.positionUsers, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'position' })
  comboboxPosition: ComboBoxEntity;
}
