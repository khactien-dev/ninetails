import { request } from '@/api/request';
import { GetVehicleResponse, PaginationParams, RecordTypes, ResponseData } from '@/interfaces';
import { Key } from 'react';

export const getVehicle = (params?: PaginationParams) =>
  request.get<PaginationParams, ResponseData<GetVehicleResponse>>('/user/vehicle', params);

export const deleteVehicle = (id: number | string) =>
  request.delete<{ id: number | string }, ResponseData<GetVehicleResponse>>(`/user/vehicle/${id}`);

export const deleteManyVehicle = (ids: Key[]) =>
  request.delete(`/user/vehicle/delete-many`, { ids });

export const updateVehicle = ({
  data,
  id,
}: {
  data: Omit<RecordTypes, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'absence'>;
  id: number;
}) =>
  request.put<Omit<RecordTypes, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>, undefined>(
    `/user/vehicle/${id}`,
    data
  );

export const createVehicle = (data: Omit<RecordTypes, 'id'>) =>
  request.post<Omit<RecordTypes, 'id'>, undefined>(`/user/vehicle/create`, data);

export const updateManyVehicleStatus = ({ ids, input }: { ids: Key[]; input: any }) =>
  request.patch(`/user/vehicle/update-many`, { ids, input });
