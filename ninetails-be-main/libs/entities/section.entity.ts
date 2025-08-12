import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { RouteEntity } from 'libs/entities/route.entity';

@Entity({ name: 'sections' })
export class SectionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  route_id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'integer', nullable: true })
  point_index: number;

  @Column({ type: 'integer', nullable: true })
  point_count: number;

  @Column({ type: 'numeric', nullable: true })
  distance: number;

  @Column({ type: 'numeric', nullable: true })
  congestion: number;

  @Column({ type: 'numeric', nullable: true })
  duration: number;

  @Column({ type: 'integer', nullable: true })
  collect_count: number;

  @Column({ type: 'numeric', nullable: true })
  collect_volume: number;

  @ManyToOne(() => RouteEntity, (r) => r.sections, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'route_id' })
  route: RouteEntity;
}
