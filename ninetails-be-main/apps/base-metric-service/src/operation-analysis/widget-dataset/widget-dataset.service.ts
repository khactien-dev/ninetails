import { Inject, Injectable } from "@nestjs/common";
import { WidgetDatasetDto } from "./widget-dataset.dto";
import { ZScoreService } from "../../z-score/z-score.service";
import { convertToArray } from "libs/utils/helper.util";
import { calculateCollectMetrics, calculateOtherMetrics, createRangeQueryDataSet, getNumberOfDays } from "../../base-query/base.function";
import { RouteInfoService } from "../../datasource-service/route-info.service";
import { RealtimeActivityService } from "../../realtime-activity/realtime-activity.service";
import { Client } from "@opensearch-project/opensearch";
import { OperationAnalysisService } from "../operation-analysis.service";
import { WorkingScheduleService } from "../../datasource-service/working-schedule.service";
@Injectable()
export class WidgetDatasetService {
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly zScoreService: ZScoreService,
    private readonly routeInfoService: RouteInfoService, 
    private readonly workingScheduleService: WorkingScheduleService,
  ) {
  }

  private addDriveModeFilters(mustQueries: any[]) {
    mustQueries.push(
      { range: { 'data.drive_mode': { gte: 0, lte: 8 } } },
      { bool: { must_not: { term: { 'data.drive_mode': 5 } } } }
    );
  }

  private buildDriveModeAggregations(type: string) {
    const field = type === 'time' ? 'data.timestamp' : "data.distance";
    const modes = [0, 1, 2, 3, 4, 6, 7, 8];
    return Object.fromEntries(modes.map((mode) => [
      `total_drive_mode_${mode}`,
      {
        filter: { term: { 'data.drive_mode': mode } },
        aggs: {
          total: {
            ...(type === 'time'
                ? {
                    value_count: { field: 'data.drive_mode' },
                }
                : { sum: { field } }),
              }
            },
        },
    ]));
  }

  private buildAggregationsDataSetOther(type: string) {
    const field = type === 'time' ? null : "data.distance";

    return {
      by_route: {
        terms: { field: 'data.segment_id', size: 10 },
        aggs: {
          total: {
            ...(type === 'time'
                ? {
                    value_count: { field: 'data.drive_mode' },
                }
                : { sum: { field } }),
              },
          ...this.buildDriveModeAggregations(type),
        },
      },
    };
  }

  private buildAggregationsDataSetCollect(type: string) {
    const field = type === 'time' ? 'data.timestamp' : "data.distance";
    return {
      by_route: {
        terms: {
          field: 'data.segment_id',
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
                            value_count: { field: 'data.drive_mode' },
                        }
                        : { sum: { field } }),
                      }
                    }
                  },
                },
              },
            },
          },
        }
      }

  getAggregationsByMode(statisticMode: string) {
    const aggregations = {
      otherDuration: this.buildAggregationsDataSetOther('time'),
      otherDistance: this.buildAggregationsDataSetOther('distance'),
      collectDuration: this.buildAggregationsDataSetCollect('time'),
      collectDistance: this.buildAggregationsDataSetCollect('distance'),
    };
    return aggregations[statisticMode] || {};
  }

  private buildQueryDataSet(segmentIds: any, startDate: string, endDate: string, statisticMode: string) {
    const mustQueries: any[] = [
      ...[{ terms: { 'data.segment_id': segmentIds.filter((metric) => metric !== null) } }],
      createRangeQueryDataSet(startDate, endDate, 'data.timestamp'),
    ];

    if (['otherDuration', 'otherDistance'].includes(statisticMode)) {
      this.addDriveModeFilters(mustQueries);
    }

    return {
      size: 0,
      query: { bool: { must: mustQueries } },
      aggs: this.getAggregationsByMode(statisticMode),
    };
  }

  async getTotalTripByDriveMode(edge, client: any, metric: 'time' | 'distance', startDate, endDate, numberOfDays: number, schema: string) {
    const aggregationForDriveMode = (driveMode: number) => ({
      filter: {
        term: { 'data.drive_mode': driveMode },
      },
      aggs: {
        total_time: {
          ...(metric === 'time'
            ? {
                value_count: { field: 'data.drive_mode' },
            }
            : { sum: { field: `data.${metric}` } } ),
        },
      },
    });

    const query = {
      size: 0,
      query: {
        bool: {
          filter: [
            { range: { 'data.drive_mode': { gte: 0, lte: 8 } } },
            { range: { 'data.timestamp': { "time_zone": "+00:00", gte: startDate, lte: endDate } } },
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
      index: `${schema}.drive_metrics`,
      body: query,
    });

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

    let totalOfAllSum = driveModes.reduce((sum, mode) => sum + response.body.aggregations[`${mode.key}`].total_time.value, 0);
    let totalOfAllAverage = driveModes.reduce((sum, mode) => sum + (response.body.aggregations[`${mode.key}`].total_time.value / numberOfDays), 0);

    if (metric === 'time') {
      totalOfAllSum *= edge;
      totalOfAllAverage *= edge;
    }

    const result = {
      routeName: "all",
      totalOfAllSum,
      totalOfAllAverage,
    };

    driveModes.forEach(mode => {
      result[`${mode.label}_sum`] = response.body.aggregations[`${mode.key}`].total_time.value;
      result[`${mode.label}_average`] = response.body.aggregations[`${mode.key}`].total_time.value / numberOfDays;

      if (metric === 'time') {
        result[`${mode.label}_sum`] *= edge;
        result[`${mode.label}_average`] *= edge;
      }
    });

    return result;
  }

  async calculateOtherMetrics(edge, buckets: any, numberOfDays: number, totalDriveModeData: any, metric, schema) {
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
    
    const routeResults = await Promise.all(buckets.map(async route => {
      const routeInfo = await this.routeInfoService.getRouteInfo(route.key, schema)
      const result: {
        routeName: any;
        totalOfAllSum: number;
        totalOfAllAverage: number;
        [key: string]: any;
      } = {
        routeName: routeInfo[0].route_name,
        totalOfAllSum: 0,
        totalOfAllAverage: 0,
      };
  
      let totalOfAllSum = 0;
      let totalOfAllAverage = 0;
  
      driveModes.forEach(mode => {
        let sumValue = route[mode.key]?.total?.value || 0;
        let averageValue = numberOfDays > 0 ? sumValue / numberOfDays : 0;

        if (metric === 'otherDuration') {
          sumValue *= edge;
          averageValue *= edge;
        }
  
        result[`${mode.label}_sum`] = sumValue;
        result[`${mode.label}_average`] = averageValue;
  
        totalOfAllSum += sumValue;
        totalOfAllAverage += averageValue;
      });
  
      result.totalOfAllSum = totalOfAllSum;
      result.totalOfAllAverage = totalOfAllAverage;
  
      return result;
    }));
  
    return {
      total: totalDriveModeData,
      routes: routeResults
    };
  }

  async calculateCollectMetrics(edge, buckets: any, numberOfDays: number, metric, schema) {
    const routeMap = {};

    // Sử dụng vòng lặp for...of để xử lý bất đồng bộ
    for (const route of buckets) {
        const segmentId = route.key;
        const routeInfo = await this.routeInfoService.getRouteInfo(segmentId, schema);
        const routeName = routeInfo[0]?.route_name; // Kiểm tra routeInfo có tồn tại hay không
        if (!routeName) continue;

        const sections = route.by_route?.buckets.map(subRoute => {
            let total = subRoute.total_drive_mode_5?.total?.value || 0;
            let average = (subRoute.total_drive_mode_5?.total?.value || 0) / numberOfDays || 0;

            if (metric === 'collectDuration') {
                total *= edge;
                average *= edge;
            }

            return {
                section_name: subRoute.key,
                total,
                average
            };
        }) || [];

        // Tính tổng của tất cả các sections trong route này
        const totalOfAll = sections.reduce((sum, section) => sum + section.total, 0);
        const totalOfAllAverage = sections.length > 0 ? sections.reduce((sum, section) => sum + section.average, 0) / sections.length : 0;

        // Lưu vào map
        routeMap[routeName] = {
            sections,
            totalOfAll,
            totalOfAllAverage
        };
    }

    return routeMap;
}

async getDriveMetricsBySegmentId(segmentId: number, startDate: string, endDate: string, schema: string) {
  let query = {
    index: `${schema}.drive_metrics`,
    body: {
      "size": 1,
      "query": {
        "bool": {
          "must": [
            { "term": { "data.segment_id": segmentId } },
            {
              "range": {
                "data.timestamp": {
                  "time_zone": "+00:00",
                  "gte": startDate,
                  "lte": endDate
                }
              }
            }
          ]
        }
      }
    },
  };

  if (startDate === endDate) {
    query = {
      index: `${schema}.drive_metrics`,
      body: {
        "size": 1,
        "query": {
          "bool": {
            "must": [
              { "term": { "data.segment_id": segmentId } },
              {
                "range": {
                  "data.timestamp": {
                    "time_zone": "+00:00",
                    "gte": startDate,
                    "lte": endDate
                  }
                }
              }
            ]
          }
        }
      },
    };
  }

  const result = await this.openSearchClient.search(query)
  if (result.body.hits.hits.length > 0) {
    return result.body.hits.hits[0]._source.data;
  } else {
    return 
  }
}

  async parseResponseDataSet(response, segmentIds, statisticMode, startDate, endDate, schema) {
    // const operatingRoutes = (await this.getOperatingRoutes(this.openSearchClient,  startDate, endDate)).body.aggregations.unique_route.value;
    let edge = 10;
    await Promise.all(segmentIds.map(async (segmentId) => {
      if (segmentId) {
        // Gọi hàm getCollectMetricsForWidget với cả routeName và segmentId
        const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
        if (driveMetricData) {
          const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
          if (IDReal) {
            edge = await this.workingScheduleService.getOperationMetrics(IDReal.route_id, schema);
          }
        }
      }
    }))
    const numberOfDays = getNumberOfDays(startDate, endDate)
    // Kiểm tra nếu statisticMode không tồn tại hoặc không phải là chuỗi
    if (!statisticMode || typeof statisticMode !== 'string') {
      return null; // Trả về null nếu statisticMode không hợp lệ
    }

    // Gọi hàm getTotalTripByDriveMode để lấy dữ liệu tổng
    const totalDriveModeData = await this.getTotalTripByDriveMode(
      edge,
      this.openSearchClient,
      statisticMode.includes('otherDuration') ? 'time' : 'distance',
      startDate, endDate,
      numberOfDays,
      schema
    );
    // Kiểm tra điều kiện của statisticMode
    if (['otherDuration', 'otherDistance'].includes(statisticMode)) {
      return this.calculateOtherMetrics(edge, response.body.aggregations.by_route.buckets, numberOfDays, totalDriveModeData, statisticMode, schema);
    } else if (['collectDuration', 'collectDistance'].includes(statisticMode)) {
      return this.calculateCollectMetrics(edge, response.body.aggregations.by_route.buckets, numberOfDays, statisticMode, schema);
    }

    // Trường hợp không thỏa điều kiện nào
    return null;
  }

  private calculateCollectCount(routeName1, buckets, startDate: string, endDate: string) {
    const numberOfDays = getNumberOfDays(startDate, endDate);
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
          existingSection.average = (existingSection.average + section.average) / numberOfDays|| 1; // Cập nhật average theo cách đơn giản
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
      ? totalOfAll / numberOfDays || 1
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

  async getCollectMetricsForWidget(routeName: string, segmentIds: any, startDate: string, endDate: string, schema: string) {
    const mustQueries = [];
    if (segmentIds) {
      mustQueries.push({ term: { 'data.segment_id': segmentIds } });
    }

    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate,
          lte: endDate,
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
                  }
                }
              }
            }
          }
        }
      }
    };

    const result = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });

    return this.calculateCollectCount(routeName, result.body.aggregations.trips_by_time.buckets, startDate, endDate);
  }

  async getDriveMetricsWidgetDataSet(widgetDatasetDto: WidgetDatasetDto, schema: string) {
    const { routeNames, startDate, endDate, statisticMode } = widgetDatasetDto;
    const allVehicleData = await this.routeInfoService.getAllRouteName(schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : allVehicleData; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
     if (statisticMode === 'collectCount') {
        let result = {};
        await Promise.all(segmentIds.map(async (segmentId, index) => {
            // Lấy routeName tương ứng từ routeNameArray
            const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
            const currentRouteName = routeArray.name;

            // Gọi hàm getCollectMetricsForWidget với cả routeName và segmentId
            const reuto = await this.getCollectMetricsForWidget(currentRouteName, segmentId, startDate, endDate, schema);

            result[currentRouteName] = {
                ...reuto
            };
        }));
        
        return result;
    } else {
      const query = this.buildQueryDataSet(segmentIds, startDate, endDate, statisticMode);
      const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
      return this.parseResponseDataSet(response, segmentIds, statisticMode, startDate, endDate, schema);
    }
  }
}