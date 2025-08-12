import {
  adminLogin,
  changePasswordMaster,
  changePasswordTemp,
  createPermission,
  deletePermission,
  getlUserDetail,
  permissionsInfo,
  updatePermission,
  updateUserInfo,
  userForgotPassword,
  userForgotPasswordVerifyTokenRequest,
  userLogin,
  userResetPasswordRequest,
} from '@/api/auth';

import useAppMutation, { AppMutationOptions } from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useLoginMutate = (options?: AppMutationOptions) =>
  useAppMutation(adminLogin, {
    useAppMutationProps: options,
  });

export const useUserLoginMutate = (options?: AppMutationOptions) =>
  useAppMutation(
    userLogin,
    {
      useAppMutationProps: options,
    },
    { toast: false }
  );

export const useUserForgotPasswordMutate = (options?: AppMutationOptions) =>
  useAppMutation(
    userForgotPassword,
    {
      useAppMutationProps: options,
    },
    { toast: false }
  );

export const useUserForgotPasswordVerifyTokenRequestMutate = (options?: AppMutationOptions) =>
  useAppMutation(userForgotPasswordVerifyTokenRequest, { useAppMutationProps: options });

export const useUserResetPasswordRequestMutate = (options?: AppMutationOptions) =>
  useAppMutation(userResetPasswordRequest, {
    useAppMutationProps: options,
  });

export const useGetUserDetailQuery = ({ access_token }: { access_token?: string }) => {
  return useAppQuery({
    queryKey: ['userDetail', access_token],
    queryFn: getlUserDetail,
    enabled: !!access_token,
  });
};

export const useChangePasswordMaster = () => {
  return useAppMutation(changePasswordMaster);
};

export const useUpdateUserInfo = () => {
  return useAppMutation(updateUserInfo);
};

export const useChangePasswordTemp = () =>
  useAppMutation((data: { password: string; token: string }) =>
    changePasswordTemp({ password: data.password }, data.token)
  );
export const useGetPermissionRole = (tenant_id: number) =>
  useAppQuery({
    queryKey: ['permission', tenant_id],
    queryFn: () => permissionsInfo(tenant_id),
  });
export const useDeletePermission = () => {
  return useAppMutation(deletePermission);
};
export const useCreatePermission = () => {
  return useAppMutation(createPermission);
};
export const useUpdatePermission = () => {
  return useAppMutation(updatePermission);
};
