import { Inject, Injectable, Logger } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
import { ManualCollectService } from "../datasource-service/manual-collect.service";
import { mean, std } from "mathjs";
import { MetricWeightService } from "../datasource-service/metric-weight.service";
import { calculateEWM, calculateZScores, checkAnomaly, compareWithPValue, generateDateRangesForStatistics, safeMean, safeStd } from "../base-query/base.function";
import { WorkingScheduleService } from "../datasource-service/working-schedule.service";
import { query } from "express";
import * as moment from 'moment';

@Injectable()
export class ZScoreService {
  logger: Logger;
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly manualCollectService: ManualCollectService,
    private readonly metricWeightService: MetricWeightService,
    private readonly workingScheduleService: WorkingScheduleService,
  ) {
    this.logger = new Logger();
    this.logger.log(
      `OpenSearch client initialized with node: ${this.openSearchClient.connectionPool}`,
    );
  }

  async getAllRouteIdAndSegmentId(date: string, schema: string) {
    const result = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      size: 0,
      body: {
        query: { bool: { must: this.buildDateRangeQuery(date, 0) } },
        aggs: {
          unique_vehicle_dispatch: {
            composite: {
              sources: [
                { segment_id: { terms: { field: 'data.segment_id' } } },
                { route_id: { terms: { field: 'data.route_id' } } },
              ],
              size: 10000,
            },
          },
        },
      },
    });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket) => ({
      segment_id: bucket.key.segment_id,
      route_id: bucket.key.route_id,
    }));
  }

  async getAllRouteIdAndSegmentId1(startDate: string, endDate: string, schema: string) {
    const result = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      size: 0,
      body: {
        query: { bool: { must: [
          {
            "range": {
              "date.timestamp": {
                "gte": startDate,
                "lte": endDate,
              }
            }
          }
        ] } },
        aggs: {
          unique_vehicle_dispatch: {
            composite: {
              sources: [
                { segment_id: { terms: { field: 'data.segment_id' } } },
                { route_id: { terms: { field: 'data.route_id' } } },
              ],
              size: 10000,
            },
          },
        },
      },
    });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket) => ({
      segment_id: bucket.key.segment_id,
      route_id: bucket.key.route_id,
    }));
  }

  private buildDateRangeQuery(date: string, numberOfDays: number) {
    // Tạo đối tượng Date từ date và tăng thêm 1 ngày
    let start = new Date();
    if (date) {
      start = new Date(date);
    }
    const end = new Date(start);
    end.setDate(start.getDate() - numberOfDays); // Tăng thêm 1 ngày

    // Định dạng lại ngày theo chuỗi ISO (yyyy-MM-dd) để sử dụng
    const formattedStartDate = start.toISOString().split('T')[0];
    const formattedEndDate = end.toISOString().split('T')[0];

    return {
      range: {
        'data.timestamp': {
          time_zone: '+00:00',
          gte: formattedEndDate,
          lte: formattedStartDate,
        },
      },
    };
  }

  private buildBucketScriptAggregation(
    bucketsPath1: string,
    bucketsPath2: string | null,
    script: string,
    path1: string,
    path2?: string,
  ) {
    return {
      bucket_script: {
        buckets_path: bucketsPath2
          ? { [path1]: bucketsPath1, [path2]: bucketsPath2 }
          : { [path1]: bucketsPath1 },
        script: script,
      },
    };
  }

  private buildAggregations(edge: number) {
    return {
      all_drive_metrics: {
        filters: { filters: { all: { match_all: {} } } },
        aggs: {
          trip_distance_mode_5: this.buildAggregationForDriveMode(5),
          trip_distance_other_modes: this.buildAggregationForDriveModes([
            0, 1, 2, 3, 4, 6, 7, 8,
          ]),
          // Tính tỉ lệ khoảng cách giữa mode 5 và các mode khác collectDistance / OtherDistance * 100
          distance_ratios: this.buildBucketScriptAggregation(
            'trip_distance_mode_5>total_trip_distance',
            'trip_distance_other_modes>total_trip_distance',
            'params.mode5 != null && params.otherModes != null && params.otherModes != 0 ? (params.mode5 / params.otherModes * 100) : null',
            'mode5',
            'otherModes',
          ),
          duration_ratios: this.buildBucketScriptAggregation(
            'trip_distance_mode_5>count_trip_distance',
            'trip_distance_other_modes>count_trip_distance',
            `params.mode5_count != null && params.otherModes_count != null && params.otherModes_count != 0 ? ((params.mode5_count * ${edge}) / (params.otherModes_count * ${edge}) * 100) : null`,
            'mode5_count',
            'otherModes_count',
          ),
          collect_duration: this.buildBucketScriptAggregation(
            'trip_distance_mode_5>count_trip_distance',
            null,
            `params.mode5_count != null ? (params.mode5_count * ${edge}) : null`,
            'mode5_count',
          ),
          other_duration: this.buildBucketScriptAggregation(
            'trip_distance_other_modes>count_trip_distance',
            null,
            `params.otherModes_count != null ? (params.otherModes_count * ${edge}) : null`,
            'otherModes_count',
          ),
        },
      },
    };
  }

  private buildAggregationForDriveMode(mode: number) {
    return {
      filter: { term: { 'data.drive_mode': mode } },
      aggs: {
        total_trip_distance: { sum: { field: 'data.distance' } },
        count_trip_distance: { value_count: { field: 'data.distance' } },
      },
    };
  }

  private buildAggregationForDriveModes(modes: number[]) {
    return {
      filter: { terms: { 'data.drive_mode': modes } },
      aggs: {
        total_trip_distance: { sum: { field: 'data.distance' } },
        count_trip_distance: { value_count: { field: 'data.distance' } },
      },
    };
  }

  private processAggregations(aggregations: any): any {
    const processedAggregations = JSON.parse(JSON.stringify(aggregations)); // Deep clone để tránh thay đổi dữ liệu gốc

    // Kiểm tra và xử lý các bucket
    if (processedAggregations.all_drive_metrics?.buckets?.all) {
      const allBucket = processedAggregations.all_drive_metrics.buckets.all;

      // Xóa các bucket có doc_count = 0
      for (const key in allBucket) {
        if (allBucket[key]?.doc_count === 0) {
          delete allBucket[key];
        }
      }

      // Thêm trip_distance_mode_5 nếu nó không tồn tại
      if (!allBucket.trip_distance_mode_5) {
        allBucket.trip_distance_mode_5 = {
          doc_count: 0,
          count_trip_distance: {
            value: 0,
          },
          total_trip_distance: {
            value: 0,
          },
        };
      }
    }

    return processedAggregations;
  }

  private async fetchAggregations(
    mustQueriesForRange: any[],
    edge: number,
    schema: string,
  ): Promise<any> {
    const body = {
      size: 0,
      query: { bool: { must: mustQueriesForRange } },
      aggs: this.buildAggregations(edge),
    };
    try {
      const result = await this.openSearchClient.search({
        index: `${schema}.drive_metrics`,
        body,
      });

      if (!result.body.aggregations) {
        throw new Error('Aggregations not found in the response');
      }

      // Lọc kết quả và thêm trip_distance_mode_5 nếu thiếu
      const processedAggregations = this.processAggregations(
        result.body.aggregations,
      );
      return processedAggregations;
    } catch (error) {
      console.error('Error fetching aggregations:', error);
      throw error;
    }
  }

  getSafeValue = (value: any) => {
    return value !== undefined && value !== null
      ? parseFloat(value.toFixed(3))
      : null;
  };

  private extractMetricsForStatistics(aggregations: any) {
    const metrics = aggregations.all_drive_metrics.buckets.all;

    return {
      distanceRatios: this.getSafeValue(metrics.distance_ratios?.value),
      collectDistance: this.getSafeValue(
        metrics.trip_distance_mode_5?.total_trip_distance?.value,
      ),
      otherDistance: this.getSafeValue(
        metrics.trip_distance_other_modes?.total_trip_distance?.value,
      ),
      durationRatios: this.getSafeValue(metrics.duration_ratios?.value),
      collectDuration: this.getSafeValue(metrics.collect_duration?.value),
      otherDuration: this.getSafeValue(metrics.other_duration?.value),
    };
  }

  async getCollectMetrics(
    segmentId: number,
    routeId: number,
    startDate: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    mustQueries.push(this.buildDateRangeQuery(startDate, 0));

    const body = {
      size: 0,
      query: {
        bool: {
          must: mustQueries,
        },
      },
      aggs: {
        total_sum: {
          sum: {
            script: {
              source: `
                      long sum = 0;
                      if (doc['data.5L_gen'].length > 1) { sum += doc['data.5L_gen'][0]; }
                      if (doc['data.10L_gen'].length > 1) { sum += doc['data.10L_gen'][0]; }
                      if (doc['data.10L_reu'].length > 1) { sum += doc['data.10L_reu'][0]; }
                      if (doc['data.20L_gen'].length > 1) { sum += doc['data.20L_gen'][0]; }
                      if (doc['data.20L_reu'].length > 1) { sum += doc['data.20L_reu'][0]; }
                      if (doc['data.30L_gen'].length > 1) { sum += doc['data.30L_gen'][0]; }
                      if (doc['data.50L_gen'].length > 1) { sum += doc['data.50L_gen'][0]; }
                      if (doc['data.50L_pub'].length > 1) { sum += doc['data.50L_pub'][0]; }
                      if (doc['data.75L_gen'].length > 1) { sum += doc['data.75L_gen'][0]; }
                      if (doc['data.75L_pub'].length > 1) { sum += doc['data.75L_pub'][0]; }
                      if (doc['data.ext'].length > 1) { sum += doc['data.ext'][0]; }
                      if (doc['data.etc'].length > 1) { sum += doc['data.etc'][0]; }
                      return sum;
                        `,
              lang: 'painless',
            },
          },
        },
      },
    };

    const result = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });

    return result.body.aggregations.total_sum.value || 0;
  }

  calculateEWM(data: number[], alpha: number): number[] {
    const ewmValues: number[] = [];
    let previousEwm: number | null = null;

    for (const value of data) {
      if (previousEwm === null) {
        previousEwm = value;
        ewmValues.push(previousEwm);
      } else {
        const currentEwm = alpha * value + (1 - alpha) * previousEwm;
        ewmValues.push(currentEwm);
        previousEwm = currentEwm;
      }
    }

    // Nếu mảng ewmValues vẫn rỗng, thêm giá trị đầu tiên của data vào
    if (ewmValues.length === 0 && data.length > 0) {
      ewmValues.push(data[0]);
    }

    return ewmValues;
  }

  private calculateEWMetricsForStatistics(metricsArray: any[]) {
    const alpha = 0.1;
    return {
      distanceRatios: this.calculateEWM(
        metricsArray.map((m) => m.distanceRatios),
        alpha,
      ),
      collectDistance: this.calculateEWM(
        metricsArray.map((m) => m.collectDistance),
        alpha,
      ),
      otherDistance: this.calculateEWM(
        metricsArray.map((m) => m.otherDistance),
        alpha,
      ),
      durationRatios: this.calculateEWM(
        metricsArray.map((m) => m.durationRatios),
        alpha,
      ),
      collectDuration: this.calculateEWM(
        metricsArray.map((m) => m.collectDuration),
        alpha,
      ),
      otherDuration: this.calculateEWM(
        metricsArray.map((m) => m.otherDuration),
        alpha,
      ),
      collectCount: this.calculateEWM(
        metricsArray.map((m) => m.collectCount),
        alpha,
      ),
      manualCollectDistance: this.calculateEWM(
        metricsArray.map((m) => m.manualCollectDistance),
        alpha,
      ),
      manualCollectTime: this.calculateEWM(
        metricsArray.map((m) => m.manualCollectTime),
        alpha,
      ),
    };
  }

  private safeMean(array: number[]) {
    // Lọc ra các giá trị undefined hoặc không phải số
    const validNumbers = array.filter(
      (value) => typeof value === 'number' && !isNaN(value),
    );

    // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
    return validNumbers.length === 0 ? null : mean(validNumbers);
  }

  private safeStd(array: number[]) {
    // Lọc ra các giá trị undefined hoặc không phải số
    const validNumbers = array.filter(
      (value) => typeof value === 'number' && !isNaN(value),
    );

    // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
    return validNumbers.length === 0 ? null : std(validNumbers);
  }

  calculateMeanAndStdForStatisticsRealtime(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.manualCollectDistance)),
        ),
        manualCollectTime: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
      standardDeviation: {
        distanceRatios: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.manualCollectDistance)),
        ),
        manualCollectTime: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
    };
  }

  async calculateMetricsForStatisticRealtime(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    let metricArray = [];
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': routeId } },
      this.buildDateRangeQuery(date, 0),
    ];
    const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);

    const result = await this.fetchAggregations(mustQueriesForRange, edge, schema);

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);

    const manualCollectDistance =
    await this.manualCollectService.manualCollectDistanceBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );
    const weight = 2.4;
    const manualCollectTime =
      +manualCollectDistance / (collectDistance / collectDuration / weight);
    const collectCount = await this.getCollectMetrics(segmentId, routeId, date, schema);

    if (
      distanceRatios === 0 &&
      otherDistance === 0 &&
      durationRatios === 0 &&
      collectDistance === 0 &&
      collectDuration === 0 &&
      collectCount === 0 &&
      otherDuration === 0 &&
      manualCollectDistance === 0 &&
      manualCollectTime === 0
    ) {
      return null;
    }

    const data = {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
      collectCount,
      manualCollectDistance,
      manualCollectTime,
    };

    metricArray.push(data);

    const filteredMetricsArray = metricArray.filter(
      (metric) => metric !== null,
    );

    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetricsForStatistics(oneMetric);

    const latest = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      otherDistance: ewmOneMetric.otherDistance.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      otherDuration: ewmOneMetric.otherDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectDistance: ewmOneMetric.manualCollectDistance.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0],
    };

    return latest;
  }

  async calculateZscoreRealtime(date: string, schema: string) {
    // Lấy danh sách các route
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateMetricsForStatisticRealtime(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );
        return { metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map((v) => v.metrics);
    const statistics1 =
      this.calculateMeanAndStdForStatisticsRealtime(allMetricsArray);
    
    return {
      latest: {
        "distanceRatios": null,
        "collectDistance": null,
        "otherDistance": null,
        "durationRatios": null,
        "collectDuration": null,
        "otherDuration": null,
        "collectCount": null,
        "manualCollectDistance": null,
        "manualCollectTime": null
      },
      ...statistics1,
    };
  }

  calculateEWMetrics(metricsArray: any[]) {
    const alpha = 0.1;
    return {
      distanceRatios: this.calculateEWM(
        metricsArray.map((m) => m.distanceRatios),
        alpha,
      ),
      durationRatios: this.calculateEWM(
        metricsArray.map((m) => m.durationRatios),
        alpha,
      ),
      collectDistance: this.calculateEWM(
        metricsArray.map((m) => m.collectDistance),
        alpha,
      ),
      collectDuration: this.calculateEWM(
        metricsArray.map((m) => m.collectDuration),
        alpha,
      ),
      collectCount: this.calculateEWM(
        metricsArray.map((m) => m.collectCount),
        alpha,
      ),
      manualCollectTime: this.calculateEWM(
        metricsArray.map((m) => m.manualCollectTime),
        alpha,
      ),
    };
  }

  async calculateMetricsWithStatsLatest(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    let metricArray = [];
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': segmentId } },

      this.buildDateRangeQuery(date, 0),
    ];

    const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);

    const result = await this.fetchAggregations(mustQueriesForRange, edge, schema);

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);
    const manualCollectDistance =
    await this.manualCollectService.manualCollectDistanceBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );
    const weight = 2.4;
    const manualCollectTime =
      manualCollectDistance / (collectDistance / collectDuration / weight);
    const collectCount = await this.getCollectMetrics(segmentId, routeId, date, schema);

    if (
      distanceRatios === 0 &&
      otherDistance === 0 &&
      durationRatios === 0 &&
      collectDistance === 0 &&
      collectDuration === 0 &&
      collectCount === 0 &&
      otherDuration === 0
    ) {
      return null;
    }

    const data = {
      distanceRatios,
      collectDistance,
      durationRatios,
      collectDuration,
      collectCount,
      manualCollectTime,
    };

    metricArray.push(data);

    const filteredMetricsArray = metricArray.filter(
      (metric) => metric !== null,
    );

    const oneMetric = [...filteredMetricsArray];

    const ewmOneMetric = this.calculateEWMetrics(oneMetric);

    const latest = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0],
    };

    return latest;
  }

  private calculateStatistics(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.safeMean(
          metricsArray.map((m) => m.distanceRatios),
        ),
        durationRatios: this.safeMean(
          metricsArray.map((m) => m.durationRatios),
        ),
        collectDistance: this.safeMean(
          metricsArray.map((m) => m.collectDistance),
        ),
        collectDuration: this.safeMean(
          metricsArray.map((m) => m.collectDuration),
        ),
        collectCount: this.safeMean(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: this.safeMean(
          metricsArray.map((m) => m.manualCollectDistance),
        ),
        manualCollectTime: this.safeMean(
          metricsArray.map((m) => m.manualCollectTime),
        ),
      },
      standardDeviation: {
        distanceRatios: this.safeStd(metricsArray.map((m) => m.distanceRatios)),
        durationRatios: this.safeStd(metricsArray.map((m) => m.durationRatios)),
        collectDistance: this.safeStd(
          metricsArray.map((m) => m.collectDistance),
        ),
        collectDuration: this.safeStd(
          metricsArray.map((m) => m.collectDuration),
        ),
        collectCount: this.safeStd(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: this.safeStd(
          metricsArray.map((m) => m.manualCollectDistance),
        ),
        manualCollectTime: this.safeStd(
          metricsArray.map((m) => m.manualCollectTime),
        ),
      },
    };
  }

  calculateZScores(data: number[], mean: number, stdDev: any): number[] {
    if (stdDev === 0) {
      return data.map(() => 0); // Nếu stdDev = 0, tất cả các zScores đều bằng 0
    }
    return data.map((value) => (value - mean) / stdDev);
  }

  calculateWeightedSum(
    zDistanceRatios: number[],
    zDurationRatios: number[],
    zCollectDistances: number[],
    zCollectDurations: number[],
    zCollectCounts: number[],
    zManualCollectTime: number[],
  ): number[] {
    const zRankScores: number[] = [];

    for (let i = 0; i < zDistanceRatios.length; i++) {
      const weightedSum =
        0.15 * zDistanceRatios[i] +
        0.15 * zDurationRatios[i] +
        0.15 * zCollectDistances[i] +
        0.15 * zCollectDurations[i] +
        0.3 * zCollectCounts[i] +
        0.1 * zManualCollectTime[i];
      zRankScores.push(weightedSum);
    }

    return zRankScores;
  }

  classifyRank(scores: any[]): string[] {
    if (scores.length === 0 || scores.every((score) => isNaN(score))) {
      return []; // Trả về mảng rỗng nếu không có giá trị hoặc tất cả giá trị là NaN
    }
  
    const validScores = scores.filter((score) => !isNaN(score));
    const total = validScores.length;
  
    // Sắp xếp các giá trị theo thứ tự tăng dần và giữ lại chỉ số gốc
    const scoresWithIndex = validScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => a.score - b.score);
  
    if (total <= 5) {
      const rankLetters = ['A', 'B', 'C', 'D', 'E'];
      const ranks = new Array(total);
  
      // Sắp xếp các giá trị theo thứ tự giảm dần và gán xếp hạng
      scoresWithIndex.reverse().forEach((item, idx) => {
        ranks[item.index] = rankLetters[idx];
      });
  
      return ranks;
    }
  
    // Phân chia các giá trị thành các nhóm tỉ lệ
    const aEnd = Math.ceil(0.1 * total);
    const eStart = total - aEnd;
    const bEnd = aEnd + Math.ceil(0.2 * total);
    const dStart = eStart - Math.ceil(0.2 * total);
    const cStart = bEnd;
    const cEnd = dStart;
  
    const ranks = new Array(total);
  
    scoresWithIndex.forEach((item, idx) => {
      if (idx < aEnd) {
        ranks[item.index] = 'A';
      } else if (idx >= eStart) {
        ranks[item.index] = 'E';
      } else if (idx < bEnd) {
        ranks[item.index] = 'B';
      } else if (idx >= dStart) {
        ranks[item.index] = 'D';
      } else {
        ranks[item.index] = 'C';
      }
    });
  
    return ranks;
  }

  async classifyRankForVehicle(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateMetricsWithStatsLatest(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );
        return { segment_id: vehicleData.segment_id, metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map((v) => v.metrics);

    // Tính toán các chỉ số thống kê cho tất cả các xe
    const statistics = this.calculateStatistics(allMetricsArray);
    // Tính toán EWM cho tất cả các x

    // Tính toán zScores cho tất cả các xe
    const zDistanceRatios = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.distanceRatios),
      statistics.mean.distanceRatios,
      statistics.standardDeviation.distanceRatios,
    );
    const zDurationRatios = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.durationRatios),
      statistics.mean.durationRatios,
      statistics.standardDeviation.durationRatios,
    );
    const zCollectDistances = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.collectDistance),
      statistics.mean.collectDistance,
      statistics.standardDeviation.collectDistance,
    );
    const zCollectDurations = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.collectDuration),
      statistics.mean.collectDuration,
      statistics.standardDeviation.collectDuration,
    );
    const zCollectCounts = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.collectCount),
      statistics.mean.collectCount,
      statistics.standardDeviation.collectCount,
    );
    const zManualCollectTime = this.calculateZScores(
      allVehicleMetrics.map((v) => v.metrics.manualCollectTime),
      statistics.mean.manualCollectTime,
      statistics.standardDeviation.manualCollectTime,
    );

    // Tính toán Weighted Sum
    const rankScores = this.calculateWeightedSum(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
    );

    const allRanks = this.classifyRank(rankScores);

    // Phân loại rank cho mỗi xe
    const vehicleIndex = allVehicleMetrics.findIndex(
      (v) => v.segmnent_id === segmentId,
    );
    if (vehicleIndex !== -1) {
      return {
        route_name: segmentId,
        rankScore: allRanks[vehicleIndex],
      };
    } else {
      return {
        route_name: segmentId,
        rankScore: 'C', // Hoặc xử lý khác nếu xe không được tìm thấy
      };
    }
  }

  async calculateMetricsForStatisticRealtimeOne(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    let metricArray = [];
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': routeId } },
      this.buildDateRangeQuery(date, 0),
    ];

    const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);

    const result = await this.fetchAggregations(mustQueriesForRange, edge, schema);

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);

    const manualCollectDistance =
    await this.manualCollectService.manualCollectDistanceBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );
    const weight = 2.4;
    const manualCollectTime =
      +manualCollectDistance / (collectDistance / collectDuration / weight);
    const collectCount = await this.getCollectMetrics(segmentId, routeId, date, schema);

    if (
      distanceRatios === 0 &&
      otherDistance === 0 &&
      durationRatios === 0 &&
      collectDistance === 0 &&
      collectDuration === 0 &&
      collectCount === 0 &&
      otherDuration === 0 &&
      manualCollectTime === 0 &&
      manualCollectDistance === 0
    ) {
      return {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      };
    }

    const data = {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
      collectCount,
      manualCollectDistance,
      manualCollectTime,
    };

    metricArray.push(data);

    const filteredMetricsArray = metricArray.filter(
      (metric) => metric !== null,
    );

    const oneMetric = [...filteredMetricsArray];

    const ewmOneMetric = this.calculateEWMetricsForStatistics(oneMetric);
    const rank = await this.classifyRankForVehicle(segmentId, routeId, date, schema);

    const latest = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      otherDistance: ewmOneMetric.otherDistance.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      otherDuration: ewmOneMetric.otherDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectDistance: ewmOneMetric.manualCollectDistance.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0],
    };

    return {
      latest,
      rankScore: rank.rankScore,
    };
  }

  async calculateRawDataForOneVehicle(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': routeId } },
      this.buildDateRangeQuery(date, 0),
    ];

    const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);

    const result = await this.fetchAggregations(mustQueriesForRange, edge, schema);

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);

    const manualCollectDistance =
    await this.manualCollectService.manualCollectDistanceBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );
    const weight = 2.4;
    const manualCollectTime = +manualCollectDistance / (collectDistance / collectDuration / weight) || 0;
    const collectCount = await this.getCollectMetrics(segmentId, routeId, date, schema);

    if (
      distanceRatios === 0 &&
      otherDistance === 0 &&
      durationRatios === 0 &&
      collectDistance === 0 &&
      collectDuration === 0 &&
      collectCount === 0 &&
      otherDuration === 0 &&
      manualCollectTime === 0 &&
      manualCollectDistance === 0
    ) {
      return {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      };
    }

    const data = {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
      collectCount,
      manualCollectDistance,
      manualCollectTime,
    };


    return data;
  }

  async calculateRawDataForOneVehicleFor100Days(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': routeId } },
      this.buildDateRangeQuery(date, 100),
    ];

    const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);

    const result = await this.fetchAggregations(mustQueriesForRange, edge, schema);

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);

    const manualCollectDistance =
      await this.manualCollectService.manualCollectDistanceBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );
    const weight = 2.4;
    const manualCollectTime = +manualCollectDistance / (collectDistance / collectDuration / weight) || 0;
    const collectCount = await this.getCollectMetrics(segmentId, routeId, date, schema);

    if (
      distanceRatios === 0 &&
      otherDistance === 0 &&
      durationRatios === 0 &&
      collectDistance === 0 &&
      collectDuration === 0 &&
      collectCount === 0 &&
      otherDuration === 0 &&
      manualCollectTime === 0 &&
      manualCollectDistance === 0
    ) {
      return {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      };
    }

    const data = {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
      collectCount,
      manualCollectDistance,
      manualCollectTime,
    };


    return data;
  }

  async calculateZscoreRealtimeOne(segmentId: number, routeId: number, date: string, schema) {
    const oneVehicleData = await this.calculateMetricsForStatisticRealtimeOne(
      segmentId,
      routeId,
      date,
      schema,
    );

    const allVehicleData = await this.calculateZscoreRealtime(date, schema);
    const rank = await this.calculateCoreData(segmentId, routeId, date, schema);
    let result: any = {
      latest: {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      },
      mean: {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      },
      standardDeviation: {
        distanceRatios: null,
        collectDistance: null,
        otherDistance: null,
        durationRatios: null,
        collectDuration: null,
        otherDuration: null,
        collectCount: null,
        manualCollectDistance: null,
        manualCollectTime: null,
      },
      rankScore: 'C',
      segment_id: segmentId,
      timestamp: date,
    };

    result.latest = oneVehicleData.latest;
    result.mean = allVehicleData.mean;
    result.standardDeviation = allVehicleData.standardDeviation;
    result.rankScore = rank.standardScoreRank.rank;
    result.segment_id = segmentId;
    result.timestamp = date;

    return result;
  }

  async getUniqueRouteIdAndSegmentIdWithOnlyDateDate(date: string, schema: string) {
    const index = `${schema}.drive_metrics`;
    const body = {
      query: {
        bool: {
          must: this.buildDateRangeQuery(date, 0),
        },
      },
      aggs: {
        unique_vehicle_segment: {
          composite: {
            sources: [
              { segment_id: { terms: { field: 'data.segment_id' } } },
              { route_id: { terms: { field: 'data.route_id' } } },
              { section_id: { terms: { field: 'data.section_id' } } },
            ],
            size: 10000, // Số lượng kết quả tối đa bạn muốn lấy
          },
        },
      },
    };
    
    const result = await this.openSearchClient.search({ index, size: 0, body });

    const buckets = result.body.aggregations.unique_vehicle_segment.buckets;

    return buckets.map((bucket: any) => ({
      segment_id: bucket.key.segment_id,
      route_id: bucket.key.route_id,
      section_id: bucket.key.section_id,
    }));
  }

  async getUniqueSegmentIdWithStartAndEndDate(
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const index = `${schema}.drive_metrics`;
    const body = {
      query: {
        bool: {
          must: {
            range: {
              'data.timestamp': {
                time_zone: '+00:00',
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      },
      aggs: {
        unique_vehicle_dispatch: {
          composite: {
            sources: [{ segment_id: { terms: { field: 'data.segment_id' } } }],
            size: 10000, // Số lượng kết quả tối đa bạn muốn lấy
          },
        },
      },
    };
    const result = await this.openSearchClient.search({ index, size: 0, body });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket: any) => ({
      segment_id: bucket.key.segment_id,
    }));
  }

  private calculateMeanAndStdForRollup(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: this.getSafeValue(
          this.safeMean(
            metricsArray.map((m) => m.manualCollectDistance),
          ),
        ),
        manualCollectTime: this.getSafeValue(
          this.safeMean(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
      standardDeviation: {
        distanceRatios: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.manualCollectDistance)),
        ),
        manualCollectTime: this.getSafeValue(
          this.safeStd(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
    };
  }

  async calculateMeanAndStandardDeviationAndZScoreForAllVehicle(
    date: string,
    schema: string,
  ) {
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateRawDataForOneVehicle(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );
        return { metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map((v) => v.metrics);
    const statistics1 = this.calculateMeanAndStdForRollup(allMetricsArray);

    return {
      ...statistics1,
    };
  }

  calculateZScoresRawData(data: number, mean: number, stdDev: any): number {
    const result = (data - mean) / stdDev;
    if (stdDev === 0) {
      return 0;
    }
    return result;
  }

  async calculateZScoreForOneVehicle(data, alllData) {
    const zDistanceRatios = this.calculateZScoresRawData(
      data.distanceRatios,
      alllData.mean.distanceRatios,
      alllData.standardDeviation.distanceRatios,
    );
    const zDurationRatios = this.calculateZScoresRawData(
      data.durationRatios,
      alllData.mean.durationRatios,
      alllData.standardDeviation.durationRatios,
    );
    const zCollectDistances = this.calculateZScoresRawData(
      data.collectDistance,
      alllData.mean.collectDistance,
      alllData.standardDeviation.collectDistance,
    );
    const zCollectDurations = this.calculateZScoresRawData(
      data.collectDuration,
      alllData.mean.collectDuration,
      alllData.standardDeviation.collectDuration,
    );
    const zCollectCount = this.calculateZScoresRawData(
      data.collectCount,
      alllData.mean.collectCount,
      alllData.standardDeviation.collectCount,
    );
    const zManualCollectTime = this.calculateZScoresRawData(
      data.manualCollectTime,
      alllData.mean.manualCollectTime,
      alllData.standardDeviation.manualCollectTime,
    );

    return {
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCount,
      zManualCollectTime,
    };
  }

  calculateWeightedSumForOneVehicle(zScores: any, metricWeight: any): number {
    const {
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCount,
      zManualCollectTime,
    } = zScores;

    const {
      distanceRatioRate,
      durationRatioRate,
      collectDistanceRate,
      collectDurationRate,
      collectCountRate,
      manualCollectTimeRate,
    } = metricWeight;

    let zRankScores: number;
    
    zRankScores =
      distanceRatioRate * zDistanceRatios +
      durationRatioRate * zDurationRatios +
      collectDistanceRate * zCollectDistances +
      collectDurationRate * zCollectDurations +
      collectCountRate * zCollectCount +
      manualCollectTimeRate * zManualCollectTime;

    return zRankScores;
  }

  classifyRankFunction(scores: any, segmentId: number, routeId: number) {
    const metricsKeys = [
      "distanceRatios",
      "collectDistance",
      "otherDistance",
      "durationRatios",
      "collectDuration",
      "otherDuration",
      "collectCount",
      "manualCollectDistance",
      "manualCollectTime",
    ];
  
    const ranks = {};
  
    metricsKeys.forEach((key) => {
      // Lấy dữ liệu từ metrics và gán rank
      const values = scores.map((v) => v.metrics[key]);
      const rankValues = this.classifyRank(values);
  
      // Gắn thêm thông tin segment_id và route_id tương ứng
      ranks[key] = scores.map((v, index) => ({
        rank: rankValues[index],
        segment_id: v.segment_id,
        route_id: v.route_id,
      }));
    });
  
    // Tìm kiếm giá trị tương ứng với segmentId và routeId
    const result = {};
    for (const [key, value] of Object.entries(ranks)) {
      const matchedRank = (value as { rank: string, segment_id: number, route_id: number }[]).find(
        (item: any) => item.segment_id === segmentId && item.route_id === routeId
      );
      if (matchedRank) {
        result[key] = matchedRank.rank; // Lưu lại chỉ giá trị rank
      }
    }
  
    return result; // Trả về các rank tương ứng cho segmentId và routeId
  }
  
  async classifyRankForAllVehicle(segmentId: number, routeId: number, date, schema) {
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateRawDataForOneVehicle(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );
        return { metrics, segment_id: vehicleData.segment_id, route_id: vehicleData.route_id };
      }),
    );

    return this.classifyRankFunction(allVehicleMetrics, segmentId, routeId);
  }

  classifyRankStandardScore(scores: any, segmentId: number, routeId: number) {
    // Phân rank cho trường standardScore
    const values = scores.map((v) => v.standardScore);
    const rankValues = this.classifyRank(values);
  
    // Gắn thông tin rank, segment_id và route_id
    const ranks = scores.map((v, index) => ({
      rank: rankValues[index],
      segment_id: v.segment_id,
      route_id: v.route_id,
    }));
  
    // Tìm kiếm giá trị tương ứng với segmentId và routeId
    const matchedRank = ranks.find(
      (item) => item.segment_id === segmentId && item.route_id === routeId
    );
  
    // Trả về kết quả nếu tìm thấy
    if (matchedRank) {
      return { rank: matchedRank.rank };
    }
  
    // Trả về giá trị mặc định nếu không tìm thấy
    return { rank: 'C' };
  }

  async classifyRankForAllVehicleStandardScore(segmentId: number, routeId: number, date, schema) {
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const rawData = await this.calculateRawDataForOneVehicle(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );

        const allVehicleData =
          await this.calculateMeanAndStandardDeviationAndZScoreForAllVehicle(
            date,
            schema,
          );

        const zScores = await this.calculateZScoreForOneVehicle(
          rawData,
          allVehicleData,
        );

        const metricWeight = await this.metricWeightService.getMetricWeight(schema);

        const weightedSum = this.calculateWeightedSumForOneVehicle(zScores, metricWeight);

        let standardScore = weightedSum * 20 + 100;
        if (isNaN(weightedSum) && weightedSum === 0) {
          standardScore = null
        }
        return { standardScore, segment_id: vehicleData.segment_id, route_id: vehicleData.route_id };
      }),
    );

    return this.classifyRankStandardScore(allVehicleMetrics, segmentId, routeId);
  }

  async getExpandedCollectDistanceAndDuration(segmentId: number, routeId: number, sectionId: number, date: string, schema: string) {
    let query = {
      "size": 0,
      "query": { "bool": { 
        "must": [
          { "term": { "data.segment_id": segmentId } },
          { "term": { "data.route_id": routeId } },
          { "term": { "data.section_id": sectionId } },
          {
            "range": {
              "data.timestamp": {
                "time_zone": "+00:00",
                gte: date, lte: date
              }
            }
          }
        ] 
      }
    },
      "aggs": {
        "by_route": {
          "terms": {
            "field": "data.section_name.keyword"
          },
          "aggs": {
            "trips_by_time": {
              "date_histogram": {
                "field": "data.timestamp",
                "interval": "day",
                "format": "yyyy-MM-dd"
              },
              "aggs": {
                "total": {
                  "filter": {
                    "term": { "data.drive_mode": 5 }
                  },
                  "aggs": {
                    "total": { "sum": { "field": "data.distance" } }
                  }
                }
              }
            }
          }
        }
      }
    };
    const response = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body: query,
    });
    return response.body.aggregations.by_route.buckets;
  }

  async getExpandedOtherDistanceAndDuration(segmentId: number, routeId: number, date: string, schema: string) {
    let query = {
      "size": 0,
      "query": {
        "bool": {
          "must": [
            { "term": { "data.segment_id": segmentId } },
            { "term": { "data.route_id": routeId } },
            { "range": { "data.drive_mode": { "gte": 0, "lte": 8 } } },
            {
              "range": {
                "data.timestamp": {
                  "time_zone": "+00:00",
                  gte: date, lte: date
                }
              }
            }
          ], 
          "must_not": [
            {
              "term": {
                "data.drive_mode": 5
              }
            }
          ]
        }
      },
      "aggs": {
        "by_route": {
          "terms": {
            "field": "data.route_id", 
            "size": 100
          },
          "aggs": {
            "total_drive_mode_0": {
              "filter": { "term": { "data.drive_mode": 0 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_1": {
              "filter": { "term": { "data.drive_mode": 1 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_2": {
              "filter": { "term": { "data.drive_mode": 2 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_3": {
              "filter": { "term": { "data.drive_mode": 3 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_4": {
              "filter": { "term": { "data.drive_mode": 4 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_6": {
              "filter": { "term": { "data.drive_mode": 6 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_7": {
              "filter": { "term": { "data.drive_mode": 7 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            },
            "total_drive_mode_8": {
              "filter": { "term": { "data.drive_mode": 8 } },
              "aggs": {
                "total": {
                  "sum": {
                    "field": "data.distance"
                  }
                }
              }
            }
          }
        }
      }
    };
    const response = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body: query,
    });
    return response.body.aggregations.by_route.buckets[0];
  }

  async getExpandedOtherDistanceAndDurationToSave(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string
  ) {
    const collect = await this.getExpandedOtherDistanceAndDuration(segmentId, routeId, date, schema);
    if (collect) {
      const edge = await this.workingScheduleService.getOperationMetrics(routeId, schema);
      return {
        segment_id: segmentId,
        route_id: routeId,
        other_distance: {
          total_drive_mode_0: collect.total_drive_mode_0.total.value || null,
          total_drive_mode_1: collect.total_drive_mode_1.total.value || null,
          total_drive_mode_2: collect.total_drive_mode_2.total.value || null,
          total_drive_mode_3: collect.total_drive_mode_3.total.value || null,
          total_drive_mode_4: collect.total_drive_mode_4.total.value || null,
          total_drive_mode_6: collect.total_drive_mode_6.total.value || null,
          total_drive_mode_7: collect.total_drive_mode_7.total.value || null,
          total_drive_mode_8: collect.total_drive_mode_8.total.value || null,
        },
        other_duration: {
          total_drive_mode_0: collect.total_drive_mode_0.doc_count * edge || null,
          total_drive_mode_1: collect.total_drive_mode_1.doc_count * edge || null,
          total_drive_mode_2: collect.total_drive_mode_2.doc_count * edge || null,
          total_drive_mode_3: collect.total_drive_mode_3.doc_count * edge || null,
          total_drive_mode_4: collect.total_drive_mode_4.doc_count * edge || null,
          total_drive_mode_6: collect.total_drive_mode_6.doc_count * edge || null,
          total_drive_mode_7: collect.total_drive_mode_7.doc_count * edge || null,
          total_drive_mode_8: collect.total_drive_mode_8.doc_count * edge || null,
        },
        date,
      };
    }
  }

  async classifyRankForDriveMode(segmentId: number, routeId: number,date: string, schema: string) {
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      date,
      schema,
    );
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.getExpandedOtherDistanceAndDurationToSave(
          vehicleData.segment_id,
          vehicleData.route_id,
          date,
          schema,
        );
        return { ...metrics };
      }),
    );

    return this.getRankBySegmentAndRoute(allVehicleMetrics, segmentId, routeId);
  }

  async getRankBySegmentAndRoute(
    allVehicleMetrics: any[],
    segment_id: number,
    route_id: number
  ): Promise<any | null> {
    // Tìm đối tượng tương ứng với segment_id và route_id
    const targetVehicle = allVehicleMetrics.find(
      (vehicle) => vehicle.segment_id === segment_id && vehicle.route_id === route_id
    );
  
    if (!targetVehicle) {
      return null; // Nếu không tìm thấy, trả về null
    }
  
    const { other_distance, other_duration } = targetVehicle;
  
    // Phân loại rank cho từng drive_mode cụ thể trong `allVehicleMetrics`
    const allDistanceScores = allVehicleMetrics.flatMap((vehicle) =>
      Object.entries(vehicle.other_distance)
        .filter(([_, score]) => score !== null)
        .map(([driveMode, score]) => ({ driveMode, score }))
    );
  
    const allDurationScores = allVehicleMetrics.flatMap((vehicle) =>
      Object.entries(vehicle.other_duration)
        .filter(([_, score]) => score !== null)
        .map(([driveMode, score]) => ({ driveMode, score }))
    );
  
    const uniqueDriveModes = [
      "total_drive_mode_0",
      "total_drive_mode_1",
      "total_drive_mode_2",
      "total_drive_mode_3",
      "total_drive_mode_4",
      "total_drive_mode_6",
      "total_drive_mode_7",
      "total_drive_mode_8",
    ];
  
    const driveModeDistanceRanks: Record<string, string[]> = {};
    const driveModeDurationRanks: Record<string, string[]> = {};
  
    // Phân loại rank cho từng drive_mode cho cả distance và duration
    for (const driveMode of uniqueDriveModes) {
      const distanceScores = allDistanceScores
        .filter((item) => item.driveMode === driveMode)
        .map((item) => item.score);
  
      const durationScores = allDurationScores
        .filter((item) => item.driveMode === driveMode)
        .map((item) => item.score);
  
      driveModeDistanceRanks[driveMode] = this.classifyRank(distanceScores);
      driveModeDurationRanks[driveMode] = this.classifyRank(durationScores);
    }
  
    // Gắn rank với từng drive_mode
    const rankedDriveModes = uniqueDriveModes.map((driveMode) => {
      const distanceScores = allDistanceScores.filter((item) => item.driveMode === driveMode);
      const durationScores = allDurationScores.filter((item) => item.driveMode === driveMode);
  
      const distanceRankIndex = distanceScores.findIndex((item) => item.score === targetVehicle.other_distance[driveMode]);
      const durationRankIndex = durationScores.findIndex((item) => item.score === targetVehicle.other_duration[driveMode]);
  
      const distanceRank =
        distanceRankIndex !== -1
          ? driveModeDistanceRanks[driveMode][distanceRankIndex]
          : null;
  
      const durationRank =
        durationRankIndex !== -1
          ? driveModeDurationRanks[driveMode][durationRankIndex]
          : null;
  
      return {
        drive_mode: driveMode,
        distance_rank: distanceRank,
        duration_rank: durationRank,
      };
    });
  
    // Trả về dữ liệu của segment và route được yêu cầu
    return {
      ranked_drive_modes: rankedDriveModes,
    };
  }

  async getAllDataExpand(segmentId: number, routeId: number, date: string, schema: string) {
    const rank = await this.classifyRankForDriveMode(segmentId, routeId, date, schema);
    const collectData = await this.getExpandedOtherDistanceAndDurationToSave(segmentId, routeId, date, schema);

    return {
      ...collectData,
      ...rank,
    }
  }

  async getExpandedCollectDistanceAndDurationToSave(segmentId: number, routeId: number, sectionId: number, date: string, schema: string) {
    const collectDistanceArray = await this.getExpandedCollectDistanceAndDuration(segmentId, routeId, sectionId, date, schema);
    let edge  = await this.workingScheduleService.getOperationMetrics(routeId, schema);
    if (collectDistanceArray.length > 0) {
      const collectDistance = collectDistanceArray.flatMap((item: any) => {
        return item.trips_by_time.buckets.map((bucket: any) => {
          return {
            section_name: item.key,
            segment_id: segmentId,
            route_id: routeId,
            section_id: sectionId,
            collect_distance: bucket.total.total.value,
            collect_duration: bucket.total.doc_count * edge,
            date
          };
        });
      });
  
      return collectDistance;
    }

    return [
      {
        section_name: 'e001',
        segment_id: segmentId,
        route_id: routeId,
        section_id: sectionId,
        collect_distance: 0,
        collect_duration: 0,
        date
      }
    ]
  }

  generateDateRangeFromPastDays(days: number, date: string): string[] {
    const dateRange: string[] = [];
    const startDate = moment(date);
  
    for (let i = days; i >= 0; i--) {
      const currentDate = startDate.clone().subtract(i, 'days').format('YYYY-MM-DD');
      dateRange.push(currentDate);
    }
  
    return dateRange;
  }

  async getCoreDataRollup(routeId: number, date: string, schema: string) {
    const query = {
      index: `${schema}.zscore_coredata_rollup`,
      body: {
        "sort": [
          {
            "date": {
              "order": "desc",
              "unmapped_type": "boolean"
            }
          }
        ],
        "size": 500,
        "version": true,
        "aggs": {
          "2": {
            "date_histogram": {
              "field": "date",
              "calendar_interval": "1h",
              "time_zone": "Asia/Saigon",
              "min_doc_count": 1
            }
          }
        },
        "stored_fields": [
          "*"
        ],
        "script_fields": {},
        "docvalue_fields": [
          {
            "field": "date",
            "format": "date_time"
          }
        ],
        "_source": {
          "excludes": []
        },
        "query": {
          "bool": {
            "must": [],
            "filter": [
              {
                "match_all": {}
              },
              {
                "match_phrase": {
                  "route_id": routeId
                }
              },
              {
                "range": {
                  "date": {
                    "gte": date,
                    "lte": date,
                    "format": "strict_date_optional_time"
                  }
                }
              }
            ],
            "should": [],
            "must_not": []
          }
        },
        "highlight": {
          "pre_tags": [
            "@opensearch-dashboards-highlighted-field@"
          ],
          "post_tags": [
            "@/opensearch-dashboards-highlighted-field@"
          ],
          "fields": {
            "*": {}
          },
          "fragment_size": 2147483647
        }
      }
    }

    const result = await this.openSearchClient.search(query);
    return result.body.hits.hits;
  }

  async calculateEWMForDrivingRoute(segmentId: number, routeId: number, date: string, schema: string) {
    const dataRange = this.generateDateRangeFromPastDays(8, date);
    const standardScores = [];
  
    for (const date of dataRange) {
      const result = await this.calculateCoreData(segmentId, routeId, date, schema);
      const pastResult = await this.getCoreDataRollup(routeId, date, schema);
      if (result && result.standardScore !== undefined) {
        // Thay thế giá trị 100 bằng null
        let score = result.standardScore === 100 ? null : result.standardScore;
        if (pastResult.length > 0) {
          score = pastResult[0]._source.standardScoreEWM;
        }
        standardScores.push(score);
      } else {
        // Nếu không có dữ liệu, push null
        standardScores.push(null);
      }
    }
    
  const EWM = calculateEWM(standardScores.filter((metric) => metric !== null), 0.1).slice(-1)[0];
  return EWM;
  }

  async calculateEWM7DaysForCoreData (
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const dataRange = this.generateDateRangeFromPastDays(8, date);
    const collectDistanceArray = []
    const otherDistanceArray = []
    const collectDurationArray = []
    const otherDurationArray = []
    
    for (const date of dataRange) {
      const rawData = await this.calculateRawDataForOneVehicle(
        segmentId,
        routeId,
        date,
        schema,
      );

      const pastResult = await this.getCoreDataRollup(routeId, date, schema);

      if (rawData) {
        // Thay thế giá trị 100 bằng null
        let collectDistanceScore = rawData.collectDistance;
        let otherDistanceScore = rawData.otherDistance;
        let collectDurationScore = rawData.collectDuration;
        let otherDurationScore = rawData.otherDuration;

        if (pastResult.length > 0) {
          collectDistanceScore = pastResult[0]._source.EWMRawData.collectDistance;
          otherDistanceScore = pastResult[0]._source.EWMRawData.otherDistance;
          collectDurationScore = pastResult[0]._source.EWMRawData.collectDuration;
          otherDurationScore = pastResult[0]._source.EWMRawData.otherDuration;
          collectDistanceArray.push(collectDistanceScore)
          otherDistanceArray.push(otherDistanceScore)
          collectDurationArray.push(collectDurationScore)
          otherDurationArray.push(otherDurationScore)
        }
      } else {
        // Nếu không có dữ liệu, push null
        collectDistanceArray.push(null)
        otherDistanceArray.push(null)
        collectDurationArray.push(null)
        otherDurationArray.push(null)
      }
    }
    
    const ewmCollectDistance = calculateEWM(collectDistanceArray.filter((metric) => metric !== null), 0.1).slice(-1)[0];
    const ewmOtherDistance = calculateEWM(otherDistanceArray.filter((metric) => metric !== null), 0.1).slice(-1)[0];
    const ewmCollectDuration = calculateEWM(collectDurationArray.filter((metric) => metric !== null), 0.1).slice(-1)[0];
    const ewmOtherDuration = calculateEWM(otherDurationArray.filter((metric) => metric !== null), 0.1).slice(-1)[0];
    
    return {
      collectDistance: ewmCollectDistance,
      otherDistance: ewmOtherDistance,
      collectDuration: ewmCollectDuration,
      otherDuration: ewmOtherDuration,
    };
  }
  
  async calculateCoreData(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    
    const rawData = await this.calculateRawDataForOneVehicle(
      segmentId,
      routeId,
      date,
      schema,
    );

    const rank = await this.classifyRankForAllVehicle(segmentId, routeId, date, schema);

    const allVehicleData =
    await this.calculateMeanAndStandardDeviationAndZScoreForAllVehicle(
      date,
      schema,
    );

    const zScores = await this.calculateZScoreForOneVehicle(
      rawData,
      allVehicleData,
    );

    const metricWeight = await this.metricWeightService.getMetricWeight(schema);

    const weightedSum = this.calculateWeightedSumForOneVehicle(zScores, metricWeight);
    let standardScore = weightedSum * 20 + 100;

    if (isNaN(weightedSum) || weightedSum === 0) {
      standardScore = null
    }

    const standardScoreRank = await this.classifyRankForAllVehicleStandardScore(segmentId, routeId, date, schema);

    const standardScoreDiagnosis = compareWithPValue(standardScore, allVehicleData.mean, allVehicleData.standardDeviation, metricWeight.pValue)
    
    const result = {
      rawData,
      rating: rank, // Logic tính rating
      standardScore,
      standardScoreRank,
      standardScoreDiagnosis,
      segment_id: segmentId,
      route_id: routeId,
      date
    }

    return result
  }

  async calculateCoreDataToSave(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ){
    const rawData = await this.calculateCoreData(segmentId, routeId, date, schema)
    const standardScoreEWM = await this.calculateEWMForDrivingRoute(segmentId, routeId, date, schema);
    const EWMRawData = await this.calculateEWM7DaysForCoreData(segmentId, routeId, date, schema);

    return {
      ...rawData,
      EWMRawData,
      standardScoreEWM
    }
  }

  async getTotalSectionTrashBagType(segmentId: number, routeId: number, date: string, schema: string) {
    const query = {
      index: `${schema}.collect_metrics`,
      body: {
        "size": 0,
        query: {
          "bool": {
            "must": [
              { "term": { "data.segment_id": segmentId } },
              { "term": { "data.route_id": routeId } },
              {
                "range": {
                  "data.timestamp": {
                    "time_zone": "+00:00",
                    gte: date, lte: date
                  }
                }
              }
            ]
          }
        },
        "aggs": {
          "sections": {
            "terms": {
              "field": "data.section_id",
              "size": 100
            },
            "aggs": {
              "bag_types": {
                "scripted_metric": {
                  "init_script": "state.bag_totals = new HashMap();",
                  "map_script": `
                    for (entry in params._source.data.entrySet()) {
                      def key = entry.getKey();
                      // Kiểm tra nếu key là các loại túi rác hợp lệ
                      if (key.contains("L_") || key == "ext" || key == "etc") {
                        if (!state.bag_totals.containsKey(key)) {
                          state.bag_totals.put(key, [0.0, 0.0, 0.0]); // [quantity, volume, weight]
                        }
                        def values = entry.getValue();
                        state.bag_totals[key][0] += values[0]; // Số lượng
                        state.bag_totals[key][1] += values[1]; // Volume (liters)
                        state.bag_totals[key][2] += values[2]; // Weight (kg)
                      }
                    }
                  `,
                  "combine_script": "return state.bag_totals;",
                  "reduce_script": `
                    Map combined = new HashMap();
                    for (state in states) {
                      for (entry in state.entrySet()) {
                        def key = entry.getKey();
                        def value = entry.getValue();
                        if (!combined.containsKey(key)) {
                          combined.put(key, [0.0, 0.0, 0.0]); // [quantity, volume, weight]
                        }
                        combined[key][0] += value[0]; // Số lượng
                        combined[key][1] += value[1]; // Volume (liters)
                        combined[key][2] += value[2]; // Weight (kg)
                      }
                    }
                    return combined;
                  `
                }
              }
            }
          }
        }
      }
    }

    const response = await this.openSearchClient.search(query);
    return response.body.aggregations.sections.buckets;
  }

  async getTotalSection(segmentId: number, routeId: number, date: string, schema: string) {
    const query = {
      index: `${schema}.collect_metrics`,
      body: {
        "size": 0,
        query: {
          "bool": {
            "must": [
              { "term": { "data.segment_id": segmentId } },
              { "term": { "data.route_id": routeId } },
              {
                "range": {
                  "data.timestamp": {
                    "time_zone": "+00:00",
                    gte: date, lte: date
                  }
                }
              }
            ]
          }
        },
        "aggs": {
          "sections": {
            "terms": {
              "field": "data.section_id",
              "size": 100
            },
            "aggs": {
              "total_summary": {
                "scripted_metric": {
                  "init_script": "state.totals = [0.0, 0.0, 0.0];",
                  "map_script": `
                    for (entry in params._source.data.entrySet()) {
                      def key = entry.getKey();
                      if (key.contains("L_") || key == "ext" || key == "etc") {
                        def values = entry.getValue();
                        state.totals[0] += values[0]; // Số lượng
                        state.totals[1] += values[1]; // Volume (liters)
                        state.totals[2] += values[2]; // Weight (kg)
                      }
                    }
                  `,
                  "combine_script": "return state.totals;",
                  "reduce_script": `
                    def final_totals = [0.0, 0.0, 0.0]; // [quantity, volume, weight]
                    for (state in states) {
                      final_totals[0] += state[0]; // Tổng số lượng
                      final_totals[1] += state[1]; // Tổng volume
                      final_totals[2] += state[2]; // Tổng weight
                    }
                    return final_totals;
                  `
                }
              }
            }
          }
        }
      }
    }

    const response = await this.openSearchClient.search(query);
    return response.body.aggregations.sections.buckets;
  }

  async calculateEWM7DaysForCollectAmount(segmentId: number, routeId: number, date: string, schema: string) {
    const dataRange = this.generateDateRangeFromPastDays(8, date);
    const countCollectAmount = [];
    const volumeCollectAmount = [];
    const weightCollectAmount = [];
    let result;
    
    for (const date of dataRange) {
      const collectDistanceArray = await this.getTotalSection(segmentId, routeId, date, schema);
      for (const item of collectDistanceArray) {
        countCollectAmount.push(item.total_summary.value[0]);
        volumeCollectAmount.push(item.total_summary.value[1]);
        weightCollectAmount.push(item.total_summary.value[2]);
        
        const ewmCountCollectAmount = calculateEWM(countCollectAmount, 0.1).slice(-1)[0];
        const ewmVolumeCollectAmount = calculateEWM(volumeCollectAmount, 0.1).slice(-1)[0];
        const ewmWeightCollectAmount = calculateEWM(weightCollectAmount, 0.1).slice(-1)[0];

        result = {
          segment_id: segmentId,
          route_id: routeId,
          section_id: item.key,
          collect_amount: item.total_summary.value ? item.total_summary.value : [0, 0, 0],
          date,
          countCollectAmount: ewmCountCollectAmount,
          volumeCollectAmount: ewmVolumeCollectAmount,
          weightCollectAmount: ewmWeightCollectAmount
        }
      }
    }

    
    return result;
  }

  async formatCollectAmount(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string
  ): Promise<any[]> {
    const collectDistanceArray = await this.getTotalSectionTrashBagType(segmentId, routeId, date, schema);
    const result = [];
  
    for (const item of collectDistanceArray) {
      result.push({
        segment_id: segmentId,
        route_id: routeId,
        section_id: item.key,
        "5L_gen": item.bag_types.value["5L_gen"] ? item.bag_types.value["5L_gen"] : [0, 0, 0],
        "10L_gen": item.bag_types.value["10L_gen"] ? item.bag_types.value["10L_gen"] : [0, 0, 0],
        "10L_reu": item.bag_types.value["10L_reu"] ? item.bag_types.value["10L_reu"] : [0, 0, 0],
        "20L_gen": item.bag_types.value["20L_gen"] ? item.bag_types.value["20L_gen"] : [0, 0, 0],
        "20L_reu": item.bag_types.value["20L_reu"] ? item.bag_types.value["20L_reu"] : [0, 0, 0],
        "30L_gen": item.bag_types.value["30L_gen"] ? item.bag_types.value["30L_gen"] : [0, 0, 0],
        "50L_gen": item.bag_types.value["50L_gen"] ? item.bag_types.value["50L_gen"] : [0, 0, 0],
        "50L_pub": item.bag_types.value["50L_pub"] ? item.bag_types.value["50L_pub"] : [0, 0, 0],
        "75L_gen": item.bag_types.value["75L_gen"] ? item.bag_types.value["75L_gen"] : [0, 0, 0],
        "75L_pub": item.bag_types.value["75L_pub"] ? item.bag_types.value["75L_pub"] : [0, 0, 0],
        "ext": item.bag_types.value["ext"] ? item.bag_types.value["ext"] : [0, 0, 0],
        "etc": item.bag_types.value["etc"] ? item.bag_types.value["etc"] : [0, 0, 0],
        date,
      });
    }
  
    return result;
  }

  async formatTotalCollectAmount(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string
  ): Promise<any[]> {
    const collectDistanceArray = await this.getTotalSection(segmentId, routeId, date, schema);
    const result = [];
  
    for (const item of collectDistanceArray) {
      result.push({
        segment_id: segmentId,
        route_id: routeId,
        section_id: item.key,
        collect_amount: item.total_summary.value ? item.total_summary.value : [0, 0, 0],
        date,
      });
    }
  
    return result;
  }

  async getTotalCollectAndOtherDistanceAndDuration(date: string, schema: string) {
    const body = {
        "size": 0,
        "query": {
          "range": {
            "data.timestamp": {
              "gte": `${date}T00:00:00`,
              "lte": `${date}T23:59:59`,
              "format": "strict_date_optional_time"
            }
          }
        },
        "aggs": {
          "collect": {
            "filter": {
              "term": {
                "data.drive_mode": 5
              }
            },
            "aggs": {
              "collect_distance": {
                "sum": {
                  "field": "data.distance"
                }
              },
              "collect_time": {
                "sum": {
                  "script": {
                    "source": "10 * doc['data.drive_mode'].size()",
                    "lang": "painless"
                  }
                }
              }
            }
          },
          "other": {
            "filter": {
              "bool": {
                "must": [
                  {
                    "range": {
                      "data.drive_mode": {
                        "gte": 0,
                        "lte": 8
                      }
                    }
                  }
                ],
                "must_not": [
                  {
                    "term": {
                      "data.drive_mode": 5
                    }
                  }
                ]
              }
            },
            "aggs": {
              "other_distance": {
                "sum": {
                  "field": "data.distance"
                }
              },
              "other_time": {
                "sum": {
                  "script": {
                    "source": "10 * doc['data.drive_mode'].size()",
                    "lang": "painless"
                  }
                }
              }
            }
          }
        }
    }

    const result = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body,
    });
    const other = result.body.aggregations.other;
    const collect = result.body.aggregations.collect;
    return {
      collectDistance: collect.collect_distance.value,
      otherDistance: other.other_distance.value,
      collectDuration: collect.collect_time.value,
      otherDuration: other.other_time.value,
    };
  }

  async calculateEWMTotalDrivingRoute(date: string, schema: string) {
    const dataRange = this.generateDateRangeFromPastDays(8, date);
    const collectDistanceArray = [];
    const otherDistanceArray = [];
    const collectDurationArray = [];
    const otherDurationArray = [];

  
    for (const date of dataRange) {
      const result = await this.getTotalCollectAndOtherDistanceAndDuration(date, schema);
      const collectDistance = result.collectDistance;
      collectDistanceArray.push(collectDistance);
      const otherDistance = result.otherDistance;
      otherDistanceArray.push(otherDistance);
      const collectDuration = result.collectDuration;
      collectDurationArray.push(collectDuration);
      const otherDuration = result.otherDuration;
      otherDurationArray.push(otherDuration);
    }
    const ewmCollectDistance = calculateEWM(collectDistanceArray, 0.1).slice(-1)[0];
    const ewmOtherDistance = calculateEWM(otherDistanceArray, 0.1).slice(-1)[0];
    const ewmCollectDuration = calculateEWM(collectDurationArray, 0.1).slice(-1)[0];
    const ewmOtherDuration = calculateEWM(otherDurationArray, 0.1).slice(-1)[0];
    return {
      collectDistance: ewmCollectDistance,
      otherDistance: ewmOtherDistance,
      collectDuration: ewmCollectDuration,
      otherDuration: ewmOtherDuration,
    };
  }
}