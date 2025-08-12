import {
  getDetailSettingNotifications,
  getNotifications,
  updateReadAllNotification,
  updateReadNotification,
  updateSettingNotifications,
} from '@/api/notifications';
import { PaginationParams } from '@/interfaces';

import useAppMutation from '../useAppMutation';
import useAppQuery from '../useAppQuery';

export const useGetMutateNotifications = () =>
  useAppMutation((params: PaginationParams) => getNotifications(params));

export const useGetSettingNotification = () =>
  useAppQuery({
    queryKey: ['setting-notification'],
    queryFn: getDetailSettingNotifications,
  });

export const useReadMutateNotificaion = () => useAppMutation(updateReadNotification);

export const useReadAllMutateNotificaion = () => useAppMutation(updateReadAllNotification);

export const useUpdateSettingNotification = () => useAppMutation(updateSettingNotifications);
