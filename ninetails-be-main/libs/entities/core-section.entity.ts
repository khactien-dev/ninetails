import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { RouteEntity } from 'libs/entities/route.entity';

@Entity({ name: 'core_sections' })
export class CoreSectionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  segment_id: number;

  @Column({ type: 'integer', nullable: true, name: 'pointIndex' })
  point_index: number;

  @Column({ type: 'integer', nullable: true })
  route_id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  route_type: string;

  @ManyToOne(() => RouteEntity, (r) => r.cores, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'route_id' })
  route: RouteEntity;
}
