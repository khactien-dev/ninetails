import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { convertToArray } from "libs/utils/helper.util";
import { Client } from "@opensearch-project/opensearch";
import { addDriveModeFilters, buildDateRangeQuery, buildDateRangeQueryOnlyDate, calculateZScores, createRangeQueryDataSet, generateDateRangesForStatistics } from "../../../base-query/base.function";
import { OperationAnalysisService } from "../../operation-analysis.service";
import { CoreDatasetService } from "../../core-dataset/core-dataset.service";
import { ManualCollectService } from "../../../datasource-service/manual-collect.service";
import { RouteInfoService } from "../../../datasource-service/route-info.service";
import { CustomGraphDto } from "./custom-graph.dto";
import { DrivingRouteService } from "../driving-route-graph/driving-route-graph.service";
import { WorkingScheduleService } from "../../../datasource-service/working-schedule.service";
import * as moment from "moment";
import { WidgetDatasetService } from "../../widget-dataset/widget-dataset.service";
@Injectable()
export class CustomGraphService {
  private scriptedMetricTemplate = {
    init_script: "state.previous_timestamp = null; state.total_duration = 0;",
    map_script: `
      if (doc.containsKey('data.timestamp') && !doc['data.timestamp'].empty) {
        Instant current_timestamp = doc['data.timestamp'].value.toInstant();
        if (state.previous_timestamp != null) {
          state.total_duration += ChronoUnit.MILLIS.between(state.previous_timestamp, current_timestamp);
        }
        state.previous_timestamp = current_timestamp;
      }
    `,
    combine_script: "return state.total_duration;",
    reduce_script: `
      long total = 0;
      for (s in states) {
        total += s;
      }
      return total / 1000; // Return in seconds
    `,
  };

  constructor(
    @Inject('Open_Search_JS_Client') private readonly openSearchClient: Client,
    private readonly operationAnalysisService: OperationAnalysisService,
    @Inject(forwardRef(() => CoreDatasetService))
    private readonly coreDatasetService: CoreDatasetService,
    private readonly manualCollectService: ManualCollectService,
    private readonly routeInfoService: RouteInfoService,
    private readonly workingScheduleService: WorkingScheduleService,
    private readonly widgetDatasetService: WidgetDatasetService,
    @Inject(forwardRef(() => DrivingRouteService))
    private readonly drivingRouteService: DrivingRouteService
  ) {
  }

  async getCustomStandardScoreData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const {
        startDate, endDate,
        yAxises1, yAxises2, conditions1, conditions2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const mustQueries = { term: { 'data.segment_id': segmentId } };

    const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
    const edge = await this.workingScheduleService.getOperationMetrics(driveMetricData.route_id, schema);

    const realStandardScore = await this.getCoreDataRollup(segmentId, routeId, startDate, endDate, schema);

    const dateRanges = this.coreDatasetService.generateDateRangesForStatistics1(startDate, endDate);
    
        // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const metricsMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
        acc[date] = null;
        return acc;
    }, {});
    
    // Gán giá trị standardScore vào các ngày tương ứng
    realStandardScore.forEach((item: any) => {
        const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
        if (metricsMap[date] !== undefined) {
          metricsMap[date] = item.standardScore;
        }
    });

    let zScores1 = realStandardScore.map((score) => score.standardScore);
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
        } else if (zScores1 && zScores1[index] !== undefined) {
            return { [date]: zScores1[index] };
        } else {
            return { [date]: null };
        }
    });

    const result = {
      ...Object.assign({}, ...dailyResults),
    };
    
    return { data: result };
  }

  async getCollectDistancetData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const {
        startDate, endDate,
        conditions1, conditions2, yAxises1, yAxises2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const allMetrics = await this.coreDatasetService.getAllMetrics(segmentId, routeId, startDate, endDate, schema);
    const result1 = allMetrics.map((metric) => metric.rawData.collectDistance);
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
    
        // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const metricsMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
        acc[date] = null;
        return acc;
    }, {});
    
    // Gán giá trị standardScore vào các ngày tương ứng
    allMetrics.forEach((item: any) => {
        const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
        if (metricsMap[date] !== undefined) {
          metricsMap[date] = item.rawData.collectDistance
        }
    });
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

  async getCollectTimetData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const {
        startDate, endDate,
        conditions1, conditions2, yAxises1, yAxises2,
        cumulation_y1, cumulation_y2
    } = customGraphDto;

    const allMetrics = await this.coreDatasetService.getAllMetrics(segmentId, routeId, startDate, endDate, schema);
    const result1 = allMetrics.map((metric) => metric.rawData.collectDuration);
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
    
        // Tạo đối tượng mặc định với các ngày từ dateRanges, giá trị ban đầu là null
    const metricsMap = dateRanges.reduce((acc: any, { date }: { date: string }) => {
        acc[date] = null;
        return acc;
    }, {});
    
    // Gán giá trị standardScore vào các ngày tương ứng
    allMetrics.forEach((item: any) => {
        const date = moment(item.date).format('YYYY-MM-DD'); // Chuẩn hóa định dạng ngày
        if (metricsMap[date] !== undefined) {
          metricsMap[date] = item.rawData.collectDuration
        }
    });

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

    const dateRanges = generateDateRangesForStatistics(startDate, endDate);
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
        return;
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
                scripted_metric: this.scriptedMetricTemplate
              }
              : { sum: { field } }),
          },
        },
      },
    ]));
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

  buildAggregationsDataSetOther(type: string) {
    const field = type === 'time' ? null : "data.distance";

    return {
      by_route: {
        terms: { field: 'data.segment_id', size: 10 },
        aggs: {
          total: {
            ...(type === 'time'
              ? {
                scripted_metric: this.scriptedMetricTemplate
              }
              : { sum: { field } }),
          },
          ...this.buildDriveModeAggregations(type),
        },
      },
    };
  }

  buildAggregationsDataSetCollect(type: string) {
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
                        scripted_metric: this.scriptedMetricTemplate
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

  buildQueryCoreDataSet(segmentId: number, routeId: number, startDate: string, endDate: string, statisticMode: string) {
    const mustQueries: any[] = [
      createRangeQueryDataSet(startDate, endDate, 'data.timestamp'),
    ];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

    if (routeId) {
      mustQueries.push({ term: { 'data.route_id': routeId } });
    }

    if (['otherTime', 'otherDistance'].includes(statisticMode)) {
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
          aggs: this.widgetDatasetService.getAggregationsByMode(statisticMode),
        }
      }
    };
  }

  // Hàm getOtherDistanceData
  async getOtherDistanceData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const { routeNames, startDate, endDate } = customGraphDto;
    const query = this.buildQueryCoreDataSet(segmentId, routeId, startDate, endDate, 'otherDistance');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    return {
      route: routeNames,
      data: this.formatResponseData(response, customGraphDto)
    };
  }

  async getOtherTimeData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const { routeNames, startDate, endDate } = customGraphDto;
    const query = this.buildQueryCoreDataSet(segmentId, routeId, startDate, endDate, 'otherDuration');
    const response = await this.openSearchClient.search({ index: `${schema}.drive_metrics`, body: query });
    return {
      route: routeNames,
      data: this.formatResponseData(response, customGraphDto)
    };
  }

  async getCollectCountData(customGraphDto: CustomGraphDto, segmentId: number, routeId: number, schema: string) {
    const { startDate, endDate, conditions1, conditions2, cumulation_y1, cumulation_y2 } = customGraphDto;
    const mustQueries = [];

    if (segmentId) {
      mustQueries.push({ term: { 'data.segment_id': segmentId } });
    }

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

    const body = {
        size: 0,
        query: {
            bool: {
                must: mustQueries,
            },
        },
        "aggs": {
        "trips_by_time": {
            "date_histogram": {
                "field": "data.timestamp",
                "interval": "day",
                "format": "yyyy-MM-dd"
            },
            "aggs": {
                "totalOfDay": {
                    "sum": {
                        "script": {
                            "source": `
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
                            "lang": "painless"
                        }
                    }
                },
                "5L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.5L_gen'].length > 0) { state.sum += doc['data.5L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "10L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.10L_gen'].length > 0) { state.sum += doc['data.10L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "10L_reu": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.10L_reu'].length > 0) { state.sum += doc['data.10L_reu'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "20L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.20L_gen'].length > 0) { state.sum += doc['data.20L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "20L_reu": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.20L_reu'].length > 0) { state.sum += doc['data.20L_reu'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "30L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.30L_gen'].length > 0) { state.sum += doc['data.30L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "50L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.50L_gen'].length > 0) { state.sum += doc['data.50L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "50L_pub": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.50L_pub'].length > 0) { state.sum += doc['data.50L_pub'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "75L_gen": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.75L_gen'].length > 0) { state.sum += doc['data.75L_gen'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "75L_pub": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.75L_pub'].length > 0) { state.sum += doc['data.75L_pub'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "ext": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.ext'].length > 0) { state.sum += doc['data.ext'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
                    }
                },
                "etc": {
                    "scripted_metric": {
                        "init_script": "state.sum = 0;",
                        "map_script": "if (doc['data.etc'].length > 0) { state.sum += doc['data.etc'][0]; }",
                        "combine_script": "return state.sum;",
                        "reduce_script": "double total = 0; for (s in states) { if (s != null) { total += s; } } return total;"
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

    const buckets = result.body.aggregations.trips_by_time.buckets;

    let formattedResult = {};
    const trashBagType = [
        '5L_gen', '10L_gen', '10L_reu', '20L_gen', '20L_reu',
        '30L_gen', '50L_gen', '50L_pub', '75L_gen', '75L_pub', 'ext', 'etc'
    ];
    const dateRanges = generateDateRangesForStatistics(startDate, endDate);

    // Kiểm tra xem có domain "collectCount" hay không
    const hasCollectCount = [...(conditions1 || []), ...(conditions2 || [])].some(cond => cond.domain === 'collectCount');

    const conditionDriveModes1 = conditions1?.filter(cond => trashBagType.some(mode => mode === cond.domain)) || [];
    const conditionOtherDistance1 = conditions1?.find(cond => cond.domain === 'collectCount') || null;

    const conditionDriveModes2 = conditions2?.filter(cond => trashBagType.some(mode => mode === cond.domain)) || [];
    const conditionOtherDistance2 = conditions2?.find(cond => cond.domain === 'collectCount') || null;

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
            formattedResult[date]['collectCount'] = null;
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
    return result.body.hits.hits.map((item: any) => item._source);
  }

  async getCustomGraph(customGraphDto: CustomGraphDto, schema: string) {
    const { routeNames, routeName1, routeName2, startDate, endDate, yAxises1, yAxises2 } = customGraphDto;
    const routeName = await this.coreDatasetService.getOperatingRoutes(startDate, endDate, schema);
    const opensearchRouteIdList = routeName.body.aggregations.unique_routes.buckets.map((route: any) => route.key);
    if (opensearchRouteIdList.length === 0) {
      return;
    }
    // Sử dụng Promise.all để chạy tính toán đồng thời cho từng routeName
    const routeList = await this.routeInfoService.getRouteNamesByRouteIds(opensearchRouteIdList, schema)
    let routeNameArray = routeNames ? convertToArray(routeNames) : routeList; // Mảng routeName
    const routeNames1 = routeName1 ? convertToArray(routeName1) : routeNames ? convertToArray(routeNames) : routeNameArray;
    const routeNames2 = routeName2 ? convertToArray(routeName2) : routeNames ? convertToArray(routeNames) : routeNameArray;
    const segmentIds1 = await this.routeInfoService.getSegmentIdsByRouteNames(routeNames1, schema)
    const segmentIds2 = await this.routeInfoService.getSegmentIdsByRouteNames(routeNames2, schema)

    // Chuyển đổi routeName1 và routeName2 thành mảng
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
        segmentIds1.map(async (segmentId, index) => {
        if (segmentId) {
          const dataForRoute = {};
          const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
          const currentRouteName = routeArray.name;
          const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
          if (driveMetricData) {
            const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
            const segmentIDReal = await this.routeInfoService.getSegmentIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
            const EWMAVG = await this.drivingRouteService.getCoreDataRollupEWM(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
            let dataY = null;
    
            // Fetch dữ liệu cho yAxises1
            if (yAxises1) {
              switch (yAxises1) {
                case 'standardScore':
                  // dataY = await this.getCoreDataRollup(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
                  dataY = await this.getCustomStandardScoreData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectDistance':
                  dataY = await this.getCollectDistancetData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectTime':
                  dataY = await this.getCollectTimetData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'otherDistance':
                  dataY = await this.getOtherDistanceData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'otherTime':
                  dataY = await this.getOtherTimeData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectCount':
                  dataY = await this.getCollectCountData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                default:
                  dataY = null;
              }
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
                  if (typeof dataY.data[date] === 'object' && dataY.data[date] !== null) {
                    totalByDayY1[date] += dataY.data[date].totalOfDay || null;
                  } else {
                    totalByDayY1[date] += dataY.data[date];
                  }
                }

                if (Object.keys(dataForDate).length > 0) {
                  dataForRoute[date] = dataForDate;
                  if (!dayCountY1[date]) dayCountY1[date] = null;
                  dayCountY1[date]++;
                }
              });

              resultY1[currentRouteName] = dataForRoute;
            }
          }
        }
      })
    );

    // Xử lý routeName2 với yAxises2 và EWM cho routeName2
    await Promise.all(
        segmentIds2.map(async (segmentId, index) => {
          if (segmentId) {
            const dataForRoute = {};
          const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
          const currentRouteName = routeArray.name;
          const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
          if (driveMetricData) {
            const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
            const EWMAVG = await this.drivingRouteService.getCoreDataRollupEWM(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
            let dataY = null;
    
            // Fetch dữ liệu cho yAxises1
            if (yAxises2) {
              switch (yAxises2) {
                case 'standardScore':
                  dataY = await this.getCustomStandardScoreData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectDistance':
                  dataY = await this.getCollectDistancetData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectTime':
                  dataY = await this.getCollectTimetData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'otherDistance':
                  dataY = await this.getOtherDistanceData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'otherTime':
                  dataY = await this.getOtherTimeData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                case 'collectCount':
                  dataY = await this.getCollectCountData(customGraphDto, IDReal.segment_id, IDReal.route_id, schema);
                  break;
                default:
                  dataY = null;
              }

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
                  if (typeof dataY.data[date] === 'object' && dataY.data[date] !== null) {
                    totalByDayY2[date] += dataY.data[date].totalOfDay || null;
                  } else {
                    totalByDayY2[date] += dataY.data[date];
                  }
                }
    
                if (Object.keys(dataForDate).length > 0) {
                  dataForRoute[date] = dataForDate;
                  if (!dayCountY2[date]) dayCountY2[date] = null;
                  dayCountY2[date]++;
                }
              });
    
              resultY2[currentRouteName] = dataForRoute;
              }
            }
          }
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
}