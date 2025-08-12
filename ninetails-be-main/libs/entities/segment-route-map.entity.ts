import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Column,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { RouteEntity } from 'libs/entities/route.entity';
import { SegmentEntity } from 'libs/entities/segment.entity';

@Entity({ name: 'route_segment_map' })
export class SegmentRouteMapEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  segment_id: number;

  @PrimaryColumn()
  route_id: number;

  @Column({ type: 'integer', nullable: true })
  section_id: number;

  @ManyToOne(() => RouteEntity, (route) => route.segment_routes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'route_id' })
  route: RouteEntity;

  @ManyToOne(() => SegmentEntity, (segment) => segment.segment_routes, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'segment_id' })
  segment: SegmentEntity;
}
