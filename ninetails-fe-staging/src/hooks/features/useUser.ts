import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  resetPasswordUser,
  updateUser,
  updateUserStatus,
} from '@/api/user';
import { PaginationParams } from '@/interfaces';

import useAppMutation from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetRoles = () =>
  useAppQuery({
    queryKey: ['user-role'],
    queryFn: () => getRoles(),
  });

export const useGetUsers = (params?: PaginationParams) =>
  useAppQuery({
    queryKey: ['user-management', params],
    queryFn: () => getUsers(params),
  });

export const useUpdateUser = () => {
  return useAppMutation(updateUser);
};

export const useCreateUser = () => {
  return useAppMutation(createUser);
};

export const useCreateUserStatus = () => {
  return useAppMutation(updateUserStatus);
};

export const useDeleteUser = () => {
  return useAppMutation(deleteUser);
};

export const useResetPasswordUser = () => {
  return useAppMutation(resetPasswordUser);
};
