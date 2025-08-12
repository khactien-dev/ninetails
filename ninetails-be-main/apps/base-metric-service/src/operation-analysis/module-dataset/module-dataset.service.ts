import { Inject, Injectable } from "@nestjs/common";
import { ModuleDatasetDto } from "./module-dataset.dto";
import { Client } from "@opensearch-project/opensearch/.";
import { RouteInfoService } from "../../datasource-service/route-info.service";
import { convertToArray } from "libs/utils/helper.util";
import { CoreDatasetService } from "../core-dataset/core-dataset.service";

@Injectable()
export class ModuleDatasetService {
  constructor(
    private readonly routeInfoService: RouteInfoService,
    private readonly coreDatasetService: CoreDatasetService
  ) {}
  // Module Dataset

  async getModuleDataset(moduleDatasetDto: ModuleDatasetDto, schema: string) {
    // Routename => SegmentId => 
    const { routeNames, startDate, endDate, pValue, conditions } = moduleDatasetDto;
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
    await Promise.all(segmentIds.map(async (segmentId) => {
      if (segmentId) {
        // Lấy routeName tương ứng từ routeNameArray
        const routeArray = await this.routeInfoService.getRouteNameBySegmentId(segmentId, schema);
        const currentRouteName = routeArray.name;
        // Gọi hàm getCollectMetricsForWidget với cả routeName và segmentId
        const driveMetricData = await this.coreDatasetService.getDriveMetricsBySegmentId(segmentId, startDate, endDate, schema);
        if (driveMetricData) {
          const IDReal = await this.routeInfoService.getSegmentIdAndRouteIdByRouteIdAndSegmentId(driveMetricData.route_id, driveMetricData.segment_id, schema);
          const allMetrics = await this.coreDatasetService.processMetricsData(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
          const mainData = await this.coreDatasetService.getStandardScore(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema);
          
          // lấy routeId, segmentId từ opensearch => lấy ra segment chuẩn 
          const [
            expandedCollectDistance,
            expandedCollectDuration,
            expandedCollectCount
          ] = await Promise.all([
            this.coreDatasetService.getProcessedExpandCollectData(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema),
            this.coreDatasetService.getProcessedExpandCollectDurationData(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema),
            this.coreDatasetService.getProcessedExpandCollectAmount(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema)
          ]);
          
          const expand = await this.coreDatasetService.getExpandOtherDataRollup(IDReal.segment_id, IDReal.route_id, startDate, endDate, schema)
    
          const fullData = {
            mainData,
            ...allMetrics,
            expandedCollectDistance,
            expandedCollectDuration,
            expandedOtherDistance: expand.expandedOtherDistance,
            expandedOtherDuration: expand.expandedOtherDuration,
            expandedCollectCount,
          };

          const dataMatchesConditions = this.filterDataByConditions(conditions, fullData, startDate, endDate);

          if (dataMatchesConditions) {
            result[currentRouteName] = fullData;
          }
        }
      }
    }));
  
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

      // Xử lý khi có L3 và L3 = L2Extension
      if (L3 && L3 === L2Extension) {
        const stats = calculateStats(dataExtension);
        tempIsValid = processColumnValue(stats, dataExtension);
      } 
      // Xử lý khi có L3 nhưng khác L2Extension
      else if (L3) {
        const expandedExtensions = ['collectDistance', 'collectDuration', 'collectCount', 'otherDistance', 'otherDuration'];
        if (expandedExtensions.includes(L2Extension)) {
          const expandedData = data[`expanded${L2Extension.charAt(0).toUpperCase() + L2Extension.slice(1)}`];
          // Kiểm tra nếu expandedData là array
          if (Array.isArray(expandedData)) {
            if (expandedExtensions.includes(L3)) {
              const stats = calculateStats(expandedData);
              tempIsValid = processColumnValue(stats, expandedData);
            }
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
}