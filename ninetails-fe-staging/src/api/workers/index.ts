import { request } from '@/api/request';
import { GetWorkersResponse, IWorker, PaginationParams, ResponseData } from '@/interfaces';
import { Key } from 'react';

export const getWorkers = (params?: PaginationParams) =>
  request.get<PaginationParams, ResponseData<GetWorkersResponse>>('/user/staff', params);

export const updateWorker = ({
  data,
  id,
}: {
  data: Omit<IWorker, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'absence_staff'>;
  id: number;
}) =>
  request.put<
    Omit<IWorker, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'absence_staff'>,
    undefined
  >(`/user/staff/update/${id}`, data);

export const updateWorkerStatus = ({ id, status }: { id: Key[]; status: number }) =>
  request.put(`/user/staff/update-status`, { id, status });

export const createWorker = (
  data: Omit<IWorker, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
) =>
  request.post<Omit<IWorker, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>, undefined>(
    `/user/staff/create`,
    data
  );

export const deleteWorker = ({ id, password }: { id: Key[]; password: string }) =>
  request.delete(`/user/staff/delete`, { id, password });
