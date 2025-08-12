import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'edge_state_raw' }) // raw for 5 mins
export class EdgeStateRawEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'integer', nullable: true })
  route_id: number;

  @Column({ type: 'timestamp without time zone', nullable: true })
  date: Date;

  @Column({ type: 'float', nullable: true })
  cpu_avg_degree: number;

  @Column({ type: 'float', nullable: true })
  gpu_avg_degree: number;

  @Column({ type: 'float', nullable: true })
  soc_avg_degree: number;

  @Column({ type: 'float', nullable: true, name: 'cpu_avg_%' })
  'cpu_avg_%': number;

  @Column({ type: 'float', nullable: true, name: 'gpu_avg_%' })
  'gpu_avg_%': number;

  @Column({ type: 'float', nullable: true, name: 'mem_avg_%' })
  'mem_avg_%': number;

  @Column({ type: 'float', nullable: true, name: 'disk_avg_%' })
  'disk_avg_%': number;

  @Column({ type: 'float', nullable: true })
  lte_in_total_byte: number;

  @Column({ type: 'float', nullable: true })
  lte_out_total_byte: number;

  @Column({ type: 'float', nullable: true })
  camera_total_byte: number;

  @Column({ type: 'float', nullable: true })
  dtg_total_byte: number;

  @Column({ type: 'float', nullable: true })
  disk_total_byte: number;
}

@Entity({ name: 'edge_state_1_hour' }) // ewm for 1 hour
export class EdgeState1HourEntity extends EdgeStateRawEntity {}

@Entity({ name: 'edge_state_1_day' }) // ewm for 1 day
export class EdgeState1DayEntity extends EdgeStateRawEntity {}
