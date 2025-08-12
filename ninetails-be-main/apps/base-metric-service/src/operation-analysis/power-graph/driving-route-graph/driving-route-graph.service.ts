import { Inject, Injectable } from "@nestjs/common";
import { convertToArray } from "libs/utils/helper.util";
import { Client } from "@opensearch-project/opensearch";
import { DrivingRouteGraphDto } from "./driving-route-graph.dto";
import { buildDateRangeQueryOnlyDate, calculateEWM, calculateZScores, checkAnomaly, generateDateRangesForStatistics, safeMean, safeStd } from "../../../base-query/base.function";
import { OperationAnalysisService } from "../../operation-analysis.service";
import { CoreDatasetService } from "../../core-dataset/core-dataset.service";
import { ManualCollectService } from "../../../datasource-service/manual-collect.service";
import { RouteInfoService } from "../../../datasource-service/route-info.service";
import { WorkingScheduleService } from "../../../datasource-service/working-schedule.service";
import * as moment from 'moment';
import { MetricWeightService } from "../../../datasource-service/metric-weight.service";

@Injectable()
export class DrivingRouteService {
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly operationAnalysisService: OperationAnalysisService,
    private readonly coreDatasetService: CoreDatasetService,
    private readonly manualCollectService: ManualCollectService,
    private readonly routeInfoService: RouteInfoService,
    private readonly workingScheduleService: WorkingScheduleService,
    private readonly metricWeightService: MetricWeightService,
  ) {
  }

  // Driving Route Graph
  async getDrivingRouteGraphData(drivingRouteGraphDto: DrivingRouteGraphDto, segmentId: number, schema: string) {
    const { startDate, endDate, cumulation } = drivingRouteGraphDto;
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          buildDateRangeQueryOnlyDate(date),
        ];

        const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);
        
        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount,
        } = await this.coreDatasetService.extractMetricsForCoreDataSet(result, segmentId, date, schema);
        const manualCollectDistance = 10
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
          manualCollectTime === 0
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

    const statistics = this.operationAnalysisService.calculateStatistics(oneMetric);
    const zDistanceRatios = calculateZScores(
      oneMetric.map((v) => v.distanceRatios),
      statistics.mean.distanceRatios,
      statistics.standardDeviation.distanceRatios
    );
    const zDurationRatios = calculateZScores(
      oneMetric.map((v) => v.durationRatios),
      statistics.mean.durationRatios,
      statistics.standardDeviation.durationRatios
    );
    const zCollectDistances = calculateZScores(
      oneMetric.map((v) => v.collectDistance),
      statistics.mean.collectDistance,
      statistics.standardDeviation.collectDistance
    );
    const zCollectDurations = calculateZScores(
      oneMetric.map((v) => v.collectDuration),
      statistics.mean.collectDuration,
      statistics.standardDeviation.collectDuration
    );
    const zCollectCounts = calculateZScores(
      oneMetric.map((v) => v.collectCount),
      statistics.mean.collectCount,
      statistics.standardDeviation.collectCount
    );

    const zManualCollectTime = calculateZScores(
      oneMetric.map((v) => v.manualCollectTime),
      statistics.mean.manualCollectTime,
      statistics.standardDeviation.manualCollectTime,
    );

    const rankScores = this.coreDatasetService.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      {
        distanceRatioRate: 15,
        durationRatioRate: 15,
        collectDistanceRate: 15,
        collectDurationRate: 15,
        collectCountRate: 30,
        manualCollectTimeRate: 10,
      }
    );

    const zScores = rankScores.map((score) => score * 0.2 + 100);

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
          [date]: zScores[index] || null  // Gán rankScore vào từng ngày
        };
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
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    // Lấy 7 ngày trước đó cho mỗi ngày trong khoảng startDate đến endDate
    const sevenDaysData = dateRanges.map(date => ({
      date,
      sevenDaysBefore: this.generate7DaysBefore(date.date),
    }));

    return sevenDaysData;
  }

  async getDriveMetricsBySegmentId(segmentId: number, date: string, schema: string) {
    const query = {
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
                    "gte": date,
                    "lte": date
                  }
                }
              }
            ]
          }
        }
      },
    };
    const result = await this.openSearchClient.search(query)
    if (result.body.hits.hits.length > 0) {
      return result.body.hits.hits[0]._source.data;
    } else {
      return 
    }
  }

  async calculateStandardScoreEWMForOneDay(segmentId: number, date: string, schema: string) {
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const genDate = this.generate7DaysBefore(date);
    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, date, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const mustQueriesForRange = [
          mustQueries,
          buildDateRangeQueryOnlyDate(date),
        ];

        const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);

        const {
          distanceRatios,
          collectDistance,
          otherDistance,
          durationRatios,
          collectDuration,
          otherDuration,
          collectCount
        } = await this.coreDatasetService.extractMetricsForCoreDataSet(result, segmentId, date, schema);

        const manualCollectDistance = 10
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
          manualCollectTime === 0
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
    const oneMetric = [...filteredMetricsArray];

    const statistics = this.operationAnalysisService.calculateStatistics(oneMetric);
    const zDistanceRatios = calculateZScores(oneMetric.map(v => v.distanceRatios), statistics.mean.distanceRatios, statistics.standardDeviation.distanceRatios);
    const zDurationRatios = calculateZScores(oneMetric.map(v => v.durationRatios), statistics.mean.durationRatios, statistics.standardDeviation.durationRatios);
    const zCollectDistances = calculateZScores(oneMetric.map(v => v.collectDistance), statistics.mean.collectDistance, statistics.standardDeviation.collectDistance);
    const zCollectDurations = calculateZScores(oneMetric.map(v => v.collectDuration), statistics.mean.collectDuration, statistics.standardDeviation.collectDuration);
    const zCollectCounts = calculateZScores(oneMetric.map(v => v.collectCount), statistics.mean.collectCount, statistics.standardDeviation.collectCount);
    const zManualCollectTime = calculateZScores(oneMetric.map(v => v.manualCollectTime), statistics.mean.manualCollectTime, statistics.standardDeviation.manualCollectTime);


    const rankScores = this.coreDatasetService.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      { distanceRatioRate: 0.15, durationRatioRate: 0.15, collectDistanceRate: 0.15, collectDurationRate: 0.15, collectCountRate: 0.3, manualCollectTimeRate: 0.1 }
    );
    
    const filteredrankScores = rankScores.filter((score) => score !== 0);
    const zScores = filteredrankScores.map((score) => score * 20 + 100);
    
    const ewmMetricsFor7Days = calculateEWM(zScores.map((m) => m), 0.1);

    return ewmMetricsFor7Days.reverse().slice(-1)[0];
  }

  async getDrivingRouteGraphEWMStartEndDate(drivingRouteGraphDto: DrivingRouteGraphDto, segmentId: number, schema) {
    const { startDate, endDate, cumulation } = drivingRouteGraphDto;
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    let cumulativeSum = 0;  // Biến giữ giá trị tổng cộng dồn theo thời gian

    // Tạo mảng metricsArray để lưu trữ kết quả cho từng ngày
    const metricsArray = [];

    // Chạy tuần tự qua từng ngày trong dateRanges
    for (const { date } of dateRanges) {
      // Lấy giá trị kết quả cho ngày hiện tại
      const result = await this.calculateStandardScoreEWMForOneDay(segmentId, date, schema);
      
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

  async getDrivingRouteGraphEWMAverageExtendsOneDay(segmentId: number, date: string, schema: string) {
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const genDate = this.generate7DaysBefore(date);
    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, date, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      genDate.map(async (date) => {
        const mustQueriesForRange = [
          mustQueries,
          buildDateRangeQueryOnlyDate(date),
        ];

        const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);

        const {
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration,
        } = await this.coreDatasetService.extractMetricsForCoreDataSet(result, segmentId, date, schema);

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

    const ewmOneMetric = this.operationAnalysisService.calculateEWMetricsForStatistics(oneMetric);

    const latest = {
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      otherDistance: ewmOneMetric.otherDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      otherDuration: ewmOneMetric.otherDuration.slice(-1)[0]
    };

    return latest;
  }

  async getDrivingRouteGraphExtendedData(drivingRouteGraphDto: DrivingRouteGraphDto, segmentId: number, schema) {
    const { startDate, endDate } = drivingRouteGraphDto
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
    const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          buildDateRangeQueryOnlyDate(date),
        ];

        const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);

        const {
          collectDistance,
          otherDistance,
          collectDuration,
          otherDuration,
        } = await this.coreDatasetService.extractMetricsForCoreDataSet(result, segmentId, date, schema);

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

  async getDrivingRouteGraphEWMAverageExtendsStartEndDate(drivingRouteGraphDto: DrivingRouteGraphDto, segmentId: number, schema: string) {
    const { startDate, endDate, cumulation } = drivingRouteGraphDto; // Thêm cumulation vào DTO
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    // Sử dụng Promise.all để đảm bảo tất cả các promise được xử lý
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const result = await this.getDrivingRouteGraphEWMAverageExtendsOneDay(segmentId, date, schema);
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
    const { routeNames, startDate, endDate } = drivingRouteGraphDto;
    const routeName = await this.coreDatasetService.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key);
    const allVehicleData = await this.routeInfoService.getAllRouteName(schema);
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema)
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
    
    const totalResult = {
      collectDistance: { total: {}, average: {}, EWM: {} },
      otherDistance: { total: {}, average: {}, EWM: {} },
      collectDuration: { total: {}, average: {}, EWM: {} },
      otherDuration: { total: {}, average: {}, EWM: {} }
    };
  
    const sumMetrics = (metrics, date, newData) => {
      Object.keys(metrics).forEach(metric => {
        metrics[metric].total[date] = (metrics[metric].total[date] || 0) + (newData[metric] || 0);
      });
    };
  
    const accumulateData = (metrics, previousDate, currentDate) => {
      Object.keys(metrics).forEach(metric => {
        metrics[metric].total[currentDate] = (metrics[metric].total[previousDate] || 0) + (metrics[metric].total[currentDate] || 0);
      });
    };
  
    await Promise.all(
      segmentIds.map(async (segmentId) => {
        const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
        if (driveMetricData) {
          const segmentIDReal = await this.routeInfoService.getSegmentIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
          const EWMData = await this.getDrivingRouteGraphEWMAverageExtendsStartEndDate(drivingRouteGraphDto, segmentIDReal, schema);
          const dataByDate = await this.getDrivingRouteGraphExtendedData(drivingRouteGraphDto, segmentIDReal, schema);
          dataByDate.forEach(({ date, collectDistance, otherDistance, collectDuration, otherDuration }) => {
            if (!totalResult.collectDistance.total[date]) {
              Object.keys(totalResult).forEach(metric => {
                totalResult[metric].total[date] = 0;
              });
            }
    
            sumMetrics(totalResult, date, { collectDistance, otherDistance, collectDuration, otherDuration });
    
            const EWMForDate = EWMData[date] || {};
            Object.keys(EWMForDate).forEach(metric => {
              totalResult[metric].EWM[date] = EWMForDate[metric] !== undefined ? EWMForDate[metric] : 0;
            });
          });
        }
      })
    );
  
    const numVehicles = allVehicleData.length;
  
    if (+drivingRouteGraphDto.cumulation === 1) {
      const sortedDates = Object.keys(totalResult.collectDistance.total).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      for (let i = 1; i < sortedDates.length; i++) {
        accumulateData(totalResult, sortedDates[i - 1], sortedDates[i]);
      }
    }
  
    const sortedTotalResult = {
      collectDistance: { total: {}, average: {}, EWM: {} },
      otherDistance: { total: {}, average: {}, EWM: {} },
      collectDuration: { total: {}, average: {}, EWM: {} },
      otherDuration: { total: {}, average: {}, EWM: {} }
    };
  
    const sortedDates = Object.keys(totalResult.collectDistance.total).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    sortedDates.forEach(date => {
      Object.keys(totalResult).forEach(metric => {
        sortedTotalResult[metric].total[date] = totalResult[metric].total[date] === 0 ? null : totalResult[metric].total[date];
        sortedTotalResult[metric].average[date] = totalResult[metric].total[date] === 0 ? null : totalResult[metric].total[date] / numVehicles;
        sortedTotalResult[metric].EWM[date] = totalResult[metric].EWM[date] === 0 ? null : totalResult[metric].EWM[date] / numVehicles;
      });
    });
  
    return sortedTotalResult;
  }

  async getStandardScore(
    segmentId: number, 
    routeId: number, 
    startDate: string, 
    endDate: string, 
    schema: string, 
    cumulation: number = 0 // Thêm tham số cumulation, mặc định là 0 (không cộng dồn)
  ) {
    const result = await this.coreDatasetService.getCoreDataRollup(segmentId, routeId, startDate, endDate, schema);
    const dateRanges = this.coreDatasetService.generateDateRangesForStatistics1(startDate, endDate);
  
    // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const scoreMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
      acc[date] = null;
      return acc;
    }, {});
  
    // Gán giá trị standardScore vào các ngày tương ứng
    let cumulativeScore = 0; // Biến lưu trữ giá trị cộng dồn
    result.reverse().forEach((item: any) => {
      const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
      if (scoreMap[date] !== undefined) {
        const score = item.standardScore === 100 ? null : item.standardScore;
        if (cumulation == 1 && score !== null) { // Nếu cumulation = 1, thực hiện cộng dồn
          cumulativeScore += score; // Cộng dồn giá trị
          scoreMap[date] = cumulativeScore; // Gán giá trị cộng dồn
        } else {
          scoreMap[date] = score; // Gán giá trị thông thường
        }
      }
    });
  
    // Thêm các trường bổ sung
    return {
      ...scoreMap
    };
  }

  async getCoreDataRollupEWM(segmentId: number, routeId: number, startDate: string, endDate: string,schema: string) {
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
                  "exists": {
                    "field": "standardScoreEWM"
                  }
                },
                {
                  "match_phrase": {
                    "route_id": routeId
                  }
                },
                {
                  "match_phrase": {
                    "segment_id": segmentId
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
      }
  
      const result = await this.openSearchClient.search(query);
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
          scoreMap[date] = item.standardScoreEWM
        }
      });

      // Thêm các trường bổ sung
      return {
        ...scoreMap
      };
    }

    async getZscoreRollUpData(segmentId: number, routeId: number, startDate: string, endDate: string, numberOfVehicle: number, schema: string, cumulation: number = 0) {
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
              "fixed_interval": "30m",
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
                "exists": {
                  "field": "EWMRawData.collectDistance"
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
      };
    
      const result = await this.openSearchClient.search({
        index: `${schema}.zscore_coredata_rollup`,
        body,
      });
    
      let hits = result.body.hits.hits;
    
      // Đảo ngược mảng hits
      hits = hits.reverse();
    
      // Lấy danh sách ngày trong khoảng
      const dates = this.getDatesRange(startDate, endDate);
      const fields = ["collectDistance", "otherDistance", "collectDuration", "otherDuration"];
      const response: any = {};
    
      // Khởi tạo dữ liệu null
      for (const field of fields) {
        response[field] = {
          total: this.initDateData(dates),
          average: this.initDateData(dates), // Sẽ để null
          EWM: this.initDateData(dates) // Sẽ để null
        };
      }
    
      // Biến lưu trữ giá trị cộng dồn
      const cumulativeTotal: any = {};
      const cumulativeAverage: any = {};
    
      for (const field of fields) {
        cumulativeTotal[field] = 0; // Khởi tạo giá trị ban đầu là 0
        cumulativeAverage[field] = 0; // Khởi tạo giá trị ban đầu là 0
      }
    
      // Điền dữ liệu vào `total`
      for (const hit of hits) {
        const source = hit._source.rawData;
        const sourceEWM = hit._source.EWMRawData;
        const date = hit._source.date.split("T")[0]; // Lấy ngày từ timestamp
    
        if (!response.collectDistance.total.hasOwnProperty(date)) continue;
        for (const field of fields) {
          if (source[field] != null) {
            if (cumulation == 1) {
              cumulativeTotal[field] += source[field];
              cumulativeAverage[field] += source[field] / numberOfVehicle;
              response[field].total[date] = cumulativeTotal[field];
              response[field].average[date] = cumulativeAverage[field];
            } else {
              response[field].total[date] = source[field];
              response[field].average[date] = source[field] / numberOfVehicle;
            }
            response[field].EWM[date] = sourceEWM[field];
          }
        }
      }
    
      return response;
    }

  // Hàm khởi tạo dữ liệu null cho mỗi ngày
  initDateData(dates: string[]) {
      return dates.reduce((acc, date) => {
          acc[date] = null;
          return acc;
      }, {});
  }

  // Hàm lấy danh sách ngày trong khoảng
  getDatesRange(startDate: string, endDate: string): string[] {
      const dates = [];
      let current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
          dates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
      }
      return dates;
  }

  async getDrivingRouteGraph(drivingRouteGraphDto: DrivingRouteGraphDto, schema: string) {
    const { routeNames, excludeRoute, startDate, endDate } = drivingRouteGraphDto;
    const routeName = await this.coreDatasetService.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key); 
    if (opensearchRouteIdList.length === 0) {
      return;
    }
    const result = {}; // Để lưu kết quả cho từng routeName
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
    if (excludeRoute) {
      const excludeRouteNames = convertToArray(excludeRoute); // Chuyển đổi excludeRoute thành mảng nếu cần
      routeNameArray = routeNameArray.filter((name) => !excludeRouteNames.includes(name));
    }
    // Biến lưu trữ tổng giá trị và số lượng phương tiện của tất cả các phương tiện trong các ngày
    const overallSum = {};
    const vehicleCountPerDay = {}; // Để theo dõi số lượng phương tiện có giá trị khác null mỗi ngày
    const overallEWM = {};
    let total = {
      collectDistance: { total: {}, average: {}, EWM: {} },
      otherDistance: { total: {}, average: {}, EWM: {} },
      collectDuration: { total: {}, average: {}, EWM: {} },
      otherDuration: { total: {}, average: {}, EWM: {} }
    };
  
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    await Promise.all(
      segmentIds.map(async (segmentId) => {
        if (segmentId) {
          const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
          const currentRouteName = routeArray.name;
          const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
          // Gọi các hàm với routeName hiện tại
          if (driveMetricData) {
            const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
            if (IDReal) {
              const mainData = await this.getStandardScore(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema, drivingRouteGraphDto.cumulation);
              const EWMAVG = await this.getCoreDataRollupEWM(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
              const totalData = await this.getZscoreRollUpData(IDReal.segment_id, IDReal.route_id, startDate, endDate, routeNameArray.length, schema, drivingRouteGraphDto.cumulation);
    
              // Lưu trữ dữ liệu cho routeName hiện tại
              result[currentRouteName] = {
                ...mainData
              };
    
              // Tính tổng cho tất cả các ngày
              Object.keys(mainData).forEach((date) => {
                const dayData = mainData[date];
                if (!overallSum[date]) {
                  overallSum[date] = null;
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
                  overallEWM[date] = null;
                  vehicleCountPerDay[date] = 0;
                }
    
                // Cộng dồn giá trị vào tổng của ngày đó, kể cả khi giá trị là null
                if (dayData !== null) {
                  overallEWM[date] += dayData; // Cộng tổng các giá trị khác null
                  vehicleCountPerDay[date] += 1; // Đếm số lượng phương tiện có dữ liệu cho ngày đó
                }
              });
    
              // Cộng dồn giá trị vào total
              for (const field of Object.keys(total)) {
                for (const key of Object.keys(total[field])) {
                  for (const date of Object.keys(totalData[field][key])) {
                    if (!total[field][key][date]) {
                      total[field][key][date] = null;
                    }
                    total[field][key][date] += totalData[field][key][date] || 0;
                  }
                }
              }
            }
            }
        }
      })
    );
  
    // Nếu chỉ có một routeName, gán vehicleCountPerDay = 1
    if (segmentIds.length === 1) {
      Object.keys(vehicleCountPerDay).forEach((date) => {
        vehicleCountPerDay[date] = 1;
      });
    }
  
    // Tính giá trị trung bình cho tất cả các phương tiện
    const averageData = {};
    Object.keys(overallSum).forEach((date) => {
      if (vehicleCountPerDay[date] > 0) {
        averageData[date] = overallSum[date] / routeNameArray.length || null; // Tính trung bình cho ngày có dữ liệu
      } else {
        averageData[date] = null; // Để null nếu không có phương tiện nào có dữ liệu cho ngày đó
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
  
    // Tính tổng và trung bình cho total
    for (const field of Object.keys(total)) {
      for (const date of Object.keys(total[field].total)) {
        if (total[field].total[date] === 0) {
          total[field].total[date] = null;
        }
        total[field].average[date] = total[field].total[date] / routeNameArray.length || null;
        total[field].EWM[date] = total[field].EWM[date] / routeNameArray.length || null;
      }
    }
  
    // Trả về kết quả cuối cùng, bao gồm dữ liệu gốc và dữ liệu trung bình
    return {
      mainData: {
        route: result,
        AVG: {
          average: averageData, // Thêm dữ liệu trung bình vào kết quả
          EWM: averageEWMData,
        }
      },
      extended: total
    };
  }
}