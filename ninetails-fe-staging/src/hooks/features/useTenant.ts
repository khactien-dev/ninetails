import {
  approveTenant,
  backupData,
  getCustomerList,
  getTenantDetailForOp,
  getTenantRegister,
  getTenantRegisterById,
  getTenantRegisterList,
  opLogin,
  registTenant,
  updateCustomer,
  updateTenantByToken,
  updateTenantDetailForOp,
  updateTentantRegister,
  uploadFile,
  verifyMail,
  verifyOtp,
} from '@/api/tenant';
import { PaginationParams } from '@/interfaces';

import useAppMutation, { AppMutationOptions } from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useRegistTenantMutate = (options?: AppMutationOptions) =>
  useAppMutation(registTenant, {
    useAppMutationProps: options,
  });

export const useGetTenantRegisterQuery = ({
  enabled,
  token,
}: {
  enabled: boolean;
  token: string | null;
}) =>
  useAppQuery({
    queryKey: ['tenant_register'],
    queryFn: () => getTenantRegister(token),
    enabled: enabled,
  });

export const useGetTenantRegisterByIdQuery = ({
  enabled,
  id,
}: {
  enabled: boolean;
  id?: string | null;
}) =>
  useAppQuery({
    queryKey: ['tenant_register_by_id'],
    queryFn: () => getTenantRegisterById(id),
    enabled: enabled,
  });

export const useUpdateTenantRegisterMutate = (options?: AppMutationOptions) =>
  useAppMutation(updateTentantRegister, {
    useAppMutationProps: options,
  });

export const useVerifyMailMutate = (options?: AppMutationOptions) =>
  useAppMutation(verifyMail, {
    useAppMutationProps: options,
  });

export const useVerifyOtpMutate = (options?: AppMutationOptions) =>
  useAppMutation(verifyOtp, {
    useAppMutationProps: options,
  });

export const useUploadFile = (options?: AppMutationOptions) =>
  useAppMutation(uploadFile, {
    useAppMutationProps: options,
  });

export const useGetCustomerListQuery = ({
  enabled,
  params,
}: {
  enabled: boolean;
  params: PaginationParams;
}) =>
  useAppQuery({
    queryKey: ['customer_list', params],
    queryFn: () => getCustomerList(params),
    enabled: enabled,
  });

export const useUpdateCustomer = (options?: AppMutationOptions) =>
  useAppMutation(updateCustomer, {
    useAppMutationProps: options,
  });

export const useGetTenantRegisterListQuery = ({
  enabled,
  params,
}: {
  enabled: boolean;
  params: PaginationParams;
}) =>
  useAppQuery({
    queryKey: ['tenant_register_list', params],
    queryFn: () => getTenantRegisterList(params),
    enabled: enabled,
  });

export const useUpdateTenantByTokenMutate = (options?: AppMutationOptions) =>
  useAppMutation(updateTenantByToken, {
    useAppMutationProps: options,
  });

export const useApproveTenant = (options?: AppMutationOptions) =>
  useAppMutation(approveTenant, {
    useAppMutationProps: options,
  });

export const useOPLoginMutate = (options?: AppMutationOptions) =>
  useAppMutation(opLogin, {
    useAppMutationProps: options,
  });

export const useGetTenantDetailForOpQuery = () =>
  useAppQuery({
    queryKey: ['tenant_detail_for_op'],
    queryFn: () => getTenantDetailForOp(),
  });

export const useUpdateTenantForOpMutation = (options?: AppMutationOptions) =>
  useAppMutation(updateTenantDetailForOp, {
    useAppMutationProps: options,
  });

export const useBackUpDataMutation = () => useAppMutation(backupData);
