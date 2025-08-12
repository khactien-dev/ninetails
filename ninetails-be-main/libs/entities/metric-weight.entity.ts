import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('metric_weight')
export class MetricWeightEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0.15, nullable: true })
  distanceRatioRate: number;

  @Column({ type: 'float', default: 0.15, nullable: true })
  durationRatioRate: number;

  @Column({ type: 'float', default: 0.15, nullable: true })
  collectDistanceRate: number;

  @Column({ type: 'float', default: 0.15, nullable: true })
  collectDurationRate: number;

  @Column({ type: 'float', default: 0.3, nullable: true })
  collectCountRate: number;

  @Column({ type: 'float', default: 0.1, nullable: true })
  manualCollectTimeRate: number;

  @Column({ type: 'float', default: 0.1, nullable: true })
  alpha: number;

  @Column({ type: 'float', default: 0.05, nullable: true })
  pValue: number;

  @Column({ type: 'float', default: 0.1, nullable: true })
  percentageAE: number;

  @Column({ type: 'float', default: 0.2, nullable: true })
  percentageBD: number;

  @Column({ type: 'float', default: 0.4, nullable: true })
  percentageC: number;
}
