import { SORT_TYPE } from '@/constants';
import { TableColumnType } from 'antd';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';

export interface RouteDrivingDiary {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: number;
  name: string;
  start: [number, number];
  goal: [number, number];
  distance: number;
  duration: number;
  bbox: [number, number][];
  path: [number, number][];
  collect_count: number;
}

export interface RouteOption {
  value: string;
  label: string;
}

export interface SignatureData {
  signed: {
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    id: number;
    op_master_id: number | null;
    dispatch_master_id: number | null;
    op_master_url: string | null;
    dispatch_master_url: string | null;
  };
  user: {
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    id: number;
    master_id: number;
    url: string;
  };
}

export interface SignatureParams {
  url: string;
}

export interface SignSignatureParams {
  vehicle_id: number;
}

export interface GetSignatureParams {
  date: dayjs.Dayjs;
  vehicle_id: number;
}

export interface GetDrivingRecordPrams {
  vehicle_id: number;
  date: string;
}

export interface DrivingRecordTypes {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: number;
  vehicle_id: string;
  distance_yesterday: number;
  fuel_yesterday: number;
  distance_today: number;
  fuel_today: number;
  fuel_volumn: number;
}

export interface LandfillRecord {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: number;
  vehicle_id: number | null;
  serial: number;
  loading_weight: number;
  empty_weight: number;
  entrance_time: string;
  exit_time: string;
  url: string;
  filename: string;
}

export type CreateLandfillTypes = {
  url: string;
  serial: string | number;
  loading_weight: number;
  empty_weight: number;
  entrance_time: string | dayjs.Dayjs | null;
  exit_time: string | dayjs.Dayjs | null;
  vehicle_id?: string | number;
  id?: number;
};
export type DataUpdateLandfill = {
  url: string;
  serial: string | number;
  loadingWeight: number;
  emptyWeight: number;
  entranceTime: string | dayjs.Dayjs | null;
  exitTime: string | dayjs.Dayjs | null;
  vehicle_id?: string | number;
  id: number;
  filename: string;
  date: string;
};

export interface DrivingRecordInterface {
  distance_today: number;
  distance_yesterday: number;
  fuel_today: number;
  fuel_yesterday: number;
  fuel_volumn: number;
}

export type SortParams = {
  sortField?: string;
  sortBy?: keyof typeof SORT_TYPE | null;
};

export type GetScheduleParams = {
  page?: number;
  pageSize?: number;
  route_id?: string;
  working_date: string;
} & SortParams;

export interface RecordDataTable {
  index?: number;
  timestamp: string;
  dispatch_no: string;
  drive_mode: number;
  vehicle_id: string;
  section_name: string;
  route_name: string;
  gps_x: number;
  gps_y: number;
  angle: number;
  eco_score: number;
  trip_time: string;
  trip_distance: number;
  velocity: number;
  speeding: number;
  sudden_accel: number;
  sudden_break: number;
  duration: string;
  weight?: number;
  collect_amount?: number;
}

export interface DataTableParams {
  page?: number;
  pageSize?: number;
  vehicleId?: number | string;
  date?: dayjs.Dayjs | string;
  sortField?: string;
  sortBy?: keyof typeof SORT_TYPE | null;
  vehicleNumber?: string | null;
  dispatchNo?: string | null;
}

export interface DriveMetrics {
  timestamp: string;
  dispatch_no: string;
  drive_mode: number;
  vehicle_id: string;
  section_name: string;
  route_name: string;
  gps_x: number;
  gps_y: number;
  angle: number;
  eco_score: number;
  trip_time: string;
  trip_distance: number;
  velocity: number;
  speeding: number;
  sudden_accel: number;
  sudden_break: number;
  duration: string | null;
}

export interface TotalDataTableTypes {
  totalDuration: string;
  total_collect_amount: number;
  total_trip_distance: number;
  total_weight: number;
}

export interface LeftDrivingDiaryProps {
  options: RouteOption[];
  userRole: string;
  signatureData: SignatureData | null;
  currentSignature: any;
  onSaveDrivingRecord: (data: any) => void;
  onDeleteSignature: () => void;
  selectedDate: dayjs.Dayjs;
  isModalVisible: boolean;
  isExpanded: boolean;
  signatureFile: RcFile | null;
  error: string | null;
  distanceYesterday: number | null;
  setDistanceYesterday: (value: number | null) => void;
  distanceToday: number | null;
  setDistanceToday: (value: number | null) => void;
  fuelYesterday: number | null;
  setFuelYesterday: (value: number | null) => void;
  fuelToday: number | null;
  setFuelToday: (value: number | null) => void;
  fuelVolume: number | null;
  setFuelVolume: (value: number | null) => void;
  expandedRowKeysLandfill: number[];
  isShowAddNewRecord: boolean;
  setIsShowAddNewRecord: (value: boolean) => void;
  isNewUploadSignature: boolean;
  handleRouteChange: (value: string) => void;
  onDateChange: (date: dayjs.Dayjs) => void;
  onToday: () => void;
  onChangeSignature: (params: { type: string }) => void;
  handleFileUpload: (file: RcFile) => void;
  selectedRoute: string;
  toggleExpand: () => void;
  onCancelSignature: () => void;
  onCreateSignature: () => void;
  onDateChangeByType: (type: 'prev' | 'next', unit: 'day' | 'month') => void;
  openExpandInfo: boolean;
  setOpenExpandInfo: (value: boolean) => void;
  drivingRecord: DrivingRecordTypes | null;
  onExpandRowLandfill: (record: number) => void;
  landfillColumns: Array<TableColumnType<LandfillRecord>>;
  sortedLandfillData: LandfillRecord[];
  onLandfill: (data: DataUpdateLandfill) => void;
  vehicleId?: number;
  isManager: boolean;
}

export type ExportDrivingDiaryParams = {
  type: string;
  date: string;
  routeId: number;
};
