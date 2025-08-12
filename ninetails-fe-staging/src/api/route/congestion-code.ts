import { CongestionCodeDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getCongestionCode = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: CongestionCodeDataset[] }>>(
    '/user/congestion/list',
    params
  );

export const deleteCongestionCode = (ids: Key[]) =>
  request.delete('/user/congestion/delete-many', { ids: ids.map((item) => Number(item)) });

export const createCongestionCode = (data: RouteRequest<Omit<CongestionCodeDataset, 'id'>[]>) =>
  request.post<
    RouteRequest<Omit<CongestionCodeDataset, 'id'>[]>,
    { data: CongestionCodeDataset[] }
  >(`/user/congestion/create`, data);

export const updateCongestionCode = (data: CongestionCodeDataset[]) =>
  request.put<any, any>(`/user/congestion/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });

export const importCongestionCode = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/congestion/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
