import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'config_weight' })
export class ConfigWeightEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '5L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '10L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '10L_reu': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '20L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '20L_reu': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '30L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '50L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '50L_pub': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '75L_gen': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  '75L_pub': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  'ext': number;

  @Column({ nullable: true, type: 'decimal', scale: 2 })
  'etc': number;
}
