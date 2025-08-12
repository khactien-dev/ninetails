import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import {situation} from "../enums/common.enum";

@Entity('location')
export class LocationEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  region_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: false })
  explanation: string;

  @Column({ type: 'varchar', nullable: false })
  line_version: string;

  @Column({ type: 'int', nullable: false })
  average_collection_amount: number;

  @Column({ type: 'int', nullable: false })
  average_collection_time: number;

  @Column({ type: 'int', nullable: false })
  movement_distance: number;

  @Column({ type: 'integer', nullable: true })
  situation: situation;

  @Column({ type: 'timestamp', nullable: false })
  update_time: Date;
}
