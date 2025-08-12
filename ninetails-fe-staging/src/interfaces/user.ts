import { ComboBoxType } from './common';

export interface IUser {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  id: number;
  key: string;
  full_name: string | null;
  username: string;
  email: string;
  phone_number: string | null;
  password: string;
  role: string;
  department?: null | ComboBoxType;
  position?: null | ComboBoxType;
  last_login: string;
  status: number;
  staff_id: number | null;
  permission?: null | IRole;
}

export interface GetUserManagementResponse {
  data: IUser[];
}

export interface IRole {
  created_at: string;
  updated_at: string;
  deleted_at: null;
  id: number;
  tenant_id: number;
  type: null | string;
  name: string;
  dashboard: string;
  work_shift: string;
  realtime_activity: string;
  operation_analysis: string;
  illegal_disposal: string;
  driving_diary: string;
  notification: string;
  user_management: string;
  company_management: string;
  staff_management: string;
  vehicle_management: string;
  route_management: string;
  absence_management: string;
  updater_application_management: string;
  usersId: null;
}
