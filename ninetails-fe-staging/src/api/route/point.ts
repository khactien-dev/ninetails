import { PointDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getPoint = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: PointDataset[] }>>('/user/point/list', params);

export const deletePoint = (ids: Key[]) =>
  request.delete('/user/point/delete-many', { ids: ids.map((item) => Number(item)) });

export const createPoint = (data: RouteRequest<Omit<PointDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<PointDataset, 'id'>[]>, { data: PointDataset[] }>(
    `/user/point/create`,
    data
  );

export const importPoint = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/point/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updatepoint = (data: PointDataset[]) =>
  request.put<any, any>(`/user/point/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
