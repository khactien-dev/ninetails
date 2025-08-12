import { MetadataDataset, ResponseData, RouteParams, RouteRequest } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getMetadata = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: MetadataDataset[] }>>(
    '/user/metadata/list',
    params
  );

export const deleteMetadata = (ids: Key[]) =>
  request.delete('/user/metadata/delete-many', { ids: ids.map((item) => Number(item)) });

export const createMetadata = (data: RouteRequest<Omit<MetadataDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<MetadataDataset, 'id'>[]>, { data: MetadataDataset[] }>(
    `/user/metadata/create`,
    data
  );

export const updateMetadata = (data: MetadataDataset[]) =>
  request.put<any, any>(`/user/metadata/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });

export const importMetadata = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/metadata/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
