import {
  NotificationItemType,
  PaginationParams,
  ResponseData,
  SettingNotificationDataType,
} from '@/interfaces';

import { request } from '../request';

export type ResponseNotifications = ResponseData<
  { data: Array<NotificationItemType> } & {
    count_unread: number;
  }
>;

export const getNotifications = (params: PaginationParams) =>
  request.get<PaginationParams, ResponseNotifications>('/user/notification', params);

export const getDetailSettingNotifications = () =>
  request.get<unknown, ResponseData<SettingNotificationDataType>>(
    '/user/setting-notification/detail'
  );

export const updateReadNotification = (id: number) =>
  request.post(`/user/notification/mark-read/${id}`);

export const updateReadAllNotification = () => request.post('/user/notification/mark-read-all');

export const updateSettingNotifications = (data: SettingNotificationDataType) =>
  request.put('/user/setting-notification/update', data);
