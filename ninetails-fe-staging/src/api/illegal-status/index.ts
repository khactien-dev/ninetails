import { request } from '@/api/request';
import { IParams } from '@/components/illegal-status/index.utils';
import { IllegalCollectData, ResponseData } from '@/interfaces';

export const getRoutes = () =>
  request.get<IParams, ResponseData<string[]>>('/base-metric/route-list');

export const getIllegalMetrics = (params?: IParams) =>
  request.get<IParams, ResponseData<IllegalCollectData>>(
    '/base-metric/illegal-discharge/search',
    params
  );
