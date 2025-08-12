import { getAreas, getMetrics } from '@/api/control-status';
import { IParams } from '@/components/control-status/index.utils';
import useAppQuery from '@/hooks/useAppQuery';
import { omit } from 'lodash';

export const useGetMetrics = (params?: IParams) => {
  const newParams = params?.isArea
    ? omit(params, ['updateTime', 'vehicleId', 'isArea', 'isRealTime', 'allRoute'])
    : omit(params, ['updateTime', 'routeName', 'isArea', 'isRealTime', 'allRoute']);
  return useAppQuery({
    queryKey: ['metrics', params],
    queryFn: () => getMetrics(newParams),
    refetchInterval: params?.isRealTime ? params?.updateTime || 0 : false,
    refetchOnWindowFocus: true,
  });
};

export const useGetAreas = () => {
  return useAppQuery({
    queryKey: ['areas'],
    queryFn: () => getAreas(),
  });
};

// export const useGetMetricDetail = (params: { vehicle_id: string }) =>
//   useAppQuery({
//     queryKey: ['metric-detail'],
//     queryFn: () => getMetricDetail(params),
//     enabled: !!params.vehicle_id,
//   });
