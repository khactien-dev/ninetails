export type SettingNotificationDataType = {
  start_operate: boolean;
  end_operate: boolean;
  to_trash_collection_point: boolean;
  to_landfill: boolean;
  complete_route: boolean;
  back_to_parking: boolean;
  start_other_operations: boolean;
  end_other_operations: boolean;
  start_standby_state: boolean;
  end_standby_state: boolean;
  lost_signal: boolean;
  reconnect_signal: boolean;
};

export interface NotificationItemType {
  id: number;
  user_ids: number[];
  type: string;
  vehicle_number: number | null;
  createdAt: string;
  read_at: string | null;
  route_name: string;
  id_ids?: number[];
}
