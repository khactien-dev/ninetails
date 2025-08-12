import { request } from '@/api/request';
import {
  GetUserManagementResponse,
  IRole,
  IUser,
  PaginationParams,
  ResponseData,
} from '@/interfaces';
import { Key } from 'react';

export const getRoles = () =>
  request.get<undefined, ResponseData<IRole[]>>('/user/get-permissions');

export const getUsers = (params?: PaginationParams) =>
  request.get<PaginationParams, ResponseData<GetUserManagementResponse>>('/user', params);

export const updateUser = ({
  data,
  id,
}: {
  data: Omit<IUser, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'email' | 'password'>;
  id: number;
}) =>
  request.put<
    Omit<IUser, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'email' | 'password'>,
    undefined
  >(`/user/update/${id}`, data);

export const updateUserStatus = ({ id, status }: { id: Key[]; status: number }) =>
  request.put(`/user/update-status`, { id, status });

export const createUser = (
  data: Omit<IUser, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
) =>
  request.post<Omit<IUser, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>, undefined>(
    `/user/create`,
    data
  );

export const deleteUser = (id: Key[]) => request.delete(`/user/delete-users`, { id });

export const resetPasswordUser = ({ id }: { id: Key[] }) =>
  request.post(`/user/reset-multi-password`, { id });
