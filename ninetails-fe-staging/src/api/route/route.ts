import { ResponseData, RouteDataset, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getRoute = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: RouteDataset[] }>>('/user/route/list', params);

export const deleteRoute = (ids: Key[]) =>
  request.delete('/user/route/delete-many', { ids: ids.map((item) => Number(item)) });

export const createRoute = (data: RouteRequest<Omit<RouteDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<RouteDataset, 'id'>[]>, { data: RouteDataset[] }>(
    `/user/route/create`,
    data
  );

export const updateRoute = (data: RouteDataset[]) =>
  request.put<any, any>(`/user/route/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });

export const importRoute = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/route/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
