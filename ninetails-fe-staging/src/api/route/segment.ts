import { DatabaseConfig } from '@/components/visualizer-flow/types/DatabaseConfig';
import { ResponseData, RouteParams, RouteRequest, SegmentDataset } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getSchemaData = () =>
  request.get<unknown, ResponseData<DatabaseConfig>>('/user/route/erd');

export const getListSegment = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: SegmentDataset[] }>>('/user/segment/list', params);

export const deleteManySegment = (ids: Key[]) =>
  request.delete('/user/segment/delete-many', { ids: ids.map((item) => Number(item)) });

export const createSegment = (data: RouteRequest<Omit<SegmentDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<SegmentDataset, 'id'>[]>, { data: SegmentDataset[] }>(
    `/user/segment/create`,
    data
  );

export const importSegment = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return request.post(`/user/segment/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateSegment = (data: SegmentDataset[]) =>
  request.put<any, any>(`/user/segment/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
