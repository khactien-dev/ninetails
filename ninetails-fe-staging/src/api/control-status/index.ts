import { request } from '@/api/request';
import { IParams } from '@/components/control-status/index.utils';
import { IMetrics, ResponseData } from '@/interfaces';

export const getMetrics = (params?: IParams) =>
  request.get<IParams, ResponseData<IMetrics>>('/base-metric', params);

export const getAreas = () => request.get<IParams, ResponseData<any>>('/base-metric/polygon');

export const getMetricDetail = (params: { vehicleNumber: string; date?: string }) =>
  request.get<{ vehicleNumber: string; date?: string }, ResponseData<IMetrics>>(
    '/base-metric',
    params
  );

export const getRoutes = () =>
  request.get<IParams, ResponseData<string[]>>('/base-metric/route-list');
