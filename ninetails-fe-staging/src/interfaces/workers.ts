import { IReplacerStaff } from './absence';

export enum WORKER_ROLE {
  DRIVER = 'DRIVER',
  CREW1 = 'CREW1',
  CREW2 = 'CREW2',
}
export interface IReplacer {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: 1;
  name: string;
  phone_number: string;
  age: string;
  driver_license: any;
  start_date: string;
  end_date: string;
  job_contract: null;
  status: null;
  note: null;
}
export interface IAbsence {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: 1;
  absence_type: any;
  start_date: string;
  end_date: string;
  period: string;
  repeat: 'NONE';
  repeat_days_week: null;
  repeat_days_month: null;
  absence_staff: any;
  replacer_staff: IReplacer;
  absence_date?: string;
  aid?: number;
  replacer_staff_id?: number;
}

export interface IWorker {
  name: string;
  age: string;
  duration?: string;
  driver_license: string;
  job_contract: string;
  absence_staff: IAbsence;
  replacer_staff: IReplacerStaff;
  phone_number: string;
  start_date: string;
  end_date?: string;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: string | null;
  id: number;
  key: string;
  note: string;
}
export interface GetWorkersResponse {
  data: IWorker[];
}
