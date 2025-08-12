import {
  createVehicle,
  deleteManyVehicle,
  deleteVehicle,
  getVehicle,
  updateManyVehicleStatus,
  updateVehicle,
} from '@/api/vehicle';
import useAppMutation from '@/hooks/useAppMutation';
import { PaginationParams } from '@/interfaces';

import useAppQuery from '../useAppQuery';

export const useGetVehicle = (params?: PaginationParams) =>
  useAppQuery({
    queryKey: ['vehicle', params],
    queryFn: () => getVehicle(params),
  });

export const useDeleteVehicle = () => {
  return useAppMutation(deleteVehicle);
};

export const useDeleteManyVehicle = () => {
  return useAppMutation(deleteManyVehicle);
};

export const useUpdateVehicle = () => {
  return useAppMutation(updateVehicle);
};

export const useCreatVehicle = () => {
  return useAppMutation(createVehicle);
};

export const useUpdateManyVehicleStatus = () => {
  return useAppMutation(updateManyVehicleStatus);
};
