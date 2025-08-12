import { CoreSectionDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getCoreSection = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: CoreSectionDataset[] }>>(
    '/user/core-section/list',
    params
  );

export const deleteCoreSection = (ids: Key[]) =>
  request.delete('/user/core-section/delete-many', { ids: ids.map((item) => Number(item)) });

export const createCoreSection = (data: RouteRequest<Omit<CoreSectionDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<CoreSectionDataset, 'id'>[]>, { data: CoreSectionDataset[] }>(
    `/user/core-section/create`,
    data
  );

export const importCoreSection = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/core-section/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateCoreSection = (data: CoreSectionDataset[]) =>
  request.put<any, any>(`/user/core-section/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
