import { GuideCodeDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getGuideCode = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: GuideCodeDataset[] }>>(
    '/user/guide/guide-code/list',
    params
  );

export const deleteGuideCode = (ids: Key[]) =>
  request.delete('/user/guide/guide-code/delete-many', { ids: ids.map((item) => Number(item)) });

export const createGuideCode = (data: RouteRequest<Omit<GuideCodeDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<GuideCodeDataset, 'id'>[]>, { data: GuideCodeDataset[] }>(
    `/user/guide/guide-code/create`,
    data
  );

export const importGuideCode = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/guide/guide-code/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateGuideCode = (data: GuideCodeDataset[]) =>
  request.put<any, any>(`/user/guide/guide-code/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
