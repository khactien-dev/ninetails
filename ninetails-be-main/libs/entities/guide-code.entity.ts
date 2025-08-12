import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'guide_codes' })
export class GuideCodeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  code: number;

  @Column({ name: 'description', nullable: true })
  description: string;
}
