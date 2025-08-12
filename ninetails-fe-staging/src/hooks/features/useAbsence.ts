import {
  AddAbsenceStaff,
  AddAbsenceVehicle,
  getAbsenceStaffList,
  getAbsenceVehicleList,
  removeAbsenceStaff,
  removeAbsenceVehicle,
  updateAbsenceStaff,
  updateAbsenceVehicle,
} from '@/api/absence';
import { getVehicle } from '@/api/vehicle';
import { getWorkers } from '@/api/workers';
import { TYPE_TABS } from '@/components/settings/absence/index.utils';
import useAppMutation, { AppMutationOptions } from '@/hooks/useAppMutation';
import { IAbsenceStaffParam, IAbsenceVehicleParam, IVehicleList } from '@/interfaces';

import useAppQuery from '../useAppQuery';

export const useGetListVehicle = (params?: IVehicleList) =>
  useAppQuery({
    queryKey: ['getVehicle'],
    queryFn: () => getVehicle(params),
    enabled: TYPE_TABS.VEHICLE === params?.type,
  });

export const useGetListWorkers = (params?: IVehicleList) =>
  useAppQuery({
    queryKey: ['getWorkers'],
    queryFn: () => getWorkers(params),
    enabled: TYPE_TABS.STAFF === params?.type,
  });

export const useGetAbsenceVehicleList = (params?: IAbsenceVehicleParam) =>
  useAppQuery({
    queryKey: ['absenceVehicleList', params],
    queryFn: () => getAbsenceVehicleList(params),
    enabled: TYPE_TABS.VEHICLE === params?.type,
  });

export const useGetAbsenceStaffList = (params?: IAbsenceStaffParam) =>
  useAppQuery({
    queryKey: ['absenceStaffList', params],
    queryFn: () => getAbsenceStaffList(params),
    enabled: TYPE_TABS.STAFF === params?.type,
  });

export const useAddAbsenceVehicle = (options?: AppMutationOptions) =>
  useAppMutation(AddAbsenceVehicle, {
    useAppMutationProps: options,
  });

export const useAddAbsenceStaff = (options?: AppMutationOptions) =>
  useAppMutation(AddAbsenceStaff, {
    useAppMutationProps: options,
  });

export const useRemoveAbsenceVehicle = (options?: AppMutationOptions) =>
  useAppMutation(removeAbsenceVehicle, {
    useAppMutationProps: options,
  });

export const useRemoveAbsenceStaff = (options?: AppMutationOptions) =>
  useAppMutation(removeAbsenceStaff, {
    useAppMutationProps: options,
  });

export const useUpdateAbsenceVehicle = (options?: AppMutationOptions) =>
  useAppMutation(updateAbsenceVehicle, {
    useAppMutationProps: options,
  });

export const useUpdateAbsenceStaff = (options?: AppMutationOptions) =>
  useAppMutation(updateAbsenceStaff, {
    useAppMutationProps: options,
  });
