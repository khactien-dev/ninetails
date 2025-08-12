import {
  createLandfill,
  createSignature,
  deleteSignature,
  exportDrivingDiary,
  getCurrentSignature,
  getDataTable,
  getDrivingRecord,
  getLandfill,
  getRouteList,
  getSignature,
  saveDrivingRecord,
  signSignature,
  updateLandfill,
} from '@/api/driving-diary';
import { PaginationParams } from '@/interfaces';

import useAppMutation from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetRouteList = () => {
  return useAppMutation(getRouteList);
};

export const useCreateSignature = () => {
  return useAppMutation(createSignature);
};

export const useGetSignature = () => {
  return useAppMutation(getSignature);
};

export const useSignSignature = () => {
  return useAppMutation(signSignature);
};

export const useDeleteSignature = () => {
  return useAppMutation(deleteSignature);
};

export const useSaveDrivingRecord = () => {
  return useAppMutation(saveDrivingRecord);
};

export const useGetDrivingRecord = () => {
  return useAppMutation(getDrivingRecord);
};

export const useCreateLandfill = () => {
  return useAppMutation(createLandfill);
};

export const useUpdateLandfill = () => {
  return useAppMutation(updateLandfill);
};

export const useGetCurrentSignature = () =>
  useAppQuery({
    queryKey: ['signature'],
    queryFn: () => getCurrentSignature(),
    gcTime: 0,
  });

export const useGetLandfill = (params: PaginationParams) =>
  useAppQuery({
    queryKey: ['driving-diary', params],
    queryFn: () => getLandfill(params),
    gcTime: 0,
  });

export const useGetDataTable = () => useAppMutation(getDataTable);

export const useExportDrivingDiary = () => useAppMutation(exportDrivingDiary);
