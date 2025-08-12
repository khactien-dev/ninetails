import {
  createWorker,
  deleteWorker,
  getWorkers,
  updateWorker,
  updateWorkerStatus,
} from '@/api/workers';
import { PaginationParams } from '@/interfaces';

import useAppMutation from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetWorkers = (params?: PaginationParams) =>
  useAppQuery({
    queryKey: ['workers', params],
    queryFn: () => getWorkers(params),
  });

export const useUpdateWorker = () => {
  return useAppMutation(updateWorker);
};

export const useCreateWorker = () => {
  return useAppMutation(createWorker);
};

export const useCreateWorkerStatus = () => {
  return useAppMutation(updateWorkerStatus);
};

export const useDeleteWorker = () => {
  return useAppMutation(deleteWorker);
};
