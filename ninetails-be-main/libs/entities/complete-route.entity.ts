import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'complete_route' })
export class CompleteRouteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  route_hash: string;

  @Column({ type: 'varchar', nullable: false })
  section_name: string;

  @Column({ type: 'varchar', nullable: null })
  schema_name: string;
}
