import { ResponseData, RouteParams, RouteRequest, SectionDataset } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getSection = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: SectionDataset[] }>>('/user/section/list', params);

export const deleteSection = (ids: Key[]) =>
  request.delete('/user/section/delete-many', { ids: ids.map((item) => Number(item)) });

export const createSection = (data: RouteRequest<Omit<SectionDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<SectionDataset, 'id'>[]>, { data: SectionDataset[] }>(
    `/user/section/create`,
    data
  );

export const importSection = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/section/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateSection = (data: SectionDataset[]) =>
  request.put<any, any>(`/user/section/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
