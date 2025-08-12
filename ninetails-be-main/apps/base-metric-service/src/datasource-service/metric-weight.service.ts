import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MetricWeightDto } from './dto/metric-weight.dto';

@Injectable()
export class MetricWeightService {
  constructor(private dataSource: DataSource) {}

  async getMetricWeight(schema: string) {
    const metricWeight = await this.dataSource.query(
      `SELECT * FROM "${schema}".metric_weight;`,
    );

    return metricWeight[0];
  }

  async insertMetricWeight(schema: string, metricWeightDto: MetricWeightDto) {
    await this.dataSource.query(
      `INSERT INTO "${schema}".metric_weight (distanceRatioRate, durationRatioRate, collectDistanceRate, collectDurationRate, collectCountRate, manualCollectTimeRate, alpha, pValue, percentageAE, percentageBD, percentageC) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metricWeightDto.distanceRatioRate,
        metricWeightDto.durationRatioRate,
        metricWeightDto.collectDistanceRate,
        metricWeightDto.collectDurationRate,
        metricWeightDto.collectCountRate,
        metricWeightDto.manualCollectTimeRate,
        metricWeightDto.alpha,
        metricWeightDto.pValue,
        metricWeightDto.percentageAE,
        metricWeightDto.percentageBD,
        metricWeightDto.percentageC,
      ],
    );
  }

  async updateMetricWeight(schema: string, metricWeightDto: MetricWeightDto) {
    const metricWeight = await this.getMetricWeight(schema);
    await this.dataSource.query(
      `UPDATE "${schema}".metric_weight SET 
      "distanceRatioRate" = ${metricWeightDto.distanceRatioRate ?? metricWeight.distanceRatioRate}, 
      "durationRatioRate" = ${metricWeightDto.durationRatioRate ?? metricWeight.durationRatioRate}, 
      "collectDistanceRate" = ${metricWeightDto.collectDistanceRate ?? metricWeight.collectDistanceRate}, 
      "collectDurationRate" = ${metricWeightDto.collectDurationRate ?? metricWeight.collectDurationRate}, 
      "collectCountRate" = ${metricWeightDto.collectCountRate ?? metricWeight.collectCountRate}, 
      "manualCollectTimeRate" = ${metricWeightDto.manualCollectTimeRate ?? metricWeight.manualCollectTimeRate}, 
      "alpha" = ${metricWeightDto.alpha ?? metricWeight.alpha}, 
      "pValue" = ${metricWeightDto.pValue ?? metricWeight.pValue}, 
      "percentageAE" = ${metricWeightDto.percentageAE ?? metricWeight.percentageAE}, 
      "percentageBD" = ${metricWeightDto.percentageBD ?? metricWeight.percentageBD}, 
      "percentageC" = ${metricWeightDto.percentageC ?? metricWeight.percentageC} 
      WHERE id = ${metricWeight.id}`
    );
  }
}
