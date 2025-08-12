import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SectionEntity } from 'libs/entities/section.entity';
import { CoreSectionEntity } from 'libs/entities/core-section.entity';
import { SegmentRouteMapEntity } from './segment-route-map.entity';

@Entity({ name: 'routes' })
export class RouteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({
    type: 'geometry',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  start: any;

  @Column({
    type: 'geometry',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  goal: any;

  @Column({ type: 'numeric', nullable: true })
  distance: number;

  @Column({ type: 'numeric', nullable: true })
  duration: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    nullable: true,
    srid: 4326,
  })
  bbox: any;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  path: any;

  @Column({ type: 'integer', nullable: true })
  collect_count: number;

  @Column({ type: 'numeric', nullable: true })
  collect_volume: number;

  @OneToMany(() => SectionEntity, (s) => s.route, {
    createForeignKeyConstraints: false,
  })
  sections?: SectionEntity[];

  @OneToMany(() => CoreSectionEntity, (c) => c.route, {
    createForeignKeyConstraints: false,
  })
  cores?: CoreSectionEntity[];

  @OneToMany(() => SegmentRouteMapEntity, (segment) => segment.route, {
    createForeignKeyConstraints: false,
  })
  segment_routes?: SegmentRouteMapEntity[];
}
