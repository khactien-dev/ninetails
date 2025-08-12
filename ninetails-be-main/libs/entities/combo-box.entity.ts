import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StaffEntity } from './staff.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'combo_box' })
export class ComboBoxEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  field: string;

  @Column({ type: 'varchar', nullable: false })
  data: string;

  @OneToMany(() => UserEntity, (s) => s.comboboxDepartment, {
    createForeignKeyConstraints: false,
  })
  departmentUsers: UserEntity;

  @OneToMany(() => UserEntity, (s) => s.comboboxPosition, {
    createForeignKeyConstraints: false,
  })
  positionUsers: UserEntity;
}
