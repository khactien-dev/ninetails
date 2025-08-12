import { request } from '@/api/request';
import {
  ChangePasswordMaster,
  ForgotPasswordRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  IPermissionRequest,
  LoginRequest,
  LoginResponse,
  ResetForgotPasswordRequest,
  ResponseData,
  UpdateUserInfo,
  User,
  UserLoginResponse,
} from '@/interfaces';

export const adminLogin = (body: LoginRequest) =>
  request.post<LoginRequest, ResponseData<LoginResponse>>('/admin/sign-in', body);

export const userLogin = (body: LoginRequest) =>
  request.post<LoginRequest, ResponseData<UserLoginResponse>>('/auth/login', body);

export const userForgotPassword = (body: ForgotPasswordRequest) =>
  request.post<ForgotPasswordRequest, ResponseData<any>>('/auth/forgot-password', body);

export const userForgotPasswordVerifyTokenRequest = (params: ForgotPasswordVerifyRequest) =>
  request.post<ForgotPasswordVerifyRequest, ResponseData<ForgotPasswordVerifyResponse>>(
    '/auth/verify-forgot-password',
    params
  );

export const userResetPasswordRequest = (body: ResetForgotPasswordRequest) =>
  request.post<ResetForgotPasswordRequest, ResponseData<any>>('/auth/reset-password', body);

export const getlUserDetail = () =>
  request.get<null, ResponseData<User>>('/auth/user-master/detail');

export const changePasswordMaster = (body: ChangePasswordMaster) =>
  request.put<ChangePasswordMaster, ResponseData<any>>('/auth/user-master/change-password', body);

export const updateUserInfo = (body: UpdateUserInfo) =>
  request.put<UpdateUserInfo, ResponseData<any>>('/user/update-information', body);

export const changePasswordTemp = (data: { password: string }, token: string) => {
  return request.put<typeof data, unknown>('/auth/user-master/change-password-first-login', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const permissionsInfo = (tenant_id: number) =>
  request.get<typeof tenant_id, ResponseData<any>>(`/auth/permission/${tenant_id}`);
export const deletePermission = (id: number) => request.delete(`/auth/permission/${id}`);

export const createPermission = (
  data: Omit<IPermissionRequest, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
) =>
  request.post<
    Omit<IPermissionRequest, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>,
    undefined
  >(`/auth/permission`, data);

export const updatePermission = ({ data, id }: { data: Omit<any, 'id'>; id: number }) =>
  request.put<Omit<any, 'id'>, undefined>(`/auth/permission/${id}`, data);
