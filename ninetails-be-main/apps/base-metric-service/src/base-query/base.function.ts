import { mean, std } from "mathjs";
import * as moment from 'moment';

export function buildMustQueriesDispatchNo(dispatchNo: string) {
    const mustQueries = [];
    if (dispatchNo)
      mustQueries.push({ term: { 'data.dispatch_no.keyword': dispatchNo } });
    return mustQueries;
}

export function buildMustQueriesSegmentId(segmentId: number) {
  const mustQueries = [];
  if (segmentId)
    mustQueries.push({ term: { 'data.segment_id': segmentId } });
  return mustQueries;
}

export function createRangeQuery(date: string | undefined, field: any): any {
  if (date) {
    return { range: { [field]: {gte: date, lte: date } } };
  } else {
    return { range: { [field]: { gte: 'now/d', lte: 'now' } } }; // Tìm kiếm trong 1 ngày gần nhất
  }
}

export function buildDateRangeQuery(startDate: string, endDate: string) {
  return {
    range: {
      'data.timestamp': {
        "time_zone": "+00:00",
        gte: startDate,
        lte: endDate,
      },
    },
  };
}

export function createRangeQueryDataSet(startDate: string, endDate: string, field: any): any {
  const formattedStartDate = startDate ? startDate : 'now/d';
  const formattedEndDate = endDate ? endDate : 'now';

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

export function buildAggregationForDriveMode(mode: number) {
  return {
    filter: { term: { 'data.drive_mode': mode } },
    aggs: {
      total_trip_distance: { sum: { field: 'data.distance' } },
      count_trip_distance: { value_count: { field: 'data.distance' } },
    },
  };
}

export function buildAggregationForDriveModes(modes: number[]) {
  return {
    filter: { terms: { 'data.drive_mode': modes } },
    aggs: {
      total_trip_distance: { sum: { field: 'data.distance' } },
      count_trip_distance: { value_count: { field: 'data.distance' } },
    },
  };
}

export function buildBucketScriptAggregation(
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

export function buildAggregations(operationMetrics: number) {
  return {
    all_drive_metrics: {
      filters: { filters: { all: { match_all: {} } } },
      aggs: {
        trip_distance_mode_5: buildAggregationForDriveMode(5),
        trip_distance_other_modes: buildAggregationForDriveModes([
          0, 1, 2, 3, 4, 6, 7, 8
        ]),
        distance_ratios: buildBucketScriptAggregation(
          'trip_distance_mode_5>total_trip_distance',
          'trip_distance_other_modes>total_trip_distance',
          'params.mode5 != null && params.otherModes != null && params.otherModes != 0 ? (params.mode5 / params.otherModes * 100) : null',
          'mode5',
          'otherModes',
        ),
        duration_ratios: buildBucketScriptAggregation(
          'trip_distance_mode_5>count_trip_distance',
          'trip_distance_other_modes>count_trip_distance',
          `params.mode5_count != null && params.otherModes_count != null && params.otherModes_count != 0 ? ((params.mode5_count * ${operationMetrics}) / (params.otherModes_count * ${operationMetrics}) * 100) : null`,
          'mode5_count',
          'otherModes_count',
        ),
        collect_duration: buildBucketScriptAggregation(
          'trip_distance_mode_5>count_trip_distance',
          null,
          `params.mode5_count != null ? (params.mode5_count * ${operationMetrics}) : null`,
          'mode5_count',
        ),
        other_duration: buildBucketScriptAggregation(
          'trip_distance_other_modes>count_trip_distance',
          null,
          `params.otherModes_count != null ? (params.otherModes_count * ${operationMetrics}) : null`,
          'otherModes_count'
        )
      },
    },
  };
}

export function buildAggregationsCoreDataset(operationMetrics: number) {
  return {
    "daily_metrics": {
      "date_histogram": {
        "field": "data.timestamp",
        "calendar_interval": "day",
        "offset": "-11h", 
        "time_zone": "+00:00"
      },
      "aggs": {
        "trip_distance_mode_5": {
          "filter": {
            "term": {
              "data.drive_mode": 5
            }
          },
          "aggs": {
            "total_trip_distance": {
              "sum": {
                "field": "data.distance"
              }
            },
            "count_trip_distance": {
              "value_count": {
                "field": "data.distance"
              }
            }
          }
        },
        "trip_distance_other_modes": {
          "filter": {
            "terms": {
              "data.drive_mode": [
                0, 1, 2, 3, 4, 6, 7, 8
              ]
            }
          },
          "aggs": {
            "total_trip_distance": {
              "sum": {
                "field": "data.distance"
              }
            },
            "count_trip_distance": {
              "value_count": {
                "field": "data.distance"
              }
            }
          }
        },
        "distance_ratios": {
          "bucket_script": {
            "buckets_path": {
              "mode5": "trip_distance_mode_5>total_trip_distance",
              "otherModes": "trip_distance_other_modes>total_trip_distance"
            },
            "script": "params.mode5 != null && params.otherModes != null && params.otherModes != 0 ? (params.mode5 / params.otherModes * 100) : null"
          }
        },
        "duration_ratios": {
          "bucket_script": {
            "buckets_path": {
              "mode5_count": "trip_distance_mode_5>count_trip_distance",
              "otherModes_count": "trip_distance_other_modes>count_trip_distance"
            },
            "script": `params.mode5_count != null && params.otherModes_count != null && params.otherModes_count != 0 ? ((params.mode5_count * ${operationMetrics}) / (params.otherModes_count * ${operationMetrics}) * 100) : null`
          }
        },
        "collect_duration": {
          "bucket_script": {
            "buckets_path": {
              "mode5_count": "trip_distance_mode_5>count_trip_distance"
            },
            "script": `params.mode5_count != null ? (params.mode5_count * ${operationMetrics}) : null`
          }
        },
        "other_duration": {
          "bucket_script": {
            "buckets_path": {
              "otherModes_count": "trip_distance_other_modes>count_trip_distance"
            },
            "script": `params.otherModes_count != null ? (params.otherModes_count * ${operationMetrics}) : null`
          }
        }
      }
    }
  }
}

export function processAggregations(aggregations: any): any {
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

export const getSafeValue = (value: any) => {
  return value !== undefined && value !== null ? parseFloat(value.toFixed(3)) : 0;
};

export function calculateEWM(data: number[], alpha: number): number[] {
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

export function safeMean(array: number[]) {
  // Lọc ra các giá trị undefined hoặc không phải số
  const validNumbers = array.filter((value) => typeof value === 'number' && !isNaN(value));

  // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
  return validNumbers.length === 0 ? 1 : mean(validNumbers);
}

export function safeStd(array: number[]) {
  // Lọc ra các giá trị undefined hoặc không phải số
  const validNumbers = array.filter((value) => typeof value === 'number' && !isNaN(value) && value !== 0);

  // Nếu mảng hợp lệ sau khi lọc trống, trả về 0
  return validNumbers.length === 0 ? 0 : std(validNumbers);
}

export function calculateZScores(data: number[], mean: number, stdDev: any): number[] {
  if (stdDev === 0) {
    return data.map(() => 0);  // Nếu stdDev = 0, tất cả các zScores đều bằng 0
  }
  return data.map((value) => (value - mean) / stdDev);
}

export function calculateWeightedSum(
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


export const getMinAndMax = (arr) => ({
  min: Math.min(...arr),
  max: Math.max(...arr)
});

export const getAverage = (arr) => arr.length ? arr.reduce((sum, value) => sum + value, 0) / arr.length : 0;

export const formatValue = (val: any, precision = 3) => {
  if (val === null || val === undefined || isNaN(val)) {
    return 0; // Trả về số 0 nếu giá trị không hợp lệ
  }
  const factor = Math.pow(10, precision);
  return Math.round(Number(val) * factor) / factor; // Làm tròn số mà không chuyển đổi thành chuỗi
};

export const handleError = (error: any) => {
  console.error('OpenSearch query error:', error.message, error.stack);
  throw new Error('Failed to calculate collection volume.');
};

export function getNumberOfDays(startDate: string, endDate: string): number {
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

export function calculateOtherMetrics(buckets: any, numberOfDays: number, totalDriveModeData: any) {
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

export function calculateCollectMetrics(buckets: any, numberOfDays: number) {
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

export function generateDateRangesForStatistics(startDate: string, endDate: string) {
  const start = moment(startDate).startOf('day');
  const end = moment(endDate).startOf('day');
  const totalDays = end.diff(start, 'days'); // Tính số ngày giữa startDate và endDate

  return Array.from({ length: totalDays + 1 }, (_, i) => ({
    date: start.clone().add(i, 'days').format('YYYY-MM-DD'),
  }));
}

export function calculateCDF(z: number): number {
  return 0.5 * (1 + Math.tanh(z / Math.sqrt(2)) * Math.sqrt(2 / Math.PI));
}

export function checkAnomaly(zValue: number, pValue: number = 0.05) {
  // Chuyển đổi Z-value thành z_probability
  const zProbability = 2 * (1 - calculateCDF(zValue));  // kiểm tra hai phía

  // So sánh z_probability với p_value
  if (zProbability < pValue) {
    return false;
  } else {
    return true;
  }
}

// Hàm tính CDF (Cumulative Distribution Function) bằng phương pháp Hastings
export function normalcdf(xValue) {
  const T = 1 / (1 + 0.2316419 * Math.abs(xValue));
  const D = 0.3989423 * Math.exp(-xValue * xValue / 2);
  let probability = D * T * (0.3193815 + T * (-0.3565638 + T * (1.781478 + T * (-1.821256 + T * 1.330274))));
  if (xValue > 0) {
      probability = 1 - probability;
  }
  return probability;
}

// Hàm xử lý logic tính toán
export function compute(xValue, mean, standardDeviation) {
  if (standardDeviation < 0) {
      throw new Error("The standard deviation must be nonnegative.");
  }

  let probability;
  if (standardDeviation === 0) {
      // Nếu độ lệch chuẩn bằng 0
      probability = xValue < mean ? 0 : 1;
  } else {
      // Tính xác suất chuẩn hóa
      const zValue = (xValue - mean) / standardDeviation;
      probability = normalcdf(zValue);
      // Làm tròn đến 5 chữ số thập phân
      probability = Math.round(probability * 100000) / 100000;
  }
  return probability;
}

// Hàm so sánh với pValue
export function compareWithPValue(xValue, mean, standardDeviation, pValue) {
  const computedProbability = compute(xValue, mean, standardDeviation);
  return computedProbability >= pValue;
}

export function buildDateRangeQueryOnlyDate(date: string) {
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
        "time_zone": "+00:00",
        gte: formattedEndDate,
        lte: formattedStartDate,
      },
    },
  };
}

export function generate7DaysBefore(date: string): string[] {
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

export function addDriveModeFilters(mustQueries: any[]) {
  mustQueries.push(
    { range: { 'data.drive_mode': { gte: 0, lte: 8 } } },
    { bool: { must_not: { term: { 'data.drive_mode': 5 } } } }
  );
}

export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return (
      (hours < 10 ? "0" : "") + hours + ":" +
      (minutes < 10 ? "0" : "") + minutes + ":" +
      (seconds < 10 ? "0" : "") + seconds
  );
}

export function calculateSectionsCovered(driveMetrics: any, sections: any): number {
  const driveSectionName = driveMetrics.section_name;
  
  // Kiểm tra xem section_name có xuất hiện trong danh sách sections không
  const coveredSections = sections.filter(section => section.name == driveSectionName);

  // Trả về số lượng sections đã đi qua
  return coveredSections.length;
}