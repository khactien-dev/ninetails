import { GuideDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getGuide = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: GuideDataset[] }>>('/user/guide/list', params);

export const deleteGuide = (ids: Key[]) =>
  request.delete('/user/guide/delete-many', { ids: ids.map((item) => Number(item)) });

export const createGuide = (data: RouteRequest<Omit<GuideDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<GuideDataset, 'id'>[]>, { data: GuideDataset[] }>(
    `/user/guide/create`,
    data
  );

export const importGuide = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/guide/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateGuide = (data: GuideDataset[]) =>
  request.put<any, any>(`/user/guide/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
