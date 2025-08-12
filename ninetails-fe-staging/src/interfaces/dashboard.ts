export interface DashboardRequest {
  analysisTime?: string;
  updateTime?: number;
  startDate?: string;
  endDate?: string;
  startDatePrev?: string;
  endDatePrev?: string;
}

export interface DashboardData {
  last_updated?: string;
  numberOfRegisterVehicleNow?: number;
  numberOfRouterNow?: number;
  numberOfStaffNow?: number;
  totalActiveVehicleNow?: number;
  dataNow: VehicleData;
  dataOld: VehicleData;
}

interface VehicleData {
  vehicleOperatingRate?: number;
  ecoOperationScore?: number;
  operatingTime?: AverageTotal;
  drivingDistance?: AverageTotal;
  collectionAmount?: AverageTotal;
  collectionWeight?: AverageTotal;
  collectionTime?: AverageTotal;
  totalActiveVehicle?: number;
  last_updated?: string;
  numberOfRegisterVehicle?: number;
  numberOfRouter?: number;
  numberOfStaff?: number;
  collectionDistance?: AverageTotal;
  speeding?: AverageTotal;
  idling?: AverageTotal;
  suddenAcceleration?: AverageTotal;
  suddenBraking?: AverageTotal;
}

interface AverageTotal {
  average: number;
  total: number;
}

export interface IDashboardData {
  lastUpdate?: string;
  totalAnalysisData?: {
    numberOfRegisterVehicleNow?: number;
    numberOfRouterNow?: number;
    numberOfStaffNow?: number;
    totalActiveVehicleNow?: number;
    vehicleOperatingRate?: number;
    ecoOperationScore?: number;
    now?: VehicleData;
    old?: VehicleData;
  };
  analysisData: ConvertDashboardDataOutput;
}

export interface ConvertDashboardDataOutput {
  [key: string]: {
    dataNow: number;
    dataOld: number;
    gap: number;
  };
}
