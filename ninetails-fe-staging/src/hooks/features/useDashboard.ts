import { getDashboardData, updateLogo } from '@/api/dashboard';
import { DashboardRequest } from '@/interfaces';
import { omit } from 'lodash';

import useAppMutation, { AppMutationOptions } from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetDashboard = (params: DashboardRequest) => {
  const newParams = omit(params, ['analysisTime', 'updateTime']);
  return useAppQuery({
    queryKey: ['dashboard', params],
    queryFn: () => getDashboardData(newParams),
    refetchInterval: params?.updateTime,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateLogo = (options?: AppMutationOptions) => {
  return useAppMutation(updateLogo, {
    useAppMutationProps: options,
  });
};
