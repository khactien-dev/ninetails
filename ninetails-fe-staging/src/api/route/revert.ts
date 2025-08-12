import { IRollbackHistory, PaginationParams, ResponseData } from '@/interfaces';

import { request } from '../request';

export const revertData = (data: { id: number | null; table: string }) =>
  request.post<unknown, ResponseData<any>>('/user/revert/action', data);

export const getListRevert = (params: PaginationParams & { table: string }) =>
  request.get<PaginationParams & { table: string }, ResponseData<{ data: IRollbackHistory[] }>>(
    '/user/revert/list',
    params
  );

export const exportData = (data: { table: string; type: string }) =>
  request.post<{ table: string; type: string }, Blob>('/user/route-management/export', data, {
    responseType: 'blob',
  });
