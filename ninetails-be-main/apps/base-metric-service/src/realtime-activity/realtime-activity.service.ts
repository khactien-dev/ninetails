import axios from 'axios';
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Client } from "@opensearch-project/opensearch";
import { RealtimeActivityDto } from "./realtime-activity.dto";
import { VehicleInfoService } from "../datasource-service/vehicle-info.service";
import { WorkingScheduleService } from "../datasource-service/working-schedule.service";
import { RouteInfoService } from "../datasource-service/route-info.service";
import { ZScoreService } from "../z-score/z-score.service";
import { buildDateRangeQuery, calculateSectionsCovered, createRangeQuery, formatTime } from "../base-query/base.function";
import { CoreSectionService } from "../datasource-service/core-section.service";

@Injectable()
export class RealtimeActivityService {
  logger: Logger;
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly vehicleInfoService: VehicleInfoService,
    private readonly workingScheduleService: WorkingScheduleService,
    private readonly routeInfoService: RouteInfoService,
    private readonly zScoreService: ZScoreService,
    private readonly coreSectionService: CoreSectionService
  ) {
    this.logger = new Logger();
    this.logger.log(
      `OpenSearch client initialized with node: ${this.openSearchClient.connectionPool}`,
    );
  }

  async getCollectMetricsSegmentIdByDate(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    const rangeQuery = createRangeQuery(date, 'data.timestamp');
    mustQueries.push(rangeQuery);

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

  async getLatestDriveMetricBySegmentId(
    segmentId: number,
    routeId: number,
    date: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    const rangeQuery = createRangeQuery(date, 'data.timestamp');
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

  async getLatestDriveMetricByRouteId(
    routeId: number,
    date: string,
    schema: string,
  ) {
    const mustQueries = [];

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    const rangeQuery = createRangeQuery(date, 'data.timestamp');
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

  async getDriveMetricsCoordinatesBySegmentId(
    segmentId: number,
    routeId: number,
    date: string,
    vehicleNumber: string,
    schema: string
  ) {
    try {
      const mustQueries = [];
  
      if (routeId) {
        mustQueries.push({ term: { 'data.route_id': routeId } });
      }
  
      const rangeQuery = createRangeQuery(date, 'data.timestamp');
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
        index: `${schema}.drive_metrics`,
        body,
      });
  
      const hits = result.body.hits.hits;
      const driveMetrics = hits.map((hit) => hit._source.data);
      const resultMetrics = [];
  
      driveMetrics.forEach((metric, index) => {
        const newSegment = {
          vehicle_number: vehicleNumber,
          segment_id: metric.segment_id,
          drive_mode: metric.drive_mode,
          start_time: metric.timestamp,
          end_time: metric.timestamp,
          start_coords: { x: metric.location[0], y: metric.location[1] },
          end_coords: { x: metric.location[0], y: metric.location[1] },
          total_time: 0, // Lấy thời gian từ trip_time
          total_distance: 0, // Lấy trực tiếp từ trip_distance
        };
  
        // Nếu có segment trước đó, cập nhật end_time và end_coords của segment trước đó
        if (index > 0) {
          const previousSegment = resultMetrics[resultMetrics.length - 1];
          previousSegment.end_time = metric.timestamp;
          previousSegment.end_coords = { x: metric.location[0], y: metric.location[1] };
  
          // Cộng dồn trip_distance vào segment trước đó
          previousSegment.total_distance += metric.distance || 0;
  
          resultMetrics.forEach((segment) => {
            const startTime = new Date(segment.start_time).getTime();
            const endTime = new Date(segment.end_time).getTime();
            segment.total_time = (endTime - startTime) / 1000; // Tính thời gian theo phút
          });
        }
        resultMetrics.push(newSegment);
      });
  
      return resultMetrics;
    } catch (error) {
      console.error('Error fetching or processing drive metrics:', error);
    }
  }

  async getDispatchHistoryBySegmentId(
    segmentId: number,
    routeId: number,
    date: string,
    vehicleNumber: string,
    schema: string
  ) {
    try {
      const mustQueries = [];
  
      if (routeId) {
        mustQueries.push({ term: { 'data.route_id': routeId } });
      }
  
      const rangeQuery = createRangeQuery(date, 'data.timestamp');
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
        index: `${schema}.drive_metrics`,
        body,
      });
  
      const hits = result.body.hits.hits;
      const driveMetrics = hits.map((hit) => hit._source.data);
      const resultMetrics = [];
  
      driveMetrics.forEach((metric, index) => {
        const previousSegment = resultMetrics[resultMetrics.length - 1];
        if (index > 0) {
          const previousSegment = resultMetrics[resultMetrics.length - 1];
          previousSegment.end_time = metric.timestamp;
          previousSegment.end_coords = { x: metric.location[0], y: metric.location[1] };
    
          resultMetrics.forEach((segment) => {
            const startTime = new Date(segment.start_time).getTime();
            const endTime = new Date(segment.end_time).getTime();
            segment.total_time = (endTime - startTime) / 1000; // Tính thời gian theo phút
          });
        }
        if (
          previousSegment &&
          previousSegment.drive_mode === metric.drive_mode &&
          previousSegment.segment_id === metric.segment_id
        ) {
          // Cộng dồn distance và cập nhật end_time, end_coords
          previousSegment.end_time = metric.timestamp;
          previousSegment.end_coords = { x: metric.location[0], y: metric.location[1] };
          previousSegment.total_distance += metric.distance || 0;
  
          const startTime = new Date(previousSegment.start_time).getTime();
          const endTime = new Date(previousSegment.end_time).getTime();
          previousSegment.total_time = (endTime - startTime) / 1000; // Tính thời gian theo phút
        } else {
          // Tạo segment mới
          resultMetrics.push({
            vehicle_number: vehicleNumber,
            segment_id: metric.segment_id,
            drive_mode: metric.drive_mode,
            start_time: metric.timestamp,
            end_time: metric.timestamp,
            start_coords: { x: metric.location[0], y: metric.location[1] },
            end_coords: { x: metric.location[0], y: metric.location[1] },
            total_time: 0, // Tạm thời 0, sẽ tính lại
            total_distance: metric.distance || 0, // Lấy giá trị ban đầu từ distance
          });
        }
      });
  
      // Tính lại tổng thời gian cho tất cả các segment
      resultMetrics.forEach((segment) => {
        const startTime = new Date(segment.start_time).getTime();
        const endTime = new Date(segment.end_time).getTime();
        segment.total_time = (endTime - startTime) / 1000; // Tính thời gian theo phút
      });
  
      return resultMetrics;
    } catch (error) {
      console.error('Error fetching or processing drive metrics:', error);
    }
  }

  async getRemainSectionBySegmentId(
    segmentId: number,
    routeId: number,
    date: string,
    sections: any[],
    schema: string
  ) {
    try {
      const mustQueries = [];

      if (routeId) {
        mustQueries.push({ term: { 'data.route_id': routeId } });
      }
  
      const rangeQuery = createRangeQuery(date, 'data.timestamp');
      mustQueries.push(rangeQuery);
  
      const body = {
        size: 10000,
        query: {
          bool: {
            must: mustQueries,
          },
        },
        sort: [{ 'data.timestamp': { order: 'asc' } }],
      };
  
      const result = await this.openSearchClient.search({
        index: `${schema}.drive_metrics`,
        body,
      });
  
      const hits = result.body.hits.hits;
      const driveMetrics = hits.map((hit) => hit._source.data);
      let resultMetrics = null
      
      driveMetrics.forEach((metric, index) => {
        resultMetrics = calculateSectionsCovered(metric, sections)
      });
  
      return resultMetrics;
    } catch (error) {
      console.error('Error fetching or processing drive metrics:', error);
    }
  } 

  async getTotalMetrics(routeId: number, date: string, schema: string) {
    try {
      const mustQueries = [
        routeId && { term: { 'data.route_id': routeId } },
        createRangeQuery(date, 'data.timestamp'),
      ].filter(Boolean);
  
      const scriptedMetricTemplate = {
        init_script: "state.previous_timestamp = null; state.total_duration = 0;",
        map_script: `
          if (doc.containsKey('data.timestamp') && !doc['data.timestamp'].empty) {
            Instant current_timestamp = doc['data.timestamp'].value.toInstant();
            if (state.previous_timestamp != null && current_timestamp.isAfter(state.previous_timestamp)) {
              state.total_duration += ChronoUnit.MILLIS.between(state.previous_timestamp, current_timestamp);
            }
            state.previous_timestamp = current_timestamp;
          }
        `,
        combine_script: "return state.total_duration;",
        reduce_script: `
          long total = 0;
          for (s in states) {
            if (s != null) {
              total += s;
            }
          }
          return total / 1000; // Convert to seconds
        `,
      };
  
      const aggregations = {
        latest_eco_score: {
          top_hits: {
            sort: [{ 'data.timestamp': { order: 'desc' } }],
            _source: { includes: ['data.eco_score'] },
            size: 1,
          },
        },
        total_distance: { sum: { field: 'data.distance' } },
        total_speeding: { sum: { field: 'data.speeding' } },
        total_idling: {
          filter: { term: { 'data.drive_mode': 6 } },
          aggs: {
            total_idling_time: {
              scripted_metric: scriptedMetricTemplate,
            },
          },
        },
        total_sudden_accel: { sum: { field: 'data.sudden_accel' } },
        total_sudden_break: { sum: { field: 'data.sudden_break' } },
        total_trip_time: {
          scripted_metric: scriptedMetricTemplate,
        },
        not_managed: {
          filter: { term: { 'data.drive_mode': 7 } },
          aggs: {
            not_managed: {
              scripted_metric: scriptedMetricTemplate,
            },
          },
        },
        out_of_control: {
          filter: { term: { 'data.drive_mode': 8 } },
          aggs: {
            out_of_control: {
              scripted_metric: scriptedMetricTemplate,
            },
          },
        },
      };
  
      const result = await this.openSearchClient.search({
        index: `${schema}.drive_metrics`,
        body: {
          size: 0,
          query: { bool: { must: mustQueries } },
          aggs: aggregations,
        },
      });
  
      const agg = result.body.aggregations;
  
      const totalMetrics = {
        eco_score: agg.latest_eco_score.hits.hits[0]?._source.data.eco_score ?? 0,
        trip_distance: agg.total_distance.value ?? 0,
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
  
  async searchAddress(gps_x: number, gps_y: number) {
    const baseUrl =
      'https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc';
    const coords = `${gps_x},${gps_y}`;
    const params = new URLSearchParams([
      ['request', 'coordsToaddr'],
      ['coords', coords],
      ['sourcecrs', 'epsg:4326'],
      ['output', 'json'],
      ['orders', 'legalcode,roadaddr'],
    ]);
    const url = new URL(`${baseUrl}?${params}`);
    const headers = {
      'X-NCP-APIGW-API-KEY-ID': 'qqdzmppwz8',
      'X-NCP-APIGW-API-KEY': 'GCCe7f0i351vrDKDm3cm2tMv2HGJRQOKDDPTvzeD',
    };
    try {
      const response = await axios.get(url.href, { headers });
      const results = response.data.results;
      const legalcode = results.find((e) => e.name == 'legalcode');
      const roadaddr = results.find((e) => e.name == 'roadaddr');
      const region = roadaddr ? roadaddr.region : legalcode.region;
      let areas = [
        region.area1.name,
        region.area2.name,
        region.area3.name,
        region.area4.name,
      ];
      areas = areas.filter((e) => e);
      return areas.join(', ');
    } catch (error) {}
    return null;
  }

  async getVehicleDataByVehicleNumber(vehicleNumber: string, date: string, schema) {
    const vehicleInfo = await this.vehicleInfoService.getVehicleInfoByVehicleNumber(vehicleNumber, schema);
    const vehicleId = await this.vehicleInfoService.getVehicleIdByVehicleNumber(vehicleNumber, schema);
    const routeId = await this.workingScheduleService.getRouteIdByVehicleId(vehicleId, date, schema);
    const routeIdOpensearch = await this.getLatestDriveMetricByRouteId(routeId, date, schema);
    const segmentId = await this.routeInfoService.getSegmentIdByRouteIdAndSegmentId(routeId, routeIdOpensearch.segment_id, schema);
    
    const latestDriveMetric = await this.getLatestDriveMetricBySegmentId(
      segmentId,
      routeId,
      date,
      schema,
    );

    const newLatestDriveMetric = {
      ...latestDriveMetric,
      gps_x: latestDriveMetric?.location[0] || 0,
      gps_y: latestDriveMetric?.location[1] || 0,
      vehicle_number: vehicleNumber,
    }

    const detailDriveMetric = await this.getDriveMetricsCoordinatesBySegmentId(
      segmentId,
      routeId,
      date,
      vehicleNumber,
      schema
    );

    const dispatchHistory = await this.getDispatchHistoryBySegmentId(
      segmentId,
      routeId,
      date,
      vehicleNumber,
      schema
    );

    const collectCount = await this.getCollectMetricsSegmentIdByDate(segmentId, routeId, date, schema);

    const totals = await this.getTotalMetrics(routeId, date, schema);

    let vehicleRoute = null;
    let totalSection = null;
    let coveredSections = null;
    let garageAndLandfill = null;
    if (latestDriveMetric) {
      const segmentId = latestDriveMetric.segment_id;
      vehicleRoute = await this.routeInfoService.getRouteInfo(segmentId, schema);
      totalSection = vehicleRoute[0]?.sections?.length;
      coveredSections = await this.getRemainSectionBySegmentId(latestDriveMetric.segment_id, latestDriveMetric.route_id, date, vehicleRoute[0]?.sections, schema);
      garageAndLandfill = await this.coreSectionService.getCoreSectionByRouteId(vehicleRoute[0].route_id, schema);
    }
    
    let currentLocation = await this.searchAddress(latestDriveMetric?.location[0], latestDriveMetric?.location[1])

    return {
      segmentId,
      latestDriveMetric: newLatestDriveMetric,
      vehicleInfo, 
      vehicleRoute, 
      detailDriveMetric, 
      dispatchHistory,
      collectCount, 
      totalSection,
      coveredSections, 
      garageAndLandfill,
      currentLocation, 
      totals
    }
  }

  async getVehicleDataByRouteName(routeName: string, date: string, schema) {
    const segmentId = await this.routeInfoService.getSegmentIdByRouteName(routeName, schema);
    const routeId = await this.routeInfoService.getRouteIdByRouteName(routeName, schema);
    const latestDriveMetric = await this.getLatestDriveMetricBySegmentId(
      segmentId,
      routeId.id,
      date,
      schema,
    );

    if (!latestDriveMetric) {
      throw new NotFoundException(`There is no drive_metrics with segment_id: ${segmentId} and route_id: ${routeId.id}`);
    }
    const vehicleId = await this.workingScheduleService.getVehicleIdByRouteId(latestDriveMetric.route_id, schema)
    const vehicleInfo = await this.vehicleInfoService.getVehicleInfoByVehicleId(vehicleId, schema);

    const newLatestDriveMetric = {
      ...latestDriveMetric,
      gps_x: latestDriveMetric?.location[0],
      gps_y: latestDriveMetric?.location[1],
      vehicle_number: vehicleInfo[0].vehicle_number,
    }
    
   
    
    const detailDriveMetric = await this.getDriveMetricsCoordinatesBySegmentId(
      segmentId,
      routeId.id,
      date,
      vehicleInfo[0].vehicle_number,
      schema
    );

    const dispatchHistory = await this.getDispatchHistoryBySegmentId(
      segmentId,
      routeId.id,
      date,
      vehicleInfo[0].vehicle_number,
      schema
    );
 
    const collectCount = await this.getCollectMetricsSegmentIdByDate(segmentId, routeId.id, date, schema);

    const totals = await this.getTotalMetrics(routeId, date, schema);

    let vehicleRoute = null;
    let totalSection = null;
    let coveredSections = null;
    let garageAndLandfill = null;
    if (latestDriveMetric) {
      const segmentId = latestDriveMetric.segment_id;
      vehicleRoute = await this.routeInfoService.getRouteInfo(segmentId, schema);
      totalSection = vehicleRoute[0]?.sections?.length;
      garageAndLandfill = await this.coreSectionService.getCoreSectionByRouteId(vehicleRoute[0].route_id, schema);
    }

    let currentLocation = await this.searchAddress(latestDriveMetric.gps_x, latestDriveMetric.gps_y)

    return {
      segmentId: latestDriveMetric.segment_id,
      latestDriveMetric: newLatestDriveMetric,
      vehicleInfo: vehicleInfo[0], 
      vehicleRoute: vehicleRoute[0],
      detailDriveMetric, 
      dispatchHistory,
      collectCount,
      totalSection,
      coveredSections,
      garageAndLandfill,
      currentLocation,
      totals
    }
  }

  async getOneVehicleData(realtimeActivityDto: RealtimeActivityDto, schema: string) {
    const { date, vehicleNumber, routeName } = realtimeActivityDto;
    let result = {
      segmentId: null,
      latestDriveMetric: null,
      vehicleInfo: null, 
      vehicleRoute: null, 
      detailDriveMetric: null, 
      dispatchHistory: null,
      collectCount: null,
      totalSection: null,
      coveredSections: null,
      garageAndLandfill: null,
      currentLocation: null,
      totals: null
    };
    if (vehicleNumber) {
      result = await this.getVehicleDataByVehicleNumber(vehicleNumber, date, schema);
    }

    if (routeName) {
      result =  await this.getVehicleDataByRouteName(routeName, date, schema);
    }
    
    let newDate = new Date();
    if (date) {
      newDate = new Date(date);
    }
    newDate.setDate(newDate.getDate());
    const isoDateString = newDate.toISOString().split('T')[0];
    
    const uniqueDriveMetrics = await this.getListVehicleData({ date }, schema);
    if (!result?.latestDriveMetric?.segment_id) {
      throw new NotFoundException('Vehicle not found');
    }
    
    const zScore = await this.zScoreService.calculateZscoreRealtimeOne(result?.latestDriveMetric?.segment_id, result?.latestDriveMetric?.route_id, isoDateString, schema);
    return {
      vehicleInfo: result.vehicleInfo,
      vehicleRoute: result.vehicleRoute,
      latestDriveMetric: result.latestDriveMetric,
      detailDriveMetric: result.detailDriveMetric,
      dispatchHistory: result.dispatchHistory,
      totalSection: result.totalSection,
      collectCount: result.collectCount,
      coveredSections: result.coveredSections,
      garageAndLandfill: result.garageAndLandfill,
      currentLocation: result.currentLocation,
      totals: result.totals,
      uniqueDriveMetrics: uniqueDriveMetrics.uniqueDriveMetrics,
      zScore,
      lastUpdated: new Date().toISOString() || null
    };
  }

  getAggregations() {
    const aggs = {
      latest_record: {
        top_hits: {
          sort: [{ 'data.timestamp': { order: 'desc' } }],
          _source: {
            includes: [
              'data.timestamp',
              'data.route_id',
              'data.drive_mode',
              'data.section_name',
              'data.section_id',
              'data.segment_id',
              'data.location',
              'data.angle',
              'data.eco_score',
              'data.distance',
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

  async formatMetrics(buckets: any[], zScore: any, updateTime: any, schema, date?) {
    const uniqueDriveMetrics = buckets.map(
      (bucket) => bucket.latest_record.hits.hits[0]._source.data 
    );

    // Tạo promises để gọi hàm getAllVehicleIdByDispatchNo và getRouteNameBySegmentId cho từng phần tử
    const vehiclePromises = uniqueDriveMetrics.map((metric) =>
      this.workingScheduleService.getAllVehicleIdByRouteId(metric.route_id, schema, date)
    );
  
    const routeNamePromises = uniqueDriveMetrics.map((metric) =>
      this.routeInfoService.getRouteNameByRouteId(metric.route_id, schema)
    );

    // Chờ kết quả từ tất cả các promises
    const allVehicleData = await Promise.all(vehiclePromises);
    const allRouteNames = await Promise.all(routeNamePromises);

    // Thêm các trường vehicle_number và routeName vào từng phần tử trong uniqueDriveMetrics
    const updatedDriveMetrics = uniqueDriveMetrics.map((metric, index) => {
      const vehicleData = allVehicleData[index];
      const routeNameData = allRouteNames[index];
  
      // Nếu vehicleData là undefined, bỏ qua phần tử này
      if (!vehicleData) {
        return null;
      }
  
      return {
        ...metric,
        gps_x: metric.location[0],
        gps_y: metric.location[1],
        vehicle_number: vehicleData?.vehicle_number || null,
        route_name: routeNameData?.name || null,
        edge_name: vehicleData?.edgeName,
      };
    }).filter(metric => metric !== null); // Lọc bỏ các phần tử null

    return {
      uniqueDriveMetrics: updatedDriveMetrics,
      lastUpdated: new Date().toISOString() || null,
      zScore,
      updateTime,
    };
  }


  async getListVehicleData(realtimeActivityDto: RealtimeActivityDto, schema: string) {
    const { date, vehicleNumber, routeName, updateTime } = realtimeActivityDto;

    if (vehicleNumber || routeName) {
      return this.getOneVehicleData(realtimeActivityDto, schema);
    }

    const body: any = {
      size: 0,
      aggs: {
        unique_drive_metric: {
          terms: { field: 'data.route_id', size: 10000 },
          aggs: this.getAggregations(),
        },
      },
    };

    const rangeQuery = createRangeQuery(date, 'data.timestamp');

    if (rangeQuery) {
      body.query = rangeQuery;
    }

    const { body: searchBody } = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body,
    });

    const zScore = await this.zScoreService.calculateZscoreRealtime(date, schema);

    return await this.formatMetrics(
      searchBody.aggregations.unique_drive_metric.buckets,
      zScore,
      updateTime,
      schema,
      realtimeActivityDto.date
    );
  }
}