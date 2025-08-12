import { BaseEntity } from './base.entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'storage_data' })
export class StorageDataEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json', nullable: true })
  ref_id: number;

  @Column({ nullable: true, type: 'text' })
  old_data: string;

  @Column({ nullable: true, type: 'text' })
  new_data: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, name: 'table' })
  @Index('table')
  table: string;

  @Column({ type: 'integer', nullable: true })
  version_id: number;
}
