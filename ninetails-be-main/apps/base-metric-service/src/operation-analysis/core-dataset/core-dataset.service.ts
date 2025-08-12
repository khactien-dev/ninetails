import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ZScoreService } from "../../z-score/z-score.service";
import { RouteInfoService } from "../../datasource-service/route-info.service";
import { Client } from "@opensearch-project/opensearch";
import { OperationAnalysisService } from "../operation-analysis.service";
import { CoreDataSetDto } from "./core-dataset.dto";
import { convertToArray, convertToArrayNumber } from "libs/utils/helper.util";
import { addDriveModeFilters, buildAggregationsCoreDataset, calculateEWM, calculateZScores, checkAnomaly, compareWithPValue, createRangeQueryDataSet, generateDateRangesForStatistics, processAggregations, safeMean, safeStd } from "../../base-query/base.function";
import { ManualCollectService } from "../../datasource-service/manual-collect.service";
import { CustomGraphService } from "../power-graph/custom-graph/custom-graph.service";
import * as moment from 'moment';
import { WorkingScheduleService } from "../../datasource-service/working-schedule.service";
import { re } from "mathjs";
import { MetricWeightService } from "../../datasource-service/metric-weight.service";
@Injectable()
export class CoreDatasetService {
  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly zScoreService: ZScoreService,
    private readonly routeInfoService: RouteInfoService, 
    private readonly operationAnalysisService: OperationAnalysisService,
    private readonly manualCollectService: ManualCollectService,
    private readonly workingScheduleService: WorkingScheduleService,
    private readonly metricWeightService: MetricWeightService,
    @Inject(forwardRef(() => CustomGraphService))
    private readonly customGraphService: CustomGraphService
  ) {}
  // Core DataSet
  // Header Core Dataset
  
  getSafeValueCoreDataSet = (value: any) => {
    return value !== undefined && value !== 0 ? parseFloat(value.toFixed(3)) : null;
  };

  classifyRankCoreDataSet(scores: number[], coreDataSetDto: CoreDataSetDto): string[] {
    const { percentageAE, percentageBD, percentageC } = coreDataSetDto;
    if (scores.length === 0 || scores.every(score => isNaN(score))) {
      return ['C'];  // Trả về 'C' nếu không có giá trị hoặc tất cả giá trị là NaN
    }
  
    const validScores = scores.filter(score => !isNaN(score));
    const total = validScores.length;
  
    // Nếu chỉ có một phần tử, trả về 'C'
    if (total === 1) {
      return ['C'];
    }
  
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

  async extractMetricsForCoreDataSet(aggregations: any, segmentId: number, date: string, schema: string) {
    const metrics = aggregations.all_drive_metrics.buckets.all;
    const collectCount = await this.operationAnalysisService.getCollectMetricsSegmentId(
      segmentId,
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

  async calculateMetricsWithStatsLatestCoreDataSet(
    segmentId: number,
    startDate: string,
    endDate: string,
    schema: string
  ) {
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
    const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
        ];

        const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);

        const {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
        } = this.extractMetrics(result);

        const manualCollectDistance = 10;
        const weight = 2.4;
        const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);

        const collectCount = await this.operationAnalysisService.getCollectMetricsSegmentId(
          segmentId,
          date,
          schema
        )

        if (
          distanceRatios === 0 &&
          durationRatios === 0 &&
          collectDistance === 0 &&
          collectDuration === 0 &&
          collectCount === 0 && 
          manualCollectTime === 0
        ) {
          return null; // Loại bỏ các giá trị không mong muốn
        }

        return {
          distanceRatios,
          durationRatios,
          collectDistance,
          collectDuration,
          collectCount,
          manualCollectTime
        };
      }),
    );
    const filteredMetricsArray = metricsArray.filter((metric) => metric !== null && !isNaN(metric.manualCollectTime));
    const oneMetric = [...filteredMetricsArray].reverse();

    const ewmOneMetric = this.zScoreService.calculateEWMetrics(oneMetric);

    const result = {
      distanceRatios: ewmOneMetric.distanceRatios.slice(-1)[0],
      durationRatios: ewmOneMetric.durationRatios.slice(-1)[0],
      collectDistance: ewmOneMetric.collectDistance.slice(-1)[0],
      collectDuration: ewmOneMetric.collectDuration.slice(-1)[0],
      collectCount: ewmOneMetric.collectCount.slice(-1)[0],
      manualCollectTime: ewmOneMetric.manualCollectTime.slice(-1)[0],
    };

    return result;
  }

  calculateWeightedSumCoreDataSet(
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
        distanceRatioRate * 0.01 * zDistanceRatios[i] +
        durationRatioRate * 0.01 * zDurationRatios[i] +
        collectDistanceRate * 0.01 * zCollectDistances[i] +
        collectDurationRate * 0.01 * zCollectDurations[i] +
        collectCountRate * 0.01 * zCollectCounts[i] +
        manualCollectTimeRate * 0.01 * zManualCollectTime[i]
      );
      
      if (weightedSum !== 0) {
        zRankScores.push(weightedSum);
      }
    }
    
    return zRankScores || [0];
  }

  buildDateRangeQuery(startDate: string) {
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
          gte: formattedEndDate,
          lte: formattedStartDate,
        },
      },
    };
  }

  combineMetrics(metricsList: any[]): any {
    // Ví dụ: Tính tổng cho collectDistance và durationRatios, các giá trị khác cũng tương tự.
    return metricsList.reduce((combined, current) => {
      if (!current) return combined;
      return {
        distanceRatios: (combined.distanceRatios || 0) + (current.distanceRatios || 0),
        collectDistance: (combined.collectDistance || 0) + (current.collectDistance || 0),
        otherDistance: (combined.otherDistance || 0) + (current.otherDistance || 0),
        durationRatios: (combined.durationRatios || 0) + (current.durationRatios || 0),
        collectDuration: (combined.collectDuration || 0) + (current.collectDuration || 0),
        otherDuration: (combined.otherDuration || 0) + (current.otherDuration || 0),
        collectCount: (combined.collectCount || 0) + (current.collectCount || 0),
        manualCollectTime: (combined.manualCollectTime || 0) + (current.manualCollectTime || 0),
      };
    }, {});
  }

  async classifyRankForRouteCoreDataSet(coreDataSetDto: CoreDataSetDto, schema: string) {
    const { routeNames, startDate, endDate } = coreDataSetDto;
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
  
    // Lấy danh sách tất cả routeNames hoặc routeNames từ coreDataSetDto
    const allVehicleData = await this.routeInfoService.getAllRouteName(schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : allVehicleData;
  
    // Lấy segmentIds từ routeNameArray
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
  
    // Kiểm tra dữ liệu trả về
    if (!segmentIds || segmentIds.length === 0) {
      console.warn('No segment IDs found for any route name');
      return {
        route_name: routeNames || 'Unknown',
        rankScore: 'C', // Xử lý lỗi hoặc giá trị mặc định
      };
    }
  
    // Ghép routeNames với segmentIds để tạo map
    const segmentIdMap = routeNameArray.reduce((acc, routeName, index) => {
      acc[routeName] = segmentIds[index] ? [segmentIds[index]] : []; // Nếu không có segmentId, để rỗng
      return acc;
    }, {});
  
    // Tính toán metrics cho từng routeName và segmentId
    const allVehicleMetrics = await Promise.all(
      routeNameArray.map(async (routeName) => {
        const currentSegmentIds = segmentIdMap[routeName] || [];
        if (currentSegmentIds.length === 0) {
          console.warn(`No segment IDs for routeName: ${routeName}`);
          return { routeName, metrics: null }; // Trả về null nếu không có segmentIds
        }
  
        const metricsList = await Promise.all(
          currentSegmentIds.map(async (segmentId) => {
            return await this.calculateMetricsWithStatsLatestCoreDataSet(
              segmentId,
              startDate,
              endDate,
              schema
            );
          })
        );
  
        // Gộp các metrics từ tất cả các segmentId của routeName
        const combinedMetrics = this.combineMetrics(metricsList);
        return { routeName, metrics: combinedMetrics };
      })
    );
    
    // Tính toán thống kê z-score
    let statistics1 = null;
    await Promise.all(
      dateRanges.map(async ({ date }) => {
        statistics1 = await this.zScoreService.calculateZscoreRealtime(date, schema);
      })
    )
    
    // Tính toán zScores cho từng loại metrics
    const zDistanceRatios = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.distanceRatios),
      statistics1.mean.distanceRatios,
      statistics1.standardDeviation.distanceRatios
    );
    const zDurationRatios = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.durationRatios),
      statistics1.mean.durationRatios,
      statistics1.standardDeviation.durationRatios
    );
    const zCollectDistances = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.collectDistance),
      statistics1.mean.collectDistance,
      statistics1.standardDeviation.collectDistance
    );
    const zCollectDurations = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.collectDuration),
      statistics1.mean.collectDuration,
      statistics1.standardDeviation.collectDuration
    );
    const zCollectCounts = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.collectCount),
      statistics1.mean.collectCount,
      statistics1.standardDeviation.collectCount
    );
    const zManualCollectTime = calculateZScores(
      allVehicleMetrics.map(v => v.metrics?.manualCollectTime),
      statistics1.mean.manualCollectTime,
      statistics1.standardDeviation.manualCollectTime
    );
  
    // Tính rank scores
    const rankScores = this.calculateWeightedSumCoreDataSet(
      zDistanceRatios,
      zDurationRatios,
      zCollectDistances,
      zCollectDurations,
      zCollectCounts,
      zManualCollectTime,
      coreDataSetDto
    );
    
    // Phân loại rank
    const allRanks = this.classifyRankCoreDataSet(rankScores, coreDataSetDto);
  
    // Trả về rank cho routeName hiện tại
    const vehicleIndex = routeNameArray.findIndex(name => name === routeNames);
    if (vehicleIndex !== -1) {
      return {
        route_name: routeNames,
        rankScore: allRanks[vehicleIndex],
      };
    } else {
      return {
        route_name: routeNames || 'Unknown',
        rankScore: 'C',
      };
    }
  }
  
  generateDateRangesForStatistics1(startDate: string, endDate: string) {
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');
    const totalDays = end.diff(start, 'days'); // Tính số ngày giữa startDate và endDate
  
    return Array.from({ length: totalDays + 1 }, (_, i) => ({
      date: start.clone().add(i, 'days').format('YYYY-MM-DD'),
    }));
  }
  
  // async calculateMainDataCoreDataSet(
  //   coreDataSetDto: CoreDataSetDto,
  //   segmentId: number,
  //   schema: string
  // ): Promise<any> {
  //   const { startDate, endDate, pValue, alpha } = coreDataSetDto;
  //   const mustQueries = { term: { 'data.segment_id': segmentId } };
  //   const dateRanges = this.generateDateRangesForStatistics1(startDate, endDate);
  //   const metricsMap = {}; // Lưu trữ kết quả theo ngày
  //   const statisticsByDate: any = {}; // Lưu zScore cho từng ngày
  //   const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
  //   let edge = 10;
  //   if (driveMetricData){
  //     edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
  //   }
  //   // Xử lý từng ngày trong dateRanges
  //   const metricsArray = await Promise.all(
  //     dateRanges.map(async ({ date }) => {
  //       const mustQueriesForRange = [
  //         mustQueries,
  //         this.buildDateRangeQuery(date),
  //       ];
  
  //       const result = await this.operationAnalysisService.fetchAggregations(
  //         mustQueriesForRange,
  //         schema,
  //         edge
  //       );
        
  //       const {
  //         distanceRatios,
  //         collectDistance,
  //         otherDistance,
  //         durationRatios,
  //         collectDuration,
  //         otherDuration,
  //         collectCount,
  //       } = await this.extractMetricsForCoreDataSet(result, segmentId, date, schema);
        
  //       const manualCollectDistance = await this.manualCollectService.manualCollectDistanceBySegmentId(segmentId, date, schema);
        
  //       const weight = 2.4;
  //       const manualCollectTime =
  //         manualCollectDistance /
  //         ((collectDistance / collectDuration) / weight);
          
  //         if (
  //           distanceRatios === 0 &&
  //           collectDistance === 0 &&
  //           otherDistance === 0 &&
  //           durationRatios === 0 &&
  //           collectDuration === 0 &&
  //         otherDuration === 0 &&
  //         collectCount === 0 &&
  //         manualCollectTime === 0
  //       ) {
  //         metricsMap[date] = null;
  //       } else {
  //         metricsMap[date] = {
  //           distanceRatios,
  //           collectDistance,
  //           otherDistance,
  //           durationRatios,
  //           collectDuration,
  //           otherDuration,
  //           collectCount,
  //           manualCollectTime,
  //         };
  //       }
        
  //       // Tính toán Z-Score cho ngày hiện tại
  //       statisticsByDate[date] = await this.zScoreService.calculateZscoreRealtime(date, schema);
  
  //       return {
  //         date,
  //         distanceRatios,
  //         collectDistance,
  //         otherDistance,
  //         durationRatios,
  //         collectDuration,
  //         otherDuration,
  //         collectCount,
  //         manualCollectTime,
  //       };
  //     })
        
  //   );
    
  //   // Lọc bỏ dữ liệu không hợp lệ
  //   const filteredMetricsArray = metricsArray.filter(
  //     (metric) => metric !== null && !isNaN(metric.manualCollectTime)
  //   );
  //   const oneMetric = [...filteredMetricsArray].reverse();
    
  //   // Tính toán Z-Scores
  //   const zDistanceRatios = calculateZScores(
  //     oneMetric.map((v) => v.distanceRatios),
  //     statisticsByDate.mean?.distanceRatios || 0,
  //     statisticsByDate.standardDeviation?.distanceRatios || 1
  //   );
  
  //   const zDurationRatios = calculateZScores(
  //     oneMetric.map((v) => v.durationRatios),
  //     statisticsByDate.mean?.durationRatios || 0,
  //     statisticsByDate.standardDeviation?.durationRatios || 1
  //   );
    
  //   const zCollectDistances = calculateZScores(
  //     oneMetric.map((v) => v.collectDistance),
  //     statisticsByDate.mean?.collectDistance || 0,
  //     statisticsByDate.standardDeviation?.collectDistance || 1
  //   );
    
  //   const zCollectDurations = calculateZScores(
  //     oneMetric.map((v) => v.collectDuration),
  //     statisticsByDate.mean?.collectDuration || 0,
  //     statisticsByDate.standardDeviation?.collectDuration || 1
  //   );
  
  //   const zCollectCounts = calculateZScores(
  //     oneMetric.map((v) => v.collectCount),
  //     statisticsByDate.mean?.collectCount || 0,
  //     statisticsByDate.standardDeviation?.collectCount || 1
  //   );
    
  //   const zManualCollectTime = calculateZScores(
  //     oneMetric.map((v) => v.manualCollectTime),
  //     statisticsByDate.mean?.manualCollectTime || 0,
  //     statisticsByDate.standardDeviation?.manualCollectTime || 1
  //   );
    
  
  //   // Kiểm tra bất thường
  //   const zScores = [
  //     zDistanceRatios,
  //     zDurationRatios,
  //     zCollectDistances,
  //     zCollectDurations,
  //     zCollectCounts,
  //   ];

  //   const anomalyResults = zScores.map((zScoreArray) =>
  //     zScoreArray.map((zValue) => checkAnomaly(zValue, pValue))
  //   );
  
  //   const rankScores = this.calculateWeightedSumCoreDataSet(
  //     zDistanceRatios,
  //     zDurationRatios,
  //     zCollectDistances,
  //     zCollectDurations,
  //     zCollectCounts,
  //     zManualCollectTime,
  //     coreDataSetDto
  //   );
  
  //   const zScore = rankScores[rankScores.length - 1] * 0.2 + 100;
    
  //   const rank = await this.classifyRankForRouteCoreDataSet(coreDataSetDto, schema);
  //   console.log(metricsMap);
    
  //   const dailyResults = dateRanges.map(({ date }) => {
  //     const metrics = metricsMap[date];
    
  //     if (!metrics) {
  //       // Nếu metrics không tồn tại
  //       return { [date]: null };
  //     }
    
  //     const metricValues = Object.values(metrics); // Đẩy tất cả giá trị của metricsMap[date] vào mảng
  //     // Kiểm tra nếu ít nhất một giá trị hợp lệ
  //     const hasValidData = metricValues.some(
  //       value => value === null // Giá trị khác null và không phải NaN
  //     );
      
  //     // Nếu có dữ liệu hợp lệ, gán rankScores cho ngày đó
  //     if (!hasValidData) {
  //       return { [date]: zScore || null };
  //     }
    
  //     // Ngược lại, trả về null
  //     return { [date]: null };
  //   });

  //   const dailyValues = dailyResults.map(result => Object.values(result)[0]);
  //   const ewmVal = calculateEWM(dailyValues, alpha * 0.01)
  
  //   const overallAnomaly = anomalyResults.some((anomalies) =>
  //     anomalies.includes(false)
  //   );
  
  //   const result = {
  //     rating: 'C',
  //     diagnosis: overallAnomaly,
  //     EWM: ewmVal.slice(-1)[0],
  //     ...Object.assign({}, ...dailyResults),
  //   };
  
  //   return result;
  // }  
  // End of Header Core Dataset

  // Body Core Dataset
  // Begin of distanceRatios, collectDistance, otherDistance, durationRatios, collectDuration, otherDuration, collectCount (No Expand)

  private calculateEWMForCoreDataSet(metricsArray: any[], alpha: number = 0.1) {
    return {
      ewmDistanceRatios: calculateEWM(metricsArray.map((m) => m.distanceRatios), alpha),
      ewmCollectDistance: calculateEWM(metricsArray.map((m) => m.collectDistance), alpha),
      ewmOtherDistance: calculateEWM(metricsArray.map((m) => m.otherDistance), alpha),
      ewmDurationRatios: calculateEWM(metricsArray.map((m) => m.durationRatios), alpha),
      ewmCollectDuration: calculateEWM(metricsArray.map((m) => m.collectDuration), alpha),
      ewmOtherDuration: calculateEWM(metricsArray.map((m) => m.otherDuration), alpha),
      ewmCollectCount: calculateEWM(metricsArray.map((m) => m.collectCount), alpha),
      ewmManualCollectTime: calculateEWM(metricsArray.map((m) => m.manualCollectTime), alpha)
    };
  }

  async calculateEWMAllRoute(coreDataSetDto: CoreDataSetDto, segmentId: number, schema: string) {
    const { startDate, endDate, alpha } = coreDataSetDto
    const mustQueries = { term: { 'data.segment_id': segmentId } }
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
    const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
    let edge = 10;
    if (driveMetricData){
      edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
    }
    const metricsArray = await Promise.all(
      dateRanges.map(async ({ date }) => {
        const mustQueriesForRange = [
          mustQueries,
          this.buildDateRangeQuery(date),
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
        } = await this.extractMetricsForCoreDataSet(result, segmentId, date, schema);

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
    const { routeNames, startDate, endDate, pValue } = coreDataSetDto;
    const routeName = await this.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key);
    if (opensearchRouteIdList.length === 0) {
      return;
    }
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema)
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
    let result = [];

    // Mảng để lưu trữ tất cả các chỉ số của các route
    let allDistanceRatios = [];
    let allOtherDistance = [];
    let allDurationRatios = [];
    let allCollectDistance = [];
    let allCollectDuration = [];
    let allOtherDuration = [];
    let allCollectCount = [];

    await Promise.all(segmentIds.map(async (segmentId, index) => {
      const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
      if (driveMetricData) {
        const segmentIDReal = await this.routeInfoService.getSegmentIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
        const allMetrics = await this.calculateEWMAllRoute(coreDataSetDto, segmentIDReal, schema);
        const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentIDReal, schema);
        const currentRouteName = routeArray.name;
        // Thu thập các giá trị cho từng chỉ số để phân loại sau
        allDistanceRatios.push(allMetrics.distanceRatios);
        allDurationRatios.push(allMetrics.durationRatios);
        allCollectDistance.push(allMetrics.collectDistance);
        allCollectDuration.push(allMetrics.collectDuration);
        allCollectCount.push(allMetrics.collectCount);
        allOtherDistance.push(allMetrics.otherDistance);
        allOtherDuration.push(allMetrics.otherDuration);
  
        result.push({
          routeName: currentRouteName,
          ...allMetrics // Thêm các giá trị tính toán được vào kết quả
        });
      }
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

  // async calculateAllMetrics(coreDataSetDto: CoreDataSetDto, routeName: string, segmentId: number, schema: string) {
  //   const { startDate, endDate, pValue } = coreDataSetDto;
  //   const mustQueries = { term: { 'data.segment_id': segmentId } }
  //   const dateRanges = generateDateRangesForStatistics(startDate, endDate);
  //   const metricsMap = {}; // Sử dụng map để lưu trữ kết quả theo ngày
  //   const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
  //   const edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);
  //   const metricsArray = await Promise.all(
  //       dateRanges.map(async ({ date }) => {
  //           const mustQueriesForRange = [
  //               mustQueries,
  //               this.buildDateRangeQuery(date),
  //           ];

  //           const result = await this.operationAnalysisService.fetchAggregations(mustQueriesForRange, schema, edge);

  //           const {
  //               distanceRatios,
  //               collectDistance,
  //               otherDistance,
  //               durationRatios,
  //               collectDuration,
  //               otherDuration,
  //               collectCount
  //           } = await this.extractMetricsForCoreDataSet(result, segmentId, date, schema);
  //           const manualCollectDistance = await this.manualCollectService.manualCollectDistanceBySegmentId(segmentId, date, schema);
            
  //           const weight = 2.4;
  //           const manualCollectTime = manualCollectDistance / ((collectDistance / collectDuration) / weight);
  //           if (
  //               distanceRatios === 0 &&
  //               collectDistance === 0 &&
  //               otherDistance === 0 &&
  //               durationRatios === 0 &&
  //               collectDuration === 0 &&
  //               otherDuration === 0 &&
  //               collectCount === 0 &&
  //               manualCollectTime === 0 &&
  //               manualCollectDistance === 0
  //           ) {
  //               return null;
  //           }

  //           metricsMap[date] = {
  //               distanceRatios,
  //               collectDistance,
  //               otherDistance,
  //               durationRatios,
  //               collectDuration,
  //               otherDuration,
  //               collectCount,
  //               manualCollectDistance,
  //               manualCollectTime,
  //           };

  //           return {
  //               date,
  //               distanceRatios,
  //               collectDistance,
  //               otherDistance,
  //               durationRatios,
  //               collectDuration,
  //               otherDuration,
  //               collectCount,
  //               manualCollectDistance,
  //               manualCollectTime,
  //           };
  //       })
  //   );

  //   const filteredMetricsArray = metricsArray.filter((metric) => metric !== null);
    
  //   // Tính EWM cho từng loại metric
  //   const ewmMetrics = {};
  //   const metricTypes = [
  //       'distanceRatios',
  //       'collectDistance',
  //       'otherDistance',
  //       'durationRatios',
  //       'collectDuration',
  //       'otherDuration',
  //       'collectCount',
  //       'manualCollectDistance',
  //       'manualCollectTime',
  //   ];
  //   const response = {};
  //   const rankResults = await this.classifyRankBaseOnEWM(coreDataSetDto, schema);
  //   metricTypes.forEach(metricType => {
  //       const oneMetric = filteredMetricsArray.reverse(); // Đảo ngược để tính EWM
  //       ewmMetrics[metricType] = this.operationAnalysisService.calculateEWMetricsForStatistics(oneMetric);

  //       const ewmMetricData = ewmMetrics[metricType];
  //       // Kiểm tra nếu giá trị EWM trả về có phải là mảng không
  //       const ewmMetricValue = Array.isArray(ewmMetricData[metricType]) 
  //           ? parseFloat(ewmMetricData[metricType].slice(-1)[0]) || null // Lấy phần tử cuối cùng
  //           : parseFloat(ewmMetricData[metricType]) || null; // Trường hợp chỉ là giá trị đơn
        
  //       // Kiểm tra nếu rankResults có chứa thông tin và routeName hợp lệ
  //       const routeRank = rankResults.find(result => result.routeName === routeName);
  //       const rankForMetric = routeRank?.[metricType] || "C";  // Mặc định là "C" nếu không có thông tin

  //       const dayMetrics = dateRanges.map(({ date }) => {
  //           const metricValue = metricsMap[date] ? parseFloat(metricsMap[date][metricType]) : null;

  //           // Gọi hàm kiểm tra bất thường
  //           const anomalyResult = checkAnomaly(metricValue, pValue);
            
  //           return {
  //               date,
  //               value: metricValue,
  //               anomaly: anomalyResult, // Thêm thông tin bất thường vào kết quả
  //           };
  //       });

  //       // Kiểm tra xem có bất kỳ giá trị anomaly nào là true
  //       const overallAnomaly = dayMetrics.some(dayMetric => dayMetric.anomaly === true);

  //       const metricResponse = {
  //           rating: rankForMetric, // Sử dụng rank từ classifyRankBaseOnEWM
  //           diagnosis: overallAnomaly,
  //           EWM: ewmMetricValue,  // Đảm bảo EWM không bị undefined
  //       };

  //       dayMetrics.forEach(dayMetric => {
  //           // Gán từng ngày vào response
  //           metricResponse[dayMetric.date] = dayMetric.value;
  //       });

  //       response[metricType] = metricResponse;
  //   });

  //   return response;
  // }
//   // End of distanceRatios, collectDistance, otherDistance, durationRatios, collectDuration, otherDuration, collectCount (No Expand)

//   // Begin of expanded collectDistance, collectDuration, otherDistance, otherTime, collectCount
  private calculateMeanAndStd(metricsArray: any[]) {
    return {
      mean: safeMean(metricsArray.map((m) => m)),
      standardDeviation: safeStd(metricsArray.map((m) => m))
    };
  }

  private buildQueryCoreDataSet(segmentId: number, startDate: string, endDate: string, statisticMode: string) {
    const mustQueries: any[] = [
      { term: { 'data.segment_id': segmentId } },
      createRangeQueryDataSet(startDate, endDate, 'data.timestamp'),
    ];

    if (['otherDuration', 'otherDistance'].includes(statisticMode)) {
      addDriveModeFilters(mustQueries);
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
          aggs: this.customGraphService.getAggregationsByMode(statisticMode),
        }
      }
    };
  }

  formatResponse(data: any, startDate: string, endDate: string, pValue: number) {
    const expanded = [];
    const sections = data?.body?.aggregations?.by_route?.buckets;

    // Tạo mảng chứa tất cả các ngày trong khoảng startDate - endDate
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    for (const section of sections) {
      const sectionData = {
        sectionName: section.key,
        rating: 'C', // Logic tính rating
        diagnosis: false, // Logic tính diagnosis
        EWM: 88.6, // Logic tính EWM
      };

      // Tạo mảng chứa giá trị metric theo từng ngày để tính EWM
      const metricValues: number[] = [];

      // Tạo map dữ liệu theo từng ngày
      const metricsByDay = {};
      section.trips_by_time.buckets.forEach((bucket) => {
        const value = bucket?.total?.total?.value;
        metricsByDay[bucket.key_as_string] = value;
        metricValues.push(value); // Thêm giá trị vào mảng để tính EWM
      });

      // Tính toán EWM từ metricValues
      const ewmValues = calculateEWM(metricValues, 0.1); // Alpha là hệ số decay cho EWM

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
        const zScores = calculateZScores(metricValues, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => checkAnomaly(zValue, pValue));

        // Gán giá trị tổng thể cho anomaly
        sectionData.diagnosis = anomalies.some(anomaly => anomaly === true);
      }

      expanded.push(sectionData);
    }

    return expanded;
  }

  private formatResponseCore(data: any, segmentId: number, startDate: string, endDate: string, ratings: any, routeName: string, pValue: number) {
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
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    // Khởi tạo object chứa dữ liệu theo chế độ lái
    const result = {};
    
    driveModes.forEach((driveMode) => {
      result[driveMode.label] = {
        rating: 'C', // Gán giá trị rating từ tham số
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
      const ewmValues = calculateEWM(modeValues, 0.1); // Alpha là hệ số decay cho EWM
      // Gán giá trị EWM cuối cùng vào sectionData
      result[driveMode.label].EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;

      // Tính toán Z-scores cho modeValues để kiểm tra bất thường
      if (modeValues.length > 0) {
        const statistics = this.calculateMeanAndStd(modeValues);
        const zScores = calculateZScores(modeValues, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => checkAnomaly(zValue, pValue));

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
      const ewmValues = calculateEWM(modeValues, 0.1); // Alpha là hệ số decay cho EWM
      // Gán giá trị EWM cuối cùng vào sectionData
      result[driveMode.label].EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;
    });

    return result;
  }

  async calculateAllExpandeOther(coreDataSetDto: CoreDataSetDto, segmentId: number, type: string, schema: string) {
    const { routeNames, startDate, endDate } = coreDataSetDto;

    const allVehicleData = await this.routeInfoService.getAllRouteName(schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : allVehicleData; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema)

    let result = {}; // Để lưu kết quả cho từng routeName

    await Promise.all(
      segmentIds.map(async (segmentId, index) => {
        const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
        const currentRouteName = routeArray.name;
        const [expandedOtherDistance, expandedOtherDuration] = await Promise.all([
          this.getExpandedOtherDistanceEWM(segmentId, startDate, endDate, schema),
          this.getExpandedOtherTimeEWM(segmentId, startDate, endDate, schema),
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

        result[currentRouteName] = formattedResult;
      })
    );

    return result;
  }

  async getExpandedCollectDistance(segmentId: number, startDate: string, endDate: string, pValue: number, schema: string) {
    let query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                "data.segment_id": [segmentId],
              },
            },
            {
              range: {
                "data.timestamp": {
                  "time_zone": "+00:00",
                  gte: startDate, //+ 'T11:00:01',
                  lte: endDate //+ 'T11:00:01',
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
                    total: { sum: { field: "data.distance" } },
                  },
                },
              },
            },
          },
        },
      },
    };

    if (startDate === endDate) {
      query = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                terms: {
                  "data.segment_id": [segmentId],
                },
              },
              {
                range: {
                  "data.timestamp": {
                    "time_zone": "+00:00",
                    gte: startDate,
                    lte: endDate,
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
                      total: { sum: { field: "data.distance" } },
                    },
                  },
                },
              },
            },
          },
        },
      };
    }

    const response = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body: query,
    });
    return this.formatResponse(response, startDate, endDate, pValue);
  }

  async getExpandedCollectDuration(segmentId: number, startDate: string, endDate: string, pValue: number, schema: string) {
    let query = {
      "size": 0,
      "query": {
        "bool": {
          "filter": [
            {
              "terms": {
                "data.segment_id": [segmentId]
              }
            },
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
                "calendar_interval": "day",
                "format": "yyyy-MM-dd"
              },
              "aggs": {
                "total": {
                  "filter": {
                    "term": { "data.drive_mode": 5 }
                  },
                  "aggs": {
                    "total": {
                      "scripted_metric": {
                        "init_script": `
                          state.total_duration = 0;
                          state.previous_timestamp = null;
                        `,
                        "map_script": `
                          if (!doc['data.timestamp'].empty) {
                            Instant currentTimestamp = Instant.parse(doc['data.timestamp'].value.toString());
                            if (state.previous_timestamp != null) {
                              long diff = Duration.between(state.previous_timestamp, currentTimestamp).toMillis();
                              if (diff > 0) {
                                state.total_duration += diff;
                              }
                            }
                            state.previous_timestamp = currentTimestamp;
                          }
                        `,
                        "combine_script": `
                          return state.total_duration != null ? state.total_duration : 0;
                        `,
                        "reduce_script": `
                          long total = 0;
                          for (s in states) {
                            if (s != null) {
                              total += s;
                            }
                          }
                          return total / 1000;
                        `
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    if (startDate === endDate) {
      query = {
        "size": 0,
        "query": {
          "bool": {
            "filter": [
              {
                "terms": {
                  "data.segment_id": [segmentId]
                }
              },
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
                  "calendar_interval": "day",
                  "format": "yyyy-MM-dd"
                },
                "aggs": {
                  "total": {
                    "filter": {
                      "term": { "data.drive_mode": 5 }
                    },
                    "aggs": {
                      "total": {
                        "scripted_metric": {
                          "init_script": `
                            state.total_duration = 0;
                            state.previous_timestamp = null;
                          `,
                          "map_script": `
                            if (!doc['data.timestamp'].empty) {
                              Instant currentTimestamp = Instant.parse(doc['data.timestamp'].value.toString());
                              if (state.previous_timestamp != null) {
                                long diff = Duration.between(state.previous_timestamp, currentTimestamp).toMillis();
                                if (diff > 0) {
                                  state.total_duration += diff;
                                }
                              }
                              state.previous_timestamp = currentTimestamp;
                            }
                          `,
                          "combine_script": `
                            return state.total_duration != null ? state.total_duration : 0;
                          `,
                          "reduce_script": `
                            long total = 0;
                            for (s in states) {
                              if (s != null) {
                                total += s;
                              }
                            }
                            return total / 1000;
                          `
                        }
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

    const response = await this.openSearchClient.search({
      index: `${schema}.drive_metrics`,
      body: query,
    });

    return this.formatResponse(response, startDate, endDate, pValue);
  }

  async getExpandedOtherDistance(segmentId: number, routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = this.buildQueryCoreDataSet(segmentId, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    const ratings = await this.calculateAllExpandeOther({ startDate, endDate }, segmentId, 'otherDistance', schema); // Gọi hàm để lấy ratings
    return this.formatResponseCore(response, segmentId, startDate, endDate, ratings, routeName, pValue);
  }

  async getExpandedOtherTime(segmentId: number, routeName: string, startDate: string, endDate: string, pValue: number, schema: string) {
    const query = this.buildQueryCoreDataSet(segmentId, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    const ratings = await this.calculateAllExpandeOther({ startDate, endDate }, segmentId, 'otherDuration', schema); // Gọi hàm để lấy ratings
    return this.formatResponseCore(response, segmentId, startDate, endDate, ratings, routeName, pValue);
  }

  async getExpandedOtherDistanceEWM(segmentId: number, startDate: string, endDate: string, schema: string) {
    const query = this.buildQueryCoreDataSet(segmentId, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    return this.formatResponseCoreEWM(response, startDate, endDate)
  }

  async getExpandedOtherTimeEWM(segmentId: number, startDate: string, endDate: string, schema: string) {
    const query = this.buildQueryCoreDataSet(segmentId, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    return this.formatResponseCoreEWM(response, startDate, endDate)
  }

  async getCollectMetricsForCoreDataSet(segmentId: number, startDate: string, endDate: string, pValue: number, schema: string) {
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    if (startDate === endDate) {
      mustQueries.push({
        range: {
          'data.timestamp': {
            "time_zone": "+00:00",
            gte: startDate,
            lte: endDate,
          },
        },
      });
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
                    "script": {
                      "source": `
                        long sum = 0;
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

    const result = await this.openSearchClient.search({
      index: `${schema}.collect_metrics`,
      body,
    });

    return this.formatResponseCollectCount(result, startDate, endDate, pValue);
  }

  private formatResponseCollectCount(data: any, startDate: string, endDate: string, pValue: number) {
    // Tạo mảng chứa tất cả các ngày từ startDate đến endDate
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

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
            rating: 'C',       // Giá trị rating mặc định (có thể thay đổi logic)
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
        const ewmValues = calculateEWM(values, 0.1); // Tính EWM với alpha 0.1
        sectionData.EWM = ewmValues.length > 0 ? ewmValues[ewmValues.length - 1] : null;

        // Tính toán Z-scores cho values để kiểm tra bất thường
        const statistics = this.calculateMeanAndStd(values);
        const zScores = calculateZScores(values, statistics.mean, statistics.standardDeviation);

        // Kiểm tra bất thường cho từng Z-score
        const anomalies = zScores.map(zValue => checkAnomaly(zValue, pValue));

        // Gán giá trị tổng thể cho anomaly
        sectionData.anomaly = anomalies.some(anomaly => anomaly === true);
      }
    });

    return expandedCollectCount;
  }
  // End of expanded collectDistance, collectDuration, otherDistance, otherTime, collectCount
  // End Body Core Dataset

  async getOperatingRoutes(startDate: string, endDate: string, schema: string) {
    let query = {
      index: `${schema}.drive_metrics`,
      body: {
        "size": 0,
        "query": {
          "bool": {
            "must": [
              {
                "range": {
                  "data.timestamp": {
                    "time_zone": "+00:00",
                    "gte": startDate || 'now/d',
                    "lte": endDate || 'now'
                  }
                }
              }
            ]
          }
        },
        "aggs": {
          "unique_routes": {
            "terms": {
              "field": "data.route_id",
              "size": 10000  
            }
          }
        }
      },
    };
    if (startDate === endDate) {
      query = {
        index: `${schema}.drive_metrics`,
        body: {
          "size": 0,
          "query": {
            "bool": {
              "must": [
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
          },
          "aggs": {
            "unique_routes": {
              "terms": {
                "field": "data.route_id",
                "size": 10000  
              }
            }
          }
        },
      };
    }
    
    return await this.openSearchClient.search(query);
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
  // segmentId: number, routeId: number, startDate: string, endDate: string, 
  async getCoreDataRollup(segmentId: number, routeId: number, startDate: string, endDate: string,schema: string) {
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
    return result.body.hits.hits.map((item: any) => item._source);
  }

  async getStandardScore(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const result = await this.getCoreDataRollup(segmentId, routeId, startDate, endDate, schema);
    const dateRanges = this.generateDateRangesForStatistics1(startDate, endDate);

    // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const scoreMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
        acc[date] = null;
        return acc;
    }, {});
    const metricWeight = await this.metricWeightService.getMetricWeight(schema);

    const EWMArray = result.map((item: any) => item.standardScore).reverse();
    const EWM = calculateEWM(EWMArray, metricWeight.alpha).slice(-1)[0];
    
    // Gán giá trị standardScore vào các ngày tương ứng
    result.forEach((item: any) => {
        const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
        if (scoreMap[date] !== undefined) {
            scoreMap[date] = item.standardScore;
        }
    });

    const anomaly = await this.processDiagnosisMetricsData(segmentId, routeId, startDate, endDate, schema);
    // Thêm các trường bổ sung
    return {
        rating: result[0].standardScoreRank.rank || 'C',
        diagnosis: anomaly,
        EWM,
        ...scoreMap
    };
  }

  async getAllMetrics(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const result = await this.getCoreDataRollup(segmentId, routeId, startDate, endDate, schema);
    return result;
  }

  async getExpandCollectData(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.zscore_expand_collect_rollup`,
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
    }

    const result = await this.openSearchClient.search(query);
    return result.body.hits.hits.map((item: any) => item._source);
  }

  async getMeanAndStdev(startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.zscore_rollup`,
      body: {
        "sort": [
          {
            "timestamp": {
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
              "field": "timestamp",
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
            "field": "data.timestamp",
            "format": "date_time"
          },
          {
            "field": "timestamp",
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
                "range": {
                  "timestamp": {
                    "gte": startDate,
                    "lte": endDate,
                    "format": "strict_date_optional_time"
                  }
                }
              }
            ],
            "should": [],
            "must_not": [
              {
                "exists": {
                  "field": "route_id"
                }
              }
            ]
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

    return {
      mean: result.body.hits.hits[0]._source.mean,
      stdev: result.body.hits.hits[0]._source.standardDeviation,
      date: result.body.hits.hits[0]._source.timestamp
    }
  }

  async getExpandOtherDataRollup(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) { 
    const query = {
        index: `${schema}.zscore_expand_other_rollup`,
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
            "query": {
                "bool": {
                    "filter": [
                        { "match_phrase": { "route_id": routeId } },
                        {
                            "range": {
                                "date": {
                                    "gte": startDate,
                                    "lte": endDate,
                                    "format": "strict_date_optional_time"
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    const result = await this.openSearchClient.search(query);
    const data = result.body.hits.hits.map((item: any) => item._source);

    // Xử lý dữ liệu
    const expandedOtherData = await this.transformOtherData(data, startDate, endDate, schema);

    return expandedOtherData;
  }

  private async transformOtherData(data: any[], startDate: string, endDate: string, schema) {
    const statuses = [
      "notSelected",
      "goingToCollectionArea",
      "goingToTheLandfill",
      "returnToGarage",
      "goingToRestaurant",
      "idling",
      "notManaged",
      "outOfControl"
    ];
  
    const dateRange = this.generateDateRange(startDate, endDate);
  
    // Hàm tạo cấu trúc mặc định
    const createDefaultStructure = () => ({
      rating: null,
      diagnosis: null,
      EWM: null,
      ...Object.fromEntries(dateRange.map(date => [date, null]))
    });
  
    const result = {
      expandedOtherDistance: {},
      expandedOtherDuration: {}
    };
  
    // Tạo cấu trúc mặc định cho mỗi status
    statuses.forEach(status => {
      result.expandedOtherDistance[status] = createDefaultStructure();
      result.expandedOtherDuration[status] = createDefaultStructure();
    });
  
    const { mean, stdev, date } = await this.getMeanAndStdev(startDate, endDate, schema);
    const metricWeight = await this.metricWeightService.getMetricWeight(schema);
  
    // Kiểm tra nếu date không bằng với endDate thì gán mean và stdev bằng null
    const finalMean = date !== endDate ? null : mean;
    const finalStdev = date !== endDate ? null : stdev;
  
    // Ánh xạ dữ liệu từ OpenSearch vào các trường tương ứng
    data.forEach(record => {
      const { date, other_distance, other_duration, ranked_drive_modes } = record;
  
      statuses.forEach(status => {
        const statusIndex = statuses.indexOf(status);
  
        // Lấy giá trị distance và rank tương ứng
        const distanceValue = other_distance[`total_drive_mode_${statusIndex}`] || null;
        const distanceRank = ranked_drive_modes.find(
          mode => mode.drive_mode === `total_drive_mode_${statusIndex}`
        )?.distance_rank || null;
  
        // Lấy giá trị duration và rank tương ứng
        const durationValue = other_duration[`total_drive_mode_${statusIndex}`] || null;
        const durationRank = ranked_drive_modes.find(
          mode => mode.drive_mode === `total_drive_mode_${statusIndex}`
        )?.duration_rank || null;
  
        // Gán giá trị vào result
        result.expandedOtherDistance[status][date] = distanceValue;
        result.expandedOtherDuration[status][date] = durationValue;
  
        // Gán rank cuối cùng vào rating nếu ngày có dữ liệu
        if (distanceValue !== 0) {
          result.expandedOtherDistance[status].rating = distanceRank;
        }
        if (durationValue !== 0) {
          result.expandedOtherDuration[status].rating = durationRank;
        }
      });
    });
  
    // Tính toán anomaly, EWM và abnormal cho mỗi status
    statuses.forEach(status => {
      // Tính EWM và anomaly cho Distance
      const distanceValues = dateRange.map(date => result.expandedOtherDistance[status][date] || null);
  
      const EWMArrayDistance = distanceValues.reverse();
      const EWMValuesDistance = calculateEWM(EWMArrayDistance, metricWeight.alpha);
  
      const anomalyDistance = (distanceValues[distanceValues.length - 1] !== null && finalMean !== null && finalStdev !== null)
        ? compareWithPValue(distanceValues[distanceValues.length - 1], finalMean, finalStdev, metricWeight.pValue)
        : null;
  
      result.expandedOtherDistance[status].EWM = EWMValuesDistance.slice(-1)[0] || null;
      result.expandedOtherDistance[status].diagnosis = anomalyDistance;
  
      // Tính EWM và anomaly cho Duration
      const durationValues = dateRange.map(date => result.expandedOtherDuration[status][date] || null);
  
      const EWMArrayDuration = durationValues.reverse();
      const EWMValuesDuration = calculateEWM(EWMArrayDuration, metricWeight.alpha);
  
      const anomalyDuration = (durationValues[durationValues.length - 1] !== null && finalMean !== null && finalStdev !== null)
        ? compareWithPValue(durationValues[durationValues.length - 1], finalMean, finalStdev, metricWeight.pValue)
        : null;
  
      result.expandedOtherDuration[status].EWM = EWMValuesDuration.slice(-1)[0] || null;
      result.expandedOtherDuration[status].diagnosis = anomalyDuration;
    });
  
    return result;
  }

  private generateDateRange(startDate: string, endDate: string) {
      const dates = [];
      let current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
          dates.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
      }

      return dates;
  }

  async getProcessedExpandCollectData(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string
  ) {
    // Lấy dữ liệu từ API
    const rawData = await this.getExpandCollectData(segmentId, routeId, startDate, endDate, schema);
    // Nhóm dữ liệu theo `section_name` và tính toán
    const groupedData: { [key: string]: any } = {};
  
    const uniqueRawData = Object.values(
      rawData.reduce((acc: any, item: any) => {
        const key = `${item.section_id}-${item.collect_distance}`;
        acc[key] = item;
        return acc;
      }, {})
    );
    const collectDistanceEWM = uniqueRawData.map((item: any) => item.collect_distance).reverse();
    const { mean, stdev, date } = await this.getMeanAndStdev(startDate, endDate, schema);
  
    // Kiểm tra nếu date không bằng với endDate thì gán mean và stdev bằng null
    const finalMean = date !== endDate ? null : mean.collectDistance;
    const finalStdev = date !== endDate ? null : stdev.collectDistance;
  
    for (const item of rawData) {
      const sectionName = item.section_name;
  
      if (!groupedData[sectionName]) {
        groupedData[sectionName] = {
          sectionName: sectionName,
          rating: null,
          diagnosis: false,
          EWM: 0,
        };
      }
  
      // Cộng giá trị `collect_distance` vào EWM
      groupedData[sectionName].EWM = calculateEWM(collectDistanceEWM, 0.1).slice(-1)[0];
  
      const metricWeight = await this.metricWeightService.getMetricWeight(schema);
  
      const anomaly = (finalMean !== null && finalStdev !== null)
        ? compareWithPValue(item.collect_distance, finalMean, finalStdev, metricWeight.pValue)
        : null;
  
      groupedData[sectionName].diagnosis = anomaly;
  
      // Lưu dữ liệu theo ngày
      const dateKey = item.date;
      groupedData[sectionName][dateKey] = item.collect_distance;
    }
  
    // Chuẩn hóa dữ liệu, thêm các ngày không có dữ liệu
    const dateRange = this.generateDateRangesForStatistics1(startDate, endDate).map(d => d.date);
  
    for (const sectionName in groupedData) {
      for (const date of dateRange) {
        if (!(date in groupedData[sectionName])) {
          groupedData[sectionName][date] = null;
        }
      }
    }
  
    // Chuyển đổi kết quả sang dạng array
    return Object.values(groupedData);
  }
  
  async getProcessedExpandCollectDurationData(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string
  ) {
    // Lấy dữ liệu từ API
    const rawData = await this.getExpandCollectData(segmentId, routeId, startDate, endDate, schema);
  
    // Nhóm dữ liệu theo `section_name` và tính toán
    const groupedData: { [key: string]: any } = {};
    const { mean, stdev, date } = await this.getMeanAndStdev(startDate, endDate, schema);
  
    // Kiểm tra nếu date không bằng với endDate thì gán mean và stdev bằng null
    const finalMean = date !== endDate ? null : mean.collectDuration;
    const finalStdev = date !== endDate ? null : stdev.collectDuration;
  
    for (const item of rawData) {
      const sectionName = item.section_name;
  
      if (!groupedData[sectionName]) {
        groupedData[sectionName] = {
          sectionName: sectionName,
          rating: null,
          diagnosis: false,
          EWM: 0,
        };
      }
  
      const uniqueRawData = Object.values(
        rawData.reduce((acc: any, item: any) => {
          const key = `${item.section_id}-${item.collect_duration}`;
          acc[key] = item;
          return acc;
        }, {})
      );
      const collectDurationEWM = uniqueRawData.map((item: any) => item.collect_duration).reverse();
  
      // Cộng giá trị `collect_duration` vào EWM
      groupedData[sectionName].EWM = calculateEWM(collectDurationEWM, 0.1).slice(-1)[0];
  
      const metricWeight = await this.metricWeightService.getMetricWeight(schema);
  
      const anomaly = (finalMean !== null && finalStdev !== null)
        ? compareWithPValue(item.collect_duration, finalMean, finalStdev, metricWeight.pValue)
        : null;
  
      groupedData[sectionName].diagnosis = anomaly;
  
      // Lưu dữ liệu theo ngày
      const dateKey = item.date;
      groupedData[sectionName][dateKey] = item.collect_duration;
    }
  
    // Chuẩn hóa dữ liệu, thêm các ngày không có dữ liệu
    const dateRange = this.generateDateRangesForStatistics1(startDate, endDate).map(d => d.date);
  
    for (const sectionName in groupedData) {
      for (const date of dateRange) {
        if (!(date in groupedData[sectionName])) {
          groupedData[sectionName][date] = null;
        }
      }
    }
  
    // Chuyển đổi kết quả sang dạng array
    return Object.values(groupedData);
  }
  
  async getExpandOtherData(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.zscore_expand_collect_rollup`,
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
    }

    const result = await this.openSearchClient.search(query);
    return result.body.hits.hits.map((item: any) => item._source);
  }

  async processDiagnosisMetricsData(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    // Lấy dữ liệu thô từ getAllMetrics
    const rawData = await this.getAllMetrics(segmentId, routeId, startDate, endDate, schema);
  
    // Sử dụng transformMetricsData để xử lý dữ liệu
    const transformedData = await this.transformMetricsData(rawData, startDate, endDate, schema);
  
    // Lấy ra toàn bộ giá trị diagnosis
    const diagnosisValues = Object.values(transformedData).map(metric => metric.diagnosis);
  
    // Kiểm tra nếu có bất kỳ giá trị nào là false thì trả về false, ngược lại trả về true
    const allTrue = diagnosisValues.every(value => value === true);
  
    return allTrue;
  }
  
  async processMetricsData(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    // Lấy dữ liệu thô từ getAllMetrics
    const rawData = await this.getAllMetrics(segmentId, routeId, startDate, endDate, schema);
  
    // Sử dụng transformMetricsData để xử lý dữ liệu
    const transformedData = await this.transformMetricsData(rawData, startDate, endDate, schema);
  
    return transformedData;
  }

  async getExpandCollectAmount(segmentId: number, routeId: number, startDate: string, endDate: string, schema: string) {
    const query = {
      index: `${schema}.zscore_collect_amount_rollup`,
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
    }

    const result = await this.openSearchClient.search(query);
    return result.body.hits.hits.map((item: any) => item._source);
  }
  
  async getProcessedExpandCollectAmount(
    segmentId: number,
    routeId: number,
    startDate: string,
    endDate: string,
    schema: string
  ) {
    // Lấy dữ liệu thô
    const rawData = await this.getExpandCollectAmount(segmentId, routeId, startDate, endDate, schema);
    const { mean, stdev, date } = await this.getMeanAndStdev(startDate, endDate, schema);
  
    // Kiểm tra nếu date không bằng với endDate thì gán mean và stdev bằng null
    const finalMean = date !== endDate ? null : mean.collectCount;
    const finalStdev = date !== endDate ? null : stdev.collectCount;
  
    const groupedData: { [key: string]: any } = {};
    for (const item of rawData) {
      const sectionName = item.section_name;
  
      if (!groupedData[sectionName]) {
        groupedData[sectionName] = {
          sectionName: sectionName,
          rating: null,
          diagnosis: false,
          EWM: 0,
        };
      }
  
      // Cộng giá trị `collect_duration` vào EWM
      groupedData[sectionName].EWM = item.collect_amount[0];
  
      const metricWeight = await this.metricWeightService.getMetricWeight(schema);
  
      const anomaly = (finalMean !== null && finalStdev !== null)
        ? compareWithPValue(item.collect_amount[0], finalMean, finalStdev, metricWeight.pValue)
        : null;
  
      groupedData[sectionName].diagnosis = anomaly;
  
      // Lưu dữ liệu theo ngày
      const dateKey = item.date;
      groupedData[sectionName][dateKey] = item.collect_amount[0];
    }
  
    // Chuẩn hóa dữ liệu, thêm các ngày không có dữ liệu
    const dateRange = this.generateDateRangesForStatistics1(startDate, endDate).map(d => d.date);
  
    for (const sectionName in groupedData) {
      for (const date of dateRange) {
        if (!(date in groupedData[sectionName])) {
          groupedData[sectionName][date] = null;
        }
      }
    }
  
    // Chuyển đổi kết quả sang dạng array
    return Object.values(groupedData);
  }

  // Hàm transformMetricsData đã định nghĩa trước đó
  async transformMetricsData(
    rawData: any[], 
    startDate: string, 
    endDate: string, 
    schema: string
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const metrics = Object.keys(rawData[0]?.rawData || {});
  
    // Tạo mảng các ngày từ startDate đến endDate
    const dateRange = this.generateDateRangesForStatistics1(startDate, endDate).map(d => d.date);
    const { mean, stdev } = await this.getMeanAndStdev(startDate, endDate, schema);
  
    for (const metric of metrics) {
      const valuesByDate = dateRange.reduce((acc: Record<string, number | null>, date) => {
        const dataForDate = rawData.find(item => item.date.split('T')[0] === date);
        acc[date] = dataForDate ? dataForDate.rawData[metric] || null : null;
        return acc;
      }, {});
  
      const rawValues = Object.values(valuesByDate).filter((val) => val !== null) as number[];
  
      // Tính toán EWM
      const ewm = this.zScoreService.calculateEWM(rawValues, 0.1).slice(-1)[0];
  
      // Tính z-value và kiểm tra anomaly cho từng metric
      let zValue = 0;
      let anomaly = false;
      const metricWeight = await this.metricWeightService.getMetricWeight(schema);
  
      if (metric === "distanceRatios") {
        zValue = typeof mean.distanceRatios === 'number' && typeof stdev.distanceRatios === 'number' && stdev.distanceRatios !== 0 
          ? (rawValues[rawValues.length - 1] - mean.distanceRatios) / stdev.distanceRatios 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.distanceRatios, stdev.distanceRatios, metricWeight.pValue);
      } else if (metric === "collectDistance") {
        zValue = typeof mean.collectDistance === 'number' && typeof stdev.collectDistance === 'number' && stdev.collectDistance !== 0 
          ? (rawValues[rawValues.length - 1] - mean.collectDistance) / stdev.collectDistance 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.collectDistance, stdev.collectDistance, metricWeight.pValue);
      } else if (metric === "otherDistance") {
        zValue = typeof mean.otherDistance === 'number' && typeof stdev.otherDistance === 'number' && stdev.otherDistance !== 0 
          ? (rawValues[rawValues.length - 1] - mean.otherDistance) / stdev.otherDistance 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.otherDistance, stdev.otherDistance, metricWeight.pValue);
      } else if (metric === "durationRatios") {
        zValue = typeof mean.durationRatios === 'number' && typeof stdev.durationRatios === 'number' && stdev.durationRatios !== 0 
          ? (rawValues[rawValues.length - 1] - mean.durationRatios) / stdev.durationRatios 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.durationRatios, stdev.durationRatios, metricWeight.pValue);
      } else if (metric === "collectDuration") {
        zValue = typeof mean.collectDuration === 'number' && typeof stdev.collectDuration === 'number' && stdev.collectDuration !== 0 
          ? (rawValues[rawValues.length - 1] - mean.collectDuration) / stdev.collectDuration 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.collectDuration, stdev.collectDuration, metricWeight.pValue);
      } else if (metric === "otherDuration") {
        zValue = typeof mean.otherDuration === 'number' && typeof stdev.otherDuration === 'number' && stdev.otherDuration !== 0 
          ? (rawValues[rawValues.length - 1] - mean.otherDuration) / stdev.otherDuration 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.otherDuration, stdev.otherDuration, metricWeight.pValue);
      } else if (metric === "collectCount") {
        zValue = typeof mean.collectCount === 'number' && typeof stdev.collectCount === 'number' && stdev.collectCount !== 0 
          ? (rawValues[rawValues.length - 1] - mean.collectCount) / stdev.collectCount 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.collectCount, stdev.collectCount, metricWeight.pValue);
      } else if (metric === "manualCollectDistance") {
        zValue = typeof mean.manualCollectDistance === 'number' && typeof stdev.manualCollectDistance === 'number' && stdev.manualCollectDistance !== 0 
          ? (rawValues[rawValues.length - 1] - mean.manualCollectDistance) / stdev.manualCollectDistance 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.manualCollectDistance, stdev.manualCollectDistance, metricWeight.pValue);
      } else if (metric === "manualCollectTime") {
        zValue = typeof mean.manualCollectTime === 'number' && typeof stdev.manualCollectTime === 'number' && stdev.manualCollectTime !== 0 
          ? (rawValues[rawValues.length - 1] - mean.manualCollectTime) / stdev.manualCollectTime 
          : 0;
        anomaly = compareWithPValue(rawValues[rawValues.length - 1], mean.manualCollectTime, stdev.manualCollectTime, metricWeight.pValue);
      }
  
      // Xác định giá trị rating và diagnosis
      const { rating } = rawData[0];
      const diagnosisMetrics = ["distanceRatios", "collectDistance", "otherDistance", "durationRatios", 
                                "collectDuration", "otherDuration", "collectCount", 
                                "manualCollectDistance", "manualCollectTime"];
      const diagnosis = diagnosisMetrics.includes(metric) ? anomaly : false;
  
      result[metric] = {
        rating: rating[metric] || null,
        diagnosis: diagnosis,
        EWM: ewm,
        ...valuesByDate,
      };
    }
  
    return result;
  }

  // Function to get all data
  async getCoreDataset(coreDataSetDto: CoreDataSetDto, schema: string) {
    // Routename => SegmentId => 
    const { routeNames, startDate, endDate, pValue } = coreDataSetDto;
    const routeName = await this.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key);
    if (opensearchRouteIdList.length === 0) {
      return;
    }
    const result = {}; // Để lưu kết quả cho từng routeName
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema);
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const segmentIds = await this.routeInfoService.getSegmentIdsByRouteNames(routeNameArray, schema);
    await Promise.all(segmentIds.map(async (segmentId) => {
      if (segmentId) {
        // Lấy routeName tương ứng từ routeNameArray
        const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
        const currentRouteName = routeArray.name;
        // Gọi hàm getCollectMetricsForWidget với cả routeName và segmentId
        const driveMetricData = await this.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
        if (driveMetricData) {
          const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
          if (IDReal) {
            const allMetrics = await this.processMetricsData(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema);
            const mainData = await this.getStandardScore(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema);
            
            // lấy routeId, segmentId từ opensearch => lấy ra segment chuẩn 
            const [
              expandedCollectDistance,
              expandedCollectDuration,
              expandedCollectCount
            ] = await Promise.all([
              this.getProcessedExpandCollectData(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema),
              this.getProcessedExpandCollectDurationData(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema),
              this.getProcessedExpandCollectAmount(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema)
            ]);
            
            const expand = await this.getExpandOtherDataRollup(IDReal?.segment_id, IDReal?.route_id, startDate, endDate, schema)
      
            result[currentRouteName] = {
              mainData,
              ...allMetrics,
              expandedCollectDistance,
              expandedCollectDuration,
              expandedOtherDistance: expand.expandedOtherDistance,
              expandedOtherDuration: expand.expandedOtherDuration,
              expandedCollectCount,
            };
          }
        }
      }
    }));
  
    return result;
  }
}
