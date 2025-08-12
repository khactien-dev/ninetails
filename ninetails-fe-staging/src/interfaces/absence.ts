import { PaginationParams } from '@/interfaces/common';
import { Dayjs } from 'dayjs';

export interface IVehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: number | string;
  vehicle_model: number;
  manufacturer: number;
  operation_start_date: string;
  operation_end_date: string;
  capacity: number;
  max_capacity: number;
  purpose: string;
  coordination_status: string;
  status: boolean;
}

export interface IAbsenceData {
  key?: string;
  id: number;
  absence_vehicle: IVehicle;
  replacement_vehicle: IVehicle;
  absence_type: string;
  start_date: string;
  end_date: string;
  period?: string;
}

export interface AbsenceVehicleList {
  data: IAbsenceData[];
}

export interface AbsenceStaffList {
  data: IAbsenceStaffData[];
}

export interface IAbsenceStaffData {
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  id: number;
  absence_type: string;
  start_date: string;
  end_date: string;
  period: string;
  repeat: string;
  repeat_days_week: null | string;
  repeat_days_month: null | string;
  absence_staff_id: number;
  replacer_staff_id: number;
  absence_staff: IAbsenceStaff;
  replacer_staff: IReplacerStaff;
}

export interface IReplacerStaff {
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  id: number;
  name: string;
  phone_number: string;
  age: string;
  driver_license: string;
  start_date: string;
  end_date: string;
  job_contract: string;
  status: string;
  note: string;

  aid?: number;
  absence_type?: string;
}

export interface IAbsenceStaff {
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  id: number;
  name: string;
  phone_number: string;
  age: string;
  driver_license: string;
  start_date: string;
  end_date: string;
  job_contract: string;
  status: string;
  note: string;
}

export type IAbsenceVehicleParam = {
  start_date: string;
  end_date?: string;
  vehicle_id?: string | null;
  staff_id?: string | null;
  type: string;
} & PaginationParams;

export type IAbsenceStaffParam = {
  start_date: string;
  end_date?: string;
  staff_id?: string | null;
  type: string;
} & PaginationParams;

export interface IAddAbsence {
  absence_vehicle: {
    id?: number;
  };
  replacement_vehicle: {
    id?: number;
  };
  absence_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface IAddAbsenceStaff {
  absence_staff: {
    id: number;
  };
  absence_type: string;
  replacer_staff: {
    id: number;
  };
  start_date: string;
  end_date: string;
  period: string;
  repeat: string;
  days?: string[];
}

export interface IUpdateAbsence extends IAddAbsence {
  id: number;
}

export interface IUpdateAbsenceStaff {
  id: number | string;
  replacer_staff: {
    id: number;
  };
  absence_type: string;
  start_date: string;
  end_date: string;
  repeat: string;
  days: string[];
  period?: string;
}

export interface FormValues {
  absence: number;
  purpose: string;
  absence_type?: string;
  replacement: number;
  start_date: Dayjs;
  end_date?: Dayjs;
  period: string;
  day?: string[];
  repeat?: string;
  multiple_day?: string[];
  other?: string;
}

export interface IVehicleList extends PaginationParams {
  type?: string;
}
