import { request } from '@/api/request';
import {
  AbsenceStaffList,
  AbsenceVehicleList,
  IAbsenceData,
  IAbsenceStaffData,
  IAbsenceStaffParam,
  IAbsenceVehicleParam,
  IAddAbsence,
  IAddAbsenceStaff,
  IUpdateAbsence,
  IUpdateAbsenceStaff,
  ResponseData,
} from '@/interfaces';
import { Key } from 'react';

export const getAbsenceVehicleList = (params?: IAbsenceVehicleParam) =>
  request.get<IAbsenceVehicleParam, ResponseData<AbsenceVehicleList>>(
    '/user/absence-vehicle/list',
    params
  );

export const getAbsenceStaffList = (params?: IAbsenceStaffParam) =>
  request.get<IAbsenceStaffParam, ResponseData<AbsenceStaffList>>(
    '/user/absence-staff/list',
    params
  );

export const AddAbsenceVehicle = (body: IAddAbsence) =>
  request.post<IAddAbsence, ResponseData<IAbsenceData>>('/user/absence-vehicle/create', body);

export const AddAbsenceStaff = (body: IAddAbsenceStaff) =>
  request.post<IAddAbsenceStaff, ResponseData<IAbsenceData>>('/user/absence-staff/create', body);

export const removeAbsenceVehicle = (body: { ids: Key[] }) =>
  request.delete<{ ids: Key[] }, ResponseData<IAbsenceData>>(
    '/user/absence-vehicle/delete-many',
    body
  );

export const removeAbsenceStaff = (body: { ids: Key[] }) =>
  request.delete<{ ids: Key[] }, ResponseData<IAbsenceStaffData>>(
    '/user/absence-staff/delete-many',
    body
  );

export const updateAbsenceVehicle = (body: IUpdateAbsence) => {
  const { id, ...data } = body;
  return request.put<IAddAbsence, ResponseData<IAbsenceData>>(
    `/user/absence-vehicle/update/${id}`,
    data
  );
};

export const updateAbsenceStaff = (body: IUpdateAbsenceStaff) => {
  const { id, ...data } = body;
  type UpdateAbsenceStaffWithoutId = Omit<IUpdateAbsenceStaff, 'id'>;
  return request.put<UpdateAbsenceStaffWithoutId, ResponseData<IAbsenceData>>(
    `/user/absence-staff/update/${id}`,
    data
  );
};
