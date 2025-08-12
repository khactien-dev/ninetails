import { IVerifyMailRequest, LoginResponse, PaginationParams, ResponseData } from '@/interfaces';
import {
  IApproveTenantRequest,
  ICustomerListResponse,
  ICustomerResponse,
  IOPLoginRequest,
  IRegisterRequest,
  IRegisterResponse,
  ITenant,
  ITenantRegisterListResponse,
  IUpdateCustomerRequest,
  IUploadFileResponse,
  IVerifyOtpRequest,
} from '@/interfaces/tenant';

import { request } from '../request';

export const registTenant = (body: IRegisterRequest) =>
  request.post<IRegisterRequest, ResponseData<IRegisterResponse>>('/auth/tenant/register', body);

export const getTenantRegister = (token: string | null) =>
  request.get<any, ResponseData<IRegisterResponse>>(`/auth/tenant/view/${token}`);

export const getTenantRegisterById = (id?: string | null) =>
  request.get<any, ResponseData<ICustomerResponse>>(`/auth/tenant/detail/${id}`);

export const updateTentantRegister = ({ id, body }: { id: string; body: IRegisterRequest }) =>
  request.put<IRegisterRequest, ResponseData<IRegisterResponse>>(`/auth/tenant/update/${id}`, body);

export const verifyMail = (body: IVerifyMailRequest) =>
  request.post<IVerifyMailRequest, any>('/auth/tenant/verify-email', body);

export const verifyOtp = (body: IVerifyOtpRequest) =>
  request.post<IVerifyOtpRequest, any>('/auth/tenant/confirm-verify-email', body);

export const uploadFile = (body: FormData) =>
  request.post<FormData, ResponseData<IUploadFileResponse>>('/auth/file', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getCustomerList = (params: PaginationParams) =>
  request.get<any, ResponseData<ICustomerListResponse>>(`/auth/tenant/management`, params);

export const updateCustomer = ({
  id,
  body,
}: {
  id: string | number;
  body: IUpdateCustomerRequest;
}) => request.put<IUpdateCustomerRequest, any>(`/auth/tenant/manage/${id}`, body);

export const getTenantRegisterList = (params: PaginationParams) =>
  request.get<any, ResponseData<ITenantRegisterListResponse>>(`/auth/tenant/list`, params);

export const updateTenantByToken = ({ token, body }: { token: string; body: IRegisterRequest }) =>
  request.put<IRegisterRequest, ResponseData<IRegisterResponse>>(
    `/auth/tenant/update-by-token/${token}`,
    body
  );

export const approveTenant = ({ id, body }: { id: string | number; body: IApproveTenantRequest }) =>
  request.put<IApproveTenantRequest, ResponseData<IRegisterResponse>>(
    `/auth/tenant/approve/${id.toString()}`,
    body
  );

export const opLogin = (body: IOPLoginRequest) =>
  request.post<IOPLoginRequest, ResponseData<LoginResponse>>(`/auth/user-master/op-login`, body);

export const getTenantDetailForOp = () =>
  request.get<any, ICustomerResponse>(`/auth/tenant/detail-by-op`);

export const updateTenantDetailForOp = (body: ITenant) =>
  request.put<ITenant, ICustomerResponse>(`/auth/tenant/change-info`, body);

export const backupData = () => request.post<unknown, unknown>(`/auth/tenant/backup-accept`);
