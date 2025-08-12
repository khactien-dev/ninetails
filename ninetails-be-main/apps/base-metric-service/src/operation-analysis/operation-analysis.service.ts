import { Inject, Injectable } from '@nestjs/common';
import { ZScoreService } from '../z-score/z-score.service';
import { OperationAnalysisDto } from './operation-analysis.dto';
import {
  buildAggregations,
  buildDateRangeQuery,
  buildMustQueriesDispatchNo,
  buildMustQueriesSegmentId,
  calculateEWM,
  calculateWeightedSum,
  calculateZScores,
  createRangeQueryDataSet,
  formatValue,
  getAverage,
  getMinAndMax,
  getSafeValue,
  handleError,
  processAggregations,
  safeMean,
  safeStd,
} from '../base-query/base.function';
import { Client } from '@opensearch-project/opensearch';
import { ManualCollectService } from '../datasource-service/manual-collect.service';
import { WorkingScheduleService } from '../datasource-service/working-schedule.service';
import { RouteInfoService } from '../datasource-service/route-info.service';
import { convertToArray } from 'libs/utils/helper.util';

@Injectable()
export class OperationAnalysisService {
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly zScoreService: ZScoreService,
    private readonly manualCollectService: ManualCollectService,
    private readonly workingScheduleService: WorkingScheduleService,
    private readonly routeInfoService: RouteInfoService,
  ) {}

  async fetchAggregations(
    mustQueriesForRange: any[],
    schema: string,
    edge: number,
  ): Promise<any> {
    const body = {
      size: 0,
      query: { bool: { must: mustQueriesForRange } },
      aggs: buildAggregations(edge),
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
      const processedAggregations = processAggregations(
        result.body.aggregations,
      );
      return processedAggregations;
    } catch (error) {
      console.error('Error fetching aggregations:', error);
      throw error;
    }
  }

  private extractMetricsForStatistics(aggregations: any) {
    const metrics = aggregations.all_drive_metrics.buckets.all;

    return {
      distanceRatios: getSafeValue(metrics.distance_ratios?.value),
      collectDistance: getSafeValue(
        metrics.trip_distance_mode_5?.total_trip_distance?.value,
      ),
      otherDistance: getSafeValue(
        metrics.trip_distance_other_modes?.total_trip_distance?.value,
      ),
      durationRatios: getSafeValue(metrics.duration_ratios?.value),
      collectDuration: getSafeValue(metrics.collect_duration?.value),
      otherDuration: getSafeValue(metrics.other_duration?.value),
    };
  }

  async getCollectMetricsSegmentIdByStartAndEndDate(
    segmentId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    mustQueries.push(buildDateRangeQuery(startDate, endDate));

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

    return result.body.aggregations.total_sum.value || null;
  }

  private buildDateRangeQuery(date: string) {
    // Tạo đối tượng Date từ startDate và tăng thêm 1 ngày
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(start.getDate() - 1); // Tăng thêm 1 ngày

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

  async getCollectMetricsSegmentId(
    segmentId: number,
    date: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    mustQueries.push(this.buildDateRangeQuery(date));

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

    return result.body.aggregations.total_sum.value || null;
  }

  calculateEWMetricsForStatistics(metricsArray: any[]) {
    const alpha = 0.1;
    return {
      distanceRatios: calculateEWM(
        metricsArray.map((m) => m.distanceRatios),
        alpha,
      ),
      collectDistance: calculateEWM(
        metricsArray.map((m) => m.collectDistance),
        alpha,
      ),
      otherDistance: calculateEWM(
        metricsArray.map((m) => m.otherDistance),
        alpha,
      ),
      durationRatios: calculateEWM(
        metricsArray.map((m) => m.durationRatios),
        alpha,
      ),
      collectDuration: calculateEWM(
        metricsArray.map((m) => m.collectDuration),
        alpha,
      ),
      otherDuration: calculateEWM(
        metricsArray.map((m) => m.otherDuration),
        alpha,
      ),
      collectCount: calculateEWM(
        metricsArray.map((m) => m.collectCount),
        alpha,
      ),
      manualCollectDistance: calculateEWM(
        metricsArray.map((m) => m.manualCollectDistance),
        alpha,
      ),
      manualCollectTime: calculateEWM(
        metricsArray.map((m) => m.manualCollectTime),
        alpha,
      ),
    };
  }

  private calculateForStatistics(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: getSafeValue(
          safeMean(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: getSafeValue(
          safeMean(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: getSafeValue(
          safeMean(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: getSafeValue(
          safeMean(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: getSafeValue(
          safeMean(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: getSafeValue(
          safeMean(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: getSafeValue(
          safeMean(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: getSafeValue(
          safeMean(metricsArray.map((m) => m.manualCollectDistance)),
        ),
        manualCollectTime: getSafeValue(
          safeMean(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
      standardDeviation: {
        distanceRatios: getSafeValue(
          safeStd(metricsArray.map((m) => m.distanceRatios)),
        ),
        collectDistance: getSafeValue(
          safeStd(metricsArray.map((m) => m.collectDistance)),
        ),
        otherDistance: getSafeValue(
          safeStd(metricsArray.map((m) => m.otherDistance)),
        ),
        durationRatios: getSafeValue(
          safeStd(metricsArray.map((m) => m.durationRatios)),
        ),
        collectDuration: getSafeValue(
          safeStd(metricsArray.map((m) => m.collectDuration)),
        ),
        otherDuration: getSafeValue(
          safeStd(metricsArray.map((m) => m.otherDuration)),
        ),
        collectCount: getSafeValue(
          safeStd(metricsArray.map((m) => m.collectCount)),
        ),
        manualCollectDistance: getSafeValue(
          safeStd(metricsArray.map((m) => m.manualCollectDistance)),
        ),
        manualCollectTime: getSafeValue(
          safeStd(metricsArray.map((m) => m.manualCollectTime)),
        ),
      },
    };
  }

  calculateStatistics(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: safeMean(metricsArray.map((m) => m.distanceRatios)),
        durationRatios: safeMean(metricsArray.map((m) => m.durationRatios)),
        collectDistance: safeMean(metricsArray.map((m) => m.collectDistance)),
        collectDuration: safeMean(metricsArray.map((m) => m.collectDuration)),
        collectCount: safeMean(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: safeMean(
          metricsArray.map((m) => m.manualCollectDistance),
        ),
        manualCollectTime: safeMean(
          metricsArray.map((m) => m.manualCollectTime),
        ),
      },
      standardDeviation: {
        distanceRatios: safeStd(metricsArray.map((m) => m.distanceRatios)),
        durationRatios: safeStd(metricsArray.map((m) => m.durationRatios)),
        collectDistance: safeStd(metricsArray.map((m) => m.collectDistance)),
        collectDuration: safeStd(metricsArray.map((m) => m.collectDuration)),
        collectCount: safeStd(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: safeStd(
          metricsArray.map((m) => m.manualCollectDistance),
        ),
        manualCollectTime: safeStd(
          metricsArray.map((m) => m.manualCollectTime),
        ),
      },
    };
  }

  async getOperatingRoutes2(
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    let query = {
      index: `${schema}.drive_metrics`,
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  'data.timestamp': {
                    time_zone: '+00:00',
                    gte: startDate || 'now/d',
                    lte: endDate || 'now',
                  },
                },
              },
            ],
          },
        },
        aggs: {
          unique_routes: {
            terms: {
              field: 'data.route_id',
              size: 10000,
            },
          },
        },
      },
    };
    if (startDate === endDate) {
      query = {
        index: `${schema}.drive_metrics`,
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                {
                  range: {
                    'data.timestamp': {
                      time_zone: '+00:00',
                      gte: startDate,
                      lte: endDate,
                    },
                  },
                },
              ],
            },
          },
          aggs: {
            unique_routes: {
              terms: {
                field: 'data.route_id',
                size: 10000,
              },
            },
          },
        },
      };
    }

    return await this.openSearchClient.search(query);
  }

  async getOperatingRoutes(startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.drive_metrics`,
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  'data.timestamp': {
                    time_zone: '+00:00',
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          unique_route: { cardinality: { field: 'data.route_id' } },
        },
      },
    };
    return await this.openSearchClient.search(query);
  }

  async getDriveMetricsBySegmentId(
    segmentId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const query = {
      index: `${schema}.drive_metrics`,
      body: {
        size: 1,
        query: {
          bool: {
            must: [
              { term: { 'data.segment_id': segmentId } },
              {
                range: {
                  'data.timestamp': {
                    time_zone: '+00:00',
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            ],
          },
        },
      },
    };
    const result = await this.openSearchClient.search(query);
    if (result.body.hits.hits.length > 0) {
      return result.body.hits.hits[0]._source.data;
    } else {
      return;
    }
  }

  async getCollectMetrics(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    mustQueries.push(buildDateRangeQuery(startDate, endDate));

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

  async calculateZScoreForOperationAnalysis(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    let metricArray = [];
    const mustQueriesForRange = [
      { term: { 'data.segment_id': segmentId } },
      { term: { 'data.route_id': routeId } },
      buildDateRangeQuery(startDate, endDate),
    ];
    const edge = await this.workingScheduleService.getOperationMetrics(
      routeId,
      schema,
    );

    const result = await this.fetchAggregations(
      mustQueriesForRange,
      schema,
      edge,
    );

    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
    } = this.extractMetricsForStatistics(result);

    const manualCollectDistance =
      await this.manualCollectService.manualCollectDistanceBySegmentIdRouteId(
        segmentId,
        routeId,
        schema,
      );
    const weight = 2.4;
    const manualCollectTime =
      +manualCollectDistance / (collectDistance / collectDuration / weight);
    const collectCount = await this.getCollectMetrics(
      segmentId,
      routeId,
      startDate,
      endDate,
      schema,
    );

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

  async getAllRouteIdAndSegmentId(
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const result = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      size: 0,
      body: {
        query: { bool: { must: buildDateRangeQuery(startDate, endDate) } },
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

  async getCoreDataRollup(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const query = {
      index: `${schema}.zscore_coredata_rollup`,
      body: {
        sort: [
          {
            date: {
              order: 'desc',
              unmapped_type: 'boolean',
            },
          },
        ],
        size: 500,
        version: true,
        aggs: {
          '2': {
            date_histogram: {
              field: 'date',
              calendar_interval: '1h',
              time_zone: 'Asia/Saigon',
              min_doc_count: 1,
            },
          },
        },
        stored_fields: ['*'],
        script_fields: {},
        docvalue_fields: [
          {
            field: 'date',
            format: 'date_time',
          },
        ],
        _source: {
          excludes: [],
        },
        query: {
          bool: {
            must: [],
            filter: [
              {
                match_all: {},
              },
              {
                match_phrase: {
                  route_id: routeId,
                },
              },
              {
                match_phrase: {
                  segment_id: segmentId,
                },
              },
              {
                range: {
                  date: {
                    gte: startDate,
                    lte: endDate,
                    format: 'strict_date_optional_time',
                  },
                },
              },
            ],
            should: [],
            must_not: [],
          },
        },
        highlight: {
          pre_tags: ['@opensearch-dashboards-highlighted-field@'],
          post_tags: ['@/opensearch-dashboards-highlighted-field@'],
          fields: {
            '*': {},
          },
          fragment_size: 2147483647,
        },
      },
    };

    const result = await this.openSearchClient.search(query);
    return result.body.hits.hits.map((item: any) => item._source);
  }

  async getStandardScore(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const result = await this.getCoreDataRollup(
      segmentId,
      routeId,
      startDate,
      endDate,
      schema,
    );
    // Tạo mảng chứa các giá trị standardScore
    const standardScores = result.map((item: any) => item.standardScore);

    // Trả về mảng standardScores
    return standardScores;
  }

  async getDispatch(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const result = await this.getCoreDataRollup(
      segmentId,
      routeId,
      startDate,
      endDate,
      schema,
    );
    // Tạo mảng chứa các giá trị standardScore
    const standardScores = result.map((item: any) => item.standardScore);

    // Trả về mảng standardScores
    return standardScores.length;
  }

  async calculateZscoreRealtime(
    routeNames,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    // Lấy danh sách các route
    const allVehicleData = await this.getAllRouteIdAndSegmentId(
      startDate,
      endDate,
      schema,
    );

    // Tính toán Z-Score cho từng route
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateZScoreForOperationAnalysis(
          vehicleData.segment_id,
          vehicleData.route_id,
          startDate,
          endDate,
          schema,
        );
        return { metrics };
      }),
    );

    // Lấy Standard Score cho từng route
    const allStandardScores = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const scores = await this.getStandardScore(
          vehicleData.segment_id,
          vehicleData.route_id,
          startDate,
          endDate,
          schema,
        );
        return scores;
      }),
    );

    // Tìm giá trị lớn nhất và bé nhất trong các Standard Scores
    let flatScores = allStandardScores.flat();
    let maxStandardScore = Math.max(...flatScores);
    let minStandardScore = Math.min(...flatScores);

    // Tính tổng của các Standard Scores
    let totalStandardScore = flatScores.reduce((acc, score) => acc + score, 0);

    let operatingRoutes = flatScores.length;

    // Tính giá trị trung bình của Standard Scores
    let averageStandardScore =
      operatingRoutes > 0 ? totalStandardScore / operatingRoutes : 0;

    if (routeNames) {
      const routeName = await this.getOperatingRoutes2(
        startDate,
        endDate,
        schema,
      );
      const opensearchRouteIdList =
        routeName.body.aggregations.unique_routes.buckets.map(
          (route: any) => route.key,
        );
      if (opensearchRouteIdList.length === 0) {
        return;
      }
      let routeNameArray = convertToArray(routeNames); // Mảng routeName
      const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(
        routeNameArray,
        schema,
      );
      await Promise.all(
        segmentIds.map(async (segmentId) => {
          if (segmentId) {
            const driveMetricData = await this.getDriveMetricsBySegmentId(
              segmentId,
              startDate,
              endDate,
              schema,
            );
            if (driveMetricData) {
              const IDReal =
                await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(
                  driveMetricData.route_id,
                  driveMetricData.segment_id,
                  schema,
                );
              const result = await this.getStandardScore(
                IDReal.segment_id,
                IDReal.route_id,
                startDate,
                endDate,
                schema,
              );
              operatingRoutes = await this.getDispatch(
                IDReal.route_id,
                IDReal.segment_id,
                startDate,
                endDate,
                schema,
              );
              maxStandardScore = Math.max(...result);
              minStandardScore = Math.min(...result);
              averageStandardScore =
                result.reduce((acc, score) => acc + score, 0) / operatingRoutes;
            }
          }
        }),
      );
    }

    if (allVehicleMetrics.length === 1) {
      return {
        operatingRoutes,
        maxStandardScore: 0,
        minStandardScore: 0,
        averageStandardScore,
        mean: {
          distanceRatios: 0,
          collectDistance: 0,
          otherDistance: 0,
          durationRatios: 0,
          collectDuration: 0,
          otherDuration: 0,
          collectCount: 0,
          manualCollectDistance: 0,
          manualCollectTime: 0,
        },
        standardDeviation: {
          distanceRatios: 0,
          collectDistance: 0,
          otherDistance: 0,
          durationRatios: 0,
          collectDuration: 0,
          otherDuration: 0,
          collectCount: 0,
          manualCollectDistance: 0,
          manualCollectTime: 0,
        },
      };
    }

    // Tính toán thống kê
    const allMetricsArray = allVehicleMetrics.map((v) => v.metrics);
    const statistics =
      this.zScoreService.calculateMeanAndStdForStatisticsRealtime(
        allMetricsArray,
      );

    return {
      operatingRoutes,
      maxStandardScore,
      minStandardScore,
      averageStandardScore,
      ...statistics,
    };
  }

  async getTotalOperated(startDate: string, endDate: string, schema) {
    const mustQueries = [];

    const rangeQuery = createRangeQueryDataSet(
      startDate,
      endDate,
      'data.timestamp',
    );
    mustQueries.push(rangeQuery);
    const query = {
      index: `${schema}.collect_metrics`,
      body: {
        size: 0,
        aggs: {
          unique_dispatch_no_count: {
            cardinality: { field: 'data.route_id' },
          },
        },
      },
    };

    const result = await this.openSearchClient.search(query);

    return result;
  }

  buildTotalFieldsScript = () => ({
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
  });

  buildTotalWeightScript = () => ({
    sum: {
      script: {
        source: `
            long sum = 0;
            if (doc['data.5L_gen'].length > 1) { sum += doc['data.5L_gen'][2]; }
            if (doc['data.10L_gen'].length > 1) { sum += doc['data.10L_gen'][2]; }
            if (doc['data.10L_reu'].length > 1) { sum += doc['data.10L_reu'][2]; }
            if (doc['data.20L_gen'].length > 1) { sum += doc['data.20L_gen'][2]; }
            if (doc['data.20L_reu'].length > 1) { sum += doc['data.20L_reu'][2]; }
            if (doc['data.30L_gen'].length > 1) { sum += doc['data.30L_gen'][2]; }
            if (doc['data.50L_gen'].length > 1) { sum += doc['data.50L_gen'][2]; }
            if (doc['data.50L_pub'].length > 1) { sum += doc['data.50L_pub'][2]; }
            if (doc['data.75L_gen'].length > 1) { sum += doc['data.75L_gen'][2]; }
            if (doc['data.75L_pub'].length > 1) { sum += doc['data.75L_pub'][2]; }
            if (doc['data.ext'].length > 1) { sum += doc['data.ext'][2]; }
            if (doc['data.etc'].length > 1) { sum += doc['data.etc'][2]; }
            return sum;
        `,
        lang: 'painless',
      },
    },
  });

  buildMaxScript = () => ({
    max: {
      script: {
        source: `
          double maxVal = Double.NEGATIVE_INFINITY;
          if (doc['data.5L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.5L_gen'][0]);
          if (doc['data.10L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.10L_gen'][0]);
          if (doc['data.10L_reu'].length > 0) maxVal = Math.max(maxVal, doc['data.10L_reu'][0]);
          if (doc['data.20L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.20L_gen'][0]);
          if (doc['data.20L_reu'].length > 0) maxVal = Math.max(maxVal, doc['data.20L_reu'][0]);
          if (doc['data.30L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.30L_gen'][0]);
          if (doc['data.50L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.50L_gen'][0]);
          if (doc['data.50L_pub'].length > 0) maxVal = Math.max(maxVal, doc['data.50L_pub'][0]);
          if (doc['data.75L_gen'].length > 0) maxVal = Math.max(maxVal, doc['data.75L_gen'][0]);
          if (doc['data.75L_pub'].length > 0) maxVal = Math.max(maxVal, doc['data.75L_pub'][0]);
          if (doc['data.ext'].length > 0) maxVal = Math.max(maxVal, doc['data.ext'][0]);
          if (doc['data.etc'].length > 0) maxVal = Math.max(maxVal, doc['data.etc'][0]);
          return maxVal;
        `,
        lang: 'painless',
      },
    },
  });

  buildMinScript = () => ({
    min: {
      script: {
        source: `
          double minVal = Double.POSITIVE_INFINITY;
          if (doc['data.5L_gen'].length > 0) minVal = Math.min(minVal, doc['data.5L_gen'][0]);
          if (doc['data.10L_gen'].length > 0) minVal = Math.min(minVal, doc['data.10L_gen'][0]);
          if (doc['data.10L_reu'].length > 0) minVal = Math.min(minVal, doc['data.10L_reu'][0]);
          if (doc['data.20L_gen'].length > 0) minVal = Math.min(minVal, doc['data.20L_gen'][0]);
          if (doc['data.20L_reu'].length > 0) minVal = Math.min(minVal, doc['data.20L_reu'][0]);
          if (doc['data.30L_gen'].length > 0) minVal = Math.min(minVal, doc['data.30L_gen'][0]);
          if (doc['data.50L_gen'].length > 0) minVal = Math.min(minVal, doc['data.50L_gen'][0]);
          if (doc['data.50L_pub'].length > 0) minVal = Math.min(minVal, doc['data.50L_pub'][0]);
          if (doc['data.75L_gen'].length > 0) minVal = Math.min(minVal, doc['data.75L_gen'][0]);
          if (doc['data.75L_pub'].length > 0) minVal = Math.min(minVal, doc['data.75L_pub'][0]);
          if (doc['data.ext'].length > 0) minVal = Math.min(minVal, doc['data.ext'][0]);
          if (doc['data.etc'].length > 0) minVal = Math.min(minVal, doc['data.etc'][0]);
          return minVal;
        `,
        lang: 'painless',
      },
    },
  });

  buildAggregationsCollectionStatistics = () => ({
    total_5L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.5L_gen'].length > 0) { state.sum += doc['data.5L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_10L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.10L_gen'].length > 0) { state.sum += doc['data.10L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_10L_reu: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.10L_reu'].length > 0) { state.sum += doc['data.10L_reu'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_20L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.20L_gen'].length > 0) { state.sum += doc['data.20L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_20L_reu: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.20L_reu'].length > 0) { state.sum += doc['data.20L_reu'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_30L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.30L_gen'].length > 0) { state.sum += doc['data.30L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_50L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.50L_gen'].length > 0) { state.sum += doc['data.50L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_50L_pub: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.50L_pub'].length > 0) { state.sum += doc['data.50L_pub'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_75L_gen: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.75L_gen'].length > 0) { state.sum += doc['data.75L_gen'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_75L_pub: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.75L_pub'].length > 0) { state.sum += doc['data.75L_pub'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_ext: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.ext'].length > 0) { state.sum += doc['data.ext'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_etc: {
      scripted_metric: {
        init_script: 'state.sum = 0;',
        map_script:
          "if (doc['data.etc'].length > 0) { state.sum += doc['data.etc'][0]; }",
        combine_script: 'return state.sum;',
        reduce_script:
          'double total = 0; for (s in states) { total += s; } return total;',
      },
    },
    total_fields: this.buildTotalFieldsScript(),
    total_weight: this.buildTotalWeightScript(),
    max_value: this.buildMaxScript(),
    min_value: this.buildMinScript(),
  });

  buildQuery(startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.collect_metrics`,
      body: {
        size: 0,
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
        aggs: this.buildAggregationsCollectionStatistics(),
      },
    };
    return query;
  }

  buildQueryWithRouteId(
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const query = {
      index: `${schema}.collect_metrics`,
      body: {
        size: 0,
        query: {
          bool: {
            must: [
              { term: { 'data.route_id': routeId } },
              {
                range: {
                  'data.timestamp': {
                    time_zone: '+00:00',
                    gte: startDate,
                    lte: endDate,
                  },
                },
              },
            ],
          },
        },
        aggs: this.buildAggregationsCollectionStatistics(),
      },
    };
    return query;
  }

  async getTotalCollectMetric(
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const query = this.buildQuery(startDate, endDate, schema);
    const result = await this.openSearchClient.search(query);

    return result;
  }

  async getTotalCollectMetricByRouteId(
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string,
  ) {
    const query = this.buildQueryWithRouteId(
      routeId,
      startDate,
      endDate,
      schema,
    );
    const result = await this.openSearchClient.search(query);

    return result;
  }

  formatResult = (totalAggs: any, totalOperatedCount: number) => {
    const filteredValues = Object.entries(totalAggs)
      .filter(
        ([key]) =>
          !['total_fields', 'total_weight', 'min_value', 'max_value'].includes(
            key,
          ),
      )
      .map(([, agg]: [string, { value: number }]) => agg.value);

    const maxValue = Math.max(...filteredValues);
    const minValue = Math.min(...filteredValues);

    return {
      total: {
        collectAmount: formatValue(totalAggs.total_fields.value),
        weight: formatValue(totalAggs.total_weight.value),
        max: formatValue(maxValue),
        min: formatValue(minValue),
        ...this.mapAggregations(totalAggs),
      },
      average: {
        collectAmount: formatValue(
          totalAggs.total_fields.value / totalOperatedCount,
        ),
        weight: formatValue(totalAggs.total_weight.value / totalOperatedCount),
        max: formatValue(maxValue),
        min: formatValue(minValue),
        ...this.mapAggregations(totalAggs, totalOperatedCount),
      },
    };
  };

  // Utility to map aggregations to the result
  mapAggregations = (aggregations: any, divisor = 1) => ({
    '5L_gen': formatValue(aggregations.total_5L_gen.value / divisor),
    '10L_gen': formatValue(aggregations.total_10L_gen.value / divisor),
    '10L_reu': formatValue(aggregations.total_10L_reu.value / divisor),
    '20L_gen': formatValue(aggregations.total_20L_gen.value / divisor),
    '20L_reu': formatValue(aggregations.total_20L_reu.value / divisor),
    '30L_gen': formatValue(aggregations.total_30L_gen.value / divisor),
    '50L_gen': formatValue(aggregations.total_50L_gen.value / divisor),
    '50L_pub': formatValue(aggregations.total_50L_pub.value / divisor),
    '75L_gen': formatValue(aggregations.total_75L_gen.value / divisor),
    '75L_pub': formatValue(aggregations.total_75L_pub.value / divisor),
    ext: formatValue(aggregations.total_ext.value / divisor),
    etc: formatValue(aggregations.total_etc.value / divisor),
  });

  async calculateCollectionStatistics(
    operationAnalysisDto: OperationAnalysisDto,
    schema: string,
  ) {
    const { startDate, endDate } = operationAnalysisDto;
    try {
      const totalCollectMetric = await this.getTotalCollectMetric(
        startDate,
        endDate,
        schema,
      );
      const allVehicleData = await this.getAllRouteIdAndSegmentId(
        startDate,
        endDate,
        schema,
      );

      const allStandardScores = await Promise.all(
        allVehicleData.map(async (vehicleData) => {
          const scores = await this.getStandardScore(
            vehicleData.segment_id,
            vehicleData.route_id,
            startDate,
            endDate,
            schema,
          );
          return scores;
        }),
      );

      // Tìm giá trị lớn nhất và bé nhất trong các Standard Scores
      let flatScores = allStandardScores.flat();
      let totalAggs = totalCollectMetric.body.aggregations;

      if (allVehicleData.length === 1) {
        totalAggs = {
          total_20L_gen: { value: 0 },
          total_50L_pub: { value: 0 },
          total_etc: { value: 0 },
          total_fields: { value: 0 },
          total_75L_gen: { value: 0 },
          total_10L_reu: { value: 0 },
          total_weight: { value: 0 },
          total_30L_gen: { value: 0 },
          total_50L_gen: { value: 0 },
          min_value: { value: 0 },
          total_20L_reu: { value: 0 },
          total_ext: { value: 0 },
          total_5L_gen: { value: 0 },
          total_75L_pub: { value: 0 },
          total_10L_gen: { value: 0 },
          max_value: { value: 0 },
        };
      }

      let totalOperatedCount = flatScores.length;

      if (operationAnalysisDto.routeNames) {
        const routeName = await this.getOperatingRoutes2(
          startDate,
          endDate,
          schema,
        );
        const opensearchRouteIdList =
          routeName.body.aggregations.unique_routes.buckets.map(
            (route: any) => route.key,
          );
        if (opensearchRouteIdList.length === 0) {
          return;
        }
        let routeNameArray = convertToArray(operationAnalysisDto.routeNames); // Mảng routeName
        const segmentIds =
          await this.routeInfoService.getSegmentIdsByRouteNames(
            routeNameArray,
            schema,
          );
        await Promise.all(
          segmentIds.map(async (segmentId) => {
            if (segmentId) {
              const driveMetricData = await this.getDriveMetricsBySegmentId(
                segmentId,
                startDate,
                endDate,
                schema,
              );
              if (driveMetricData) {
                const IDReal =
                  await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(
                    driveMetricData.route_id,
                    driveMetricData.segment_id,
                    schema,
                  );
                const result = await this.getTotalCollectMetricByRouteId(
                  IDReal.route_id,
                  startDate,
                  endDate,
                  schema,
                );
                totalOperatedCount = await this.getDispatch(
                  driveMetricData.route_id,
                  driveMetricData.segment_id,
                  startDate,
                  endDate,
                  schema,
                );
                totalAggs = result.body.aggregations
                  ? result.body.aggregations
                  : {
                      total_20L_gen: { value: 0 },
                      total_50L_pub: { value: 0 },
                      total_etc: { value: 0 },
                      total_fields: { value: 0 },
                      total_75L_gen: { value: 0 },
                      total_10L_reu: { value: 0 },
                      total_weight: { value: 0 },
                      total_30L_gen: { value: 0 },
                      total_50L_gen: { value: 0 },
                      min_value: { value: 0 },
                      total_20L_reu: { value: 0 },
                      total_ext: { value: 0 },
                      total_5L_gen: { value: 0 },
                      total_75L_pub: { value: 0 },
                      total_10L_gen: { value: 0 },
                      max_value: { value: 0 },
                    };
              }
            }
          }),
        );
      }

      // Parse results

      // Return the formatted result
      return this.formatResult(totalAggs, totalOperatedCount);
    } catch (error) {
      handleError(error);
    }
  }

  async operationAnalysis(
    operationAnalysisDto: OperationAnalysisDto,
    schema: string,
  ) {
    const operationStatistics = await this.calculateZscoreRealtime(
      operationAnalysisDto.routeNames,
      operationAnalysisDto.startDate,
      operationAnalysisDto.endDate,
      schema,
    );
    const collectionStatistics = await this.calculateCollectionStatistics(
      operationAnalysisDto,
      schema,
    );
    return {
      operationStatistics: operationStatistics
        ? operationStatistics
        : {
              operatingRoutes: 0,
              maxStandardScore: 0,
              minStandardScore: 0,
              averageStandardScore: 0,
              mean: {
                distanceRatios: 0,
                collectDistance: 0,
                otherDistance: 0,
                durationRatios: 0,
                collectDuration: 0,
                otherDuration: 0,
                collectCount: 0,
                manualCollectDistance: 0,
                manualCollectTime: 0,
              },
              standardDeviation: {
                distanceRatios: 0,
                collectDistance: 0,
                otherDistance: 0,
                durationRatios: 0,
                collectDuration: 0,
                otherDuration: 0,
                collectCount: 0,
                manualCollectDistance: 0,
                manualCollectTime: 0,
              },
          },
      collectionStatistics: collectionStatistics
        ? collectionStatistics
        : {
              total: {
                collectAmount: 0,
                weight: 0,
                max: 0,
                min: 0,
                '5L_gen': 0,
                '10L_gen': 0,
                '10L_reu': 0,
                '20L_gen': 0,
                '20L_reu': 0,
                '30L_gen': 0,
                '50L_gen': 0,
                '50L_pub': 0,
                '75L_gen': 0,
                '75L_pub': 0,
                ext: 0,
                etc: 0,
              },
              average: {
                collectAmount: 0,
                weight: 0,
                max: 0,
                min: 0,
                '5L_gen': 0,
                '10L_gen': 0,
                '10L_reu': 0,
                '20L_gen': 0,
                '20L_reu': 0,
                '30L_gen': 0,
                '50L_gen': 0,
                '50L_pub': 0,
                '75L_gen': 0,
                '75L_pub': 0,
                ext: 0,
                etc: 0,
              },
          },
      startDate: operationAnalysisDto.startDate || new Date().toISOString(),
      endDate: operationAnalysisDto.endDate || new Date().toISOString(),
    };
  }
}
