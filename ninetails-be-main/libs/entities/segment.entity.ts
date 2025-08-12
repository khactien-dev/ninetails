import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SegmentRouteMapEntity } from './segment-route-map.entity';

@Entity({ name: 'segments' })
export class SegmentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'numeric', nullable: true })
  congestion: number;

  @Column({ type: 'numeric', nullable: true })
  duration: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  must_pass: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  manual_collect: boolean;

  @Column({ type: 'numeric', nullable: true })
  distance: number;

  @Column({ type: 'integer', nullable: true })
  collect_count: number;

  @Column({ type: 'numeric', nullable: true })
  collect_volume: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  segment_line: any;

  @OneToMany(() => SegmentRouteMapEntity, (route) => route.segment)
  segment_routes?: SegmentRouteMapEntity[];
}
