import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SegmentEntity } from './segment.entity';

@Entity({ name: 'point' })
export class PointEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  segment_id: number;

  @Column({ type: 'integer', nullable: true })
  point_index: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  segment: SegmentEntity;
}
