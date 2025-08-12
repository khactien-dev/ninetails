import { getIllegalMetrics, getRoutes } from '@/api/illegal-status';
import { IParams } from '@/components/illegal-status/index.utils';
import useAppQuery from '@/hooks/useAppQuery';

export const useGetMetrics = (params: IParams) => {
  return useAppQuery({
    queryKey: ['metrics'],
    queryFn: () => getIllegalMetrics(params),
  });
};

export const useGetRoute = () =>
  useAppQuery({
    queryKey: ['routes'],
    queryFn: () => getRoutes(),
  });
