import { IMarker } from '@/components/map/marker';

export interface IPosition {
  latitude: number;
  longitude: number;
}

export interface IDirection {
  start: IPosition;
  end: IPosition;
}

interface Coordinates {
  x: number;
  y: number;
}

export interface IMetricDetail {
  vehicle_id: string;
  dispatch_no: string;
  drive_mode: number;
  start_time: string; // ISO 8601 date-time string
  start_coords: Coordinates;
  end_time: string; // ISO 8601 date-time string
  end_coords: Coordinates;
  total_distance: number;
  total_time: number; // time in hours
}

export interface ICurrentMetric {
  vehicle_number: string;
  vehicle_id: string;
  timestamp: string;
  dispatch_no: string;
  drive_mode: number;
  segment_id: string;
  section_name: string;
  area_name: string;
  route_name: string;
  gps_x: number;
  gps_y: number;
  angle: number;
  eco_score: number;
  trip_time: string;
  trip_time_minutes: number;
  trip_distance: number;
  velocity: number;
  speeding: number;
  idling: number;
  sudden_accel: number;
  sudden_break: number;
  exit_at: string;
  vehicle_state_duration: number;
  main_record: boolean;
}

export interface IRouteSummary {
  eco_score: number;
  trip_distance: number;
  speeding: number;
  idling: number;
  sudden_accel: number;
  sudden_break: number;
  trip_time: number;
  not_managed: number;
  out_of_control: number;
}

export interface IMetric {
  area_name: string;
  trip_time: string;
  gps_x: number;
  eco_score: number;
  speeding: number;
  gps_y: number;
  vehicle_state_duration: number;
  main_record: boolean;
  velocity: number;
  exit_at: string;
  dispatch_no: string;
  trip_distance: number;
  sudden_accel: number;
  idling: number;
  sudden_break: number;
  drive_mode: number;
  segment_id: string;
  vehicle_id: string;
  timestamp: string;
}

interface IVehicleInfo {
  timestamp: string;
  vehicle_id: string;
  vehicle_number: string;
  type: string;
  model: string;
  vendor: string;
  capacity_m3: number;
  capacity_kg: number;
  operation_start: string;
  operation_end: string;
  dispatch_status: string;
  last_maintenance: string;
  next_maintenance: string;
  usage: string;
  note: string;
}

export interface IRatios {
  distanceRatios: number;
  durationRatios: number;
  collectDistance: number;
  collectDuration: number;
  collectCount: number;
}

export interface IScore {
  [key: string]: {
    [innerKey: string]: number;
  };
  rankScore?: any;
}

export interface IMetrics {
  detailDriveMetric?: IMetricDetail[];
  dispatchHistory?: IMetricDetail[];
  detailWalkMetric?: IMetricDetail;
  lastUpdated: string;
  totalSection?: number;
  coveredSections?: number;
  collectCount?: number;
  currentLocation?: string;
  latestDriveMetric?: ICurrentMetric;
  totals?: IRouteSummary;
  uniqueDriveMetrics?: IMetric[];
  vehicleInfo?: IVehicleInfo[];
  vehicleRoute?: {
    route_id: number;
    route_name: string;
    path: number[][];
    summary: {
      start: number[];
      goal: number[];
      distance: number;
      duration: number;
      bbox: number[][];
      collectCount: number;
    };
    sections: {
      name?: string;
      pointIndex?: number;
      pointCount?: number;
      distance?: number;
      congestion?: number;
      speed?: number;
      collectCount?: number;
    }[];
  }[];
  zScore: IScore;
  garageAndLandfill: {
    name: string;
    type: string;
    segment_line: number[][];
  }[];
}

export interface IScoreStatistics {
  lastest: number;
  mean: number;
  standardDeviation: number;
}

export interface IDataType {
  [innerKey: string]: {
    [key: string]: number;
  };
  rankScore?: any;
}

export interface IllegalItem {
  address: string;
  gps_x: number;
  gps_y: number;
  classification: number;
  collection: string | null;
  produce: string;
  route_name: string;
  hour: number | null;
  diff_week: number;
}

export interface IAggregateHour {
  max: number;
  min: number;
  avg: number;
}

export interface ClassificationCount {
  key: string;
  count: number;
}

export interface ICountData {
  within_1_week: number;
  within_2_week: number;
  more_than_2_week: number;
  classifications: ClassificationCount[];
}

export interface IllegalCollectData {
  items: IllegalItem[];
  aggregate_hour: IAggregateHour;
  count: {
    all: ICountData;
    collection: ICountData;
    produce: ICountData;
  };
  last_updated: string;
}

export interface IIllegalData {
  markers: IMarker[];
  aggregate_hour: IAggregateHour;
  count: {
    all: ICountData;
    collection: ICountData;
    produce: ICountData;
  };
  last_updated: string;
}
