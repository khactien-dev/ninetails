import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'guides' })
export class GuideEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  route_id: number;

  @Column({ type: 'integer', nullable: true })
  point_index: number;

  @Column({ type: 'integer', nullable: true })
  point_count: number;

  @Column({ type: 'integer', nullable: true })
  type: number;

  @Column({ type: 'varchar', nullable: true })
  instructions: string;

  @Column({ type: 'numeric', nullable: true })
  distance: number;

  @Column({ type: 'numeric', nullable: true })
  duration: number;

  @Column({
    type: 'geometry',
    nullable: true,
    srid: 4326,
    spatialFeatureType: 'Polygon',
  })
  bbox: any;
}
