import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'metadata' })
export class MetadataEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: 'varchar' })
  table_name: string;

  @Column({ type: 'integer', nullable: true })
  version: number;

  @Column({ type: 'varchar', nullable: true })
  updated_by: string;

  @Column({ type: 'timestamp', nullable: true })
  update_time: Date;
}
