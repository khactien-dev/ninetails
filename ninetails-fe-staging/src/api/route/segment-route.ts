import { ResponseData, RouteParams, RouteRequest, SegmentRouteDataset } from '@/interfaces';
import { Key } from 'react';

import { request } from '../request';

export const getSegmentsRoute = (params?: RouteParams) =>
  request.post<RouteParams, ResponseData<{ data: SegmentRouteDataset[] }>>(
    '/user/segment-route/list',
    params
  );

export const deleteSegmentRoute = (ids: Key[]) =>
  request.delete('/user/segment-route/delete-many', { ids: ids.map((item) => Number(item)) });

export const createSegmentRoute = (data: RouteRequest<Omit<SegmentRouteDataset, 'id'>[]>) =>
  request.post<RouteRequest<Omit<SegmentRouteDataset, 'id'>[]>, { data: SegmentRouteDataset[] }>(
    `/user/segment-route/create`,
    data
  );

export const importSegmentRoute = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/user/segment-route/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateSegmentRoute = (data: SegmentRouteDataset[]) =>
  request.put<any, any>(`/user/segment-route/update-many`, {
    data: data.map(({ id, ...rest }) => ({
      ...rest,
      updateId: Number(id),
    })),
  });
