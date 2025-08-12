import { RecordTypes } from '@/interfaces/settings';

import { IVehicle } from './absence';
import { IWorker } from './workers';

export interface GetScheduleResponse {
  data: RecordTypes[];
}

export enum STATUS {
  ABSENCE_LONG_TERM = 'ABSENCE_LONG_TERM',
  ABSENCE_SHORT_TERM = 'ABSENCE_SHORT_TERM',
  REPLACE_LONG_TERM = 'REPLACE_LONG_TERM',
  REPLACE_SHORT_TERM = 'REPLACE_SHORT_TERM',
}

export enum CREW_TYPE {
  DRIVING_CREW_REGULAR = 'DRIVING_CREW_REGULAR',
  COLLECT_CREW_REGULAR = 'COLLECT_CREW_REGULAR',
  COLLECT_CREW_MONTHLY = 'COLLECT_CREW_MONTHLY',
  COLLECT_CREW_FIXED_TERM = 'COLLECT_CREW_FIXED_TERM',
  SUPPORT_CREW_REGULAR = 'SUPPORT_CREW_REGULAR',
  SUPPORT_CREW_FIXED_TERM = 'SUPPORT_CREW_FIXED_TERM',
}

export enum VEHICLE_TYPE {
  COMPOSITE_REGULAR = 'COMPOSITE_REGULAR',
  COMPOSITE_SUPPORT = 'COMPOSITE_SUPPORT',
  FOOD_REGULAR = 'FOOD_REGULAR',
  FOOD_SUPPORT = 'FOOD_SUPPORT',
  REUSABLE_REGULAR = 'REUSABLE_REGULAR',
  REUSABLE_SUPPORT = 'REUSABLE_SUPPORT',
  TATICAL_MOBILITY_REGULAR = 'TATICAL_MOBILITY_REGULAR',
  TATICAL_MOBILITY_SUPPORT = 'TATICAL_MOBILITY_SUPPORT',
}

export enum DOMAIN {
  ALL = 'ALL',
  LIFE = 'LIFE',
  FOOD = 'FOOD',
  REHABILITATION = 'REHABILITATION',
  MOBILITY = 'MOBILITY',
}

export interface ICrewOnPurpose {
  DRIVING_CREW_REGULAR: IStatisticStaff[];
  COLLECT_CREW_REGULAR: IStatisticStaff[];
  COLLECT_CREW_MONTHLY: IWorker[];
  COLLECT_CREW_FIXED_TERM: IStatisticStaff[];
  SUPPORT_CREW_REGULAR: IStatisticStaff[];
  SUPPORT_CREW_FIXED_TERM: IStatisticStaff[];
}

export interface IStatisticStaff {
  absence_type?: string;
  aid?: number;
  id?: number;
  name: string;
  repeat?: string;
  repeat_days_month?: null | number;
  repeat_days_week?: null | number;
  replacer_staff_id?: number;
}

export interface IVehicleOnPurpose {
  COMPOSITE_REGULAR: IVehicle[];
  COMPOSITE_SUPPORT: IVehicle[];
  FOOD_REGULAR: IVehicle[];
  FOOD_SUPPORT: IVehicle[];
  REUSABLE_REGULAR: IVehicle[];
  REUSABLE_SUPPORT: IVehicle[];
  TATICAL_MOBILITY_REGULAR: IVehicle[];
  TATICAL_MOBILITY_SUPPORT: IVehicle[];
}

export interface ICrewCount {
  DRIVING_CREW_REGULAR: StatisticCount;
  COLLECT_CREW_REGULAR: StatisticCount;
  COLLECT_CREW_MONTHLY: StatisticCount;
  COLLECT_CREW_FIXED_TERM: StatisticCount;
  SUPPORT_CREW_REGULAR: StatisticCount;
  SUPPORT_CREW_FIXED_TERM: StatisticCount;
}

export interface IVehicleCount {
  COMPOSITE_REGULAR: StatisticCount;
  COMPOSITE_SUPPORT: StatisticCount;
  FOOD_REGULAR: StatisticCount;
  FOOD_SUPPORT: StatisticCount;
  REUSABLE_REGULAR: StatisticCount;
  REUSABLE_SUPPORT: StatisticCount;
  TATICAL_MOBILITY_REGULAR: StatisticCount;
  TATICAL_MOBILITY_SUPPORT: StatisticCount;
}

type StatisticCount = [number, number, number];

export interface ISchedulePurposeStatistic {
  routeCount: number | null;
  vehicleRegularCount: number | null;
  vehicleBackupCount: number | null;
  driverRegularCount: number | null;
  driverBackupCount: number | null;
  collectRegularCount: number | null;
  collectBackupCount: number | null;
  sumNonCollectDistance: number | null;
  sumCollectDistance: number | null;
  replacementRate: number | null;
}

export interface ISCheduleStatisticResponse {
  statistics: ISchedulePurposeStatistic;
  staffSection: {
    driverActive: number | null;
    driverBackupCount: number | null;
    agent1BackupCount: number | null;
    agent2BackupCount: number | null;
    staffCount: ICrewCount;
    staffAbsence: ICrewOnPurpose;
    staffAvailable: ICrewOnPurpose;
  };
  vehicleSection: {
    vehicleCount: IVehicleCount;
    vehicleAbsence: IVehicleOnPurpose;
    vehicleAvailable: IVehicleOnPurpose;
  };
}

export interface IWholeDataTreeItem<T> {
  key: string;
  key_indicator: string;
  dispatching: number;
  available: number;
  absent: number;
  total: number;
  bolds?: string[];
  layer: number;
  children?: T[];
}

export interface IWholeDataTree extends IWholeDataTreeItem<IWholeDataTree> {}

export interface ICrewStatusDataSourceItem {
  driving_regular?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
  collect_regular?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
  support_regular?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
  collect_monthly?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
  collect_fixed_term?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
  support_fixed_term?: { value?: IStatisticStaff; isSummary?: boolean; total?: number };
}

export interface IVehicleStatusDataSourceItem {
  composite_regular?: { value?: IVehicle; isSummary?: boolean; total?: number };
  food_regular?: { value?: IVehicle; isSummary?: boolean; total?: number };
  reusable_regular?: { value?: IVehicle; isSummary?: boolean; total?: number };
  tatical_mobility_regular?: { value?: IVehicle; isSummary?: boolean; total?: number };
  composite_support?: { value?: IVehicle; isSummary?: boolean; total?: number };
  food_support?: { value?: IVehicle; isSummary?: boolean; total?: number };
  reusable_support?: { value?: IVehicle; isSummary?: boolean; total?: number };
  tatical_mobility_support?: { value?: IVehicle; isSummary?: boolean; total?: number };
}

export interface ISchedule {
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  id: number;
  dispatch_no: string;
  working_date: string;
  vehicle_id: number;
  backup_vehicle_id: null | number;
  route_id: number;
  driver: number;
  backup_driver: null | number;
  field_agent_1: number;
  backup_field_agent_1: null | number;
  field_agent_2: number;
  backup_field_agent_2: null | number;
  vehicle: IVehicle;
  wsDriver: IWorker;
  wsBackupDriver: null | IWorker;
  wsFieldAgent1: IWorker;
  wsBackupFieldAgent1: null | IWorker;
  wsFieldAgent2: IWorker;
  wsBackupFieldAgent2: null | IWorker;
  wsBackupVehicle: null | IVehicle;
  route: {
    id: number;
    name: string;
    distance: number;
    duration: number;
    collect_count: number;
  };
}

export interface IScheduleListReponse {
  data: ISchedule[];
}

export interface IScheduleStaffParams {
  job_contract?: string | string[];
  status?: 'NORMAL' | 'LEAVING' | 'RESIGNED';
  pageSize?: number;
}

export interface IReturnToWorkParams {
  end_date: string;
}

export interface IReturnToWorkStaff {
  id: number;
  absence_type: string;
  start_date: string;
  end_date: string;
  period: string;
  repeat: string;
  repeat_days_week: string;
  repeat_days_month: string | null;
  absence_staff_id: number;
  replacer_staff_id: number;
  absence_staff: IWorker;
  absence_dates: string[];
  back_to_work: string;
}

export interface IReturnToWorkStaffList {
  data: IReturnToWorkStaff[];
}

export interface IStatisticVehicle {
  id: number;
  vehicle_number: string;
  aid: number;
  absence_type: string;
}
