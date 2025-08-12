import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as moment from 'moment';
import { mean, std } from 'mathjs';
import {
  CoreDataSetDto,
  CustomGraphDto,
  ModuleDatasetDto,
  CollectCountGraphDto,
  DrivingRouteGraphDto,
  SearchAndFilterListDto,
  SearchForStatisticsDto,
  SearchOtherStatisticsDto,
  SearchVehicleForStatisticsDto
} from '../opensearch/opensearch.dto';
import { Client } from '@opensearch-project/opensearch';
import { convertToArray } from 'libs/utils/helper.util';
import { ManualCollectService } from '../datasource-service/manual-collect.service';
import { BaseFilterDatasetDto } from '../opensearch/operation-analysis.dto';

@Injectable()
export class DriveMetricService {
  logger: Logger;
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly manualCollectService: ManualCollectService
  ) {
    this.logger = new Logger();
    this.logger.log(
      `OpenSearch client initialized with node: ${this.openSearchClient.connectionPool}`,
    );
  }

  getSchema(type: string, schema: string) {
    if (schema) {
      return type === 'drive_metrics' ? `${schema.toLowerCase()}.drive_metrics` : `${schema.toLowerCase()}.collect_metrics`
    } else {
      return type === 'drive_metrics' ? `drive_metrics` : `collect_metrics`
    }
  }

  async getDriveMetrics(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    try {
      const { date, dispatchNo, routeName } = searchAndFilterListDto;
      const mustQueries = [];

      if (dispatchNo) {
        mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
      }
      if (routeName) {
        mustQueries.push({ term: { 'data.route_name.keyword': routeName } });
      }

      const rangeQuery = this.createRangeQuery(date, 'data.timestamp');
      mustQueries.push(rangeQuery);

      const body = {
        size: 1000,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        sort: [{ 'data.timestamp': { order: 'asc' } }],
      };

      const result = await this.openSearchClient.search({
        index: this.getSchema('drive_metrics', schema),
        body,
      });

      const hits = result.body.hits.hits;
      const driveMetrics = hits.map((hit) => hit._source.data);
      const resultMetrics = [];

      driveMetrics.forEach((metric, index) => {
        // Khởi tạo một segment mới
        const newSegment = {
          segment_id: metric.segment_id,
          route_name: metric.route_name,
          dispatch_no: metric.dispatch_no,
          drive_mode: metric.drive_mode,
          start_time: metric.timestamp,
          start_coords: { x: metric.gps_x, y: metric.gps_y },
          end_time: metric.timestamp,
          end_coords: { x: metric.gps_x, y: metric.gps_y },
          total_time: 0,
        };

        // Nếu có segment trước đó, cập nhật end_time và end_coords của segment trước đó
        if (index > 0) {
          resultMetrics[resultMetrics.length - 1].end_time = metric.timestamp;
          resultMetrics[resultMetrics.length - 1].end_coords = {
            x: metric.gps_x,
            y: metric.gps_y,
          };
        }

        // Thêm segment mới vào mảng kết quả
        resultMetrics.push(newSegment);
      });

      // Tính toán tổng thời gian cho mỗi segment
      resultMetrics.forEach((segment) => {
        const startTime = new Date(segment.start_time).getTime();
        const endTime = new Date(segment.end_time).getTime();
        segment.total_time = (endTime - startTime) / (1000 * 60); // Tính thời gian theo phút
      });

      return resultMetrics;
    } catch (error) {
      console.error('Error fetching or processing drive metrics:', error);
    }
  }

  async getVehicleInfo(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    const { date, dispatchNo } = searchAndFilterListDto;
    const mustQueries = [];

    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    const rangeQuery = this.createRangeQuery(date, 'data.timestamp');
    mustQueries.push(rangeQuery);
    const { body } = await this.openSearchClient.search({
      index: `${schema}.vehicle_info`,
      body: {
        size: 1,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        sort: [{ 'data.timestamp': { order: 'desc' } }],
      },
    });

    if (body.hits.total.value > 0) {
      return body.hits.hits[0]._source.data;
    } else {
      return null;
    }
  }

  async getVehicleRoute(dispatchNo: string, date: string, schema: string) {
    const mustQueries = [];
    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }
    
    const rangeQuery = this.createRangeQuery(date, 'data.timestamp');
    mustQueries.push(rangeQuery);
    const { body } = await this.openSearchClient.search({
      index: `${schema}.vehicle_route`,
      body: {
        size: 1,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        sort: [{ 'data.timestamp': { order: 'desc' } }],
      },
    });

    if (body.hits.total.value > 0) {
      return body.hits.hits[0]._source.data;
    } else {
      return null;
    }
  }

  async getLatestDriveMetricByVehicleId(
    searchAndFilterListDto: SearchAndFilterListDto,
    schema: string
  ) {
    const { date, routeName } = searchAndFilterListDto;
    const mustQueries = [];

    if (routeName) {
      mustQueries.push({ term: { 'data.route_name.keyword': routeName } });
    }

    const rangeQuery = this.createRangeQuery(date, 'data.timestamp');
    mustQueries.push(rangeQuery);

    const body: any = {
      size: 1,
      query: {
        bool: {
          must: mustQueries,
        },
      },
      sort: [{ 'data.timestamp': { order: 'desc' } }],
    };

    const { body: result } = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body,
    });

    if (result.hits.total.value > 0) {
      return result.hits.hits[0]._source.data;
    } else {
      return null;
    }
  }

  async getTotalMetrics(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    try {
      const { date, dispatchNo, routeName } = searchAndFilterListDto;
      const mustQueries = [
        dispatchNo && { term: { 'data.dispatch_no.keyword': dispatchNo } },
        routeName && { term: { 'data.route_name.keyword': routeName } },
        this.createRangeQuery(date, 'data.timestamp'),
      ].filter(Boolean);

      const scriptTemplate = `
        if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
          String tripTime = doc['data.trip_time.keyword'].value;
          int colon1 = tripTime.indexOf(':');
          int colon2 = tripTime.lastIndexOf(':');
          if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
            double hours = Double.parseDouble(tripTime.substring(0, colon1));
            double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
            double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
            return (hours * 60) + minutes + (seconds / 60.0);
          }
        }
        return 0;
      `;

      const aggregations = {
        latest_eco_score: {
          top_hits: {
            sort: [{ 'data.timestamp': { order: 'desc' } }],
            _source: { includes: ['data.eco_score'] },
            size: 1,
          },
        },
        total_trip_distance: { sum: { field: 'data.trip_distance' } },
        total_speeding: { sum: { field: 'data.speeding' } },
        total_idling: {
          filter: { term: { 'data.drive_mode': 6 } },
          aggs: {
            total_idling_time: {
              sum: { script: { source: scriptTemplate, lang: 'painless' } },
            },
          },
        },
        total_sudden_accel: { sum: { field: 'data.sudden_accel' } },
        total_sudden_break: { sum: { field: 'data.sudden_break' } },
        total_trip_time: {
          sum: { script: { source: scriptTemplate, lang: 'painless' } },
        },
        not_managed: {
          filter: { term: { 'data.drive_mode': 7 } },
          aggs: {
            not_managed: {
              sum: { script: { source: scriptTemplate, lang: 'painless' } },
            },
          },
        },
        out_of_control: {
          filter: { term: { 'data.drive_mode': 8 } },
          aggs: {
            out_of_control: {
              sum: { script: { source: scriptTemplate, lang: 'painless' } },
            },
          },
        },
      };

      const result = await this.openSearchClient.search({
        index: this.getSchema('drive_metrics', schema),
        body: {
          size: 0,
          query: { bool: { must: mustQueries } },
          aggs: aggregations,
        },
      });

      const agg = result.body.aggregations;

      const totalMetrics = {
        eco_score: agg.latest_eco_score.hits.hits[0]?._source.data.eco_score ?? 0,
        trip_distance: agg.total_trip_distance.value ?? 0,
        speeding: agg.total_speeding.value ?? 0,
        idling: agg.total_idling.total_idling_time.value ?? 0,
        sudden_accel: agg.total_sudden_accel.value ?? 0,
        sudden_break: agg.total_sudden_break.value ?? 0,
        trip_time: agg.total_trip_time.value ?? 0,
        not_managed: agg.not_managed.not_managed.value ?? 0,
        out_of_control: agg.out_of_control.out_of_control.value ?? 0,
      };

      return totalMetrics;
    } catch (error) {
      console.error('Error fetching total metrics:', error);
      return {
        eco_score: 0,
        trip_distance: 0,
        speeding: 0,
        idling: 0,
        sudden_accel: 0,
        sudden_break: 0,
        trip_time: 0,
        not_managed: 0,
        out_of_control: 0,
      };
    }
  }

  async getRouteInfo(segmentId: number, schema: string) {
    return this.manualCollectService.getRouteInfo(segmentId, schema)
  }

  async getLatestDriveMetric(routeName: string, schema: string) {
    return await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      body: {
        size: 0,
        query: { bool: { must: [
          { sort: [{ 'data.timestamp': { order: 'desc' } }] },
          { terms: { 'data.section_name.keyword': routeName } }
        ] } },
      },
    });
  }

  convertMillisecondsToSeconds(milliseconds: number): number {
    return milliseconds / 1000;
  }

  async getCombinedVehicleData(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    const { date } = searchAndFilterListDto;
    const vehicleInfo = await this.getVehicleInfo(searchAndFilterListDto, schema);
    const latestDriveMetric = await this.getLatestDriveMetricByVehicleId(
      searchAndFilterListDto,
      schema
    );
    
    const detailDriveMetric = await this.getDriveMetrics(
      searchAndFilterListDto,
      schema
    );

    const totals = await this.getTotalMetrics(searchAndFilterListDto, schema);

    let vehicleRoute = null;
    if (latestDriveMetric) {
      const segmentId = latestDriveMetric.segment_id;
      vehicleRoute = await this.getRouteInfo(segmentId, schema);
    }

    let newDate = new Date();
    if (date) {
      newDate = new Date(date);
    }
    newDate.setDate(newDate.getDate())
    const isoDateString = newDate.toISOString().split('T')[0];
    const uniqueDriveMetrics = await this.getUniqueDriveMetrics({ date }, schema);
    const searchDispatchNo = await this.getDispatchNoByRouteName(searchAndFilterListDto.routeName, schema);
    const zScore = await this.calculateZscoreRealtimeOne({ ...searchAndFilterListDto, date: isoDateString }, searchDispatchNo, schema);
    return {
      vehicleInfo,
      vehicleRoute,
      latestDriveMetric,
      detailDriveMetric,
      totals,
      uniqueDriveMetrics: uniqueDriveMetrics.uniqueDriveMetrics,
      zScore,
      lastUpdated: new Date().toISOString() || null
    };
  }

  async getUniqueDriveMetrics(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    const { date, dispatchNo, routeName, updateTime } = searchAndFilterListDto;

    if (dispatchNo || routeName) {
      return this.getCombinedVehicleData(searchAndFilterListDto, schema);
    }

    const body: any = {
      size: 0,
      aggs: {
        unique_drive_metric: {
          terms: { field: 'data.route_name.keyword', size: 10000 },
          aggs: this.getAggregations(),
        },
      },
    };

    const rangeQuery = this.createRangeQuery(date, 'data.timestamp');

    if (rangeQuery) {
      body.query = rangeQuery;
    }

    const { body: searchBody } = await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      body,
    });
    const zScore = await this.calculateZscoreRealtime(searchAndFilterListDto, schema);

    return await this.formatMetrics(
      searchBody.aggregations.unique_drive_metric.buckets,
      zScore,
      date,
      updateTime,
      schema
    );
  }

  async calculateZscoreRealtimeOne(searchAndFilterListDto: SearchAndFilterListDto, dispatchNo: string, schema) {
    const latest = await this.calculateMetricsForStatisticRealtimeOne(searchAndFilterListDto, dispatchNo, schema);
    const statistic = await this.calculateZscoreRealtime(searchAndFilterListDto, schema);
    return {
      latest: latest.latest,
      ...statistic,
      rankScore: latest.rankScore
    }
  }

  async calculateZscoreRealtime(searchAndFilterListDto: SearchAndFilterListDto, schema) {
    // Lấy danh sách các route
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);
    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const newSearchForStatisticsDto = new SearchAndFilterListDto();
        newSearchForStatisticsDto.routeName = vehicleData.route_name;
        newSearchForStatisticsDto.date = searchAndFilterListDto.date || new Date().toISOString();

        const metrics = await this.calculateMetricsForStatisticRealtime(
          newSearchForStatisticsDto,
          vehicleData.dispatch_no,
          schema
        );
        return { metrics };
      }),
    );
    
    
    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);
    const statistics1 = this.calculateForStatisticsRealtime(allMetricsArray);

    return {
      latest: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      ...statistics1
    };
  }

  async calculateMetricsForStatisticRealtimeOne(
    searchAndFilterListDto: SearchAndFilterListDto,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = this.buildMustQueries(searchAndFilterListDto);
    let metricArray = []
    const mustQueriesForRange = [
      ...mustQueries,
      this.buildDateRangeQuery(searchAndFilterListDto.date),
    ];

    const result = await this.fetchAggregations(mustQueriesForRange, schema);
    
    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration
    } = this.extractMetricsForStatistics(result);
    const manualCollectDistance = await this.manualCollectService.manualCollectDistance(searchAndFilterListDto.routeName, schema);
    const weight = 2.4;
    const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
    const collectCount = await this.getCollectMetrics(
      dispatch_no,
      searchAndFilterListDto.date,
      schema
    )

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

    const data =  {
      distanceRatios,
      collectDistance,
      durationRatios,
      collectDuration,
      collectCount,
      manualCollectTime,
    };

    metricArray.push(data)

    const filteredMetricsArray = metricArray.filter((metric) => metric !== null);

    const oneMetric = [...filteredMetricsArray];

    const ewmOneMetric = this.calculateEWMetricsForStatistics(oneMetric);
    const rank = await this.classifyRankForVehicle(searchAndFilterListDto, schema);
    const latest = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0] || 0
    };

    return {
      latest, 
      rankScore: rank.rankScore
    };
  }

  async calculateMetricsForStatisticRealtime(
    searchAndFilterListDto: SearchAndFilterListDto,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = this.buildMustQueries(searchAndFilterListDto);
    let metricArray = []
    const mustQueriesForRange = [
      ...mustQueries,
      this.buildDateRangeQuery(searchAndFilterListDto.date),
    ];

    const result = await this.fetchAggregations(mustQueriesForRange, schema);
    
    const {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration
    } = this.extractMetricsForStatistics(result);
    const manualCollectDistance = await this.manualCollectService.manualCollectDistance(searchAndFilterListDto.routeName, schema);
    const weight = 2.4;
    const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
    const collectCount = await this.getCollectMetrics(
      dispatch_no,
      searchAndFilterListDto.date,
      schema
    )

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

    const data =  {
      distanceRatios,
      collectDistance,
      otherDistance,
      durationRatios,
      collectDuration,
      otherDuration,
      collectCount,
      manualCollectDistance,
      manualCollectTime
    };

    metricArray.push(data)

    const filteredMetricsArray = metricArray.filter((metric) => metric !== null);

    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetricsForStatistics(oneMetric);

    const latest = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0]
    };

    return latest;
  }

  private calculateForStatisticsRealtime(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.distanceRatios))),
        collectDistance: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectDistance))),
        durationRatios: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.durationRatios))),
        collectDuration: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectDuration))),
        collectCount: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectCount))),
        manualCollectTime: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.manualCollectTime))),
      },
      standardDeviation: {
        distanceRatios: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.distanceRatios))),
        collectDistance: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectDistance))),
        durationRatios: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.durationRatios))),
        collectDuration: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectDuration))),
        collectCount: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectCount))),
        manualCollectTime: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.manualCollectTime))),
      },
    };
  }

  async getZscoreRollupByVehicle(searchAndFilterListDto: SearchAndFilterListDto, schema) {
    const shouldQueries = [];

    if (searchAndFilterListDto.dispatchNo) {
      shouldQueries.push({
        match: {
          'data.dispatch_no.keyword': searchAndFilterListDto.dispatchNo
        }
      });
    }

    if (searchAndFilterListDto.routeName) {
      shouldQueries.push({
        match: {
          'data.route_name.keyword': searchAndFilterListDto.routeName
        }
      });
    }

    const result = await this.openSearchClient.search({
      index: `${schema}.zscore_rollup`,
      size: 10000,
      body: {
        query: {
          bool: {
            must: [
              {
                range: {
                  'timestamp': {
                    gte: searchAndFilterListDto.date,
                    lte: searchAndFilterListDto.date
                  }
                }
              }
            ],
            should: shouldQueries,
            minimum_should_match: 1  // Chỉ thực thi khi có ít nhất một điều kiện trong should khớp
          }
        }
      }
    });

    let data = {
      latest: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      mean: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      standardDeviation: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      rankScore: null
    };

    if (!result.body.hits.hits[0]?._source) {
      return data;
    }

    data.latest = result.body.hits.hits[0]?._source.latest;
    data.mean = result.body.hits.hits[0]?._source.mean;
    data.standardDeviation = result.body.hits.hits[0]?._source.standardDeviation;
    data.rankScore = result.body.hits.hits[0]?._source.rankScore;

    return data;  // Handle cases where no result is found
  }


  async getZscoreRollup(date: string, schema: string) {
    const result = await this.openSearchClient.search({
      index: `${schema}.zscore_rollup`,
      size: 10000,
      body: {
        sort: [{ 'timestamp': { order: 'desc' } }],
        query: {
          bool: {
            must: [
              {
                range: {
                  'timestamp': {
                    gte: date,
                    lte: date
                  }
                }
              }
            ],
            must_not: [
              { exists: { field: 'latest.distanceRatios' } },
              { exists: { field: 'latest.durationRatios' } },
              { exists: { field: 'latest.collectDistance' } },
              { exists: { field: 'latest.collectDuration' } },
              { exists: { field: 'latest.collectCount' } }
            ],
            filter: [
              { exists: { field: 'mean.distanceRatios' } },
              { exists: { field: 'mean.durationRatios' } },
              { exists: { field: 'mean.collectDistance' } },
              { exists: { field: 'mean.collectDuration' } },
              { exists: { field: 'mean.collectCount' } },
              { exists: { field: 'standardDeviation.distanceRatios' } },
              { exists: { field: 'standardDeviation.durationRatios' } },
              { exists: { field: 'standardDeviation.collectDistance' } },
              { exists: { field: 'standardDeviation.collectDuration' } },
              { exists: { field: 'standardDeviation.collectCount' } }
            ]
          }
        }
      }
    });

    let data = {
      latest: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      mean: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      standardDeviation: {
        distanceRatios: null,
        durationRatios: null,
        collectDistance: null,
        collectDuration: null,
        collectCount: null
      },
      rankScore: null
    };

    if (!result.body.hits.hits[0]?._source) {
      return data;
    }

    data.latest = result.body.hits.hits[0]?._source.latest;
    data.mean = result.body.hits.hits[0]?._source.mean;
    data.standardDeviation = result.body.hits.hits[0]?._source.standardDeviation;
    return data;  // Handle cases where no result is found
  }

  getAggregations() {
    const aggs = {
      latest_record: {
        top_hits: {
          sort: [{ 'data.timestamp': { order: 'desc' } }],
          _source: {
            includes: [
              'data.timestamp',
              'data.dispatch_no',
              'data.drive_mode',
              'data.section_name',
              'data.route_name',
              'data.gps_x',
              'data.gps_y',
              'data.angle',
              'data.eco_score',
              'data.trip_time',
              'data.trip_distance',
              'data.velocity',
              'data.speeding',
              'data.sudden_accel',
              'data.sudden_break',
            ],
          },
          size: 1,
        },
      },
    };

    return aggs;
  }

  createRangeQuery(date: string | undefined, field: any): any {
    if (date) {
      return { range: { [field]: { gte: date, lte: date } } };
    } else {
      return { range: { [field]: { gte: 'now/d', lte: 'now' } } }; // Tìm kiếm trong 1 ngày gần nhất
    }
  }

  async formatMetrics(buckets: any[], zScore: any, date: any, updateTime: any, schema: string) {
    const lastestData = await this.getLatestDriveMetricByVehicleId({ date }, schema);

    const uniqueDriveMetrics = buckets.map(
      (bucket) => bucket.latest_record.hits.hits[0]._source.data,
    );

    return {
      uniqueDriveMetrics,
      lastUpdated: new Date().toISOString() || null,
      zScore,
      updateTime,
    };
  }

  calculateTotals(buckets: any[]) {
    return buckets.reduce(
      (totals, bucket) => {
        totals.eco_score += bucket.total_eco_score.value || 0;
        totals.trip_distance += bucket.total_trip_distance.value || 0;
        totals.speeding += bucket.total_speeding.value || 0;
        totals.idling += bucket.total_idling.value || 0;
        totals.sudden_accel += bucket.total_sudden_accel.value || 0;
        totals.sudden_break += bucket.total_sudden_break.value || 0;
        totals.not_managed += bucket.not_managed.not_managed.value || 0;
        totals.out_of_control += bucket.out_of_control.out_of_control.value || 0;
        return totals;
      },
      {
        eco_score: 0,
        trip_time: 0,
        trip_distance: 0,
        speeding: 0,
        idling: 0,
        sudden_accel: 0,
        sudden_break: 0,
        not_managed: 0,
        out_of_control: 0
      },
    );
  }

  parseDuration(duration: string): number {
    const parts = duration.split(':');
    return (
      parseInt(parts[0], 10) * 60 +
      parseInt(parts[1], 10) +
      parseInt(parts[2], 10) / 60
    );
  }

  async getCollectMetrics(dispatchNo: string, startDate: string, schema: string) {
    const mustQueries = [];

    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push(this.buildDateRangeQuery(startDate))

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      "aggs": {
        "total_sum": {
          "sum": {
            "script": {
              "source": `
                long sum = 0;
                sum += doc['data.5L_gen'].value;
                sum += doc['data.10L_gen'].value;
                sum += doc['data.10L_reu'].value;
                sum += doc['data.20L_gen'].value;
                sum += doc['data.20L_reu'].value;
                sum += doc['data.30L_gen'].value;
                sum += doc['data.50L_gen'].value;
                sum += doc['data.50L_pub'].value;
                sum += doc['data.75L_gen'].value;
                sum += doc['data.75L_pub'].value;
                sum += doc['data.ext'].value;
                sum += doc['data.etc'].value;
                return sum;
              `,
              "lang": "painless"
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return result.body.aggregations.total_sum.value || null;
  }


  async calculateMetricsWithStatsForAll(
    searchAndFilterListDto: SearchAndFilterListDto,
    schema: string
  ) {
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const newSearchAndFilterListDto = new SearchAndFilterListDto();
        newSearchAndFilterListDto.date = searchAndFilterListDto.date;
        newSearchAndFilterListDto.routeName = vehicleData.route_name;

        const metrics = await this.calculateMetricsWithStatsLatest(
          newSearchAndFilterListDto,
          vehicleData.dispatch_no,
          schema
        );
        return { metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);

    // Tính toán các chỉ số thống kê cho tất cả các xe
    const statistics = this.calculateStatistics(allMetricsArray);

    const latest = {
      distanceRatios: null,
      durationRatios: null,
      collectDistance: null,
      collectDuration: null,
      collectCount: null
    }

    const result = {
      latest,
      ...statistics,
      rankScore: null,
      dispatch_no: null,
      route_name: null,
      timestamp: searchAndFilterListDto.date
    }

    return result;
  }

  async calculateMetricsWithStatsForAlly(
    searchAndFilterListDto: SearchAndFilterListDto,
    schema: string
  ) {
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const newSearchAndFilterListDto = new SearchAndFilterListDto();
        newSearchAndFilterListDto.date = searchAndFilterListDto.date;
        newSearchAndFilterListDto.dispatchNo = vehicleData.dis;
        newSearchAndFilterListDto.routeName = vehicleData.route_name;

        const metrics = await this.calculateMetricsWithStatsLatest(
          newSearchAndFilterListDto,
          vehicleData.dispatch_no,
          schema
        );
        return { metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);

    // Tính toán các chỉ số thống kê cho tất cả các xe
    const statistics = this.calculateStatistics(allMetricsArray);

    const latest = {
      distanceRatios: null,
      durationRatios: null,
      collectDistance: null,
      collectDuration: null,
      collectCount: null
    }

    const result = {
      latest,
      ...statistics,
      rankScore: null,
      dispatch_no: null,
      route_name: null,
      timestamp: searchAndFilterListDto.date
    }

    return result;
  }

  async classifyRankForVehicle(searchAndFilterListDto: SearchAndFilterListDto, schema: string) {
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const newSearchAndFilterListDto = new SearchAndFilterListDto();
        newSearchAndFilterListDto.date = searchAndFilterListDto.date;
        newSearchAndFilterListDto.dispatchNo = vehicleData.dispatch_no;
        newSearchAndFilterListDto.routeName = vehicleData.route_name;

        const metrics = await this.calculateMetricsWithStatsLatest(
          newSearchAndFilterListDto,
          vehicleData.dispatch_no,
          schema
        );
        return { route_name: vehicleData.route_name, metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);

    // Tính toán các chỉ số thống kê cho tất cả các xe
    const statistics = this.calculateStatistics(allMetricsArray);
    // Tính toán EWM cho tất cả các x

    // Tính toán zScores cho tất cả các xe
    const zDistanceRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);

    // Tính toán Weighted Sum
    const rankScores = this.calculateWeightedSum(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime
    );

    const allRanks = this.classifyRank(rankScores);

    // Phân loại rank cho mỗi xe
    const vehicleIndex = allVehicleMetrics.findIndex(v => v.route_name === searchAndFilterListDto.routeName);
    if (vehicleIndex !== -1) {
      return {
        route_name: searchAndFilterListDto.routeName,
        rankScore: allRanks[vehicleIndex],
      };
    } else {
      return {
        route_name: searchAndFilterListDto.routeName,
        rankScore: 'Not Found',  // Hoặc xử lý khác nếu xe không được tìm thấy
      };
    }
  }

  async calculateMetricsWithStatsLatest(
    searchAndFilterListDto: SearchAndFilterListDto,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = this.buildMustQueries(searchAndFilterListDto);
    const dateRanges = this.generateDateRanges(7, searchAndFilterListDto.date);

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ startDate }) => {
        const mustQueriesForRange = [
          ...mustQueries,
          this.buildDateRangeQuery(startDate),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
        } = this.extractMetrics(result);

        const collectCount = await this.getCollectMetrics(
          dispatch_no,
          startDate,
          schema
        )

        if (
          distanceRatios === 0 &&
          durationRatios === 0 &&
          collectDistance === 0 &&
          collectDuration === 0 &&
          collectCount === 0
        ) {
          return null; // Loại bỏ các giá trị không mong muốn
        }

        return {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
          collectCount,
        };
      }),
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);

    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetrics(oneMetric);

    const latest = {
      distanceRatios: ewmOneMetric.ewmDistanceRatios.slice(-1)[0],
      durationRatios: ewmOneMetric.ewmDurationRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.ewmCollectDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.ewmCollectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.ewmCollectCount.slice(-1)[0],
    };

    return latest;
  }

  async calculateMetricsWithStats(
    searchAndFilterListDto: SearchAndFilterListDto,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = this.buildMustQueries(searchAndFilterListDto);
    const dateRanges = this.generateDateRanges(7, searchAndFilterListDto.date);

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ startDate }) => {
        const mustQueriesForRange = [
          ...mustQueries,
          this.buildDateRangeQuery(startDate),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);
        const {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
        } = this.extractMetrics(result);

        const collectCount = await this.getCollectMetrics(
          dispatch_no,
          startDate,
          schema
        )

        if (
          distanceRatios === 0 &&
          durationRatios === 0 &&
          collectDistance === 0 &&
          collectDuration === 0 &&
          collectCount === 0
        ) {
          return null; // Loại bỏ các giá trị không mong muốn
        }

        return {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
          collectCount,
        };
      }),
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);

    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetrics(oneMetric);
    const latest = {
      distanceRatios: parseFloat(ewmOneMetric.ewmDistanceRatios.slice(-1)[0].toFixed(3)),
      durationRatios: parseFloat(ewmOneMetric.ewmDurationRatios.slice(-1)[0].toFixed(3)),
      collectDistance: parseFloat(ewmOneMetric.ewmCollectDistance.slice(-1)[0].toFixed(3)),
      collectDuration: parseFloat(ewmOneMetric.ewmCollectDuration.slice(-1)[0].toFixed(3)),
      collectCount: parseFloat(ewmOneMetric.ewmCollectCount.slice(-1)[0].toFixed(3)),
    };

    const dataAll = await this.calculateMetricsWithStatsForAlly(searchAndFilterListDto, schema);
    const rank = await this.classifyRankForVehicle(searchAndFilterListDto, schema);
    dataAll.latest = latest
    dataAll.dispatch_no = searchAndFilterListDto.dispatchNo
    dataAll.rankScore = rank.rankScore
    dataAll.route_name = searchAndFilterListDto.routeName
    return {
      ...dataAll
    };
  }

  async getUniqueRouteNameAndDispatchByDate(baseFilterDatasetDto: BaseFilterDatasetDto, schema: string) {
    const result = await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      size: 0, // Không cần lấy documents, chỉ cần aggregation
      body: {
        query: {
          bool: {
            must: {
              range: {
                'data.timestamp': {
                  "time_zone": "+00:00",
                  gte: baseFilterDatasetDto.startDate + 'T11:00:00',
                  lte: baseFilterDatasetDto.endDate + 'T11:00:00',
                },
              },
            },
          },
        },
        aggs: {
          unique_vehicle_dispatch: {
            composite: {
              sources: [
                { dispatch_no: { terms: { field: 'data.dispatch_no.keyword' } } },
                { route_name: { terms: { field: 'data.route_name.keyword' } } }
              ],
              size: 10000 // Số lượng kết quả tối đa bạn muốn lấy
            }
          }
        }
      }
    });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket) => ({
      dispatch_no: bucket.key.dispatch_no,
      route_name: bucket.key.route_name,
    }));
  }

  async getRouteListByDate(baseFilterDatasetDto: BaseFilterDatasetDto, schema: string) {
    const result = await this.getUniqueRouteNameAndDispatchByDate(baseFilterDatasetDto, schema);
    return result.map((r) => r.route_name);
  }

  async getUniqueVehicleIdsAndDispatchNos(schema: string) {
    const result = await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      size: 0, // Không cần lấy documents, chỉ cần aggregation
      body: {
        aggs: {
          unique_vehicle_dispatch: {
            composite: {
              sources: [
                { dispatch_no: { terms: { field: 'data.dispatch_no.keyword' } } },
                { route_name: { terms: { field: 'data.route_name.keyword' } } }
              ],
              size: 10000 // Số lượng kết quả tối đa bạn muốn lấy
            }
          }
        }
      }
    });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket) => ({
      dispatch_no: bucket.key.dispatch_no,
      route_name: bucket.key.route_name,
    }));
  }

  async getRouteList(schema: string) {
    const result = await this.getUniqueVehicleIdsAndDispatchNos(schema);
    return result.map((r) => r.route_name);
  }

  private buildMustQueries(searchAndFilterListDto: SearchAndFilterListDto) {
    const { dispatchNo, routeName } = searchAndFilterListDto;
    const mustQueries = [];
    if (dispatchNo)
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    if (routeName)
      mustQueries.push({ term: { 'data.route_name.keyword': routeName } });
    return mustQueries;
  }

  private generateDateRanges(days: number, date?: string) {
    const startDate = date
      ? moment(date).startOf('day')
      : moment().startOf('day');

    return Array.from({ length: days }, (_, i) => {
      const start = startDate.clone().subtract(i, 'days').format('YYYY-MM-DD');
      return { startDate: start };
    });
  }

  private buildDateRangeQuery(startDate: string) {
    // Tạo đối tượng Date từ startDate và tăng thêm 1 ngày
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() - 1); // Tăng thêm 1 ngày

    // Định dạng lại ngày theo chuỗi ISO (yyyy-MM-dd) để sử dụng
    const formattedStartDate = start.toISOString().split('T')[0];
    const formattedEndDate = end.toISOString().split('T')[0];

    return {
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: formattedEndDate + 'T11:00:00',
          lte: formattedStartDate + 'T11:00:00',
        },
      },
    };
  }

  private async fetchAggregations(mustQueriesForRange: any[], schema: string): Promise<any> {
    const body = {
      size: 0,
      query: { bool: { must: mustQueriesForRange } },
      aggs: this.buildAggregations(),
    };
    try {
      const result = await this.openSearchClient.search({
        index: this.getSchema('drive_metrics', schema),
        body,
      });

      if (!result.body.aggregations) {
        throw new Error('Aggregations not found in the response');
      }

      // Lọc kết quả và thêm trip_distance_mode_5 nếu thiếu
      const processedAggregations = this.processAggregations(result.body.aggregations);
      return processedAggregations;
    } catch (error) {
      console.error('Error fetching aggregations:', error);
      throw error;
    }
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
            value: 0
          },
          total_trip_distance: {
            value: 0
          }
        };
      }
    }

    return processedAggregations;
  }

  private buildAggregations() {
    return {
      all_drive_metrics: {
        filters: { filters: { all: { match_all: {} } } },
        aggs: {
          trip_distance_mode_5: this.buildAggregationForDriveMode(5),
          trip_distance_other_modes: this.buildAggregationForDriveModes([
            0, 1, 2, 3, 4, 6, 7, 8
          ]),
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
            'params.mode5_count != null && params.otherModes_count != null && params.otherModes_count != 0 ? ((params.mode5_count * 10) / (params.otherModes_count * 10) * 100) : null',
            'mode5_count',
            'otherModes_count',
          ),
          collect_duration: this.buildBucketScriptAggregation(
            'trip_distance_mode_5>count_trip_distance',
            null,
            'params.mode5_count != null ? (params.mode5_count * 10) : null',
            'mode5_count',
          ),
          other_duration: this.buildBucketScriptAggregation(
            'trip_distance_other_modes>count_trip_distance',
            null,
            'params.otherModes_count != null ? (params.otherModes_count * 10) : null',
            'otherModes_count'
          )
        },
      },
    };
  }

  private buildAggregationForDriveMode(mode: number) {
    return {
      filter: { term: { 'data.drive_mode': mode } },
      aggs: {
        total_trip_distance: { sum: { field: 'data.trip_distance' } },
        count_trip_distance: { value_count: { field: 'data.trip_distance' } },
      },
    };
  }

  private buildAggregationForDriveModes(modes: number[]) {
    return {
      filter: { terms: { 'data.drive_mode': modes } },
      aggs: {
        total_trip_distance: { sum: { field: 'data.trip_distance' } },
        count_trip_distance: { value_count: { field: 'data.trip_distance' } },
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

  private extractMetrics(aggregations: any) {
    const metrics = aggregations.all_drive_metrics.buckets.all;
    return {
      distanceRatios: parseFloat(metrics.distance_ratios?.value.toFixed(3)) || 0,
      durationRatios: parseFloat(metrics.duration_ratios?.value.toFixed(3)) || 0,
      collectDistance:
        parseFloat(metrics.trip_distance_mode_5.total_trip_distance?.value.toFixed(3)) || 0,
      collectDuration: parseFloat(metrics.collect_duration?.value.toFixed(3)) || 0,
    };
  }

  private calculateEWMetrics(metricsArray: any[]) {
    const alpha = 0.1;
    return {
      ewmDistanceRatios: this.calculateEWM(metricsArray.map((m) => m.distanceRatios), alpha),
      ewmDurationRatios: this.calculateEWM(metricsArray.map((m) => m.durationRatios), alpha),
      ewmCollectDistance: this.calculateEWM(metricsArray.map((m) => m.collectDistance), alpha),
      ewmCollectDuration: this.calculateEWM(metricsArray.map((m) => m.collectDuration), alpha),
      ewmCollectCount: this.calculateEWM(metricsArray.map((m) => m.collectCount), alpha),
      ewmManualCollectTime: this.calculateEWM(metricsArray.map((m) => m.manualCollectTime), alpha),
    };
  }

  private calculateStatistics(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.safeMean(metricsArray.map((m) => m.distanceRatios)),
        durationRatios: this.safeMean(metricsArray.map((m) => m.durationRatios)),
        collectDistance: this.safeMean(metricsArray.map((m) => m.collectDistance)),
        collectDuration: this.safeMean(metricsArray.map((m) => m.collectDuration)),
        collectCount: this.safeMean(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: this.safeMean(metricsArray.map((m) => m.manualCollectDistance)),
        manualCollectTime: this.safeMean(metricsArray.map((m) => m.manualCollectTime))
      },
      standardDeviation: {
        distanceRatios: this.safeStd(metricsArray.map((m) => m.distanceRatios)),
        durationRatios: this.safeStd(metricsArray.map((m) => m.durationRatios)),
        collectDistance: this.safeStd(metricsArray.map((m) => m.collectDistance)),
        collectDuration: this.safeStd(metricsArray.map((m) => m.collectDuration)),
        collectCount: this.safeStd(metricsArray.map((m) => m.collectCount)),
        manualCollectDistance: this.safeStd(metricsArray.map((m) => m.manualCollectDistance)),
        manualCollectTime: this.safeStd(metricsArray.map((m) => m.manualCollectTime))
      },
    };
  }

  private safeMean(array: number[]) {
    // Lọc ra các giá trị undefined hoặc không phải số
    const validNumbers = array.filter((value) => typeof value === 'number' && !isNaN(value));

    // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
    return validNumbers.length === 0 ? 0 : mean(validNumbers);
  }

  private safeStd(array: number[]) {
    // Lọc ra các giá trị undefined hoặc không phải số
    const validNumbers = array.filter((value) => typeof value === 'number' && !isNaN(value));

    // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
    return validNumbers.length === 0 ? 0 : std(validNumbers);
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
  

  calculateZScores(data: number[], mean: number, stdDev: any): number[] {
    if (stdDev === 0) {
      return data.map(() => 0);  // Nếu stdDev = 0, tất cả các zScores đều bằng 0
    }
    return data.map((value) => (value - mean) / stdDev);
  }

  calculateWeightedSum(
    zDistanceRatios: number[],
    zDurationRatios: number[],
    zCollectDistances: number[],
    zCollectDurations: number[],
    zCollectCounts: number[],
    zManualCollectTime: number[]
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

  classifyRank(scores: number[]): string[] {
    if (scores.length === 0 || scores.every(score => isNaN(score))) {
      return [];  // Trả về mảng rỗng nếu không có giá trị hoặc tất cả giá trị là NaN
    }

    const validScores = scores.filter(score => !isNaN(score));
    const total = validScores.length;

    // Sắp xếp các giá trị theo thứ tự tăng dần
    const scoresSorted = [...validScores].sort((a, b) => a - b);
    if (total <= 5) {
      const rankLetters = ['A', 'B', 'C', 'D', 'E'];
      return validScores.map(score => {
        const position = scoresSorted.indexOf(score);
        return rankLetters[position];
      });
    }
    // Phân chia các giá trị thành các nhóm tỉ lệ
    const aEnd = Math.floor(0.1 * total);
    const bEnd = Math.floor(0.3 * total);  // A(10%) + B(20%)
    const cEnd = Math.floor(0.7 * total);  // A(10%) + B(20%) + C(40%)
    const dEnd = Math.floor(0.9 * total);  // A(10%) + B(20%) + C(40%) + D(20%)

    return validScores.map(score => {
      // Tìm vị trí của `score` trong danh sách đã sắp xếp
      const position = scoresSorted.indexOf(score);

      if (position < aEnd) {
        return 'A';
      } else if (position < bEnd) {
        return 'B';
      } else if (position < cEnd) {
        return 'C';
      } else if (position < dEnd) {
        return 'D';
      } else {
        return 'E';
      }
    });
  }

  getMinAndMax = (arr) => ({
    min: Math.min(...arr),
    max: Math.max(...arr)
  });

  getAverage = (arr) => arr.length ? arr.reduce((sum, value) => sum + value, 0) / arr.length : 0;

  async getOperatingRoutes(client: any, startDate: string, endDate: string, schema: string) {
    const query = {
      index: this.getSchema('drive_metrics', schema),
      body: {
        size: 0,
        query: { bool: { must: [{ match: { topic: 'drive_metrics' } }, { range: { 'data.timestamp': { "time_zone": "+00:00", gte: startDate + 'T11:00:00', lte: endDate + 'T11:00:00' } } }] } },
        aggs: { unique_route: { cardinality: { field: 'data.route_name.keyword' } } },
      },
    };
    return await client.search(query);
  };

  async operationAnalysis(searchForStatisticsDto: SearchForStatisticsDto, schema: string) {
    const operationStatistics = await this.calculateMetricsWithStatsForAllStatistics(searchForStatisticsDto, schema);
    const collectionStatistics = await this.calculateCollectionStatistics(searchForStatisticsDto, schema);
    return {
      operationStatistics,
      collectionStatistics,
      startDate: searchForStatisticsDto.startDate || new Date().toISOString(),
      endDate: searchForStatisticsDto.endDate || new Date().toISOString()
    }
  }

  async calculateMetricsWithStatsForAllStatistics(searchForStatisticsDto: SearchForStatisticsDto, schema: string) {
    // Lấy danh sách các route
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const newSearchForStatisticsDto = new SearchVehicleForStatisticsDto();
        newSearchForStatisticsDto.startDate = searchForStatisticsDto.startDate;
        newSearchForStatisticsDto.endDate = searchForStatisticsDto.endDate;
        newSearchForStatisticsDto.routeName = vehicleData.route_name;

        const metrics = await this.calculateMetricsForStatistic(
          newSearchForStatisticsDto,
          vehicleData.dispatch_no,
          schema
        );
        return { metrics };
      }),
    );
    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);
    const statistics1 = this.calculateForStatistics(allMetricsArray);
    const statistics = this.calculateStatistics(allMetricsArray);
    // Tính toán EWM cho tất cả các x

    // Tính toán zScores cho tất cả các xe
    const zDistanceRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);

    // Tính toán Weighted Sum
    const rankScores = this.calculateWeightedSum(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime
    );

    const zScore = rankScores.map((z) => z * 20 + 100);
    const operatingRoutesRes = await this.getOperatingRoutes(this.openSearchClient, searchForStatisticsDto.startDate, searchForStatisticsDto.endDate, schema)
    const operatingRoutes = operatingRoutesRes.body.aggregations.unique_route.value
    const minMax = this.getMinAndMax(zScore);
    const averageStandardScore = this.getAverage(zScore);
    const result = {
      operatingRoutes,
      minStandardScore: this.getSafeValue(minMax.min),
      maxStandardScore: this.getSafeValue(minMax.max),
      averageStandardScore,
      ...statistics1
    }

    return result;
  }

  async calculateMetricsForStatistic(
    searchVehicleForStatisticsDto: SearchVehicleForStatisticsDto,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = this.buildMustQueries(searchVehicleForStatisticsDto);
    const dateRanges = this.generateDateRangesForStatistics(searchVehicleForStatisticsDto.startDate, searchVehicleForStatisticsDto.endDate);

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          ...mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration
        } = this.extractMetricsForStatistics(result);
        const manualCollectDistance = await this.manualCollectService.manualCollectDistance(searchVehicleForStatisticsDto.routeName, schema);
        const weight = 2.4;
        const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
        const collectCount = await this.getCollectMetrics(
          dispatch_no,
          date,
          schema
        )

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

        return {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
          manualCollectDistance,
          manualCollectTime
        };
      }),
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);

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
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0]
    };

    return latest;
  }

  getSafeValue = (value: any) => {
    return value !== undefined && value !== null ? parseFloat(value.toFixed(3)) : 0;
  };

  private generateDateRangesForStatistics(startDate: string, endDate: string) {
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');
    const totalDays = end.diff(start, 'days'); // Tính số ngày giữa startDate và endDate

    return Array.from({ length: totalDays + 1 }, (_, i) => ({
      date: start.clone().add(i, 'days').format('YYYY-MM-DD'),
    }));
  }

  private extractMetricsForStatistics(aggregations: any) {
    const metrics = aggregations.all_drive_metrics.buckets.all;

    return {
      distanceRatios: this.getSafeValue(metrics.distance_ratios?.value),
      collectDistance: this.getSafeValue(metrics.trip_distance_mode_5?.total_trip_distance?.value),
      otherDistance: this.getSafeValue(metrics.trip_distance_other_modes?.total_trip_distance?.value),
      durationRatios: this.getSafeValue(metrics.duration_ratios?.value),
      collectDuration: this.getSafeValue(metrics.collect_duration?.value),
      otherDuration: this.getSafeValue(metrics.other_duration?.value),
    };
  }

  private calculateEWMetricsForStatistics(metricsArray: any[]) {
    const alpha = 0.1;
    return {
      distanceRatios: this.calculateEWM(metricsArray.map((m) => m.distanceRatios), alpha),
      collectDistance: this.calculateEWM(metricsArray.map((m) => m.collectDistance), alpha),
      otherDistance: this.calculateEWM(metricsArray.map((m) => m.otherDistance), alpha),
      durationRatios: this.calculateEWM(metricsArray.map((m) => m.durationRatios), alpha),
      collectDuration: this.calculateEWM(metricsArray.map((m) => m.collectDuration), alpha),
      otherDuration: this.calculateEWM(metricsArray.map((m) => m.otherDuration), alpha),
      collectCount: this.calculateEWM(metricsArray.map((m) => m.collectCount), alpha),
      manualCollectDistance: this.calculateEWM(metricsArray.map((m) => m.manualCollectDistance), alpha),
      manualCollectTime: this.calculateEWM(metricsArray.map((m) => m.manualCollectTime), alpha),
    };
  }

  private calculateForStatistics(metricsArray: any[]) {
    return {
      mean: {
        distanceRatios: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.distanceRatios))),
        collectDistance: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectDistance))),
        otherDistance: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.otherDistance))),
        durationRatios: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.durationRatios))),
        collectDuration: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectDuration))),
        otherDuration: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.otherDuration))),
        collectCount: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.collectCount))),
        manualCollectDistance: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.manualCollectDistance))),
        manualCollectTime: this.getSafeValue(this.safeMean(metricsArray.map((m) => m.manualCollectTime))),
      },
      standardDeviation: {
        distanceRatios: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.distanceRatios))),
        collectDistance: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectDistance))),
        otherDistance: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.otherDistance))),
        durationRatios: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.durationRatios))),
        collectDuration: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectDuration))),
        otherDuration: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.otherDuration))),
        collectCount: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.collectCount))),
        manualCollectDistance: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.manualCollectDistance))),
        manualCollectTime: this.getSafeValue(this.safeStd(metricsArray.map((m) => m.manualCollectTime))),
      },
    };
  }

  // Collection Statistics
  async calculateCollectionStatistics(searchForStatisticsDto: SearchForStatisticsDto, schema: string) {
    try {
      // Execute main queries
      const totalOperated = await this.getTotalOperated(this.openSearchClient, searchForStatisticsDto.startDate, searchForStatisticsDto.endDate, schema)
      const totalCollectMetric = await this.getTotalCollectMetric(this.openSearchClient, searchForStatisticsDto, schema);

      // Parse results
      const totalOperatedCount = totalOperated.body.aggregations.unique_dispatch_no_count.value;
      const totalAggs = totalCollectMetric.body.aggregations;
      // Return the formatted result
      return this.formatResult(totalAggs, totalOperatedCount);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Helper to execute the total collect metric query
  async getTotalCollectMetric(client: any, searchForStatisticsDto: SearchForStatisticsDto, schema: string) {
    const query = this.buildQuery(searchForStatisticsDto.startDate, searchForStatisticsDto.endDate, schema);

    return await client.search(query);
  };

  // Helper to execute the total operated query
  async getTotalOperated(client: any, startDate: string, endDate: string, schema) {
    const mustQueries = [{ match: { topic: 'collect_metrics' } }];

    const rangeQuery = this.createRangeQueryDataSet(startDate, endDate, 'data.timestamp');
    mustQueries.push(rangeQuery);
    const query = {
      index: this.getSchema('collect_metrics', schema),
      body: {
        size: 0,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        aggs: { unique_dispatch_no_count: { cardinality: { field: 'data.dispatch_no.keyword' } } },
      },
    };

    return await client.search(query);
  };
  // Helper to build the main query
  buildQuery(startDate: string, endDate: string, schema: string) {
    const mustQueries = [{ match: { topic: 'collect_metrics' } }];

    const rangeQuery = this.createRangeQueryDataSet(startDate, endDate, 'data.timestamp');
    mustQueries.push(rangeQuery);
    const query = {
      index: this.getSchema('collect_metrics', schema),
      body: {
        size: 0,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        aggs: this.buildAggregationsCollectionStatistics(),
      },
    };
    return query
  }

  // Build aggregation query
  buildAggregationsCollectionStatistics = () => ({
    total_5L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.5L_gen'].length > 0) { state.sum += doc['data.5L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_10L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.10L_gen'].length > 0) { state.sum += doc['data.10L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_10L_reu: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.10L_reu'].length > 0) { state.sum += doc['data.10L_reu'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_20L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.20L_gen'].length > 0) { state.sum += doc['data.20L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_20L_reu: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.20L_reu'].length > 0) { state.sum += doc['data.20L_reu'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_30L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.30L_gen'].length > 0) { state.sum += doc['data.30L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_50L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.50L_gen'].length > 0) { state.sum += doc['data.50L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_50L_pub: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.50L_pub'].length > 0) { state.sum += doc['data.50L_pub'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_75L_gen: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.75L_gen'].length > 0) { state.sum += doc['data.75L_gen'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_75L_pub: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.75L_pub'].length > 0) { state.sum += doc['data.75L_pub'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_ext: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.ext'].length > 0) { state.sum += doc['data.ext'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_etc: {
      scripted_metric: {
        init_script: "state.sum = 0;",
        map_script: "if (doc['data.etc'].length > 0) { state.sum += doc['data.etc'][0]; }",
        combine_script: "return state.sum;",
        reduce_script: "double total = 0; for (s in states) { total += s; } return total;"
      }
    },
    total_fields: this.buildTotalFieldsScript(),
    max_value: this.buildMaxScript(),
    min_value: this.buildMinScript(),
  });

  // Script for total fields aggregation
  buildTotalFieldsScript = () => ({
    sum: {
      script: {
        source: `
          long sum = 0;
          sum += doc['data.5L_gen'].value;
          sum += doc['data.10L_gen'].value;
          sum += doc['data.10L_reu'].value;
          sum += doc['data.20L_gen'].value;
          sum += doc['data.20L_reu'].value;
          sum += doc['data.30L_gen'].value;
          sum += doc['data.50L_gen'].value;
          sum += doc['data.50L_pub'].value;
          sum += doc['data.75L_gen'].value;
          sum += doc['data.75L_pub'].value;
          sum += doc['data.ext'].value;
          sum += doc['data.etc'].value;
          return sum;
        `,
        lang: 'painless',
      },
    },
  });

  // Script for max value aggregation
  buildMaxScript = () => ({
    max: {
      script: {
        source: `
          double maxVal = doc['data.5L_gen'].value;
          maxVal = Math.max(maxVal, doc['data.10L_gen'].value);
          maxVal = Math.max(maxVal, doc['data.10L_reu'].value);
          maxVal = Math.max(maxVal, doc['data.20L_gen'].value);
          maxVal = Math.max(maxVal, doc['data.20L_reu'].value);
          maxVal = Math.max(maxVal, doc['data.30L_gen'].value);
          maxVal = Math.max(maxVal, doc['data.50L_gen'].value);
          maxVal = Math.max(maxVal, doc['data.50L_pub'].value);
          maxVal = Math.max(maxVal, doc['data.75L_gen'].value);
          maxVal = Math.max(maxVal, doc['data.75L_pub'].value);
          maxVal = Math.max(maxVal, doc['data.ext'].value);
          maxVal = Math.max(maxVal, doc['data.etc'].value);
          return maxVal;
        `,
        lang: 'painless',
      },
    },
  });

  // Script for min value aggregation
  buildMinScript = () => ({
    min: {
      script: {
        source: `
          double minVal = doc['data.5L_gen'].value;
          minVal = Math.min(minVal, doc['data.10L_gen'].value);
          minVal = Math.min(minVal, doc['data.10L_reu'].value);
          minVal = Math.min(minVal, doc['data.20L_gen'].value);
          minVal = Math.min(minVal, doc['data.20L_reu'].value);
          minVal = Math.min(minVal, doc['data.30L_gen'].value);
          minVal = Math.min(minVal, doc['data.50L_gen'].value);
          minVal = Math.min(minVal, doc['data.50L_pub'].value);
          minVal = Math.min(minVal, doc['data.75L_gen'].value);
          minVal = Math.min(minVal, doc['data.75L_pub'].value);
          minVal = Math.min(minVal, doc['data.ext'].value);
          minVal = Math.min(minVal, doc['data.etc'].value);
          return minVal;
        `,
        lang: 'painless',
      },
    },
  });

  formatValue = (val: any, precision = 3) => {
    if (val === null || val === undefined || isNaN(val)) {
      return 0; // Trả về số 0 nếu giá trị không hợp lệ
    }
    const factor = Math.pow(10, precision);
    return Math.round(Number(val) * factor) / factor; // Làm tròn số mà không chuyển đổi thành chuỗi
  };


  // Format the final result with total and average values
  formatResult = (totalAggs: any, totalOperatedCount: number) => {
    return {
      total: {
        collectAmount: this.formatValue(totalAggs.total_fields.value),
        weight: 32.542,
        max: this.formatValue(totalAggs.max_value.value),
        min: this.formatValue(totalAggs.min_value.value),
        ...this.mapAggregations(totalAggs),
      },
      average: {
        collectAmount: this.formatValue(totalAggs.total_fields.value / totalOperatedCount),
        weight: this.formatValue(32.542 / totalOperatedCount),
        max: this.formatValue(totalAggs.max_value.value),
        min: this.formatValue(totalAggs.min_value.value),
        ...this.mapAggregations(totalAggs, totalOperatedCount),
      },
    };
  };

  // Utility to map aggregations to the result
  mapAggregations = (aggregations: any, divisor = 1) => ({
    '5L_gen': this.formatValue(aggregations.total_5L_gen.value / divisor),
    '10L_gen': this.formatValue(aggregations.total_10L_gen.value / divisor),
    '10L_reu': this.formatValue(aggregations.total_10L_reu.value / divisor),
    '20L_gen': this.formatValue(aggregations.total_20L_gen.value / divisor),
    '20L_reu': this.formatValue(aggregations.total_20L_reu.value / divisor),
    '30L_gen': this.formatValue(aggregations.total_30L_gen.value / divisor),
    '50L_gen': this.formatValue(aggregations.total_50L_gen.value / divisor),
    '50L_pub': this.formatValue(aggregations.total_50L_pub.value / divisor),
    '75L_gen': this.formatValue(aggregations.total_75L_gen.value / divisor),
    '75L_pub': this.formatValue(aggregations.total_75L_pub.value / divisor),
    'ext': this.formatValue(aggregations.total_ext.value / divisor),
    'etc': this.formatValue(aggregations.total_etc.value / divisor),
  });

  // Centralized error handling
  handleError = (error: any) => {
    console.error('OpenSearch query error:', error.message, error.stack);
    throw new Error('Failed to calculate collection volume.');
  };

  // Data Set: Other Distance & Other Time
  getNumberOfDays(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime(); // Chuyển đổi ngày sang số milliseconds
    const end = new Date(endDate).getTime(); // Chuyển đổi ngày sang số milliseconds

    if (isNaN(start) || isNaN(end)) {
      return null
    }

    // Tính toán số thời gian giữa 2 ngày (milliseconds)
    const timeDifference = end - start;

    // Chuyển đổi từ milliseconds sang số ngày
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

    // Trả về số ngày giữa 2 ngày, thêm 1 để tính luôn cả ngày end
    return dayDifference + 1;
  }

  async getDriveMetricsWidgetDataSet(searchOtherStatisticsDto: SearchOtherStatisticsDto, schema: string) {
    const { routeNames, startDate, endDate } = searchOtherStatisticsDto;
    if (searchOtherStatisticsDto.statisticMode === 'collectCount') {
      const allVehicleMetrics = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
      const allVehicleData = allVehicleMetrics.map((vehicleData) => vehicleData.route_name);
      const routeName = routeNames ? convertToArray(routeNames) : allVehicleData; // Mảng routeName
      let result = {};
      await Promise.all(routeName.map(async (routeName1) => {
        const dispatchNo = await this.getDispatchNoByRouteName(routeName1, schema);
        const reuto = await this.getCollectMetricsForWidget(routeName1, dispatchNo, startDate, endDate, schema);
        result[routeName1] = {
          ...reuto
        }
      }))
      return result
    } else {
      const query = this.buildQueryDataSet(searchOtherStatisticsDto);
      const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
      return this.parseResponseDataSet(response, searchOtherStatisticsDto.statisticMode, startDate, endDate, schema);
    }
  }

  async getCollectMetricsForWidget(routeName: string, dispatchNo: string, startDate: string, endDate: string, schema: string) {
    const mustQueries = [];
    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: `${startDate}T11:00:00`,
          lte: `${endDate}T11:00:00`,
        },
      },
    })

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      "aggs": {
        trips_by_time: {
          date_histogram: {
            field: "data.timestamp",
            interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: {
            by_route: {
              terms: { field: 'data.section_name.keyword', size: 10 },
              aggs: {
                "total_sum": {
                  "sum": {
                    "script": {
                      "source": `
                        long sum = 0;
                        sum += doc['data.5L_gen'].value;
                        sum += doc['data.10L_gen'].value;
                        sum += doc['data.10L_reu'].value;
                        sum += doc['data.20L_gen'].value;
                        sum += doc['data.20L_reu'].value;
                        sum += doc['data.30L_gen'].value;
                        sum += doc['data.50L_gen'].value;
                        sum += doc['data.50L_pub'].value;
                        sum += doc['data.75L_gen'].value;
                        sum += doc['data.75L_pub'].value;
                        sum += doc['data.ext'].value;
                        sum += doc['data.etc'].value;
                        return sum;
                      `,
                      "lang": "painless"
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return this.calculateCollectCount(routeName, result.body.aggregations.trips_by_time.buckets, startDate, endDate);
  }

  private calculateCollectCount(routeName1, buckets, startDate: string, endDate: string) {
    const numberOfDays = this.getNumberOfDays(startDate, endDate);
    const routeMap = {};

    // Kiểm tra nếu buckets có tồn tại và không rỗng
    if (!buckets || buckets.length === 0) {
      return { collect: [] }; // Trả về kết quả trống nếu không có dữ liệu
    }

    let newArray = [];

    // Duyệt qua các buckets (từng route)
    buckets.forEach(route => {
      // Kiểm tra subRoute trong bucket và tạo sections nếu có
      const sections = (route.by_route?.buckets || []).map(subRoute => ({
        section_name: subRoute.key,
        total: subRoute.total_sum?.value || 0,
        average: (subRoute.total_sum?.value || 0) / (numberOfDays || 1) // Tính average dựa trên doc_count
      }));

      // Gộp các section có cùng section_name
      sections.forEach(section => {
        const existingSection = newArray.find(item => item.section_name === section.section_name);
        if (existingSection) {
          // Cộng dồn giá trị nếu đã có section với cùng section_name
          existingSection.total += section.total;
          existingSection.average = (existingSection.average + section.average) / numberOfDays; // Cập nhật average theo cách đơn giản
        } else {
          // Thêm section mới nếu chưa tồn tại
          newArray.push({ ...section });
        }
      });
    });

    // Loại bỏ các mảng rỗng (nếu có)
    newArray = newArray.filter(section => section.total > 0);

    // Tính tổng và tổng trung bình của tất cả các sections
    const totalOfAll = newArray.reduce((sum, section) => sum + section.total, 0);
    const totalOfAllAverage = numberOfDays > 0
      ? newArray.reduce((sum, section) => sum + section.average, 0) / numberOfDays
      : 0;

    // Lưu kết quả vào routeMap
    routeMap[routeName1] = {
      sections: newArray,
      totalOfAll,
      totalOfAllAverage
    };

    return {
      collect: Object.keys(routeMap).map(routeName => ({
        route_name: routeName, // routeName1 ở đây là tên gốc của route
        sections: routeMap[routeName].sections,
        totalOfAll: routeMap[routeName].totalOfAll,
        totalOfAllAverage: routeMap[routeName].totalOfAllAverage
      }))
    };
  }

  async getTotalTripByDriveMode(client: any, metric: 'trip_time' | 'trip_distance', startDate, endDate, schema: string) {
    const scriptForTripTime = `
      if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
        String tripTime = doc['data.trip_time.keyword'].value;
        int colon1 = tripTime.indexOf(':');
        int colon2 = tripTime.lastIndexOf(':');
        if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
          double hours = Double.parseDouble(tripTime.substring(0, colon1));
          double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
          double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
          return (hours * 60) + minutes + (seconds / 60.0);
        }
      }
      return 0;
    `;
    const aggregationForDriveMode = (driveMode: number) => ({
      filter: {
        term: { 'data.drive_mode': driveMode },
      },
      aggs: {
        total_time: {
          sum: metric === 'trip_time'
            ? { script: { source: scriptForTripTime, lang: 'painless' } }
            : { field: `data.${metric}` }
        },
      },
    });

    const query = {
      size: 0,
      query: {
        bool: {
          filter: [
            { range: { 'data.drive_mode': { gte: 0, lte: 8 } } },
            { range: { 'data.timestamp': { "time_zone": "+00:00", gte: startDate + 'T11:00:00', lte: endDate + 'T11:00:00' } } },
            { bool: { must_not: { term: { 'data.drive_mode': 5 } } } }
          ],
        },
      },
      aggs: {
        total_drive_mode_0: aggregationForDriveMode(0),
        total_drive_mode_1: aggregationForDriveMode(1),
        total_drive_mode_2: aggregationForDriveMode(2),
        total_drive_mode_3: aggregationForDriveMode(3),
        total_drive_mode_4: aggregationForDriveMode(4),
        total_drive_mode_6: aggregationForDriveMode(6),
        total_drive_mode_7: aggregationForDriveMode(7),
        total_drive_mode_8: aggregationForDriveMode(8),
      },
    };

    const response = await client.search({
      index: this.getSchema('drive_metrics', schema),
      body: query,
    });
    const operatingRoutes = (await this.getOperatingRoutes(this.openSearchClient, startDate, endDate, schema)).body.aggregations.unique_route.value;

    const driveModes = [
      { key: 'total_drive_mode_0', label: 'otherNotSelected' },
      { key: 'total_drive_mode_1', label: 'goingToCollectionArea' },
      { key: 'total_drive_mode_2', label: 'goingToTheLandfill' },
      { key: 'total_drive_mode_3', label: 'returnToGarage' },
      { key: 'total_drive_mode_4', label: 'goingToRestaurant' },
      { key: 'total_drive_mode_6', label: 'idling' },
      { key: 'total_drive_mode_7', label: 'notManaged' },
      { key: 'total_drive_mode_8', label: 'outOfControl' },
    ];
    const totalOfAllSum = driveModes.reduce((sum, mode) => sum + response.body.aggregations[`${mode.key}`].total_time.value, 0);

    const totalOfAllAverage = driveModes.reduce((sum, mode) =>
      sum + (response.body.aggregations[`${mode.key}`].total_time.value / operatingRoutes), 0
    );

    const result = {
      routeName: "all",
      totalOfAllSum,
      totalOfAllAverage,
    };

    driveModes.forEach(mode => {
      result[`${mode.label}_sum`] = response.body.aggregations[`${mode.key}`].total_time.value;
      result[`${mode.label}_average`] = response.body.aggregations[`${mode.key}`].total_time.value / operatingRoutes;
    });

    return result;
  }

  private buildQueryDataSet(searchOtherStatisticsDto: SearchOtherStatisticsDto) {
    const mustQueries: any[] = [
      ...(searchOtherStatisticsDto.routeNames?.length ? [{ terms: { 'data.route_name.keyword': convertToArray(searchOtherStatisticsDto.routeNames) } }] : []),
      this.createRangeQueryDataSet(searchOtherStatisticsDto.startDate, searchOtherStatisticsDto.endDate, 'data.timestamp'),
    ];

    if (['otherDuration', 'otherDistance'].includes(searchOtherStatisticsDto.statisticMode)) {
      this.addDriveModeFilters(mustQueries);
    }

    return {
      size: 0,
      query: { bool: { must: mustQueries } },
      aggs: this.getAggregationsByMode(searchOtherStatisticsDto.statisticMode),
    };
  }

  private addDriveModeFilters(mustQueries: any[]) {
    mustQueries.push(
      { range: { 'data.drive_mode': { gte: 0, lte: 8 } } },
      { bool: { must_not: { term: { 'data.drive_mode': 5 } } } }
    );
  }

  private getAggregationsByMode(statisticMode: string) {
    const aggregations = {
      otherDuration: this.buildAggregationsDataSetOther('time'),
      otherDistance: this.buildAggregationsDataSetOther('distance'),
      collectDuration: this.buildAggregationsDataSetCollect('time'),
      collectDistance: this.buildAggregationsDataSetCollect('distance'),
    };
    return aggregations[statisticMode] || {};
  }

  private createRangeQueryDataSet(startDate: string, endDate: string, field: any): any {
    const formattedStartDate = startDate ? `${startDate}T11:00:00` : 'now/d';
    const formattedEndDate = endDate ? `${endDate}T11:00:00` : 'now';

    return {
      range: {
        [field]: {
          "time_zone": "+00:00",
          gte: formattedStartDate,
          lte: formattedEndDate
        }
      }
    };
  }

  private buildAggregationsDataSetOther(type: string) {
    const field = type === 'time' ? null : 'data.trip_distance';
    const script = type === 'time' ? this.buildTimeScript() : null;

    return {
      by_route: {
        terms: { field: 'data.route_name.keyword', size: 10 },
        aggs: {
          total: {
            sum: {
              ...(script ? { script: { source: script, lang: 'painless' } } : { field }), // Sử dụng script nếu là time, ngược lại dùng field cho distance
            },
          },
          ...this.buildDriveModeAggregations(type),
        },
      },
    };
  }

  private buildAggregationsDataSetCollect(type: string) {
    const field = type === 'time' ? 'data.trip_time.keyword' : 'data.trip_distance';
    return {
      by_route: {
        terms: {
          field: 'data.route_name.keyword',
          size: 10,
        },
        aggs: {
          by_route: {
            terms: { field: 'data.section_name.keyword', size: 10 },
            aggs: {
              total_drive_mode_5: {
                filter: { term: { 'data.drive_mode': 5 } },
                aggs: {
                  total: {
                    ...(type === 'time'
                      ? {
                        sum: {
                          script: {
                            source: this.buildTimeScript(),
                            lang: 'painless',
                          },
                        },
                      }
                      : { sum: { field } }),
                  },
                },
              },
            },
          },
        }
      }
    }
  }


  private buildDriveModeAggregations(type: string) {
    const field = type === 'time' ? 'data.trip_time.keyword' : 'data.trip_distance';
    const modes = [0, 1, 2, 3, 4, 6, 7, 8];
    return Object.fromEntries(modes.map((mode) => [
      `total_drive_mode_${mode}`,
      {
        filter: { term: { 'data.drive_mode': mode } },
        aggs: {
          total: {
            ...(type === 'time'
              ? {
                sum: {
                  script: {
                    source: this.buildTimeScript(),
                    lang: 'painless',
                  },
                },
              }
              : { sum: { field } }),
          },
        },
      },
    ]));
  }

  private buildTimeScript() {
    return `
      if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
        String tripTime = doc['data.trip_time.keyword'].value;
        int colon1 = tripTime.indexOf(':');
        int colon2 = tripTime.lastIndexOf(':');
        if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
          double hours = Double.parseDouble(tripTime.substring(0, colon1));
          double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
          double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
          return (hours * 60) + minutes + (seconds / 60.0);
        }
      }
      return 0;
    `;
  }

  async parseResponseDataSet(response, statisticMode, startDate, endDate, schema) {
    // const operatingRoutes = (await this.getOperatingRoutes(this.openSearchClient,  startDate, endDate)).body.aggregations.unique_route.value;
    const numberOfDays = this.getNumberOfDays(startDate, endDate)
    // Kiểm tra nếu statisticMode không tồn tại hoặc không phải là chuỗi
    if (!statisticMode || typeof statisticMode !== 'string') {
      return null; // Trả về null nếu statisticMode không hợp lệ
    }

    // Gọi hàm getTotalTripByDriveMode để lấy dữ liệu tổng
    const totalDriveModeData = await this.getTotalTripByDriveMode(
      this.openSearchClient,
      statisticMode.includes('otherDuration') ? 'trip_time' : 'trip_distance',
      startDate, endDate,
      schema
    );

    // Kiểm tra điều kiện của statisticMode
    if (['otherDuration', 'otherDistance'].includes(statisticMode)) {
      return this.calculateOtherMetrics(response.body.aggregations.by_route.buckets, numberOfDays, totalDriveModeData);
    } else if (['collectDuration', 'collectDistance'].includes(statisticMode)) {
      return this.calculateCollectMetrics(response.body.aggregations.by_route.buckets, numberOfDays);
    }

    // Trường hợp không thỏa điều kiện nào
    return null;
  }


  private calculateOtherMetrics(buckets, numberOfDays, totalDriveModeData) {
    const driveModes = [
      { key: 'total_drive_mode_0', label: 'otherNotSelected' },
      { key: 'total_drive_mode_1', label: 'goingToCollectionArea' },
      { key: 'total_drive_mode_2', label: 'goingToTheLandfill' },
      { key: 'total_drive_mode_3', label: 'returnToGarage' },
      { key: 'total_drive_mode_4', label: 'goingToRestaurant' },
      { key: 'total_drive_mode_6', label: 'idling' },
      { key: 'total_drive_mode_7', label: 'notManaged' },
      { key: 'total_drive_mode_8', label: 'outOfControl' },
    ];

    // Biến chứa các kết quả của từng route
    const routeResults = buckets.map(route => {
      const result: {
        routeName: any;
        totalOfAllSum: number;
        totalOfAllAverage: number;
        [key: string]: any;
      } = {
        routeName: route.key,
        totalOfAllSum: 0,
        totalOfAllAverage: 0,
      };

      let totalOfAllSum = 0;
      let totalOfAllAverage = 0;

      driveModes.forEach(mode => {
        const sumValue = route[mode.key]?.total?.value || 0;
        const averageValue = numberOfDays > 0 ? sumValue / numberOfDays : 0;

        result[`${mode.label}_sum`] = sumValue;
        result[`${mode.label}_average`] = averageValue;

        totalOfAllSum += sumValue;
        totalOfAllAverage += averageValue;
      });

      result.totalOfAllSum = totalOfAllSum;
      result.totalOfAllAverage = totalOfAllAverage;

      return result;
    });

    return {
      total: totalDriveModeData,
      routes: routeResults
    };
  }

  private calculateCollectMetrics(buckets, numberOfDays) {
    const routeMap = {};

    // Duyệt qua các route và subRoute để tạo kết quả
    buckets.forEach(route => {
      const routeName = route.key;
      const sections = route.by_route?.buckets.map(subRoute => ({
        section_name: subRoute.key,
        total: subRoute.total_drive_mode_5?.total?.value || 0,
        average: (subRoute.total_drive_mode_5?.total?.value || 0) / numberOfDays || 0
      })) || [];

      // Tính tổng của tất cả các sections trong route này
      const totalOfAll = sections.reduce((sum, section) => sum + section.total, 0);
      const totalOfAllAverage = sections.reduce((sum, section) => sum + section.average, 0) / sections.length;

      // Lưu vào map
      routeMap[routeName] = {
        sections,
        totalOfAll,
        totalOfAllAverage
      };
    });

    // Trả về object có cấu trúc đúng
    return {
      collect: Object.keys(routeMap).map(routeName => ({
        route_name: routeName,
        sections: routeMap[routeName].sections,
        totalOfAll: routeMap[routeName].totalOfAll,
        totalOfAllAverage: routeMap[routeName].totalOfAllAverage
      }))
    }
  }


  async getDispatchNoByRouteName(routeName: string, schema: string) {
    const index = this.getSchema('drive_metrics', schema);

    const queryBody = {
      size: 1,
      query: {
        bool: {
          must: [
            {
              match: {
                'data.route_name.keyword': routeName,
              },
            },
          ],
        },
      },
    };

    const result = await this.openSearchClient.search({
      index,
      body: queryBody,
    });

    const hit = result.body.hits.hits[0];

    return hit?._source?.data?.dispatch_no ?? null; // Trả về null nếu không tìm thấy
  }

  async getSectionDriveMode5(routeName: string, schema: string) {
    const query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                'data.route_name.keyword': [routeName],
              },
            },
          ],
        },
      },
      aggs: {
        by_route: {
          terms: {
            field: 'data.section_name.keyword',
          },
          aggs: {
            total_drive_mode_5_distance: {
              filter: {
                term: { 'data.drive_mode': 5 },
              },
              aggs: {
                total_trip_distance: { sum: { field: 'data.trip_distance' } },
              },
            },
          },
        },
      },
    };

    try {
      const response = await this.openSearchClient.search({
        index: this.getSchema('drive_metrics', schema),
        body: query,
      });
      return response.body.aggregations.by_route.buckets.map((m) => {
        return { sectionName: m.key, data: m.total_drive_mode_5_distance.total_trip_distance.value }
      }); // Trả về kết quả từ OpenSearch
    } catch (error) {
      console.error('Error fetching drive metrics:', error);
      throw error; // Xử lý lỗi nếu cần
    }
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Core DataSet
  // Header Core Dataset
  getSafeValueCoreDataSet = (value: any) => {
    return value !== undefined && value !== 0 ? parseFloat(value.toFixed(3)) : null;
  };

  classifyRankCoreDataSet(scores: number[], coreDataSetDto: CoreDataSetDto): string[] {
    const { percentageAE, percentageBD, percentageC } = coreDataSetDto;
    if (scores.length === 0 || scores.every(score => isNaN(score))) {
      return [];  // Trả về mảng rỗng nếu không có giá trị hoặc tất cả giá trị là NaN
    }

    const validScores = scores.filter(score => !isNaN(score));
    const total = validScores.length;

    // Sắp xếp các giá trị theo thứ tự tăng dần
    const scoresSorted = [...validScores].sort((a, b) => a - b);

    if (total <= 5) {
      const rankLetters = ['A', 'B', 'C', 'D', 'E'];
      return validScores.map(score => {
        const position = scoresSorted.indexOf(score);
        return rankLetters[position];
      });
    }

    // Tính toán các điểm phân chia dựa trên tỷ lệ truyền vào
    const aEnd = Math.floor(percentageAE * total);
    const bEnd = Math.floor((percentageAE + percentageBD) * total);  // A(percentageAE) + B(percentageBD)
    const cEnd = Math.floor((percentageAE + percentageBD + percentageC) * total);  // A + B + C
    const dEnd = Math.floor((percentageAE + 2 * percentageBD + percentageC) * total);  // A + B + C + D

    return validScores.map(score => {
      // Tìm vị trí của `score` trong danh sách đã sắp xếp
      const position = scoresSorted.indexOf(score);

      if (position < aEnd) {
        return 'A';
      } else if (position < bEnd) {
        return 'B';
      } else if (position < cEnd) {
        return 'C';
      } else if (position < dEnd) {
        return 'D';
      } else {
        return 'E';
      }
    });
  }

  private async extractMetricsForCoreDataSet(aggregations: any, dispatchNo: string, date: string, schema: string) {
    const metrics = aggregations.all_drive_metrics.buckets.all;
    const collectCount = await this.getCollectMetrics(
      dispatchNo,
      date,
      schema
    )
    return {
      distanceRatios: this.getSafeValueCoreDataSet(metrics.distance_ratios?.value),
      collectDistance: this.getSafeValueCoreDataSet(metrics.trip_distance_mode_5?.total_trip_distance?.value),
      otherDistance: this.getSafeValueCoreDataSet(metrics.trip_distance_other_modes?.total_trip_distance?.value),
      durationRatios: this.getSafeValueCoreDataSet(metrics.duration_ratios?.value),
      collectDuration: this.getSafeValueCoreDataSet(metrics.collect_duration?.value),
      otherDuration: this.getSafeValueCoreDataSet(metrics.other_duration?.value),
      collectCount
    };
  }

  async classifyRankForRouteCoreDataSet(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName, startDate, endDate } = coreDataSetDto
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);

    const allVehicleMetrics = await Promise.all(
      allVehicleData.map(async (vehicleData) => {
        const metrics = await this.calculateMetricsWithStatsLatestCoreDataSet(
          routeName, startDate, endDate,
          vehicleData.dispatch_no,
          schema
        );
        return { route_name: vehicleData.route_name, metrics };
      }),
    );

    const allMetricsArray = allVehicleMetrics.map(v => v.metrics);

    // Tính toán các chỉ số thống kê cho tất cả các xe
    const statistics = this.calculateStatistics(allMetricsArray);
    // Tính toán EWM cho tất cả các x

    // Tính toán zScores cho tất cả các xe
    const zDistanceRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(allVehicleMetrics.map(v => v.metrics.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(allVehicleMetrics.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);

    // Tính toán Weighted Sum
    const rankScores = this.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      coreDataSetDto
    );

    const allRanks = this.classifyRankCoreDataSet(rankScores, coreDataSetDto);
    console.log(routeName);
    
    // Phân loại rank cho mỗi xe
    const vehicleIndex = allVehicleMetrics.findIndex(v => v.route_name === routeName);
    if (vehicleIndex !== -1) {
      return {
        route_name: routeName,
        rankScore: allRanks[vehicleIndex],
      };
    } else {
      return {
        route_name: routeName,
        rankScore: 'Not Found',  // Hoặc xử lý khác nếu xe không được tìm thấy
      };
    }
  }

  async calculateMetricsWithStatsLatestCoreDataSet(
    routeName: string,
    startDate: string,
    endDate: string,
    dispatch_no: string,
    schema: string
  ) {
    const mustQueries = { term: { 'data.route_name.keyword': routeName } }
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
        } = this.extractMetrics(result);

        const collectCount = await this.getCollectMetrics(
          dispatch_no,
          date,
          schema
        )

        if (
          distanceRatios === 0 &&
          durationRatios === 0 &&
          collectDistance === 0 &&
          collectDuration === 0 &&
          collectCount === 0
        ) {
          return null; // Loại bỏ các giá trị không mong muốn
        }

        return {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
          collectCount,
        };
      }),
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);

    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetrics(oneMetric);

    const result = {
      distanceRatios: ewmOneMetric.ewmDistanceRatios.slice(-1)[0],
      durationRatios: ewmOneMetric.ewmDurationRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.ewmCollectDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.ewmCollectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.ewmCollectCount.slice(-1)[0],
      manualCollectTime: ewmOneMetric.ewmManualCollectTime.slice(-1)[0],
    };

    return result;
  }

  private calculateWeightedSumCoreDataSet(
    zDistanceRatios: number[],
    zDurationRatios: number[],
    zCollectDistances: number[],
    zCollectDurations: number[],
    zCollectCounts: number[],
    zManualCollectTime: number[],
    coreDataSetDto: CoreDataSetDto
  ): number[] {
    const {
      distanceRatioRate,
      durationRatioRate,
      collectDistanceRate,
      collectDurationRate,
      collectCountRate,
      manualCollectTimeRate,
    } = coreDataSetDto;
    const zRankScores: number[] = [];
  
    for (let i = 0; i < zDistanceRatios.length; i++) {
      const weightedSum = Math.abs(
        distanceRatioRate * 0.10 * zDistanceRatios[i] +
        durationRatioRate * 0.10 * zDurationRatios[i] +
        collectDistanceRate * 0.10 * zCollectDistances[i] +
        collectDurationRate * 0.10 * zCollectDurations[i] +
        collectCountRate * 0.10 * zCollectCounts[i] +
        manualCollectTimeRate * 0.10 * zManualCollectTime[i]
      );
  
      zRankScores.push(weightedSum);
    }
  
    return zRankScores.filter(score => !isNaN(score));
  }
  
  async calculateMainDataCoreDataSet(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName, startDate, endDate, pValue } = coreDataSetDto
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } }
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);
        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);
        const manualCollectDistance = await this.manualCollectService.manualCollectDistance(routeName, schema);
        const weight = 2.4;
        const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
        if (
          distanceRatios === 0 &&
          collectDistance === 0 &&
          otherDistance === 0 &&
          durationRatios === 0 &&
          collectDuration === 0 &&
          otherDuration === 0 &&
          collectCount === 0 &&
          manualCollectTime
        ) {
          metricsMap[date] = null;
        } else {
          metricsMap[date] = {
            distanceRatios,
            collectDistance,
            otherDistance,
            durationRatios,
            collectDuration,
            otherDuration,
            collectCount,
            manualCollectTime
          };
        }

        return {
          date,
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
          manualCollectTime
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.calculateStatistics(oneMetric);
    const zDistanceRatios = this.calculateZScores(oneMetric.map(v => v.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(oneMetric.map(v => v.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(oneMetric.map(v => v.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(oneMetric.map(v => v.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(oneMetric.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);

    // Kiểm tra bất thường cho từng chỉ số Z
    const zScores = [zDistanceRatios, zDurationRatios, zCollectDistances, zCollectDurations, zCollectCounts];
    const anomalyResults = zScores.map(zScoreArray => zScoreArray.map(zValue => this.checkAnomaly(zValue, pValue)));

    const rankScores = this.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      coreDataSetDto
    );
    
    // const ewmOneMetric = this.calculateEWMForCoreDataSet(oneMetric, coreDataSetDto.alpha);
    const zScore = rankScores[rankScores.length - 1] * 20 + 100;
    const rank = await this.classifyRankForRouteCoreDataSet(coreDataSetDto, schema);

    // Sử dụng map để tạo dailyResults
    const dailyResults = dateRanges.map(({ date }) => {
      // Kiểm tra tất cả các trường trong metricsMap cho ngày này
      const metrics = metricsMap[date];
      if (
        metrics.distanceRatios === null &&
        metrics.collectDistance === null &&
        metrics.otherDistance === null &&
        metrics.durationRatios === null &&
        metrics.collectDuration === null &&
        metrics.otherDuration === null &&
        metrics.collectCount === null
      ) {
        return {
          [date]: null  // Gán null cho ngày này
        };
      } else {
        const index = dateRanges.findIndex(d => d.date === date);
        return {
          [date]: rankScores[index] || null  // Gán rankScore vào từng ngày
        };
      }
    });

    // Tính toán anomaly tổng thể từ kết quả kiểm tra
    const overallAnomaly = anomalyResults.some(anomalies => anomalies.includes(false));

    // Tạo đối tượng kết quả cuối cùng
    const result = {
      rating: rank.rankScore,  // Giá trị mẫu, có thể thay đổi theo logic khác
      diagnosis: overallAnomaly,  // Giá trị mẫu, có thể thay đổi theo logic khác
      EWM: zScore,  // Tính toán EWM dựa trên rankScores
      ...Object.assign({}, ...dailyResults)  // Trộn kết quả cho từng ngày
    };

    return result;
  }
  // End of Header Core Dataset

  // Body Core Dataset
  // Begin of distanceRatios, collectDistance, otherDistance, durationRatios, collectDuration, otherDuration, collectCount (No Expand)
  private calculateCDF(z: number): number {
    return 0.5 * (1 + Math.tanh(z / Math.sqrt(2)) * Math.sqrt(2 / Math.PI));
  }

  checkAnomaly(zValue: number, pValue: number = 0.05) {
    // Chuyển đổi Z-value thành z_probability
    const zProbability = 2 * (1 - this.calculateCDF(Math.abs(zValue)));  // kiểm tra hai phía

    // So sánh z_probability với p_value
    if (zProbability < pValue) {
      return false;
    } else {
      return true;
    }
  }

  private calculateEWMForCoreDataSet(metricsArray: any[], alpha: number = 0.1) {
    return {
      ewmDistanceRatios: this.calculateEWM(metricsArray.map((m) => m.distanceRatios), alpha),
      ewmCollectDistance: this.calculateEWM(metricsArray.map((m) => m.collectDistance), alpha),
      ewmOtherDistance: this.calculateEWM(metricsArray.map((m) => m.otherDistance), alpha),
      ewmDurationRatios: this.calculateEWM(metricsArray.map((m) => m.durationRatios), alpha),
      ewmCollectDuration: this.calculateEWM(metricsArray.map((m) => m.collectDuration), alpha),
      ewmOtherDuration: this.calculateEWM(metricsArray.map((m) => m.otherDuration), alpha),
      ewmCollectCount: this.calculateEWM(metricsArray.map((m) => m.collectCount), alpha),
      ewmManualCollectTime: this.calculateEWM(metricsArray.map((m) => m.manualCollectTime), alpha)
    };
  }

  async calculateEWMAllRoute(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName, startDate, endDate, alpha } = coreDataSetDto
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } }
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

        if (
          distanceRatios === 0 &&
          collectDistance === 0 &&
          otherDistance === 0 &&
          durationRatios === 0 &&
          collectDuration === 0 &&
          otherDuration === 0 &&
          collectCount === 0
        ) {
          return null;
        }

        return {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();
    const ewmOneMetric = this.calculateEWMForCoreDataSet(oneMetric, alpha);

    return {
      routeName: routeName,
      distanceRatios: ewmOneMetric.ewmDistanceRatios.slice(-1)[0],
      durationRatios: ewmOneMetric.ewmDurationRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.ewmCollectDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.ewmCollectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.ewmCollectCount.slice(-1)[0],
      otherDistance: ewmOneMetric.ewmOtherDistance.slice(-1)[0],
      otherDuration: ewmOneMetric.ewmOtherDuration.slice(-1)[0],
    }
  }

  async classifyRankBaseOnEWM(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName } = coreDataSetDto
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    // Kiểm tra nếu routeName được truyền vào
    const routeNames = routeName
      ? convertToArray(routeName)  // Nếu có routeName, chỉ dùng route đó
      : allVehicleMetrics;  // Nếu không, dùng tất cả các route

    let result = [];

    // Mảng để lưu trữ tất cả các chỉ số của các route
    let allDistanceRatios = [];
    let allOtherDistance = [];
    let allDurationRatios = [];
    let allCollectDistance = [];
    let allCollectDuration = [];
    let allOtherDuration = [];
    let allCollectCount = [];

    await Promise.all(routeNames.map(async (routeName) => {
      const updatedDto = { ...coreDataSetDto, routeName };
      const allMetrics = await this.calculateEWMAllRoute(updatedDto, schema);

      // Thu thập các giá trị cho từng chỉ số để phân loại sau
      allDistanceRatios.push(allMetrics.distanceRatios);
      allDurationRatios.push(allMetrics.durationRatios);
      allCollectDistance.push(allMetrics.collectDistance);
      allCollectDuration.push(allMetrics.collectDuration);
      allCollectCount.push(allMetrics.collectCount);
      allOtherDistance.push(allMetrics.otherDistance);
      allOtherDuration.push(allMetrics.otherDuration);

      result.push({
        routeName: routeName,
        ...allMetrics // Thêm các giá trị tính toán được vào kết quả
      });
    }));

    // Phân loại rank cho từng chỉ số dựa trên danh sách các giá trị
    const distanceRankings = this.classifyRankCoreDataSet(allDistanceRatios, coreDataSetDto);
    const durationRankings = this.classifyRankCoreDataSet(allDurationRatios, coreDataSetDto);
    const collectDistanceRankings = this.classifyRankCoreDataSet(allCollectDistance, coreDataSetDto);
    const collectDurationRankings = this.classifyRankCoreDataSet(allCollectDuration, coreDataSetDto);
    const collectCountRankings = this.classifyRankCoreDataSet(allCollectCount, coreDataSetDto);
    const otherDistanceRankings = this.classifyRankCoreDataSet(allOtherDistance, coreDataSetDto);
    const otherDurationRankings = this.classifyRankCoreDataSet(allOtherDuration, coreDataSetDto);


    // Gán rank vào kết quả
    result = result.map((routeResult, index) => ({
      routeName: routeResult.routeName,
      distanceRatios: distanceRankings[index],
      durationRatios: durationRankings[index],
      collectDistance: collectDistanceRankings[index],
      collectDuration: collectDurationRankings[index],
      collectCount: collectCountRankings[index],
      otherDistance: otherDistanceRankings[index],
      otherDuration: otherDurationRankings[index]
    }));

    return result;
  }

  async calculateAllMetrics(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName, startDate, endDate, pValue } = coreDataSetDto;
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);
    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày

    const metricsArray = await Promise.all(
        dateRanges.map(async ({ date }) => {
            const mustQueriesForRange = [
                mustQueries,
                this.buildDateRangeQuery(date),
            ];

            const result = await this.fetchAggregations(mustQueriesForRange, schema);

            const {
                distanceRatios,
                collectDistance,
                otherDistance,
                durationRatios,
                collectDuration,
                otherDuration,
                collectCount
            } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);
            const manualCollectDistance = await this.manualCollectService.manualCollectDistance(routeName, schema);
            const weight = 2.4;
            const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
            if (
                distanceRatios === 0 &&
                collectDistance === 0 &&
                otherDistance === 0 &&
                durationRatios === 0 &&
                collectDuration === 0 &&
                otherDuration === 0 &&
                collectCount === 0 &&
                manualCollectTime === 0 &&
                manualCollectDistance === 0
            ) {
                return null;
            }

            metricsMap[date] = {
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

            return {
                date,
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
        })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    
    // Tính EWM cho từng loại metric
    const ewmMetrics = {};
    const metricTypes = [
        'distanceRatios',
        'collectDistance',
        'otherDistance',
        'durationRatios',
        'collectDuration',
        'otherDuration',
        'collectCount',
        'manualCollectDistance',
        'manualCollectTime',
    ];
    const response = {};
    const rankResults = await this.classifyRankBaseOnEWM(coreDataSetDto, schema);
    metricTypes.forEach(metricType => {
        const oneMetric = filteredMetricsArray.reverse(); // Đảo ngược để tính EWM
        ewmMetrics[metricType] = this.calculateEWMetricsForStatistics(oneMetric);

        const ewmMetricData = ewmMetrics[metricType];
        // Kiểm tra nếu giá trị EWM trả về có phải là mảng không
        const ewmMetricValue = Array.isArray(ewmMetricData[metricType]) 
            ? parseFloat(ewmMetricData[metricType].slice(-1)[0]) || null // Lấy phần tử cuối cùng
            : parseFloat(ewmMetricData[metricType]) || null; // Trường hợp chỉ là giá trị đơn
        
        // Kiểm tra nếu rankResults có chứa thông tin và routeName hợp lệ
        const routeRank = rankResults.find(result => result.routeName === routeName);
        const rankForMetric = routeRank?.[metricType] || "C";  // Mặc định là "C" nếu không có thông tin

        const dayMetrics = dateRanges.map(({ date }) => {
            const metricValue = metricsMap[date] ? parseFloat(metricsMap[date][metricType]) : null;

            // Gọi hàm kiểm tra bất thường
            const anomalyResult = this.checkAnomaly(metricValue, pValue);
            
            return {
                date,
                value: metricValue,
                anomaly: anomalyResult, // Thêm thông tin bất thường vào kết quả
            };
        });

        // Kiểm tra xem có bất kỳ giá trị anomaly nào là true
        const overallAnomaly = dayMetrics.some(dayMetric => dayMetric.anomaly === true);

        const metricResponse = {
            rating: rankForMetric, // Sử dụng rank từ classifyRankBaseOnEWM
            diagnosis: overallAnomaly,
            EWM: ewmMetricValue,  // Đảm bảo EWM không bị undefined
        };

        dayMetrics.forEach(dayMetric => {
            // Gán từng ngày vào response
            metricResponse[dayMetric.date] = dayMetric.value;
        });

        response[metricType] = metricResponse;
    });

    return response;
  }
  // End of distanceRatios, collectDistance, otherDistance, durationRatios, collectDuration, otherDuration, collectCount (No Expand)

  // Begin of expanded collectDistance, collectDuration, otherDistance, otherTime, collectCount
  private calculateMeanAndStd(metricsArray: any[]) {
    return {
      mean: this.safeMean(metricsArray.map((m) => m)),
      standardDeviation: this.safeStd(metricsArray.map((m) => m))
    };
  }

  private buildQueryCoreDataSet(routeName: string, startDate: string, endDate: string, statisticMode: string) {
    const mustQueries: any[] = [
      ...(routeName?.length ? [{ terms: { 'data.route_name.keyword': convertToArray(routeName) } }] : []),
      this.createRangeQueryDataSet(startDate, endDate, 'data.timestamp'),
    ];

    if (['otherTime', 'otherDistance'].includes(statisticMode)) {
      this.addDriveModeFilters(mustQueries);
    }

    return {
      size: 0,
      query: { bool: { filter: mustQueries } },
      aggs: {
        trips_by_time: {
          date_histogram: {
            field: "data.timestamp",
            interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: this.getAggregationsByMode(statisticMode),
        }
      }
    };
  }

  private formatResponse(data: any, startDate: string, endDate: string, pValue: number) {
    const expanded = [];
    const sections = data.body.aggregations.by_route.buckets;

    // Tạo mảng chứa tất cả các ngày trong khoảng startDate - endDate
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    for (const section of sections) {
      const sectionData = {
        sectionName: section.key,
        rating: null, // Logic tính rating
        diagnosis: false, // Logic tính diagnosis
        EWM: 88.6, // Logic tính EWM
      };

      // Tạo mảng chứa giá trị metric theo từng ngày để tính EWM
      const metricValues: number[] = [];

      // Tạo map dữ liệu theo từng ngày
      const metricsByDay = {};
      section.trips_by_time.buckets.forEach((bucket) => {
        const value = bucket.total.total.value;
        metricsByDay[bucket.key_as_string] = value;
        metricValues.push(value); // Thêm giá trị vào mảng để tính EWM
      });

      // Tính toán EWM từ metricValues
      const ewmValues = this.calculateEWM(metricValues, 0.1); // Alpha là hệ số decay cho EWM

      // Gán giá trị EWM cuối cùng vào sectionData
      sectionData.EWM = ewmValues[ewmValues.length - 1] || 0; // Giá trị EWM cuối cùng

      // Lặp qua các ngày trong khoảng startDate - endDate
      dateRanges.forEach(({ date }) => {
        // Nếu không có dữ liệu cho ngày đó, gán null
        sectionData[date] = metricsByDay[date] ? metricsByDay[date] : null;
      });

      // Tính toán Z-scores cho metricValues để kiểm tra bất thường
      if (metricValues.length > 0) {
        const statistics = this.calculateMeanAndStd(metricValues);
        const zScores = this.calculateZScores(metricValues, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => this.checkAnomaly(zValue, pValue));

        // Gán giá trị tổng thể cho anomaly
        sectionData.diagnosis = anomalies.some(anomaly => anomaly === true);
      }

      expanded.push(sectionData);
    }

    return expanded;
  }

  private formatResponseCore(data: any, routeName: string, startDate: string, endDate: string, ratings: any, pValue: number) {
    const driveModes = [
      { key: 'total_drive_mode_0', label: 'notSelected' },
      { key: 'total_drive_mode_1', label: 'goingToCollectionArea' },
      { key: 'total_drive_mode_2', label: 'goingToTheLandfill' },
      { key: 'total_drive_mode_3', label: 'returnToGarage' },
      { key: 'total_drive_mode_4', label: 'goingToRestaurant' },
      { key: 'total_drive_mode_6', label: 'idling' },
      { key: 'total_drive_mode_7', label: 'notManaged' },
      { key: 'total_drive_mode_8', label: 'outOfControl' },
    ];

    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Khởi tạo object chứa dữ liệu theo chế độ lái
    const result = {};

    driveModes.forEach((driveMode) => {
      result[driveMode.label] = {
        rating: ratings[routeName][driveMode.label], // Gán giá trị rating từ tham số
        diagnosis: false, // Logic tính toán diagnosis
        EWM: null, // Sẽ được tính toán sau
        anomaly: false, // Thêm trường anomaly
      };

      // Khởi tạo tất cả các ngày với giá trị null ban đầu
      dateRanges.forEach(({ date }) => {
        result[driveMode.label][date] = null;
      });
    });

    // Tạo map để lưu trữ các giá trị theo chế độ lái cho từng ngày
    const metricsByDriveMode = {};
    driveModes.forEach((driveMode) => {
      metricsByDriveMode[driveMode.label] = [];
    });

    // Xử lý dữ liệu trả về từ Elasticsearch
    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
      const date = bucket.key_as_string; // Ngày từ Elasticsearch
      bucket.by_route.buckets.forEach((routeBucket: any) => {
        driveModes.forEach((driveMode) => {
          const modeData = routeBucket[driveMode.key]?.total?.value || 0;
          // Gán giá trị cho từng chế độ lái tương ứng với ngày cụ thể
          result[driveMode.label][date] = modeData;
          metricsByDriveMode[driveMode.label].push(modeData); // Thêm giá trị vào mảng để tính EWM
        });
      });
    });

    // Tính toán EWM cho từng chế độ lái
    driveModes.forEach((driveMode) => {
      const modeValues = metricsByDriveMode[driveMode.label];
      const ewmValues = this.calculateEWM(modeValues, 0.1); // Alpha là hệ số decay cho EWM
      // Gán giá trị EWM cuối cùng vào sectionData
      result[driveMode.label].EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;

      // Tính toán Z-scores cho modeValues để kiểm tra bất thường
      if (modeValues.length > 0) {
        const statistics = this.calculateMeanAndStd(modeValues);
        const zScores = this.calculateZScores(modeValues, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => this.checkAnomaly(zValue, pValue));

        // Gán giá trị tổng thể cho anomaly
        result[driveMode.label].anomaly = anomalies.some(anomaly => anomaly === true);
      }
    });

    return result;
  }

  private formatResponseCoreEWM(data: any, startDate: string, endDate: string) {
    const driveModes = [
      { key: 'total_drive_mode_0', label: 'notSelected' },
      { key: 'total_drive_mode_1', label: 'goingToCollectionArea' },
      { key: 'total_drive_mode_2', label: 'goingToTheLandfill' },
      { key: 'total_drive_mode_3', label: 'returnToGarage' },
      { key: 'total_drive_mode_4', label: 'goingToRestaurant' },
      { key: 'total_drive_mode_6', label: 'idling' },
      { key: 'total_drive_mode_7', label: 'notManaged' },
      { key: 'total_drive_mode_8', label: 'outOfControl' },
    ];

    // Khởi tạo object chứa dữ liệu theo chế độ lái
    const result = {};

    driveModes.forEach((driveMode) => {
      result[driveMode.label] = {
        EWM: null, // Sẽ được tính toán sau
      };
    });

    // Tạo map để lưu trữ các giá trị theo chế độ lái cho từng ngày
    const metricsByDriveMode = {};
    driveModes.forEach((driveMode) => {
      metricsByDriveMode[driveMode.label] = [];
    });

    // Xử lý dữ liệu trả về từ Elasticsearch
    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
      bucket.by_route.buckets.forEach((routeBucket: any) => {
        driveModes.forEach((driveMode) => {
          const modeData = routeBucket[driveMode.key]?.total?.value || 0;
          // Gán giá trị cho từng chế độ lái tương ứng với ngày cụ thể
          metricsByDriveMode[driveMode.label].push(modeData); // Thêm giá trị vào mảng để tính EWM
        });
      });
    });

    // Tính toán EWM cho từng chế độ lái
    driveModes.forEach((driveMode) => {
      const modeValues = metricsByDriveMode[driveMode.label];
      const ewmValues = this.calculateEWM(modeValues, 0.1); // Alpha là hệ số decay cho EWM
      // Gán giá trị EWM cuối cùng vào sectionData
      result[driveMode.label].EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;
    });

    return result;
  }

  async calculateAllExpandeOther(coreDataSetDto: CoreDataSetDto, type: string, schema: string) {
    const { routeName, startDate, endDate } = coreDataSetDto;
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNos(schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    const routeNames = routeName ? convertToArray(routeName) : allVehicleMetrics; // Mảng routeName
    let result = {}; // Để lưu kết quả cho từng routeName

    await Promise.all(
      routeNames.map(async (routeName) => {
        const [expandedOtherDistance, expandedOtherDuration] = await Promise.all([
          this.getExpandedOtherDistanceEWM(routeName, startDate, endDate, schema),
          this.getExpandedOtherTimeEWM(routeName, startDate, endDate, schema),
        ]);

        const distanceEWMValues = [];
        for (const key in expandedOtherDistance) {
          if (expandedOtherDistance.hasOwnProperty(key)) {
            distanceEWMValues.push(expandedOtherDistance[key].EWM);
          }
        }

        // Lấy giá trị EWM từ expandedOtherDuration
        const durationEWMValues = [];
        for (const key in expandedOtherDuration) {
          if (expandedOtherDuration.hasOwnProperty(key)) {
            durationEWMValues.push(expandedOtherDuration[key].EWM);
          }
        }
        // Phân loại rank cho distanceEWMValues và durationEWMValues
        const distanceRanks = this.classifyRankCoreDataSet(distanceEWMValues, coreDataSetDto);
        const durationRanks = this.classifyRankCoreDataSet(durationEWMValues, coreDataSetDto);

        // Định dạng lại kết quả theo yêu cầu
        let formattedResult = null
        if (type = 'otherDistance') {
          formattedResult = {
            notSelected: distanceRanks[0],
            goingToCollectionArea: distanceRanks[1],
            goingToTheLandfill: distanceRanks[2],
            returnToGarage: distanceRanks[3],
            goingToRestaurant: distanceRanks[4],
            idling: distanceRanks[5],
            notManaged: distanceRanks[6],
            outOfControl: distanceRanks[7]
          }
        } else if (type = 'otherDuration') {
          formattedResult = {
            notSelected: durationRanks[0],
            goingToCollectionArea: durationRanks[1],
            goingToTheLandfill: durationRanks[2],
            returnToGarage: durationRanks[3],
            goingToRestaurant: durationRanks[4],
            idling: durationRanks[5],
            notManaged: durationRanks[6],
            outOfControl: durationRanks[7]
          }
        }

        result[routeName] = formattedResult;
      })
    );

    return result;
  }

  async getExpandedCollectDistance(routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                "data.route_name.keyword": [routeName],
              },
            },
            {
              range: {
                "data.timestamp": {
                  "time_zone": "+00:00",
                  gte: startDate + 'T11:00:00',
                  lte: endDate + 'T11:00:00',
                },
              },
            },
          ],
        },
      },
      aggs: {
        by_route: {
          terms: {
            field: "data.section_name.keyword",
          },
          aggs: {
            trips_by_time: {
              date_histogram: {
                field: "data.timestamp",
                interval: "day",
                format: "yyyy-MM-dd",
              },
              aggs: {
                total: {
                  filter: {
                    term: { "data.drive_mode": 5 },
                  },
                  aggs: {
                    total: { sum: { field: "data.trip_distance" } },
                  },
                },
              },
            },
          },
        },
      },
    };

    const response = await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      body: query,
    });
    return this.formatResponse(response, startDate, endDate, pValue);
  }

  async getExpandedCollectDuration(routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                "data.route_name.keyword": [routeName],
              },
            },
            {
              range: {
                "data.timestamp": {
                  "time_zone": "+00:00",
                  gte: startDate + 'T11:00:00',
                  lte: endDate + 'T11:00:00',
                },
              },
            },
          ],
        },
      },
      aggs: {
        by_route: {
          terms: {
            field: "data.section_name.keyword",
          },
          aggs: {
            trips_by_time: {
              date_histogram: {
                field: "data.timestamp",
                interval: "day",
                format: "yyyy-MM-dd",
              },
              aggs: {
                total: {
                  filter: {
                    term: { "data.drive_mode": 5 },
                  },
                  aggs: {
                    total: {
                      sum: {
                        script: {
                          source: `
                            if (doc.containsKey('data.trip_time.keyword') && !doc['data.trip_time.keyword'].empty) {
                              String tripTime = doc['data.trip_time.keyword'].value;
                              int colon1 = tripTime.indexOf(':');
                              int colon2 = tripTime.lastIndexOf(':');
                              if (colon1 != -1 && colon2 != -1 && colon1 != colon2) {
                                double hours = Double.parseDouble(tripTime.substring(0, colon1));
                                double minutes = Double.parseDouble(tripTime.substring(colon1 + 1, colon2));
                                double seconds = Double.parseDouble(tripTime.substring(colon2 + 1));
                                return (hours * 60) + minutes + (seconds / 60.0);
                              }
                            }
                            return 0;
                            `,
                          lang: "painless"
                        }
                      }
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const response = await this.openSearchClient.search({
      index: this.getSchema('drive_metrics', schema),
      body: query,
    });

    return this.formatResponse(response, startDate, endDate, pValue);
  }

  async getExpandedOtherDistance(routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    const ratings = await this.calculateAllExpandeOther({ routeName, startDate, endDate }, 'otherDistance', schema); // Gọi hàm để lấy ratings
    return this.formatResponseCore(response, routeName, startDate, endDate, ratings, pValue);
  }

  async getExpandedOtherTime(routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    const ratings = await this.calculateAllExpandeOther({ routeName, startDate, endDate }, 'otherDuration', schema); // Gọi hàm để lấy ratings
    return this.formatResponseCore(response, routeName, startDate, endDate, ratings, pValue);
  }

  async getExpandedOtherDistanceEWM(routeName: string, startDate: string, endDate: string, schema: string) {
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    return this.formatResponseCoreEWM(response, startDate, endDate)
  }

  async getExpandedOtherTimeEWM(routeName: string, startDate: string, endDate: string, schema: string) {
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    return this.formatResponseCoreEWM(response, startDate, endDate)
  }

  async getCollectMetricsForCoreDataSet(dispatchNo: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const mustQueries = [];

    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    })

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      "aggs": {
        trips_by_time: {
          date_histogram: {
            field: "data.timestamp",
            interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: {
            by_route: {
              terms: { field: 'data.section_name.keyword', size: 10 },
              aggs: {
                "total_sum": {
                  "sum": {
                    "script": {
                      "source": `
                        long sum = 0;
                        sum += doc['data.5L_gen'].value;
                        sum += doc['data.10L_gen'].value;
                        sum += doc['data.10L_reu'].value;
                        sum += doc['data.20L_gen'].value;
                        sum += doc['data.20L_reu'].value;
                        sum += doc['data.30L_gen'].value;
                        sum += doc['data.50L_gen'].value;
                        sum += doc['data.50L_pub'].value;
                        sum += doc['data.75L_gen'].value;
                        sum += doc['data.75L_pub'].value;
                        sum += doc['data.ext'].value;
                        sum += doc['data.etc'].value;
                        return sum;
                      `,
                      "lang": "painless"
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return this.formatResponseCollectCount(result, startDate, endDate, pValue);
  }

  private formatResponseCollectCount(data: any, startDate: string, endDate: string, pValue: number) {
    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Khởi tạo object chứa dữ liệu cho từng section
    const expandedCollectCount = [];

    // Duyệt qua từng bucket (mỗi bucket tương ứng với một ngày)
    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
      const date = bucket.key_as_string; // Ngày từ Elasticsearch

      // Duyệt qua từng section trong by_route.buckets
      bucket.by_route.buckets.forEach((sectionBucket: any) => {
        const sectionKey = sectionBucket.key;

        // Tìm hoặc tạo mới section trong kết quả
        let sectionData = expandedCollectCount.find(sec => sec.sectionName === sectionKey);
        if (!sectionData) {
          // Nếu không tìm thấy section đã tồn tại, tạo mới object cho section này
          sectionData = {
            sectionName: sectionKey,
            rating: null,       // Giá trị rating mặc định (có thể thay đổi logic)
            diagnosis: false,  // Giá trị diagnosis mặc định (có thể thay đổi logic)
            EWM: null,         // Giá trị EWM mặc định (có thể thay đổi logic)
            anomaly: false,    // Thêm trường anomaly
          };

          // Khởi tạo tất cả các ngày với giá trị null ban đầu
          dateRanges.forEach(({ date }) => {
            sectionData[date] = null;
          });

          expandedCollectCount.push(sectionData);
        }

        // Gán giá trị total_sum cho ngày tương ứng của section
        sectionData[date] = sectionBucket.total_sum?.value || 0;
      });
    });

    // Sau khi điền đầy đủ dữ liệu cho các section, tính toán EWM, anomaly
    expandedCollectCount.forEach((sectionData) => {
      const values = dateRanges.map(({ date }) => sectionData[date]).filter(value => value !== null);

      if (values.length > 0) {
        const ewmValues = this.calculateEWM(values, 0.1); // Tính EWM với alpha 0.1
        sectionData.EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;

        // Tính toán Z-scores cho values để kiểm tra bất thường
        const statistics = this.calculateMeanAndStd(values);
        const zScores = this.calculateZScores(values, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => this.checkAnomaly(zValue, pValue));

        // Gán giá trị tổng thể cho anomaly
        sectionData.anomaly = anomalies.some(anomaly => anomaly === true);
      }
    });

    return expandedCollectCount;
  }

  async getUniqueVehicleIdsAndDispatchNosWithDate(startDate: string, endDate: string, schema: string) {
    const index = this.getSchema('drive_metrics', schema);
    const body = {
        query: {
          bool: {
            must: {
                range: {
                  'data.timestamp': {
                    "time_zone": "+00:00",
                    gte: startDate + 'T11:00:00',
                    lte: endDate + 'T11:00:00',
                  },
                }
              }
          },
        },
        aggs: {
          unique_vehicle_dispatch: {
            composite: {
              sources: [
                { dispatch_no: { terms: { field: 'data.dispatch_no.keyword' } } },
                { route_name: { terms: { field: 'data.route_name.keyword' } } }
              ],
              size: 10000 // Số lượng kết quả tối đa bạn muốn lấy
            }
          }
        }
      }
    const result = await this.openSearchClient.search({ index, size: 0, body });

    const buckets = result.body.aggregations.unique_vehicle_dispatch.buckets;

    return buckets.map((bucket: any) => ({
      dispatch_no: bucket.key.dispatch_no,
      route_name: bucket.key.route_name,
    }));
  }
  // End of expanded collectDistance, collectDuration, otherDistance, otherTime, collectCount
  // End Body Core Dataset

  // Function to get all data
  async getCoreDataset(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeName, startDate, endDate, pValue } = coreDataSetDto;
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    const routeNames = routeName ? convertToArray(routeName) : allVehicleMetrics; // Mảng routeName
    const result = {}; // Để lưu kết quả cho từng routeName
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    await Promise.all(
      routeNames.map(async (routeName) => {
        // Cập nhật lại searchAndFilterListDto với routeName hiện tại
        const updatedDto = { ...coreDataSetDto, routeName };

        // Gọi các hàm với routeName hiện tại
        const mainData = await this.calculateMainDataCoreDataSet(updatedDto, schema);
        const allMetrics = await this.calculateAllMetrics(updatedDto, schema);
        const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);

        const [expandedCollectDistance, expandedCollectDuration, expandedOtherDistance, expandedOtherDuration, expandedCollectCount] = await Promise.all([
          this.getExpandedCollectDistance(routeName, startDate, endDate, pValue, schema),
          this.getExpandedCollectDuration(routeName, startDate, endDate, pValue, schema),
          this.getExpandedOtherDistance(routeName, startDate, endDate, pValue, schema),
          this.getExpandedOtherTime(routeName, startDate, endDate, pValue, schema),
          this.getCollectMetricsForCoreDataSet(dispatchNo, startDate, endDate, pValue, schema)
        ]);

        // Gán kết quả vào object theo tên của routeName
        result[routeName] = {
          mainData,
          ...allMetrics,
          expandedCollectDistance,
          expandedCollectDuration,
          expandedOtherDistance,
          expandedOtherDuration,
          expandedCollectCount,
        };
      })
    );

    return result;
  }

  // Module Dataset
  async getModuleDataset(moduleDatasetDto: ModuleDatasetDto, schema: string) {
    const { routeName, startDate, endDate, pValue, conditions } = moduleDatasetDto;
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    // Nếu có routeName thì dùng, nếu không thì lấy tất cả các route_name từ allVehicleMetrics
    const routeNames = routeName ? convertToArray(routeName) : allVehicleMetrics;
    const result = {};

    await Promise.all(
      routeNames.map(async (routeName) => {
        const updatedDto = { ...moduleDatasetDto, routeName };

        // Gọi các hàm để lấy dữ liệu liên quan đến routeName hiện tại
        const mainData = await this.calculateMainDataCoreDataSet(updatedDto, schema);
        const allMetrics = await this.calculateAllMetrics(updatedDto, schema);
        const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);

        // Lấy các dữ liệu bổ sung
        const [expandedCollectDistance, expandedCollectDuration, expandedOtherDistance, expandedOtherDuration, expandedCollectCount] = await Promise.all([
          this.getExpandedCollectDistance(routeName, startDate, endDate, pValue, schema),
          this.getExpandedCollectDuration(routeName, startDate, endDate, pValue, schema),
          this.getExpandedOtherDistance(routeName, startDate, endDate, pValue, schema),
          this.getExpandedOtherTime(routeName, startDate, endDate, pValue, schema),
          this.getCollectMetricsForCoreDataSet(dispatchNo, startDate, endDate, pValue, schema)
        ]);

        // Tổng hợp tất cả dữ liệu
        const fullData = {
          mainData,
          ...allMetrics,
          expandedCollectDistance,
          expandedCollectDuration,
          expandedOtherDistance,
          expandedOtherDuration,
          expandedCollectCount
        };

        // Áp dụng các điều kiện để lọc dữ liệu
        const dataMatchesConditions = this.filterDataByConditions(conditions, fullData, startDate, endDate);

        // Nếu dữ liệu thỏa mãn điều kiện (true) thì thêm vào result
        if (dataMatchesConditions) {
          result[routeName] = fullData;
        }
      })
    );

    return result;
  }

  // Hàm để lọc dữ liệu theo conditions
  filterDataByConditions(conditions, data, startDate, endDate) {
    if (!conditions || conditions.length === 0) return true;

    const isDateInRange = (date, startDate, endDate) => {
      const d = new Date(date);
      return d >= new Date(startDate) && d <= new Date(endDate);
    };

    const isDateKey = (key) => !isNaN(Date.parse(key));

    let isValid = true;
    let tempIsValid = true;

    // Duyệt qua các điều kiện
    for (let i = 0; i < conditions.length; i++) {
      const { L2Extension, L3Extension, logicalOperator } = conditions[i];
      const { L3Extension: L3, column, condition: operator, value } = L3Extension || {};
      tempIsValid = false;

      let dataExtension = data[L2Extension];
      if (!dataExtension || typeof dataExtension !== 'object') {
        isValid = false;
        break;
      }

      // Hàm tính toán tổng, max, và min
      const calculateStats = (dataSection) => {
        let total = 0, count = 0, max = -Infinity, min = Infinity;

        for (const [key, dataValue] of Object.entries(dataSection)) {
          if (isDateKey(key) && isDateInRange(key, startDate, endDate) && dataValue != null) {
            const numericValue = Number(dataValue);  // Ép kiểu dataValue thành number
            if (!isNaN(numericValue)) {  // Chỉ xử lý nếu dataValue là số hợp lệ
              total += numericValue;
              count++;
              max = Math.max(max, numericValue);
              min = Math.min(min, numericValue);
            }
          }
        }

        return { average: total / count, max, min, count };
      };

      const processColumnValue = (stats, dataSection) => {
        switch (column) {
          case 'Average':
            return stats.count > 0 ? this.compareValues(stats.average, operator, value) : false;
          case 'Maximum':
            return stats.count > 0 ? this.compareValues(stats.max, operator, value) : false;
          case 'Minimum':
            return stats.count > 0 ? this.compareValues(stats.min, operator, value) : false;
          case 'Raw value':
            // Xử lý khi column là "Raw data", duyệt qua từng ngày
            for (const [key, dataValue] of Object.entries(dataSection)) {
              if (isDateKey(key) && isDateInRange(key, startDate, endDate) && dataValue != null) {
                if (this.compareValues(dataValue, operator, value)) {
                  return true; // Nếu thỏa mãn điều kiện, trả về true ngay lập tức
                }
              }
            }
            return false; // Nếu không tìm thấy giá trị nào thỏa mãn
          default:
            return false;
        }
      };

      // Xử lý khi có L3
      if (L3) {
        const expandedExtensions = ['collectDistance', 'collectDuration', 'collectCount', 'otherDistance', 'otherDuration'];

        if (expandedExtensions.includes(L2Extension)) {
          const expandedData = data[`expanded${L2Extension.charAt(0).toUpperCase() + L2Extension.slice(1)}`];

          // Kiểm tra nếu expandedData là array
          if (Array.isArray(expandedData)) {
            expandedData.forEach((m) => {
              if (m.sectionName === L3) {
                const stats = calculateStats(m);
                tempIsValid = processColumnValue(stats, m);
              }
            });
          }
          // Nếu không phải array, mà là object
          else if (typeof expandedData === 'object') {
            for (let key in expandedData) {
              if (key === L3) {  // So sánh L3 với key của object
                const sectionData = expandedData[key];
                const stats = calculateStats(sectionData);
                tempIsValid = processColumnValue(stats, sectionData);
              }
            }
          }
        }
      } else {
        // Xử lý không có L3, tính toán trên toàn bộ L2Extension
        const stats = calculateStats(dataExtension);
        tempIsValid = processColumnValue(stats, dataExtension);
      }

      // Áp dụng logicalOperator cho nhiều điều kiện
      if (i === 0) {
        isValid = tempIsValid;
      } else if (logicalOperator === 'AND') {
        isValid = isValid && tempIsValid;
        if (!isValid) break;
      } else if (logicalOperator === 'OR') {
        isValid = isValid || tempIsValid;
      }
    }

    return isValid;
  }

  compareValues(dataValue, operator, value) {
    switch (operator) {
      case 'Equals':
        return dataValue === value;
      case 'Greater than':
        return dataValue > value;
      case 'Greater than or equals':
        return dataValue >= value;
      case 'Less than':
        return dataValue < value;
      case 'Less than or equals':
        return dataValue <= value;
      case 'Not equals':
        return dataValue !== value;
      default:
        return false;
    }
  }

  // Graph Builder
  // Driving Route Graph
  async getDrivingRouteGraphData(drivingRouteGraphDto: DrivingRouteGraphDto, schema: string) {
    const { routeName, startDate, endDate, cumulation } = drivingRouteGraphDto;
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);
        const manualCollectDistance = await this.manualCollectService.manualCollectDistance(routeName, schema);
        const weight = 2.4;
        const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
        if (
          distanceRatios === 0 &&
          collectDistance === 0 &&
          otherDistance === 0 &&
          durationRatios === 0 &&
          collectDuration === 0 &&
          otherDuration === 0 &&
          collectCount === 0 &&
          manualCollectTime
        ) {
          metricsMap[date] = null;
        } else {
          metricsMap[date] = {
            distanceRatios,
            collectDistance,
            otherDistance,
            durationRatios,
            collectDuration,
            otherDuration,
            collectCount,
            manualCollectTime
          };
        }

        return {
          date,
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
          manualCollectTime
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.calculateStatistics(oneMetric);
    const zDistanceRatios = this.calculateZScores(
      oneMetric.map((v) => v.distanceRatios),
      statistics.mean.distanceRatios,
      statistics.standardDeviation.distanceRatios
    );
    const zDurationRatios = this.calculateZScores(
      oneMetric.map((v) => v.durationRatios),
      statistics.mean.durationRatios,
      statistics.standardDeviation.durationRatios
    );
    const zCollectDistances = this.calculateZScores(
      oneMetric.map((v) => v.collectDistance),
      statistics.mean.collectDistance,
      statistics.standardDeviation.collectDistance
    );
    const zCollectDurations = this.calculateZScores(
      oneMetric.map((v) => v.collectDuration),
      statistics.mean.collectDuration,
      statistics.standardDeviation.collectDuration
    );
    const zCollectCounts = this.calculateZScores(
      oneMetric.map((v) => v.collectCount),
      statistics.mean.collectCount,
      statistics.standardDeviation.collectCount
    );

    const zManualCollectTime = this.calculateZScores(oneMetric.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);


    const rankScores = this.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      {
        distanceRatioRate: 0.15,
        durationRatioRate: 0.15,
        collectDistanceRate: 0.15,
        collectDurationRate: 0.15,
        collectCountRate: 0.3,
        manualCollectTimeRate: 0.1,
      }
    );

    const zScores = rankScores.map((score) => score * 20 + 100);

    // Tạo dailyResults, gán giá trị zScore cho từng ngày
    const dailyResults = dateRanges.map(({ date }, index) => {
      const metrics = metricsMap[date];
      if (!metrics) {
        return { [date]: null }; // Gán null cho ngày không có dữ liệu
      } else {
        return { [date]: zScores[index] || null }; // Gán zScore tương ứng vào từng ngày
      }
    });

    // Nếu có cumulation = true, thực hiện cộng dồn zScores bên ngoài
    if (+cumulation === 1) { // Kiểm tra rõ ràng nếu cumulation là true
      let cumulativeScore = 0;
      dailyResults.forEach((result) => {
        const [date] = Object.keys(result);
        if (result[date] !== null) {
          cumulativeScore += result[date]; // Cộng dồn các giá trị zScores
          result[date] = cumulativeScore; // Gán giá trị cộng dồn vào ngày tương ứng
        }
      });
    }

    // Kết hợp các dailyResults thành kết quả cuối cùng
    const result = {
      ...Object.assign({}, ...dailyResults),
    };

    return result;
  }

  generate7DaysBefore(date: string): string[] {
    const baseDate = new Date(date);
    const daysBefore = [];

    // Lặp qua để lấy 7 ngày trước đó (bao gồm cả ngày hiện tại)
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() - i); // Trừ đi i ngày
      const formattedDate = newDate.toISOString().split('T')[0]; // Định dạng YYYY-MM-DD
      daysBefore.push(formattedDate);
    }

    return daysBefore;
  }

  generate7DaysForAllDates(startDate: string, endDate: string) {
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Lấy 7 ngày trước đó cho mỗi ngày trong khoảng startDate đến endDate
    const sevenDaysData = dateRanges.map(date => ({
      date,
      sevenDaysBefore: this.generate7DaysBefore(date.date),
    }));

    return sevenDaysData;
  }

  async calculateStandardScoreEWMForOneDay(routeName: string, date: string, schema: string) {
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const genDate = this.generate7DaysBefore(date);
    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

        const manualCollectDistance = await this.manualCollectService.manualCollectDistance(routeName, schema);
        const weight = 2.4;
        const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
        if (
          distanceRatios === 0 &&
          collectDistance === 0 &&
          otherDistance === 0 &&
          durationRatios === 0 &&
          collectDuration === 0 &&
          otherDuration === 0 &&
          collectCount === 0 &&
          manualCollectTime
        ) {
          metricsMap[date] = null;
        } else {
          metricsMap[date] = {
            distanceRatios,
            collectDistance,
            otherDistance,
            durationRatios,
            collectDuration,
            otherDuration,
            collectCount,
            manualCollectTime
          };
        }

        return {
          date,
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
          manualCollectTime
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.calculateStatistics(oneMetric);
    const zDistanceRatios = this.calculateZScores(oneMetric.map(v => v.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(oneMetric.map(v => v.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(oneMetric.map(v => v.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(oneMetric.map(v => v.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(oneMetric.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);


    const rankScores = this.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      { distanceRatioRate: 0.15, durationRatioRate: 0.15, collectDistanceRate: 0.15, collectDurationRate: 0.15, collectCountRate: 0.3, manualCollectTimeRate: 0.1 }
    );

    const zScores = rankScores.map((score) => score * 20 + 100);
    const ewmMetricsFor7Days = this.calculateEWM(zScores.map((m) => m), 0.1);

    return ewmMetricsFor7Days.reverse().slice(-1)[0];
  }

  async getDrivingRouteGraphEWMStartEndDate(drivingRouteGraphDto: DrivingRouteGraphDto, schema) {
    const { routeName, startDate, endDate, cumulation } = drivingRouteGraphDto;
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    let cumulativeSum = 0;  // Biến giữ giá trị tổng cộng dồn theo thời gian

    // Tạo mảng metricsArray để lưu trữ kết quả cho từng ngày
    const metricsArray = [];

    // Chạy tuần tự qua từng ngày trong dateRanges
    for (const { date } of dateRanges) {
      // Lấy giá trị kết quả cho ngày hiện tại
      const result = await this.calculateStandardScoreEWMForOneDay(routeName, date, schema);

      // Nếu cumulation = 1 (cộng dồn), tiếp tục cộng dồn giá trị
      if (+cumulation === 1) {
        cumulativeSum += result != null ? result : 0;  // Kiểm tra giá trị null hoặc undefined trước khi cộng
      }

      // Đẩy kết quả vào mảng, nếu cumulation = 1 thì trả về cumulativeSum, nếu không thì trả về result cho từng ngày
      metricsArray.push({
        date,        // Giữ lại thông tin ngày
        resultValue: +cumulation === 1 ? cumulativeSum : result  // Nếu cumulation = 1 thì trả về cumulativeSum, nếu không thì trả về result
      });
    }

    // Chuyển đổi metricsArray thành một đối tượng với khóa là ngày và giá trị là resultValue
    const resultObject = metricsArray.reduce((acc, { date, resultValue }) => {
      acc[date] = resultValue;
      return acc;
    }, {});

    return resultObject;  // Trả về đối tượng kết quả đã định dạng
  }

  async getDrivingRouteGraphEWMAverageExtendsOneDay(routeName: string, date: string, schema: string) {
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const genDate = this.generate7DaysBefore(date);
    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration,
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

        if (
          collectDistance === 0 &&
          otherDistance === 0 &&
          collectDuration === 0 &&
          otherDuration === 0
        ) {
          metricsMap[date] = null;
        } else {
          metricsMap[date] = {
            collectDistance,
            otherDistance,
            collectDuration,
            otherDuration,
          };
        }

        return {
          date,
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration,
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.calculateEWMetricsForStatistics(oneMetric);

    const latest = {
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      otherDistance: ewmOneMetric.otherDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      otherDuration: ewmOneMetric.otherDuration.slice(-1)[0]
    };

    return latest;
  }

  async getDrivingRouteGraphExtendedData(drivingRouteGraphDto: DrivingRouteGraphDto, schema) {
    const { routeName, startDate, endDate } = drivingRouteGraphDto
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } }
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày

    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.fetchAggregations(mustQueriesForRange, schema);

        const {
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration,
        } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

        if (
          collectDistance === 0 &&
          otherDistance === 0 &&
          collectDuration === 0 &&
          otherDuration === 0
        ) {
          metricsMap[date] = null;
        } else {
          metricsMap[date] = {
            collectDistance,
            otherDistance,
            collectDuration,
            otherDuration
          };
        }

        return {
          date,
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();
    return oneMetric;
  }

  async getDrivingRouteGraphEWMAverageExtendsStartEndDate(drivingRouteGraphDto: DrivingRouteGraphDto, schema: string) {
    const { routeName, startDate, endDate, cumulation } = drivingRouteGraphDto; // Thêm cumulation vào DTO
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Sử dụng Promise.all để đảm bảo tất cả các promise được xử lý
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const result = await this.getDrivingRouteGraphEWMAverageExtendsOneDay(routeName, date, schema);
        return {
          date,        // Giữ lại thông tin ngày
          resultValue: result  // Giả định result chứa các giá trị cần thiết
        };
      })
    );

    // Biến để giữ giá trị cộng dồn cho từng trường
    let cumulativeTotal = {
      collectDistance: 0,
      otherDistance: 0,
      collectDuration: 0,
      otherDuration: 0
    };

    // Chuyển đổi metricsArray thành một đối tượng với khóa là ngày và giá trị là resultValue
    const resultObject = metricsArray.reduce((acc, { date, resultValue }) => {
      // Kiểm tra nếu cumulation = 1 thì thực hiện cộng dồn, nếu không thì giữ giá trị gốc
      if (+cumulation === 1) {
        // Cộng dồn giá trị của ngày hiện tại vào tổng cộng dồn
        cumulativeTotal.collectDistance += resultValue.collectDistance || 0;
        cumulativeTotal.otherDistance += resultValue.otherDistance || 0;
        cumulativeTotal.collectDuration += resultValue.collectDuration || 0;
        cumulativeTotal.otherDuration += resultValue.otherDuration || 0;

        acc[date] = { ...cumulativeTotal }; // Gán giá trị cộng dồn vào kết quả của ngày hiện tại
      } else {
        // Nếu cumulation != 1 thì chỉ trả về giá trị của từng ngày
        acc[date] = resultValue;
      }

      return acc;
    }, {});

    return resultObject; // Trả về đối tượng đã định dạng theo yêu cầu
  }

  async getTotalOfElement(drivingRouteGraphDto: DrivingRouteGraphDto, schema: string) {
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNosWithDate(drivingRouteGraphDto.startDate, drivingRouteGraphDto.endDate, schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    // Initialize result object
    const totalResult = {
      collectDistance: { total: {}, average: {}, EWM: {} },
      otherDistance: { total: {}, average: {}, EWM: {} },
      collectDuration: { total: {}, average: {}, EWM: {} },
      otherDuration: { total: {}, average: {}, EWM: {} }
    };

    // Helper function to sum values
    const sumMetrics = (metrics, date, newData) => {
      Object.keys(metrics).forEach(metric => {
        metrics[metric].total[date] = (metrics[metric].total[date] || 0) + (newData[metric] || 0);
      });
    };

    // Helper function to accumulate data
    const accumulateData = (metrics, previousDate, currentDate) => {
      Object.keys(metrics).forEach(metric => {
        metrics[metric].total[currentDate] = (metrics[metric].total[previousDate] || 0) + (metrics[metric].total[currentDate] || 0);
      });
    };

    await Promise.all(
      allVehicleMetrics.map(async (routeName) => {
        const updatedDto = { ...drivingRouteGraphDto, routeName };
        const EWMData = await this.getDrivingRouteGraphEWMAverageExtendsStartEndDate(updatedDto, schema);
        const dataByDate = await this.getDrivingRouteGraphExtendedData(updatedDto, schema);
        dataByDate.forEach(({ date, collectDistance, otherDistance, collectDuration, otherDuration }) => {
          // Initialize values for each date if not present
          if (!totalResult.collectDistance.total[date]) {
            Object.keys(totalResult).forEach(metric => {
              totalResult[metric].total[date] = 0;
            });
          }

          // Sum up the metrics for each date
          sumMetrics(totalResult, date, { collectDistance, otherDistance, collectDuration, otherDuration });

          // Add EWM Average data for each date, if available
          const EWMForDate = EWMData[date] || {};
          Object.keys(EWMForDate).forEach(metric => {
            totalResult[metric].EWM[date] = EWMForDate[metric] !== undefined ? EWMForDate[metric] : null;
          });
        });
      })
    );

    const numVehicles = allVehicleMetrics.length;

    // Cumulate data if cumulation is true
    if (+drivingRouteGraphDto.cumulation === 1) {
      // Sort dates in ascending order
      const sortedDates = Object.keys(totalResult.collectDistance.total).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // Apply accumulation for sorted dates
      for (let i = 1; i < sortedDates.length; i++) {
        accumulateData(totalResult, sortedDates[i - 1], sortedDates[i]);
      }
    }

    // After accumulation, ensure the final result is also sorted by date
    const sortedTotalResult = {
      collectDistance: { total: {}, average: {}, EWM: {} },
      otherDistance: { total: {}, average: {}, EWM: {} },
      collectDuration: { total: {}, average: {}, EWM: {} },
      otherDuration: { total: {}, average: {}, EWM: {} }
    };

    const sortedDates = Object.keys(totalResult.collectDistance.total).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    sortedDates.forEach(date => {
      Object.keys(totalResult).forEach(metric => {
        sortedTotalResult[metric].total[date] = totalResult[metric].total[date];
        sortedTotalResult[metric].average[date] = totalResult[metric].total[date] === null
          ? null
          : totalResult[metric].total[date] / numVehicles;
        sortedTotalResult[metric].EWM[date] = totalResult[metric].EWM[date] === null
          ? null
          : totalResult[metric].EWM[date] / numVehicles;
      });
    });

    return sortedTotalResult;
  }

  async getDrivingRouteGraph(drivingRouteGraphDto: DrivingRouteGraphDto, schema: string) {
    const { routeName, startDate, endDate, excludeRoute } = drivingRouteGraphDto;
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    let routeNames = routeName ? convertToArray(routeName) : allVehicleMetrics; // Mảng routeName
    const result = {}; // Để lưu kết quả cho từng routeName
    if (excludeRoute) {
      const excludeRouteNames = convertToArray(excludeRoute); // Chuyển đổi excludeRoute thành mảng nếu cần
      routeNames = routeNames.filter((name) => !excludeRouteNames.includes(name));
    }
    // Biến lưu trữ tổng giá trị và số lượng phương tiện của tất cả các phương tiện trong các ngày
    const overallSum = {};
    const vehicleCountPerDay = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const overallEWM = {};
    let extended
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    await Promise.all(
      routeNames.map(async (routeName) => {
        const updatedDto = { ...drivingRouteGraphDto, routeName };

        // Gọi các hàm với routeName hiện tại
        const mainData = await this.getDrivingRouteGraphData(updatedDto, schema);
        const EWMAVG = await this.getDrivingRouteGraphEWMStartEndDate(updatedDto, schema);
        extended = await this.getTotalOfElement(updatedDto, schema);
        // Lưu trữ dữ liệu cho routeName hiện tại
        result[routeName] = {
          ...mainData
        };

        // Tính tổng cho tất cả các ngày
        Object.keys(mainData).forEach((date) => {
          const dayData = mainData[date];

          if (!overallSum[date]) {
            overallSum[date] = 0;
            vehicleCountPerDay[date] = 0;
          }

          // Cộng dồn giá trị vào tổng của ngày đó, kể cả khi giá trị là null
          if (dayData !== null) {
            overallSum[date] += dayData; // Cộng tổng các giá trị khác null
            vehicleCountPerDay[date] += 1; // Đếm số lượng phương tiện có dữ liệu cho ngày đó
          }
        });

        Object.keys(EWMAVG).forEach((date) => {
          const dayData = EWMAVG[date];

          if (!overallEWM[date]) {
            overallEWM[date] = 0;
            vehicleCountPerDay[date] = 0;
          }

          // Cộng dồn giá trị vào tổng của ngày đó, kể cả khi giá trị là null
          if (dayData !== null) {
            overallEWM[date] += dayData; // Cộng tổng các giá trị khác null
            vehicleCountPerDay[date] += 1; // Đếm số lượng phương tiện có dữ liệu cho ngày đó
          }
        });
      })
    );

    // Tính giá trị trung bình cho tất cả các phương tiện
    const averageData = {};
    Object.keys(overallSum).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        averageData[date] = overallSum[date] / vehicleCountPerDay[date] || null; // Tính trung bình cho ngày có dữ liệu
      } else {
        averageData[date] = null; // Để null nếu không có phương tiện nào có dữ liệu cho ngày đó
      }
    });

    const averageEWMData = {};
    Object.keys(overallEWM).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        averageEWMData[date] = overallEWM[date] / vehicleCountPerDay[date]; // Tính trung bình cho ngày có dữ liệu
      } else {
        averageEWMData[date] = null; // Để null nếu không có phương tiện nào có dữ liệu cho ngày đó
      }
    });

    // Trả về kết quả cuối cùng, bao gồm dữ liệu gốc và dữ liệu trung bình
    return {
      mainData: {
        route: result,
        AVG: {
          average: averageData, // Thêm dữ liệu trung bình vào kết quả
          EWM: averageEWMData,
        }
      },
      extended
    };
  }

  // Collect Count Graph
  buildAggregationsCollectCount = () => ({
    total_5L_gen: { sum: { field: 'data.5L_gen' } },
    total_10L_gen: { sum: { field: 'data.10L_gen' } },
    total_10L_reu: { sum: { field: 'data.10L_reu' } },
    total_20L_gen: { sum: { field: 'data.20L_gen' } },
    total_20L_reu: { sum: { field: 'data.20L_reu' } },
    total_30L_gen: { sum: { field: 'data.30L_gen' } },
    total_50L_gen: { sum: { field: 'data.50L_gen' } },
    total_50L_pub: { sum: { field: 'data.50L_pub' } },
    total_75L_gen: { sum: { field: 'data.75L_gen' } },
    total_75L_pub: { sum: { field: 'data.75L_pub' } },
    total_ext: { sum: { field: 'data.ext' } },
    total_etc: { sum: { field: 'data.etc' } }
  });

  convertUnit = (value: number, unit: string) => {
    if (unit) {
      switch (unit.toLowerCase()) {
        case 'kg':
          return value * 0.001; // Ví dụ: 1 lít = 0.001 kg
        case 'm3':
          return value * 0.001; // Ví dụ: 1 lít = 0.001 m³
        case 'lit': // Mặc định không chuyển đổi nếu là lít
        default:
          return value;
      }
    }
    return value
  };

  async getCollectMetricsForCollectCountGraph(collectCountGraphDto: CollectCountGraphDto, dispatchNo: string, schema: string) {
    const { startDate, endDate, cumulation, unit, trashBagType } = collectCountGraphDto;
    const mustQueries = [];

    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    });

    // Prepare the sum script based on trashBagType
    let sumScript = `
        long sum = 0;
    `;

    const trashBagTypes = trashBagType
      ? trashBagType.split(',').map(type => type.trim())
      : ['5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu', '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'];

    trashBagTypes.forEach(type => {
      sumScript += `sum += doc['data.${type}'].value;\n`;
    });

    sumScript += `return sum;`;

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      "aggs": {
        trips_by_time: {
          date_histogram: {
            field: "data.timestamp",
            interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: {
            "total_sum": {
              "sum": {
                "script": {
                  "source": sumScript,
                  "lang": "painless"
                }
              }
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return this.formatResponseCollectCountGraph(result, startDate, endDate, cumulation, unit);
  }

  async getCollectMetricsForAllType(collectCountGraphDto: CollectCountGraphDto, dispatchNo: string, schema: string) {
    const { startDate, endDate, unit, trashBagType } = collectCountGraphDto;
    const mustQueries = [];

    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    });

    // Chuẩn bị danh sách các trường sẽ tính sum dựa trên trashBagType
    const defaultTrashBagTypes = ['5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu', '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'];
    const trashBagTypes = trashBagType ? trashBagType.split(',').map(type => type.trim()) : defaultTrashBagTypes;

    // Tạo script sum cho totalOfDay
    let totalOfDayScript = `
        long sum = 0;
    `;

    trashBagTypes.forEach(type => {
      totalOfDayScript += `sum += doc['data.${type}'].value;\n`;
    });

    totalOfDayScript += `return sum;`;

    // Tạo body cho query Elasticsearch
    const body = {
      size: 0,
      query: {
        bool: {
          must: mustQueries,
        },
      },
      aggs: {
        trips_by_time: {
          date_histogram: {
            field: 'data.timestamp',
            interval: 'day',
            format: 'yyyy-MM-dd',
          },
          aggs: {
            totalOfDay: {
              "sum": {
                "script": {
                  "source": totalOfDayScript,
                  "lang": "painless"
                }
              },
            },
            // Các trường sum khác dựa trên trashBagTypes
          }
        }
      }
    };

    trashBagTypes.forEach(type => {
      body.aggs.trips_by_time.aggs[type] = { sum: { field: `data.${type}` } };
    });

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    const buckets = result.body.aggregations.trips_by_time.buckets;

    // Tạo một danh sách tất cả các ngày giữa startDate và endDate
    const allDates = this.generateDateRangesForStatistics(startDate, endDate);

    const formattedResult = {};

    // Duyệt qua từng ngày trong khoảng từ startDate đến endDate
    allDates.forEach(({ date }) => {
      const foundBucket = buckets.find(bucket => bucket.key_as_string === date);

      // Nếu có bucket cho ngày này, sử dụng giá trị từ bucket, nếu không thì để null
      if (foundBucket) {
        formattedResult[date] = {
          totalOfDay: this.convertUnit(foundBucket.totalOfDay.value || 0, unit),
        };

        trashBagTypes.forEach(type => {
          formattedResult[date][type] = this.convertUnit(foundBucket[type].value || 0, unit);
        });
      } else {
        // Nếu không có dữ liệu cho ngày này, gán null
        formattedResult[date] = {
          totalOfDay: null,
        };

        trashBagTypes.forEach(type => {
          formattedResult[date][type] = null;
        });
      }
    });

    return formattedResult;
  }

  private formatResponseCollectCountGraph(data: any, startDate: string, endDate: string, cumulation: number, unit: string) {
    // Tạo object chứa dữ liệu cho từng ngày
    const expandedCollectCount: any = {};

    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Khởi tạo tất cả các ngày với giá trị null ban đầu trong object
    dateRanges.forEach(({ date }) => {
      expandedCollectCount[date] = null;
    });

    // Chuyển đổi cumulation từ string sang boolean
    const isCumulative = +cumulation === 1;

    let cumulativeSum = 0;

    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
      const date = bucket.key_as_string;
      let dayValue = bucket.total_sum?.value || 0;
      if (dayValue === 0) dayValue = null;

      // Chuyển đổi đơn vị
      if (dayValue !== null) {
        dayValue = this.convertUnit(dayValue, unit);
      }

      // Nếu cộng dồn, tính cumulativeSum, ngược lại gán trực tiếp
      if (isCumulative && dayValue !== null) {
        cumulativeSum += dayValue;
        expandedCollectCount[date] = cumulativeSum;
      } else {
        expandedCollectCount[date] = dayValue;
      }
    });

    return expandedCollectCount;
  }

  private async extractMetricsForCollectCount(dispatchNo: string, date: string, schema: string) {
    const collectCount = await this.getCollectMetrics(
      dispatchNo,
      date,
      schema
    )
    return collectCount
  }

  async calculateCollectCountEWMForOneDay(routeName: string, date: string, schema: string) {
    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const genDate = this.generate7DaysBefore(date);
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const collectCount = await this.extractMetricsForCollectCount(dispatchNo, date, schema);
        return {
          date,
          collectCount,
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.calculateStatistics(oneMetric);
    const zCollectCounts = this.calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const ewmMetricsFor7Days = this.calculateEWM(zCollectCounts.map((m) => m), 0.1);

    return ewmMetricsFor7Days.reverse().slice(-1)[0];
  }

  async getCollectCountGraphEWMStartEndDate(collectCountGraphDto: CollectCountGraphDto, schema: string) {
    const { routeName, startDate, endDate } = collectCountGraphDto;
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Sử dụng Promise.all để đảm bảo tất cả các promise được xử lý
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const result = await this.calculateCollectCountEWMForOneDay(routeName, date, schema);
        return {
          date,
          resultValue: result  // Giả định result chứa giá trị bạn cần trả về
        };
      })
    );

    // Chuyển đổi metricsArray thành một đối tượng với khóa là ngày và giá trị là resultValue
    const resultObject = metricsArray.reduce((acc, { date, resultValue }) => {
      acc[date] = resultValue;
      return acc;
    }, {});

    return resultObject; // Trả về đối tượng đã định dạng theo yêu cầu
  }

  async calculateAverageEWMCollectCount(collectCountGraphDto: CollectCountGraphDto, schema: string) {
    const { routeName, startDate, endDate, cumulation } = collectCountGraphDto;
    const allVehicleMetrics = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleData = allVehicleMetrics.map((vehicleData) => vehicleData.route_name);
    const routeNames = routeName ? convertToArray(routeName) : allVehicleData; // Mảng routeName

    const vehicleCountPerDay: any = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const overallEWM: any = {}; // Tính tổng EWM cho mỗi ngày
    let cumulativeSum = 0; // Biến để lưu trữ giá trị cộng dồn nếu cumulation = true

    // Chuyển đổi cumulation từ string sang boolean
    const isCumulative = +cumulation === 1;

    // Duyệt qua tất cả các routeNames và tính tổng EWM
    await Promise.all(
      routeNames.map(async (routeName) => {
        // Cập nhật lại searchAndFilterListDto với routeName hiện tại
        const updatedDto = { ...collectCountGraphDto, routeName };

        // Gọi hàm để lấy EWM trung bình cho mỗi ngày
        const EWMAVG = await this.getCollectCountGraphEWMStartEndDate(updatedDto, schema);

        // Duyệt qua các ngày và cộng giá trị EWM
        Object.keys(EWMAVG).forEach((date) => {
          const dayData = EWMAVG[date];

          if (!overallEWM[date]) {
            overallEWM[date] = 0;
            vehicleCountPerDay[date] = 0;
          }

          // Cộng dồn giá trị nếu có dữ liệu cho ngày đó
          if (dayData !== null) {
            overallEWM[date] += dayData; // Cộng tổng các giá trị khác null
            vehicleCountPerDay[date] += 1; // Đếm số lượng phương tiện có dữ liệu cho ngày đó
          }
        });
      })
    );

    // Tính trung bình EWM cho tất cả các phương tiện và tiến hành cộng dồn nếu cumulation = true
    const averageEWMData: any = {};
    Object.keys(overallEWM).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        const averageValue = overallEWM[date] / vehicleCountPerDay[date]; // Tính trung bình

        if (isCumulative) {
          // Nếu cumulation = true, cộng dồn giá trị của các ngày trước đó
          cumulativeSum += averageValue;
          averageEWMData[date] = cumulativeSum;
        } else {
          // Nếu không cộng dồn, chỉ gán giá trị trung bình cho ngày đó
          averageEWMData[date] = averageValue;
        }
      } else {
        averageEWMData[date] = null; // Để null nếu không có dữ liệu cho ngày đó
      }
    });

    return averageEWMData;
  }

  private formatResponseCollectCountSection(data: any, startDate: string, endDate: string) {
    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Khởi tạo object chứa dữ liệu cho từng ngày
    const expandedCollectCount: Record<string, any> = {};

    // Duyệt qua tất cả các ngày trong khoảng từ startDate đến endDate, khởi tạo null cho từng ngày
    dateRanges.forEach(({ date }) => {
      expandedCollectCount[date] = { totalOfDay: null };
    });

    // Duyệt qua từng bucket (mỗi bucket tương ứng với một ngày)
    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
      const date = bucket.key_as_string; // Ngày từ Elasticsearch

      // Kiểm tra nếu ngày tồn tại trong expandedCollectCount
      if (!expandedCollectCount[date]) {
        expandedCollectCount[date] = { totalOfDay: null };
      }

      let totalOfDay = 0; // Biến tạm để tính tổng số của ngày

      // Duyệt qua từng section trong by_route.buckets
      bucket.by_route.buckets.forEach((sectionBucket: any) => {
        const sectionKey = sectionBucket.key;
        const sectionValue = sectionBucket.total_sum?.value || 0;

        // Gán giá trị section vào ngày tương ứng
        expandedCollectCount[date][sectionKey] = sectionValue;

        // Cộng dồn giá trị section vào tổng của ngày
        totalOfDay += sectionValue;
      });

      // Nếu có section thì gán totalOfDay, nếu không có thì giữ nguyên là null
      if (totalOfDay > 0) {
        expandedCollectCount[date].totalOfDay = totalOfDay;
      }
    });

    return expandedCollectCount;
  }

  async getSectionCollectCountGraph(dispatchNo: string, startDate: string, endDate: string, schema: string, sectionName?: string) {
    const mustQueries = [];
    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    if (sectionName) {
      mustQueries.push({ terms: { 'data.section_name.keyword': convertToArray(sectionName) } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    })

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      "aggs": {
        trips_by_time: {
          date_histogram: {
            field: "data.timestamp",
            interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: {
            by_route: {
              terms: { field: 'data.section_name.keyword', size: 10 },
              aggs: {
                "total_sum": {
                  "sum": {
                    "script": {
                      "source": `
                        long sum = 0;
                        sum += doc['data.5L_gen'].value;
                        sum += doc['data.10L_gen'].value;
                        sum += doc['data.10L_reu'].value;
                        sum += doc['data.20L_gen'].value;
                        sum += doc['data.20L_reu'].value;
                        sum += doc['data.30L_gen'].value;
                        sum += doc['data.50L_gen'].value;
                        sum += doc['data.50L_pub'].value;
                        sum += doc['data.75L_gen'].value;
                        sum += doc['data.75L_pub'].value;
                        sum += doc['data.ext'].value;
                        sum += doc['data.etc'].value;
                        return sum;
                      `,
                      "lang": "painless"
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    // return result.body.aggregations.trips_by_time.buckets

    return this.formatResponseCollectCountSection(result, startDate, endDate);
  }

  async getSectionList(dispatchNo: string, startDate: string, endDate: string, schema: string) {
    const mustQueries = [];
    if (dispatchNo) {
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    })

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      aggs: {
        unique_vehicle_dispatch: {
          composite: {
            sources: [
              { section_name: { terms: { field: 'data.section_name.keyword' } } },
            ],
            size: 10000
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return result.body.aggregations.unique_vehicle_dispatch.buckets.map((m) => m.key.section_name);
  }

  private calculateDailyAverage(data: any) {
    const average: Record<string, number | null> = {};

    // Duyệt qua từng ngày trong data
    Object.keys(data).forEach((date) => {
      const dayData = data[date];
      const sections = Object.keys(dayData).filter(key => key !== 'totalOfDay');

      // Nếu không có section nào, gán average cho ngày đó là null
      if (sections.length === 0) {
        average[date] = null;
        return;
      }

      // Tính tổng giá trị các section trong ngày đó
      let totalSum = 0;
      let sectionCount = 0;

      sections.forEach(section => {
        const value = dayData[section];

        // Chỉ tính những section có giá trị hợp lệ
        if (value !== null && value !== undefined) {
          totalSum += value;
          sectionCount++;
        }
      });

      // Tính giá trị trung bình nếu có section, nếu không có thì gán null
      average[date] = sectionCount > 0 ? totalSum / sectionCount : null;
    });

    return average;
  }


  async getCollectCountGraph(collectCountGraphDto: CollectCountGraphDto, schema: string) {
    const { routeName, startDate, endDate, aggregation, L3Extension, L4Extension, sectionName } = collectCountGraphDto;
    const allVehicleMetrics = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleData = allVehicleMetrics.map((vehicleData) => vehicleData.route_name);
    const routeNames = routeName ? convertToArray(routeName) : allVehicleData; // Mảng routeName
    const result = {}; // Để lưu kết quả cho từng ngày khi L3Extension hoặc L4Extension = true
    const overallSumPerDay = {}; // Biến lưu trữ tổng giá trị của tất cả các route cho mỗi ngày (tổng số nguyên)
    const detailedSumPerDay = {}; // Biến lưu trữ dữ liệu chi tiết khi L3Extension hoặc L4Extension = true
    const vehicleCountPerDay = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const maxPerDay = {};
    const minPerDay = {};
    let newArray = null
    let newAvg = null;
    let sectionList = null;

    await Promise.all(
      routeNames.map(async (routeName) => {
        const updatedDto = { ...collectCountGraphDto, routeName };
        const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
        const mainData = await this.getCollectMetricsForCollectCountGraph(updatedDto, dispatchNo, schema);
        const agre = await this.getCollectMetricsForAllType(updatedDto, dispatchNo, schema);
        const collectType = await this.getSectionCollectCountGraph(dispatchNo, startDate, endDate, schema, sectionName);
        const AVGcollectType = this.calculateDailyAverage(collectType);
        const newSectionList = await this.getSectionList(dispatchNo, startDate, endDate, schema);

        if (!aggregation && convertToArray(routeName).length === 1) {
          newArray = collectType;
          newAvg = AVGcollectType
          sectionList = newSectionList
        }

        result[routeName] = { ...mainData };

        Object.keys(mainData).forEach((date) => {
          const dayData = mainData[date];

          if (!overallSumPerDay[date]) {
            overallSumPerDay[date] = 0;
            vehicleCountPerDay[date] = 0;
            maxPerDay[date] = -Infinity;
            minPerDay[date] = Infinity;
          }

          if (dayData !== null && dayData !== undefined) {
            overallSumPerDay[date] += dayData;
            vehicleCountPerDay[date] += 1;

            if (dayData > maxPerDay[date]) {
              maxPerDay[date] = dayData;
            }
            if (dayData < minPerDay[date]) {
              minPerDay[date] = dayData;
            }
          }
        });

        if (L4Extension) {
          Object.keys(agre).forEach((date) => {
            const dayData = agre[date];

            if (!detailedSumPerDay[date]) {
              detailedSumPerDay[date] = {
                totalOfDay: null,
                "5L_gen": null,
                "10L_gen": null,
                "10L_reu": null,
                "20L_gen": null,
                "20L_reu": null,
                "30L_gen": null,
                "50L_gen": null,
                "50L_pub": null,
                "75L_gen": null,
                "75L_pub": null,
                "ext": null,
                "etc": null
              };
            }

            // Cộng dồn các giá trị chi tiết cho từng ngày, nếu không có thì để null
            detailedSumPerDay[date].totalOfDay = (detailedSumPerDay[date].totalOfDay || 0) + (dayData.totalOfDay || 0) || null;
            detailedSumPerDay[date]["5L_gen"] = (detailedSumPerDay[date]["5L_gen"] || 0) + (dayData["5L_gen"] || 0) || null;
            detailedSumPerDay[date]["10L_gen"] = (detailedSumPerDay[date]["10L_gen"] || 0) + (dayData["10L_gen"] || 0) || null;
            detailedSumPerDay[date]["10L_reu"] = (detailedSumPerDay[date]["10L_reu"] || 0) + (dayData["10L_reu"] || 0) || null;
            detailedSumPerDay[date]["20L_gen"] = (detailedSumPerDay[date]["20L_gen"] || 0) + (dayData["20L_gen"] || 0) || null;
            detailedSumPerDay[date]["20L_reu"] = (detailedSumPerDay[date]["20L_reu"] || 0) + (dayData["20L_reu"] || 0) || null;
            detailedSumPerDay[date]["30L_gen"] = (detailedSumPerDay[date]["30L_gen"] || 0) + (dayData["30L_gen"] || 0) || null;
            detailedSumPerDay[date]["50L_gen"] = (detailedSumPerDay[date]["50L_gen"] || 0) + (dayData["50L_gen"] || 0) || null;
            detailedSumPerDay[date]["50L_pub"] = (detailedSumPerDay[date]["50L_pub"] || 0) + (dayData["50L_pub"] || 0) || null;
            detailedSumPerDay[date]["75L_gen"] = (detailedSumPerDay[date]["75L_gen"] || 0) + (dayData["75L_gen"] || 0) || null;
            detailedSumPerDay[date]["75L_pub"] = (detailedSumPerDay[date]["75L_pub"] || 0) + (dayData["75L_pub"] || 0) || null;
            detailedSumPerDay[date]["ext"] = (detailedSumPerDay[date]["ext"] || 0) + (dayData["ext"] || 0) || null;
            detailedSumPerDay[date]["etc"] = (detailedSumPerDay[date]["etc"] || 0) + (dayData["etc"] || 0) || null;
          });
        }

        if (L3Extension) {
          Object.keys(agre).forEach((date) => {
            const dayData = agre[date];

            if (!detailedSumPerDay[date]) {
              detailedSumPerDay[date] = {
                totalOfDay: null,
              };
            }
            detailedSumPerDay[date].totalOfDay = (detailedSumPerDay[date].totalOfDay || 0) + (dayData.totalOfDay || 0) || null;
            detailedSumPerDay[date][routeName] = dayData.totalOfDay || null;
          });
        }
      })
    );

    const averageData = {};
    const aggregationData = {};
    Object.keys(overallSumPerDay).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        const average = overallSumPerDay[date] / vehicleCountPerDay[date];
        averageData[date] = average || null;

        if (aggregation) {
          aggregationData[date] = {
            totalOfDay: overallSumPerDay[date],
            average: average,
            max: maxPerDay[date] === -Infinity ? null : maxPerDay[date],
            min: minPerDay[date] === Infinity ? null : minPerDay[date]
          };
        }
      } else {
        averageData[date] = null;
        if (aggregation) {
          aggregationData[date] = {
            totalOfDay: null,
            average: null,
            max: null,
            min: null
          };
        }
      }
    });

    const averageEWMData = await this.calculateAverageEWMCollectCount(collectCountGraphDto, schema);
    if (L3Extension) {
      if (!aggregation && convertToArray(routeName).length === 1) {
        return {
          route: newArray, // Tổng giá trị của tất cả các route cho mỗi ngày
          AVG: {
            average: newAvg,
            EWM: averageEWMData,
          },
          sectionList
        };
      } else if (aggregation && convertToArray(routeName).length === 1) {
        return {
          route: detailedSumPerDay, // Tổng giá trị của tất cả các route cho mỗi ngày
          AVG: {
            average: averageData,
            EWM: averageEWMData,
          }
        }
      } else {
        return {
          route: detailedSumPerDay, // Tổng giá trị của tất cả các route cho mỗi ngày
          AVG: {
            average: averageData,
            EWM: averageEWMData,
          }
        };
      }
    }

    if (L4Extension) {
      return {
        route: detailedSumPerDay, // Tổng giá trị của tất cả các route cho mỗi ngày (chi tiết)
        AVG: {
          average: averageData, // Dữ liệu trung bình cho mỗi ngày
          EWM: averageEWMData,
        }
      };
    }

    return aggregation
      ? {
        route: aggregationData, // Dữ liệu tính tổng, max, min khi aggregation = true
        AVG: {
          average: averageData,
          EWM: averageEWMData,
        }
      }
      : {
        route: result,
        AVG: {
          average: averageData,
          EWM: averageEWMData,
        }
      };
  }

  // Custom Graph
  async getCustomStandardScoreData(customGraphDto: CustomGraphDto, schema: string) {
    const {
        routeName, startDate, endDate,
        yAxises1, yAxises2, conditions1, conditions2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {};

    const metricsArray = await Promise.all(
        dateRanges.map(async ({ date }) => {
            const mustQueriesForRange = [
                mustQueries,
                this.buildDateRangeQuery(date),
            ];

            const result = await this.fetchAggregations(mustQueriesForRange, schema);

            const {
                distanceRatios, collectDistance, otherDistance,
                durationRatios, collectDuration, otherDuration,
                collectCount
            } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

            const manualCollectDistance = await this.manualCollectService.manualCollectDistance(routeName, schema);
            const weight = 2.4;
            const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);

            if (
                distanceRatios === 0 && collectDistance === 0 &&
                otherDistance === 0 && durationRatios === 0 &&
                collectDuration === 0 && otherDuration === 0 &&
                collectCount === 0 && manualCollectTime
            ) {
                metricsMap[date] = null;
            } else {
                metricsMap[date] = {
                    distanceRatios, collectDistance, otherDistance,
                    durationRatios, collectDuration, otherDuration,
                    collectCount, manualCollectTime
                };
            }

            return {
                date, distanceRatios, collectDistance, otherDistance,
                durationRatios, collectDuration, otherDuration,
                collectCount, manualCollectTime
            };
        })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.calculateStatistics(oneMetric);
    const zDistanceRatios = this.calculateZScores(oneMetric.map(v => v.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = this.calculateZScores(oneMetric.map(v => v.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = this.calculateZScores(oneMetric.map(v => v.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = this.calculateZScores(oneMetric.map(v => v.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = this.calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = this.calculateZScores(oneMetric.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);

    const rankScores = this.calculateWeightedSumCoreDataSet(
        zDistanceRatios, zDurationRatios, zCollectDistances,
        zCollectDurations, zCollectCounts, zManualCollectTime,
        { distanceRatioRate: 0.15, durationRatioRate: 0.15, collectDistanceRate: 0.15, collectDurationRate: 0.15, collectCountRate: 0.3, manualCollectTimeRate: 0.1 }
    );

    let zScores1 = rankScores.map((score) => score * 20 + 100);
    let zScores2 = [...zScores1]; // Duplicate to apply cumulation separately

    if (+cumulation_y1 === 1) {
        zScores1 = zScores1.reduce((acc, score, index) => {
            if (index === 0) {
                acc.push(score);
            } else {
                acc.push(acc[index - 1] + score);
            }
            return acc;
        }, []);
    }

    if (+cumulation_y2 === 1) {
        zScores2 = zScores2.reduce((acc, score, index) => {
            if (index === 0) {
                acc.push(score);
            } else {
                acc.push(acc[index - 1] + score);
            }
            return acc;
        }, []);
    }

    const checkConditions = (conditions, score, axis) => {
        let currentResult = applyCondition(conditions[0], score, axis);

        for (let i = 1; i < conditions.length; i++) {
            const logicalOp = conditions[i].logicalOperator || 'AND';
            const nextResult = applyCondition(conditions[i], score, axis);

            if (logicalOp === 'AND') {
                currentResult = currentResult && nextResult;
            } else if (logicalOp === 'OR') {
                currentResult = currentResult || nextResult;
            }
        }

        return currentResult;
    };

    const applyCondition = (condition, score, axis) => {
        if (condition.domain !== axis) return true;
        switch (condition.condition) {
            case 'Equals': return score === condition.value;
            case 'Greater than': return score > condition.value;
            case 'Greater than or equals': return score >= condition.value;
            case 'Less than': return score < condition.value;
            case 'Less than or equals': return score <= condition.value;
            case 'Not equals': return score !== condition.value;
            default: throw new Error('Unknown condition type');
        }
    };

    let filteredZScores = null;

    if (yAxises1 && conditions1) {
        filteredZScores = zScores1.map((score) => checkConditions(conditions1, score, yAxises1) ? score : null);
    } else if (yAxises2 && conditions2) {
        filteredZScores = zScores2.map((score) => checkConditions(conditions2, score, yAxises2) ? score : null);
    }

    const dailyResults = dateRanges.map(({ date }, index) => {
        const metrics = metricsMap[date];

        if (!metrics) {
            return { [date]: null };
        } else if (filteredZScores && filteredZScores[index] !== undefined) {
            return { [date]: filteredZScores[index] };
        } else if (rankScores && rankScores[index] !== undefined) {
            return { [date]: rankScores[index] };
        } else {
            return { [date]: null };
        }
    });

    const result = {
        ...Object.assign({}, ...dailyResults),
    };

    return { data: result };
  }

  async getCollectDistancetData(customGraphDto: CustomGraphDto, schema: string) {
    const {
        routeName, startDate, endDate,
        conditions1, conditions2, yAxises1, yAxises2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {};

    // Fetch metrics for each date range
    const metricsArray = await Promise.all(
        dateRanges.map(async ({ date }) => {
            const mustQueriesForRange = [
                mustQueries,
                this.buildDateRangeQuery(date),
            ];

            const result = await this.fetchAggregations(mustQueriesForRange, schema);

            const { collectDistance } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

            if (collectDistance === 0) {
                metricsMap[date] = null;
            } else {
                metricsMap[date] = { collectDistance };
            }

            return {
                date,
                collectDistance,
            };
        })
    );

    // Prepare collectDistance data for conditions
    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();
    const result1 = oneMetric.map((metric) => metric.collectDistance);

    // Separate filteredZScores for each yAxis
    let filteredZScores1 = null;
    let filteredZScores2 = null;

    // Apply conditions and accumulate based on yAxises1
    if (yAxises1 === 'collectDistance') {
        filteredZScores1 = result1.map((score) => {
            let isValid = true;
            if (conditions1) {
                conditions1.forEach((condition) => {
                    if (condition.domain === yAxises1) {
                        switch (condition.condition) {
                            case 'Equals':
                                if (score !== condition.value) isValid = false;
                                break;
                            case 'Greater than':
                                if (score <= condition.value) isValid = false;
                                break;
                            case 'Greater than or equals':
                                if (score < condition.value) isValid = false;
                                break;
                            case 'Less than':
                                if (score >= condition.value) isValid = false;
                                break;
                            case 'Less than or equals':
                                if (score > condition.value) isValid = false;
                                break;
                            case 'Not equals':
                                if (score === condition.value) isValid = false;
                                break;
                            default:
                                throw new Error('Unknown condition type');
                        }
                    }
                });
            }
            return isValid ? score : null;
        });
    }

    // Apply conditions and accumulate based on yAxises2
    if (yAxises2 === 'collectDistance') {
        filteredZScores2 = result1.map((score) => {
            let isValid = true;
            if (conditions2) {
                conditions2.forEach((condition) => {
                    if (condition.domain === yAxises2) {
                        switch (condition.condition) {
                            case 'Equals':
                                if (score !== condition.value) isValid = false;
                                break;
                            case 'Greater than':
                                if (score <= condition.value) isValid = false;
                                break;
                            case 'Greater than or equals':
                                if (score < condition.value) isValid = false;
                                break;
                            case 'Less than':
                                if (score >= condition.value) isValid = false;
                                break;
                            case 'Less than or equals':
                                if (score > condition.value) isValid = false;
                                break;
                            case 'Not equals':
                                if (score === condition.value) isValid = false;
                                break;
                            default:
                                throw new Error('Unknown condition type');
                        }
                    }
                });
            }
            return isValid ? score : null;
        });
    }

    // Accumulate if cumulation1 is set for yAxises1
    if (+cumulation_y1 === 1 && filteredZScores1) {
        let cumulativeSum1 = 0;
        filteredZScores1 = filteredZScores1.map((score) => {
            if (score !== null) {
                cumulativeSum1 += score;
                return cumulativeSum1;
            }
            return null;
        });
    }

    // Accumulate if cumulation2 is set for yAxises2
    if (+cumulation_y2 === 1 && filteredZScores2) {
        let cumulativeSum2 = 0;
        filteredZScores2 = filteredZScores2.map((score) => {
            if (score !== null) {
                cumulativeSum2 += score;
                return cumulativeSum2;
            }
            return null;
        });
    }

    // Map daily results based on cumulation and filtered scores
    const dailyResults = dateRanges.map(({ date }, index) => {
        const metrics = metricsMap[date];

        if (!metrics) {
            return { [date]: null };
        } else if (filteredZScores1 && filteredZScores1[index] !== undefined) {
            return { [date]: filteredZScores1[index] };
        } else if (filteredZScores2 && filteredZScores2[index] !== undefined) {
            return { [date]: filteredZScores2[index] };
        } else if (result1 && result1[index] !== undefined) {
            return { [date]: result1[index] };
        } else {
            return { [date]: null };
        }
    });

    // Merge daily results into the final output
    const result = {
        ...Object.assign({}, ...dailyResults),
    };

    return { data: result };
  }

  async getCollectTimetData(customGraphDto: CustomGraphDto, schema: string) {
    const {
        routeName, startDate, endDate,
        conditions1, conditions2, yAxises1, yAxises2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
    const mustQueries = { term: { 'data.route_name.keyword': routeName } };
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {};

    // Fetch metrics for each date range
    const metricsArray = await Promise.all(
        dateRanges.map(async ({ date }) => {
            const mustQueriesForRange = [
                mustQueries,
                this.buildDateRangeQuery(date),
            ];

            const result = await this.fetchAggregations(mustQueriesForRange, schema);

            const { collectDuration } = await this.extractMetricsForCoreDataSet(result, dispatchNo, date, schema);

            if (collectDuration === 0) {
                metricsMap[date] = null;
            } else {
                metricsMap[date] = { collectDuration };
            }

            return {
                date,
                collectDuration,
            };
        })
    );

    // Prepare collectDuration data for conditions
    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();
    const result1 = oneMetric.map((metric) => metric.collectDuration);

    // Separate filteredZScores for each yAxis
    let filteredZScores1 = null;
    let filteredZScores2 = null;

    // Apply conditions and accumulate based on yAxises1
    if (yAxises1 === 'collectTime') {
        filteredZScores1 = result1.map((score) => {
            let isValid = true;
            if (conditions1) {
                conditions1.forEach((condition) => {
                    if (condition.domain === yAxises1) {
                        switch (condition.condition) {
                            case 'Equals':
                                if (score !== condition.value) isValid = false;
                                break;
                            case 'Greater than':
                                if (score <= condition.value) isValid = false;
                                break;
                            case 'Greater than or equals':
                                if (score < condition.value) isValid = false;
                                break;
                            case 'Less than':
                                if (score >= condition.value) isValid = false;
                                break;
                            case 'Less than or equals':
                                if (score > condition.value) isValid = false;
                                break;
                            case 'Not equals':
                                if (score === condition.value) isValid = false;
                                break;
                            default:
                                throw new Error('Unknown condition type');
                        }
                    }
                });
            }
            return isValid ? score : null;
        });
    }

    // Apply conditions and accumulate based on yAxises2
    if (yAxises2 === 'collectTime') {
        filteredZScores2 = result1.map((score) => {
            let isValid = true;
            if (conditions2) {
                conditions2.forEach((condition) => {
                    if (condition.domain === yAxises2) {
                        switch (condition.condition) {
                            case 'Equals':
                                if (score !== condition.value) isValid = false;
                                break;
                            case 'Greater than':
                                if (score <= condition.value) isValid = false;
                                break;
                            case 'Greater than or equals':
                                if (score < condition.value) isValid = false;
                                break;
                            case 'Less than':
                                if (score >= condition.value) isValid = false;
                                break;
                            case 'Less than or equals':
                                if (score > condition.value) isValid = false;
                                break;
                            case 'Not equals':
                                if (score === condition.value) isValid = false;
                                break;
                            default:
                                throw new Error('Unknown condition type');
                        }
                    }
                });
            }
            return isValid ? score : null;
        });
    }

    // Accumulate if cumulation1 is set for yAxises1
    if (+cumulation_y1 === 1 && filteredZScores1) {
        let cumulativeSum1 = 0;
        filteredZScores1 = filteredZScores1.map((score) => {
            if (score !== null) {
                cumulativeSum1 += score;
                return cumulativeSum1;
            }
            return null;
        });
    }

    // Accumulate if cumulation2 is set for yAxises2
    if (+cumulation_y2 === 1 && filteredZScores2) {
        let cumulativeSum2 = 0;
        filteredZScores2 = filteredZScores2.map((score) => {
            if (score !== null) {
                cumulativeSum2 += score;
                return cumulativeSum2;
            }
            return null;
        });
    }

    // Map daily results based on cumulation and filtered scores
    const dailyResults = dateRanges.map(({ date }, index) => {
        const metrics = metricsMap[date];

        if (!metrics) {
            return { [date]: null };
        } else if (filteredZScores1 && filteredZScores1[index] !== undefined) {
            return { [date]: filteredZScores1[index] };
        } else if (filteredZScores2 && filteredZScores2[index] !== undefined) {
            return { [date]: filteredZScores2[index] };
        } else if (result1 && result1[index] !== undefined) {
            return { [date]: result1[index] };
        } else {
            return { [date]: null };
        }
    });

    // Merge daily results into the final output
    const result = {
        ...Object.assign({}, ...dailyResults),
    };

    return { data: result };
  }

  private formatResponseData(data: any, customGraphDto: CustomGraphDto) {
    const { startDate, endDate, conditions1, conditions2, cumulation_y1, cumulation_y2 } = customGraphDto;

    const driveModes = [
        { key: 'total_drive_mode_0', label: 'driveMode0' },
        { key: 'total_drive_mode_1', label: 'driveMode1' },
        { key: 'total_drive_mode_2', label: 'driveMode2' },
        { key: 'total_drive_mode_3', label: 'driveMode3' },
        { key: 'total_drive_mode_4', label: 'driveMode4' },
        { key: 'total_drive_mode_6', label: 'driveMode6' },
        { key: 'total_drive_mode_7', label: 'driveMode7' },
        { key: 'total_drive_mode_8', label: 'driveMode8' },
    ];

    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);
    const result = {};

    let cumulativeOtherDistance1 = 0;
    let cumulativeOtherDistance2 = 0;
    let cumulativeOtherTime1 = 0;
    let cumulativeOtherTime2 = 0;
    const cumulativeDriveModes1 = {};
    const cumulativeDriveModes2 = {};

    driveModes.forEach((driveMode) => {
        cumulativeDriveModes1[driveMode.label] = 0;
        cumulativeDriveModes2[driveMode.label] = 0;
    });

    const activeConditions1 = conditions1?.length ? conditions1 : conditions2;
    const activeConditions2 = conditions1?.length && conditions2?.length ? conditions2 : null;

    const conditionDriveModes1 = activeConditions1?.filter(cond => driveModes.some(mode => mode.label === cond.domain));
    const conditionOtherDistance1 = activeConditions1?.find(cond => cond.domain || customGraphDto.yAxises1 === 'otherDistance');
    const conditionOtherTime1 = activeConditions1?.find(cond => cond.domain || customGraphDto.yAxises1 === 'otherTime');

    const conditionDriveModes2 = activeConditions2?.filter(cond => driveModes.some(mode => mode.label === cond.domain));
    const conditionOtherDistance2 = activeConditions2?.find(cond => cond.domain || customGraphDto.yAxises2 === 'otherDistance');
    const conditionOtherTime2 = activeConditions2?.find(cond => cond.domain || customGraphDto.yAxises2 === 'otherTime');

    dateRanges.forEach(({ date }) => {
        result[date] = {};
        driveModes.forEach((driveMode) => {
            result[date][driveMode.label] = null;
        });
        result[date]['otherDistance'] = null;
        result[date]['otherTime'] = null;
    });

    const applyCondition = (value, condition) => {
        switch (condition.condition) {
            case 'Equals': return value === condition.value;
            case 'Greater than': return value > condition.value;
            case 'Greater than or equals': return value >= condition.value;
            case 'Less than': return value < condition.value;
            case 'Less than or equals': return value <= condition.value;
            case 'Not equals': return value !== condition.value;
            default: return false;
        }
    };

    const checkConditions = (conditions, value) => {
        let currentResult = applyCondition(value, conditions[0]);

        for (let i = 1; i < conditions.length; i++) {
            const logicalOp = conditions[i].logicalOperator || 'AND';
            const nextResult = applyCondition(value, conditions[i]);

            if (logicalOp === 'AND') {
                currentResult = currentResult && nextResult;
            } else if (logicalOp === 'OR') {
                currentResult = currentResult || nextResult;
            }
        }

        return currentResult;
    };

    const getDriveModeResult = (domain, bucket, routeBucket) => {
        const matchingDriveMode = driveModes.find(mode => mode.label === domain);
        if (matchingDriveMode) {
            const modeData = routeBucket[matchingDriveMode.key]?.total?.value || null;
            return { [matchingDriveMode.label]: modeData };
        }
        return {};
    };

    data.body.aggregations.trips_by_time.buckets.forEach((bucket: any) => {
        const date = bucket.key_as_string;
        if (result[date]) {
            let otherDistanceTotal = 0;
            let otherTimeTotal = 0;

            bucket.by_route.buckets.forEach((routeBucket: any) => {
                (conditionDriveModes1 || []).forEach((conditionDriveMode) => {
                    const driveModeResult = getDriveModeResult(conditionDriveMode.domain, bucket, routeBucket);
                    const modeValue = driveModeResult[conditionDriveMode.domain];
                    const conditionMet = checkConditions([conditionDriveMode], modeValue);
                    result[date][conditionDriveMode.domain] = conditionMet ? modeValue : null;

                    if (+cumulation_y1 === 1 && conditionMet) {
                        cumulativeDriveModes1[conditionDriveMode.domain] += modeValue || 0;
                        result[date][conditionDriveMode.domain] = cumulativeDriveModes1[conditionDriveMode.domain];
                    }
                });

                if (conditionOtherDistance1) {
                    driveModes.forEach((driveMode) => {
                        const modeData = routeBucket[driveMode.key]?.total?.value || 0;
                        otherDistanceTotal += modeData;
                    });
                }

                if (conditionOtherTime1) {
                    driveModes.forEach((driveMode) => {
                        const modeData = routeBucket[driveMode.key]?.total?.value || 0;
                        otherTimeTotal += modeData;
                    });
                }

                (conditionDriveModes2 || []).forEach((conditionDriveMode) => {
                    const driveModeResult = getDriveModeResult(conditionDriveMode.domain, bucket, routeBucket);
                    const modeValue = driveModeResult[conditionDriveMode.domain];
                    const conditionMet = checkConditions([conditionDriveMode], modeValue);
                    result[date][conditionDriveMode.domain] = conditionMet ? modeValue : null;

                    if (+cumulation_y2 === 1 && conditionMet) {
                        cumulativeDriveModes2[conditionDriveMode.domain] += modeValue || 0;
                        result[date][conditionDriveMode.domain] = cumulativeDriveModes2[conditionDriveMode.domain];
                    }
                });

                if (conditionOtherDistance2) {
                    driveModes.forEach((driveMode) => {
                        const modeData = routeBucket[driveMode.key]?.total?.value || 0;
                        otherDistanceTotal += modeData;
                    });
                }

                if (conditionOtherTime2) {
                    driveModes.forEach((driveMode) => {
                        const modeData = routeBucket[driveMode.key]?.total?.value || 0;
                        otherTimeTotal += modeData;
                    });
                }
            });

            const conditionMetOtherDistance1 = conditionOtherDistance1 ? checkConditions([conditionOtherDistance1], otherDistanceTotal) : true;
            const conditionMetOtherDistance2 = conditionOtherDistance2 ? checkConditions([conditionOtherDistance2], otherDistanceTotal) : true;
            result[date]['otherDistance'] = (conditionMetOtherDistance1 && conditionMetOtherDistance2) ? otherDistanceTotal : null;

            const conditionMetOtherTime1 = conditionOtherTime1 ? checkConditions([conditionOtherTime1], otherTimeTotal) : true;
            const conditionMetOtherTime2 = conditionOtherTime2 ? checkConditions([conditionOtherTime2], otherTimeTotal) : true;
            result[date]['otherTime'] = (conditionMetOtherTime1 && conditionMetOtherTime2) ? otherTimeTotal : null;

            if (+cumulation_y1 === 1) {
                cumulativeOtherDistance1 += otherDistanceTotal || 0;
                cumulativeOtherTime1 += otherTimeTotal || 0;

                result[date]['otherDistance'] = cumulativeOtherDistance1;
                result[date]['otherTime'] = cumulativeOtherTime1;
            }

            if (+cumulation_y2 === 1) {
                cumulativeOtherDistance2 += otherDistanceTotal || 0;
                cumulativeOtherTime2 += otherTimeTotal || 0;

                result[date]['otherDistance'] = cumulativeOtherDistance2;
                result[date]['otherTime'] = cumulativeOtherTime2;
            }
        }
    });

    return result;
  }

  // Hàm getOtherDistanceData
  async getOtherDistanceData(customGraphDto: CustomGraphDto, schema: string) {
    const { routeName, startDate, endDate } = customGraphDto;
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    return {
      route: routeName,
      data: this.formatResponseData(response, customGraphDto)
    };
  }

  async getOtherTimeData(customGraphDto: CustomGraphDto, schema: string) {
    const { routeName, startDate, endDate } = customGraphDto;
    const query = this.buildQueryCoreDataSet(routeName, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: this.getSchema('drive_metrics', schema), body: query });
    return {
      route: routeName,
      data: this.formatResponseData(response, customGraphDto)
    };
  }

  async getCollectCountData(customGraphDto: CustomGraphDto, dispatchNo: string, schema: string) {
    const { startDate, endDate, conditions1, conditions2, cumulation_y1, cumulation_y2 } = customGraphDto;
    const mustQueries = [];

    if (dispatchNo) {
        mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    }

    mustQueries.push({
        range: {
            'data.timestamp': {
                "time_zone": "+00:00",
                gte: startDate + 'T11:00:00',
                lte: endDate + 'T11:00:00',
            },
        },
    });

    const body = {
        size: 0,
        query: {
            bool: {
                must: mustQueries,
            },
        },
        aggs: {
            trips_by_time: {
                date_histogram: {
                    field: 'data.timestamp',
                    interval: 'day',
                    format: 'yyyy-MM-dd',
                },
                aggs: {
                    totalOfDay: {
                        "sum": {
                            "script": {
                                "source": `
                                    long sum = 0;
                                    sum += doc['data.5L_gen'].value;
                                    sum += doc['data.10L_gen'].value;
                                    sum += doc['data.10L_reu'].value;
                                    sum += doc['data.20L_gen'].value;
                                    sum += doc['data.20L_reu'].value;
                                    sum += doc['data.30L_gen'].value;
                                    sum += doc['data.50L_gen'].value;
                                    sum += doc['data.50L_pub'].value;
                                    sum += doc['data.75L_gen'].value;
                                    sum += doc['data.75L_pub'].value;
                                    sum += doc['data.ext'].value;
                                    sum += doc['data.etc'].value;
                                    return sum;
                                `,
                                "lang": "painless"
                            }
                        },
                    },
                    // Các trường sum khác
                    '5L_gen': { sum: { field: 'data.5L_gen' } },
                    '10L_gen': { sum: { field: 'data.10L_gen' } },
                    '10L_reu': { sum: { field: 'data.10L_reu' } },
                    '20L_gen': { sum: { field: 'data.20L_gen' } },
                    '20L_reu': { sum: { field: 'data.20L_reu' } },
                    '30L_gen': { sum: { field: 'data.30L_gen' } },
                    '50L_gen': { sum: { field: 'data.50L_gen' } },
                    '50L_pub': { sum: { field: 'data.50L_pub' } },
                    '75L_gen': { sum: { field: 'data.75L_gen' } },
                    '75L_pub': { sum: { field: 'data.75L_pub' } },
                    ext: { sum: { field: 'data.ext' } },
                    etc: { sum: { field: 'data.etc' } },
                },
            },
        },
    };

    const result = await this.openSearchClient.search({
        index: this.getSchema('collect_metrics', schema),
        body,
    });

    const buckets = result.body.aggregations.trips_by_time.buckets;

    let formattedResult = {};
    const trashBagType = [
        '5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu',
        '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'
    ];
    const dateRanges = this.generateDateRangesForStatistics(startDate, endDate);

    // Kiểm tra xem có domain "collectCount" hay không
    const hasCollectCount = [...(conditions1 || []), ...(conditions2 || [])].some(cond => cond.domain === 'collectCount');

    const conditionDriveModes1 = conditions1?.filter(cond => trashBagType.some(mode => mode === cond.domain)) || [];
    const conditionOtherDistance1 = conditions1?.find(cond => cond.domain === 'collectTime') || null;

    const conditionDriveModes2 = conditions2?.filter(cond => trashBagType.some(mode => mode === cond.domain)) || [];
    const conditionOtherDistance2 = conditions2?.find(cond => cond.domain === 'collectTime') || null;

    // Biến cộng dồn
    let cumulativeCollectCount1 = 0;
    let cumulativeCollectCount2 = 0;

    // Hàm áp dụng điều kiện
    const applyCondition = (value, condition) => {
        switch (condition.condition) {
            case 'Equals': return value === condition.value;
            case 'Greater than': return value > condition.value;
            case 'Greater than or equals': return value >= condition.value;
            case 'Less than': return value < condition.value;
            case 'Less than or equals': return value <= condition.value;
            case 'Not equals': return value !== condition.value;
            default: return false;
        }
    };

    // Tạo các kết quả mặc định cho các ngày không có dữ liệu
    dateRanges.forEach(({ date }) => {
        formattedResult[date] = {};

        if (hasCollectCount) {
            formattedResult[date].totalOfDay = null;
        }

        [...conditionDriveModes1, ...conditionDriveModes2].forEach((cond) => {
            formattedResult[date][cond.domain] = null;
        });

        if (conditionOtherDistance1 || conditionOtherDistance2) {
            formattedResult[date]['collectTime'] = null;
        }
    });

    // Duyệt qua các buckets để lấy dữ liệu
    buckets.forEach((bucket) => {
        const date = bucket.key_as_string;
        const dayResult = {};

        if (hasCollectCount && bucket.totalOfDay?.value !== undefined && bucket.totalOfDay.value !== 0) {
            dayResult['totalOfDay'] = bucket.totalOfDay.value;
        }

        conditions1?.forEach(condition => {
            if (trashBagType.includes(condition.domain)) {
                const bucketValue = bucket[condition.domain]?.value || 0;

                if (applyCondition(bucketValue, condition)) {
                    dayResult[condition.domain] = bucketValue;

                    if (+cumulation_y1 === 1) {
                        cumulativeCollectCount1 += bucketValue;
                        dayResult[condition.domain] = cumulativeCollectCount1;
                    }
                } else {
                    dayResult[condition.domain] = null;
                }
            }
        });

        conditions2?.forEach(condition => {
            if (trashBagType.includes(condition.domain)) {
                const bucketValue = bucket[condition.domain]?.value || 0;

                if (applyCondition(bucketValue, condition)) {
                    dayResult[condition.domain] = bucketValue;

                    if (+cumulation_y2 === 1) {
                        cumulativeCollectCount2 += bucketValue;
                        dayResult[condition.domain] = cumulativeCollectCount2;
                    }
                } else {
                    dayResult[condition.domain] = null;
                }
            }
        });

        formattedResult[date] = { ...formattedResult[date], ...dayResult };
    });

    return { data: formattedResult };
  }

  async getCustomGraph(customGraphDto: CustomGraphDto, schema: string) {
    const { routeName, routeName1, routeName2, startDate, endDate, yAxises1, yAxises2 } = customGraphDto;
    const allVehicleData = await this.getUniqueVehicleIdsAndDispatchNosWithDate(startDate, endDate, schema);
    const allVehicleMetrics = allVehicleData.map((vehicleData) => vehicleData.route_name);

    // Chuyển đổi routeName1 và routeName2 thành mảng
    const routeNames1 = routeName1 ? convertToArray(routeName1) : routeName ? convertToArray(routeName) : allVehicleMetrics;
    const routeNames2 = routeName2 ? convertToArray(routeName2) : routeName ? convertToArray(routeName) : allVehicleMetrics;

    // Khởi tạo kết quả cho hai trục Y và EWM riêng biệt
    const resultY1 = {}; 
    const resultY2 = {}; 
    let totalByDayY1 = {}; 
    let totalByDayY2 = {}; 
    const dayCountY1 = {}; 
    const dayCountY2 = {}; 
    const vehicleCountPerDayY1 = {}; 
    const vehicleCountPerDayY2 = {}; 
    const overallEWMY1 = {}; 
    const overallEWMY2 = {};

    // Xử lý routeName1 với yAxises1 và EWM cho routeName1
    await Promise.all(
      routeNames1.map(async (routeName) => {
        const updatedDto = { ...customGraphDto, routeName };
        const dataForRoute = {};
        const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
        const EWMAVG = await this.getDrivingRouteGraphEWMStartEndDate(updatedDto, schema);
        let dataY = null;

        // Fetch dữ liệu cho yAxises1
        if (yAxises1) {
          switch (yAxises1) {
            case 'standardScore':
              dataY = await this.getCustomStandardScoreData(updatedDto, schema);
              break;
            case 'collectDistance':
              dataY = await this.getCollectDistancetData(updatedDto, schema);
              break;
            case 'collectTime':
              dataY = await this.getCollectTimetData(updatedDto, schema);
              break;
            case 'otherDistance':
              dataY = await this.getOtherDistanceData(updatedDto, schema);
              break;
            case 'otherTime':
              dataY = await this.getOtherTimeData(updatedDto, schema);
              break;
            case 'collectCount':
              dataY = await this.getCollectCountData(updatedDto, dispatchNo, schema);
              break;
            default:
              dataY = null;
          }
        }

        // Hợp nhất dữ liệu từ dataY theo từng ngày cho routeName1
        const allDates = new Set(Object.keys(dataY?.data || {}));
        Object.keys(EWMAVG).forEach((date) => {
          const dayData = EWMAVG[date];

          if (!overallEWMY1[date]) {
            overallEWMY1[date] = null;
            vehicleCountPerDayY1[date] = null;
          }

          if (dayData !== null) {
            overallEWMY1[date] += dayData;
            vehicleCountPerDayY1[date] += 1;
          }
        });

        allDates.forEach(date => {
          const dataForDate = {};
          if (dataY && dataY.data && dataY.data[date] !== undefined) {
            dataForDate[yAxises1] = dataY.data[date];
            if (!totalByDayY1[date]) totalByDayY1[date] = null;
            totalByDayY1[date] += dataY.data[date];
          }

          if (Object.keys(dataForDate).length > 0) {
            dataForRoute[date] = dataForDate;
            if (!dayCountY1[date]) dayCountY1[date] = null;
            dayCountY1[date]++;
          }
        });

        resultY1[routeName] = dataForRoute;
      })
    );

    // Xử lý routeName2 với yAxises2 và EWM cho routeName2
    await Promise.all(
      routeNames2.map(async (routeName) => {
        const updatedDto = { ...customGraphDto, routeName };
        const dataForRoute = {};
        const dispatchNo = await this.getDispatchNoByRouteName(routeName, schema);
        const EWMAVG = await this.getDrivingRouteGraphEWMStartEndDate(updatedDto, schema);
        let dataY = null;

        // Fetch dữ liệu cho yAxises2
        if (yAxises2) {
          switch (yAxises2) {
            case 'standardScore':
              dataY = await this.getCustomStandardScoreData(updatedDto, schema);
              break;
            case 'collectDistance':
              dataY = await this.getCollectDistancetData(updatedDto, schema);
              break;
            case 'collectTime':
              dataY = await this.getCollectTimetData(updatedDto, schema);
              break;
            case 'otherDistance':
              dataY = await this.getOtherDistanceData(updatedDto, schema);
              break;
            case 'otherTime':
              dataY = await this.getOtherTimeData(updatedDto, schema);
              break;
            case 'collectCount':
              dataY = await this.getCollectCountData(updatedDto, dispatchNo, schema);
              break;
            default:
              dataY = null;
          }
        }

        // Hợp nhất dữ liệu từ dataY theo từng ngày cho routeName2
        const allDates = new Set(Object.keys(dataY?.data || {}));
        Object.keys(EWMAVG).forEach((date) => {
          const dayData = EWMAVG[date];

          if (!overallEWMY2[date]) {
            overallEWMY2[date] = null;
            vehicleCountPerDayY2[date] = null;
          }

          if (dayData !== null) {
            overallEWMY2[date] += dayData;
            vehicleCountPerDayY2[date] += 1;
          }
        });

        allDates.forEach(date => {
          const dataForDate = {};
          if (dataY && dataY.data && dataY.data[date] !== undefined) {
            dataForDate[yAxises2] = dataY.data[date];
            if (!totalByDayY2[date]) totalByDayY2[date] = null;
            totalByDayY2[date] += dataY.data[date];
          }

          if (Object.keys(dataForDate).length > 0) {
            dataForRoute[date] = dataForDate;
            if (!dayCountY2[date]) dayCountY2[date] = null;
            dayCountY2[date]++;
          }
        });

        resultY2[routeName] = dataForRoute;
      })
    );

    // Tính trung bình theo ngày cho từng trục Y và EWM
    const averageByDayY1 = Object.keys(totalByDayY1).reduce((acc, date) => {
      acc[date] = dayCountY1[date] > 0 ? totalByDayY1[date] / dayCountY1[date] : null;
      return acc;
    }, {});
    const averageByDayY2 = Object.keys(totalByDayY2).reduce((acc, date) => {
      acc[date] = dayCountY2[date] > 0 ? totalByDayY2[date] / dayCountY2[date] : null;
      return acc;
    }, {});

    const averageEWMY1 = Object.keys(overallEWMY1).reduce((acc, date) => {
      acc[date] = vehicleCountPerDayY1[date] > 0 ? overallEWMY1[date] / vehicleCountPerDayY1[date] : null;
      return acc;
    }, {});

    const averageEWMY2 = Object.keys(overallEWMY2).reduce((acc, date) => {
      acc[date] = vehicleCountPerDayY2[date] > 0 ? overallEWMY2[date] / vehicleCountPerDayY2[date] : null;
      return acc;
    }, {});

    return {
      mainData: {
        routeY1: resultY1,
        routeY2: resultY2,
        total: {
          totalY1: totalByDayY1,
          totalY2: totalByDayY2,
        },
        AVG: {
          averageY1: averageByDayY1,
          averageY2: averageByDayY2,
          EWMY1: averageEWMY1,
          EWMY2: averageEWMY2,
        }
      }
    };
  }

  async getAllSection(searchForStatisticsDto: SearchForStatisticsDto, schema: string) {
    const { startDate, endDate } = searchForStatisticsDto;
    const mustQueries = [];

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate + 'T11:00:00',
          lte: endDate + 'T11:00:00',
        },
      },
    })

    const body = {
      "size": 0,
      "query": {
        "bool": {
          "must": mustQueries
        }
      },
      aggs: {
        unique_vehicle_dispatch: {
          composite: {
            sources: [
              { section_name: { terms: { field: 'data.section_name.keyword' } } },
            ],
            size: 10000
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: this.getSchema('collect_metrics', schema),
      body,
    });

    return result.body.aggregations.unique_vehicle_dispatch.buckets.map((m) => m.key.section_name);
  }
}