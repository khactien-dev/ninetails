import { Inject, Injectable } from "@nestjs/common";
import { convertToArray } from "libs/utils/helper.util";
import { Client } from "@opensearch-project/opensearch";
import { calculateEWM, calculateZScores, generate7DaysBefore, generateDateRangesForStatistics } from "../../../base-query/base.function";
import { RouteInfoService } from "../../../datasource-service/route-info.service";
import { CollectCountGraphDto } from "./collect-count-graph.dto";
import { OperationAnalysisService } from "../../operation-analysis.service";
import { CoreDatasetService } from "../../core-dataset/core-dataset.service";
import * as moment from 'moment';
@Injectable()
export class CollectCountGraphService {
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly operationAnalysisService: OperationAnalysisService,
    private readonly routeInfoService: RouteInfoService,
    private readonly coreDatasetService: CoreDatasetService,
  ) {
  }

  // Collect Count Graph
  buildAggregationsCollectCount = () => ({
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
    }
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

  async getCollectMetricsForCollectCountGraph(collectCountGraphDto: CollectCountGraphDto, segmentId: number, routeId: number, schema: string) {
    const { startDate, endDate, cumulation, unit, trashBagType } = collectCountGraphDto;

    const body = {
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
            "fixed_interval": "12h",
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
              "exists": {
                "field": "countCollectAmount"
              }
            },
            {
              "match_phrase": {
                "route_id": routeId
              }
            },
            
            {
              "range": {
                "date": {
                  "gte": startDate,
                  "lte": endDate,
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

    const result = await this.openSearchClient.search({
      index: `${schema}.zscore_collect_amount_rollup`,
      body,
    });
    return this.formatResponseCollectCountGraph(result, startDate, endDate, cumulation, unit);
  }

  async getEWMCollectCountGraph(collectCountGraphDto: CollectCountGraphDto, segmentId: number, routeId: number, schema: string) {
    const { startDate, endDate, cumulation, unit, trashBagType } = collectCountGraphDto;
    const body = {
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
            "fixed_interval": "12h",
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
              "exists": {
                "field": "countCollectAmount"
              }
            },
            {
              "match_phrase": {
                "route_id": routeId
              }
            },
            {
              "range": {
                "date": {
                  "gte": startDate,
                  "lte": endDate,
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

    const result = await this.openSearchClient.search({
      index: `${schema}.zscore_collect_amount_rollup`,
      body,
    });

    const dateRanges = this.coreDatasetService.generateDateRangesForStatistics1(startDate, endDate);
    const resultArray = result.body.hits.hits.map((item: any) => item._source)
    // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const scoreMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
      acc[date] = null;
      return acc;
    }, {});
  
    // Gán giá trị standardScore vào các ngày tương ứng
    resultArray.forEach((item: any) => {
      const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
      if (scoreMap[date] !== undefined) {
        scoreMap[date] = item.countCollectAmount
        if (unit === 'm3') {
          scoreMap[date] = item.volumeCollectAmount
        }

        if (unit === 'kg') {
          scoreMap[date] = item.weightCollectAmount
        }
      }
    });

    // Thêm các trường bổ sung
    return {
      ...scoreMap
    };
  }

  async getCollectMetricsForAllType(
    collectCountGraphDto: CollectCountGraphDto,
    segmentId: number,
    routeId: number,
    schema: string
  ) {
    const { startDate, endDate, unit, trashBagType } = collectCountGraphDto;
    const mustQueries = [];
  
    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }
  
    mustQueries.push({
      range: {
        'data.timestamp': {
          "time_zone": "+00:00",
          gte: startDate,
          lte: endDate,
        },
      },
    });
  
    const defaultTrashBagTypes = ['5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu', '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'];
    const trashBagTypes = trashBagType ? trashBagType.split(',').map(type => type.trim()) : defaultTrashBagTypes;
  
    let totalOfDayScript = `
      long sum = 0;
    `;
  
    trashBagTypes.forEach(type => {
      totalOfDayScript += `if (doc['data.${type}'].length > 0) { sum += doc['data.${type}'][0]; }\n`;
    });
  
    if (unit === 'm3') {
      trashBagTypes.forEach(type => {
        totalOfDayScript += `if (doc['data.${type}'].length > 1) { sum += doc['data.${type}'][1]; }\n`;
      });
    }
  
    if (unit === 'kg') {
      trashBagTypes.forEach(type => {
        totalOfDayScript += `if (doc['data.${type}'].length > 2) { sum += doc['data.${type}'][2]; }\n`;
      });
    }
  
    totalOfDayScript += `return sum;`;
  
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
              sum: {
                script: {
                  source: totalOfDayScript,
                  lang: "painless",
                },
              },
            },
          },
        },
      },
    };
  
    trashBagTypes.forEach(type => {
      body.aggs.trips_by_time.aggs[type] = {
        sum: {
          script: {
            source: `if (doc['data.${type}'].length > 0) { return doc['data.${type}'][0]; } else { return 0; }`,
            lang: "painless",
          },
        },
      };
    });
  
    const result = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });
  
    const buckets = result.body.aggregations.trips_by_time.buckets;
    const allDates = generateDateRangesForStatistics(startDate, endDate);
  
    const formattedResult: Record<string, any> = {};
    const cumulatedValues: Record<string, number> = {};
    trashBagTypes.forEach(type => (cumulatedValues[type] = 0));
    cumulatedValues['totalOfDay'] = 0;
  
    allDates.forEach(({ date }) => {
      const foundBucket = buckets.find(bucket => bucket.key_as_string === date);
  
      if (foundBucket && foundBucket.totalOfDay.value > 0) {
        const dailyData: Record<string, number | null> = {
          totalOfDay: foundBucket.totalOfDay.value,
        };
  
        trashBagTypes.forEach(type => {
          dailyData[type] = foundBucket[type]?.value ?? 0;
        });
  
        if (collectCountGraphDto.cumulation == 1) {
          cumulatedValues['totalOfDay'] += dailyData['totalOfDay'] || 0;
          trashBagTypes.forEach(type => {
            cumulatedValues[type] += dailyData[type] || 0;
            dailyData[type] = cumulatedValues[type];
          });
          dailyData['totalOfDay'] = cumulatedValues['totalOfDay'];
        }
  
        formattedResult[date] = dailyData;
      } else {
        // Ngày không có dữ liệu hoặc có giá trị bằng 0
        const emptyData: Record<string, number | null> = {
          totalOfDay: null,
        };
  
        trashBagTypes.forEach(type => {
          emptyData[type] = null;
        });
  
        formattedResult[date] = emptyData;
      }
    });
  
    return formattedResult;
  }

  // async getCollectMetricsForAllType(collectCountGraphDto: CollectCountGraphDto, segmentId: number, routeId: number, schema: string) {
  //   const { startDate, endDate, unit, trashBagType } = collectCountGraphDto;

  //   // Chuẩn bị danh sách các trường sẽ tính sum dựa trên trashBagType
  //   const defaultTrashBagTypes = ['5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu', '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'];
  //   const trashBagTypes = trashBagType ? trashBagType.split(',').map(type => type.trim()) : defaultTrashBagTypes;

  //   // Tạo body cho query Elasticsearch
  //   const body = {
  //     "sort": [
  //       {
  //         "date": {
  //           "order": "desc",
  //           "unmapped_type": "boolean"
  //         }
  //       }
  //     ],
  //     "size": 500,
  //     "version": true,
  //     "aggs": {
  //       "2": {
  //         "date_histogram": {
  //           "field": "date",
  //           "fixed_interval": "12h",
  //           "time_zone": "Asia/Saigon",
  //           "min_doc_count": 1
  //         }
  //       }
  //     },
  //     "stored_fields": [
  //       "*"
  //     ],
  //     "script_fields": {},
  //     "docvalue_fields": [
  //       {
  //         "field": "date",
  //         "format": "date_time"
  //       }
  //     ],
  //     "_source": {
  //       "excludes": []
  //     },
  //     "query": {
  //       "bool": {
  //         "must": [],
  //         "filter": [
  //           {
  //             "match_all": {}
  //           },
  //           {
  //             "match_phrase": {
  //               "route_id": routeId
  //             }
  //           },
  //           {
  //             "match_phrase": {
  //               "segment_id": segmentId
  //             }
  //           },
  //           {
  //             "range": {
  //               "date": {
  //                 "gte": startDate,
  //                 "lte": endDate,
  //                 "format": "strict_date_optional_time"
  //               }
  //             }
  //           }
  //         ],
  //         "should": [],
  //         "must_not": []
  //       }
  //     },
  //     "highlight": {
  //       "pre_tags": [
  //         "@opensearch-dashboards-highlighted-field@"
  //       ],
  //       "post_tags": [
  //         "@/opensearch-dashboards-highlighted-field@"
  //       ],
  //       "fields": {
  //         "*": {}
  //       },
  //       "fragment_size": 2147483647
  //     }
  //   };

  //   const result = await this.openSearchClient.search({
  //     index: `${schema}.zscore_trash_bags_type_rollup`,
  //     body,
  //   });
  //   const buckets = result.body.hits.hits;

  //   // Tạo một danh sách tất cả các ngày giữa startDate và endDate
  //   const allDates = generateDateRangesForStatistics(startDate, endDate);

  //   const formattedResult = {};

  //   // Duyệt qua từng ngày trong khoảng từ startDate đến endDate
  //   allDates.forEach(({ date }) => {
  //     const foundBucket = buckets.find(bucket => bucket._source.date === date);

  //     // Nếu có bucket cho ngày này, sử dụng giá trị từ bucket, nếu không thì để null
  //     if (foundBucket) {
  //       formattedResult[date] = {
  //         totalOfDay: 1,
  //       };

  //       trashBagTypes.forEach(type => {
  //         formattedResult[date][type] = foundBucket._source[type][0] || 0;
  //         if (unit === 'm3') {
  //           formattedResult[date][type] = foundBucket._source[type][1] || 0;
  //         }

  //         if (unit === 'kg') {
  //           formattedResult[date][type] = foundBucket._source[type][2] || 0;
  //         }
  //       });
  //     } else {
  //       // Nếu không có dữ liệu cho ngày này, gán null
  //       formattedResult[date] = {
  //         totalOfDay: null,
  //       };

  //       trashBagTypes.forEach(type => {
  //         formattedResult[date][type] = null;
  //       });
  //     }
  //   });

  //   return formattedResult
  // }

  private formatResponseCollectCountGraph(data: any, startDate: string, endDate: string, cumulation: number, unit: string) {
    // Tạo object chứa dữ liệu cho từng ngày
    const expandedCollectCount: any = {};
  
    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
  
    // Khởi tạo tất cả các ngày với giá trị null ban đầu trong object
    dateRanges.forEach(({ date }) => {
      expandedCollectCount[date] = null;
    });
  
    // Chuyển đổi cumulation từ string sang boolean
    const isCumulative = +cumulation === 1;
  
    let cumulativeSum = 0;
    const routeDateMap = new Map();
    
    data.body.hits.hits.reverse().forEach((bucket: any) => {
      const date = bucket._source.date;
      const routeId = bucket._source.route_id;
      let dayValue = bucket._source.collect_amount[0] || 0;
  
      if (unit === 'm3') {
        dayValue = bucket._source.collect_amount[1] || 0;
      }
  
      if (unit === 'kg') {
        dayValue = bucket._source.collect_amount[2] || 0;
      }
  
      if (dayValue === 0) dayValue = null;
  
      const routeDateKey = `${routeId}_${date}`;
  
      if (isCumulative && dayValue !== null) {
        if (!routeDateMap.has(routeDateKey)) {
          cumulativeSum += dayValue;
          routeDateMap.set(routeDateKey, true);
        }
        expandedCollectCount[date] = cumulativeSum;
      } else {
        expandedCollectCount[date] = dayValue;
      }
    });
  
    return expandedCollectCount;
  }

  private async extractMetricsForCollectCount(segmentId: number, date: string, schema: string) {
    const collectCount = await this.operationAnalysisService.getCollectMetricsSegmentId(
        segmentId,
      date,
      schema
    )
    return collectCount
  }

  async calculateCollectCountEWMForOneDay(segmentId: number, date: string, schema: string) {
    const genDate = generate7DaysBefore(date);
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const collectCount = await this.extractMetricsForCollectCount(segmentId, date, schema);
        return {
          date,
          collectCount,
        };
      })
    );

    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    const oneMetric = [...filteredMetricsArray].reverse();

    const statistics = this.operationAnalysisService.calculateStatistics(oneMetric);
    const zCollectCounts = calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const ewmMetricsFor7Days = calculateEWM(zCollectCounts.map((m) => m), 0.1);

    return ewmMetricsFor7Days.reverse().slice(-1)[0];
  }

  async getCollectCountGraphEWMStartEndDate(collectCountGraphDto: CollectCountGraphDto, segmentId: number, schema: string) {
    const { startDate, endDate } = collectCountGraphDto;
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    // Sử dụng Promise.all để đảm bảo tất cả các promise được xử lý
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const result = await this.calculateCollectCountEWMForOneDay(segmentId, date, schema);
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
    const { routeNames, cumulation } = collectCountGraphDto;
    const allVehicleData = await this.routeInfoService.getAllRouteName(schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : allVehicleData; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema)

    const vehicleCountPerDay: any = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const overallEWM: any = {}; // Tính tổng EWM cho mỗi ngày
    let cumulativeSum = 0; // Biến để lưu trữ giá trị cộng dồn nếu cumulation = true

    // Chuyển đổi cumulation từ string sang boolean
    const isCumulative = +cumulation === 1;

    // Duyệt qua tất cả các routeNames và tính tổng EWM
    await Promise.all(
        segmentIds.map(async (segmentId) => {
        // Gọi hàm để lấy EWM trung bình cho mỗi ngày
        const EWMAVG = await this.getCollectCountGraphEWMStartEndDate(collectCountGraphDto, segmentId, schema);

        // Duyệt qua các ngày và cộng giá trị EWM
        Object.keys(EWMAVG).forEach((date) => {
          const dayData = EWMAVG[date];

          if (!overallEWM[date]) {
            overallEWM[date] = null;
            vehicleCountPerDay[date] = null;
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

  private formatResponseCollectCountSection(data: any, startDate: string, endDate: string, cumulation?) {
    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
  
    // Khởi tạo object chứa dữ liệu cho từng ngày
    const expandedCollectCount: Record<string, any> = {};
  
    // Duyệt qua tất cả các ngày trong khoảng từ startDate đến endDate, khởi tạo null cho từng ngày
    dateRanges.forEach(({ date }) => {
      expandedCollectCount[date] = { totalOfDay: null };
    });
  
    // Biến lưu trữ giá trị cộng dồn
    let cumulativeSum = {
      totalOfDay: 0,
    };
  
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
  
        // Thực hiện cộng dồn nếu cumulation được bật
        if (cumulation) {
          cumulativeSum.totalOfDay += totalOfDay;
          expandedCollectCount[date].totalOfDay = cumulativeSum.totalOfDay;
  
          // Cộng dồn các giá trị section
          bucket.by_route.buckets.forEach((sectionBucket: any) => {
            const sectionKey = sectionBucket.key;
            const sectionValue = sectionBucket.total_sum?.value || 0;
  
            if (!cumulativeSum[sectionKey]) {
              cumulativeSum[sectionKey] = 0;
            }
  
            cumulativeSum[sectionKey] += sectionValue;
            expandedCollectCount[date][sectionKey] = cumulativeSum[sectionKey];
          });
        }
      }
    });
  
    return expandedCollectCount;
  }

  // async getSectionCollectCountGraph(segmentId: number, routeId: number, sectionId: number, startDate: string, endDate: string, schema: string, sectionName?: string) {
  //   if (sectionName) {
  //     sectionId = await this.routeInfoService.getSectionIdByRouteIdAndSectionName(routeId, sectionName, schema);
  //   }
  //   const body = {
  //     "sort": [
  //       {
  //         "date": {
  //           "order": "desc",
  //           "unmapped_type": "boolean"
  //         }
  //       }
  //     ],
  //     "size": 500,
  //     "version": true,
  //     "aggs": {
  //       "2": {
  //         "date_histogram": {
  //           "field": "date",
  //           "fixed_interval": "12h",
  //           "time_zone": "Asia/Saigon",
  //           "min_doc_count": 1
  //         }
  //       }
  //     },
  //     "stored_fields": [
  //       "*"
  //     ],
  //     "script_fields": {},
  //     "docvalue_fields": [
  //       {
  //         "field": "date",
  //         "format": "date_time"
  //       }
  //     ],
  //     "_source": {
  //       "excludes": []
  //     },
  //     "query": {
  //       "bool": {
  //         "must": [],
  //         "filter": [
  //           {
  //             "match_all": {}
  //           },
  //           {
  //             "match_phrase": {
  //               "route_id": routeId
  //             }
  //           },
  //           {
  //             "match_phrase": {
  //               "segment_id": segmentId
  //             }
  //           },
  //           {
  //             "match_phrase": {
  //               "section_id": sectionId
  //             }
  //           },
  //           {
  //             "exists": {
  //               "field": "countCollectAmount"
  //             }
  //           },
  //           {
  //             "range": {
  //               "date": {
  //                 "gte": startDate,
  //                 "lte": endDate,
  //                 "format": "strict_date_optional_time"
  //               }
  //             }
  //           }
  //         ],
  //         "should": [],
  //         "must_not": []
  //       }
  //     },
  //     "highlight": {
  //       "pre_tags": [
  //         "@opensearch-dashboards-highlighted-field@"
  //       ],
  //       "post_tags": [
  //         "@/opensearch-dashboards-highlighted-field@"
  //       ],
  //       "fields": {
  //         "*": {}
  //       },
  //       "fragment_size": 2147483647
  //     }
  //   }

  //   const result = await this.openSearchClient.search({
  //     index: `${schema}.zscore_collect_amount_rollup`,
  //     body,
  //   });
  //   return result
  //   // return result.body.aggregations.trips_by_time.buckets

  //   // return this.formatResponseCollectCountSection(result, startDate, endDate);
  // }

  async getSectionCollectCountGraph(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string, sectionName?: string, unit?, cumulation?) {
    const mustQueries = [];

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    if (sectionName) {
      mustQueries.push({ terms: { 'data.section_name.keyword': convertToArray(sectionName) } });
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

    let body = {
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
                        long float = 0;
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

    if (unit === 'm3') {
      body = {
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
                          long float = 0;
                          if (doc['data.5L_gen'].length > 1) { sum += doc['data.5L_gen'][1]; }
                          if (doc['data.10L_gen'].length > 1) { sum += doc['data.10L_gen'][1]; }
                          if (doc['data.10L_reu'].length > 1) { sum += doc['data.10L_reu'][1]; }
                          if (doc['data.20L_gen'].length > 1) { sum += doc['data.20L_gen'][1]; }
                          if (doc['data.20L_reu'].length > 1) { sum += doc['data.20L_reu'][1]; }
                          if (doc['data.30L_gen'].length > 1) { sum += doc['data.30L_gen'][1]; }
                          if (doc['data.50L_gen'].length > 1) { sum += doc['data.50L_gen'][1]; }
                          if (doc['data.50L_pub'].length > 1) { sum += doc['data.50L_pub'][1]; }
                          if (doc['data.75L_gen'].length > 1) { sum += doc['data.75L_gen'][1]; }
                          if (doc['data.75L_pub'].length > 1) { sum += doc['data.75L_pub'][1]; }
                          if (doc['data.ext'].length > 1) { sum += doc['data.ext'][1]; }
                          if (doc['data.etc'].length > 1) { sum += doc['data.etc'][1]; }
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
    }

    if (unit === 'kg') {
      body = {
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
                          long float = 0;
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
    }
    

    const result = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });

    // return result.body.aggregations.trips_by_time.buckets

    return this.formatResponseCollectCountSection(result, startDate, endDate, cumulation);
  }

  async getSectionList(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const mustQueries = [];

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
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
      aggs: {
        unique_section: {
          composite: {
            sources: [
              { section_id: { terms: { field: 'data.section_id' } } },
            ],
            size: 10000
          }
        }
      }
    };

    const opensearchResult = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });
    
    const result = await Promise.all(
      opensearchResult.body.aggregations.unique_section.buckets.map(async (m) => {
        return this.routeInfoService.getSectionNameBySectionIdAndRouteId(m.key.section_id, routeId, schema);
      })
    )
    return result
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
    const { routeNames, startDate, endDate, aggregation, L3Extension, L4Extension, sectionName } = collectCountGraphDto;
    const routeName = await this.coreDatasetService.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key);
    if (opensearchRouteIdList.length === 0) {
      return;
    }
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema)
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema)
    const result = {}; // Để lưu kết quả cho từng ngày khi L3Extension hoặc L4Extension = true
    const detailedSumPerDay = {}; // Biến lưu trữ dữ liệu chi tiết khi L3Extension hoặc L4Extension = true
    const vehicleCountPerDay = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const maxPerDay = {};
    const minPerDay = {};
    const overallSum = {};
    const overallEWM = {};
    let newArray = null
    let newAvg = null;
    let sectionList = null;
    await Promise.all(
        segmentIds.map(async (segmentId, index) => {
        if (segmentId) {
          const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
          const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
          if (driveMetricData) {
            const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
            const mainData = await this.getCollectMetricsForCollectCountGraph(collectCountGraphDto, IDReal.segment_id, IDReal.route_id, schema);
            let agre = await this.getCollectMetricsForAllType(collectCountGraphDto, IDReal.segment_id, IDReal.route_id, schema);
            const collectType = await this.getSectionCollectCountGraph(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema, sectionName, collectCountGraphDto.unit, collectCountGraphDto.cumulation);
            const AVGcollectType = this.calculateDailyAverage(collectType);
            const newSectionList = await this.getSectionList(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
            const EWMAVG = await this.getEWMCollectCountGraph(collectCountGraphDto, IDReal.segment_id, IDReal.route_id, schema);
            const currentRouteName = routeArray.name;
            
            if (!aggregation && convertToArray(currentRouteName).length === 1) {
              newArray = collectType;
              newAvg = AVGcollectType
              sectionList = newSectionList
            }
    
            result[currentRouteName] = { ...mainData };
    
            Object.keys(mainData).forEach((date) => {
              const dayData = mainData[date];
    
              if (!overallSum[date]) {
                overallSum[date] = null;
                vehicleCountPerDay[date] = 0;
                maxPerDay[date] = -Infinity;
                minPerDay[date] = Infinity;
              }
    
              if (dayData !== null && dayData !== undefined) {
                overallSum[date] += dayData;
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

                if (routeNameArray.length > 1) {
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
                }

                // Cộng dồn các giá trị chi tiết cho từng ngày, nếu không có thì để null
                detailedSumPerDay[date].totalOfDay = (dayData.totalOfDay || 0) || null;
                detailedSumPerDay[date]["5L_gen"] = (dayData["5L_gen"] || 0) || null;
                detailedSumPerDay[date]["10L_gen"] = (dayData["10L_gen"] || 0) || null;
                detailedSumPerDay[date]["10L_reu"] = (dayData["10L_reu"] || 0) || null;
                detailedSumPerDay[date]["20L_gen"] = (dayData["20L_gen"] || 0) || null;
                detailedSumPerDay[date]["20L_reu"] = (dayData["20L_reu"] || 0) || null;
                detailedSumPerDay[date]["30L_gen"] = (dayData["30L_gen"] || 0) || null;
                detailedSumPerDay[date]["50L_gen"] = (dayData["50L_gen"] || 0) || null;
                detailedSumPerDay[date]["50L_pub"] = (dayData["50L_pub"] || 0) || null;
                detailedSumPerDay[date]["75L_gen"] = (dayData["75L_gen"] || 0) || null;
                detailedSumPerDay[date]["75L_pub"] = (dayData["75L_pub"] || 0) || null;
                detailedSumPerDay[date]["ext"] = (dayData["ext"] || 0) || null;
                detailedSumPerDay[date]["etc"] = (dayData["etc"] || 0) || null;
                
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
                detailedSumPerDay[date][currentRouteName] = dayData.totalOfDay || null;
              });
            }

            Object.keys(EWMAVG).forEach((date) => {
              const dayData = EWMAVG[date];
  
              if (!overallEWM[date]) {
                overallEWM[date] = null;
                vehicleCountPerDay[date] = 0;
              }
  
              // Cộng dồn giá trị vào tổng của ngày đó, kể cả khi giá trị là null
              if (dayData !== null) {
                overallEWM[date] += dayData; // Cộng tổng các giá trị khác null
                vehicleCountPerDay[date] += 1; // Đếm số lượng phương tiện có dữ liệu cho ngày đó
              }
            });

          }
        }
      })
    );

    const averageData = {};
    const aggregationData = {};
    Object.keys(overallSum).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        const average = overallSum[date] / routeNameArray.length || null;
        averageData[date] = average || null;
        if (aggregation) {
          aggregationData[date] = {
            totalOfDay: overallSum[date],
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
        

    const averageEWMData = {};
    Object.keys(overallEWM).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        averageEWMData[date] = overallEWM[date] / routeNameArray.length || null; // Tính trung bình cho ngày có dữ liệu
      } else {
        averageEWMData[date] = null; // Để null nếu không có phương tiện nào có dữ liệu cho ngày đó
      }
    });

    if (L3Extension) {
      if (!aggregation && convertToArray(routeNames).length === 1) {
        return {
          route: newArray, // Tổng giá trị của tất cả các route cho mỗi ngày
          AVG: {
            average: newAvg,
            EWM: averageEWMData,
          },
          sectionList
        };
      } else if (aggregation && convertToArray(routeNames).length === 1) {
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
}