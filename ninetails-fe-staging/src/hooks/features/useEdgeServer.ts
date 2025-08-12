import {
  createEdgeServer,
  deleteEdgeServer,
  deleteManyEdgeServers,
  getEdgeServerDetail,
  getEdgeServers,
  getWeightConfig,
  updateEdgeServer,
  updateManyEdgeServers,
  updateWeightConfig,
} from '@/api/edge-server';
import { getVehicle } from '@/api/vehicle';
import useAppQuery from '@/hooks/useAppQuery';

import useAppMutation, { AppMutationOptions } from '../useAppMutation';

export const useGetEdgeServers = (params?: any) => {
  return useAppQuery({
    queryKey: ['edge-servers', params],
    queryFn: () => getEdgeServers(params),
  });
};

export const useGetMetricDetail = (params: { id: number }) =>
  useAppQuery({
    queryKey: ['edge-server-detail'],
    queryFn: () => getEdgeServerDetail(params),
    enabled: !!params.id,
  });

export const useUpdateEdgeServer = (options?: AppMutationOptions) =>
  useAppMutation(updateEdgeServer, {
    useAppMutationProps: options,
  });

export const useCreateEdgeServer = (options?: AppMutationOptions) =>
  useAppMutation(createEdgeServer, {
    useAppMutationProps: options,
  });

export const useDeleteEdgeServer = (options?: AppMutationOptions) =>
  useAppMutation(deleteEdgeServer, {
    useAppMutationProps: options,
  });

export const useDeleteManyEdgeServer = (options?: AppMutationOptions) =>
  useAppMutation(deleteManyEdgeServers, {
    useAppMutationProps: options,
  });

export const useUpdateManyEdgeServer = (options?: AppMutationOptions) =>
  useAppMutation(updateManyEdgeServers, {
    useAppMutationProps: options,
  });

export const useGetVehicleMutation = (options?: AppMutationOptions) =>
  useAppMutation(getVehicle, {
    useAppMutationProps: options,
  });

export const useGetWeightConfigQuery = () => {
  return useAppQuery({
    queryKey: ['config-weight'],
    queryFn: () => getWeightConfig(),
  });
};

export const useUpdateWeightConfigMutation = (options?: AppMutationOptions) =>
  useAppMutation(updateWeightConfig, {
    useAppMutationProps: options,
  });
