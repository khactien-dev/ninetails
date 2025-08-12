import { request } from '@/api/request';
import { IScheduleParams } from '@/components/schedule/context/index.utils';
import {
  AbsenceVehicleList,
  GetWorkersResponse,
  IAbsenceData,
  IAbsenceStaffData,
  RecordTypes,
  ResponseData,
} from '@/interfaces';
import {
  IReturnToWorkParams,
  IReturnToWorkStaffList,
  ISCheduleStatisticResponse,
  IScheduleListReponse,
  IScheduleStaffParams,
} from '@/interfaces/schedule';
import { Key } from 'react';

export const getScheduleStaff = (params: IScheduleStaffParams) =>
  request.get<IScheduleStaffParams, ResponseData<GetWorkersResponse>>('/user/staff', params);

export const deleteSchedule = (id: Key[]) =>
  request.delete(`/user/working-schedule/delete`, { id });

export const createSchedule = (data: Omit<RecordTypes, 'id'>) =>
  request.post<Omit<RecordTypes, 'id'>, undefined>(`/user/working-schedule/create`, data);

export const updateSchedule = (data: { body: any; id: any }) =>
  request.put<any, any>(`/user/working-schedule/update/${data?.id}`, data.body);

export const getWorkingScheduleStatistic = (params: IScheduleParams) =>
  request.get<IScheduleParams, ResponseData<ISCheduleStatisticResponse>>(
    `/user/working-schedule/statistic`,
    params
  );

export const getWorkingScheduleById = (params: IScheduleParams, id: string | number) =>
  request.get(`/user/working-schedule/${id}`, params);

export const getWorkingSchedule = (params: IScheduleParams) =>
  request.get<IScheduleParams, ResponseData<IScheduleListReponse>>(
    `/user/working-schedule/list`,
    params
  );

export const getReturnToWorkStaff = (params: { date: string }) =>
  request.get<{ date: string }, IReturnToWorkStaffList>('/user/absence-staff/back-to-work', params);

export const getReturnToWorkVehicle = (params?: IReturnToWorkParams) =>
  request.get<IReturnToWorkParams, ResponseData<AbsenceVehicleList>>(
    '/user/absence-vehicle/closet',
    params
  );

export const getAbsenceDetailStaff = (id?: number) =>
  request.get<unknown, ResponseData<IAbsenceStaffData>>(`/user/absence-staff/${id}`);

export const getAbsenceDetailVehicle = (id?: number) =>
  request.get<unknown, ResponseData<IAbsenceData>>(`/user/absence-vehicle/detail/${id}`);
