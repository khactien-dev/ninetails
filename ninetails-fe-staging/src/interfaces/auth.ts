import { SelectComboBoxItem } from './common';

export interface User {
  organization?: string;
  email?: string;
  id?: number | string;
  username?: string | null;
  full_name?: string;
  staff_id?: string;
  role: string;
  exp: number;
  iat: number;
  tenant_id: number;
  last_login: string;
  phone_number: string;
  department: SelectComboBoxItem;
  position: SelectComboBoxItem;
  status: boolean;
  first_login: boolean;
  master_id?: number | string;
  permission?: any;
}

export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  imgUrl: string;
  userName: string;
  email: {
    name: string;
    verified: boolean;
  };
  phone: {
    number: string;
    verified: boolean;
  };
  sex: 'male' | 'female';
  birthday: string;
  lang: 'en' | 'de';
  country: string;
  city: string;
  address1: string;
  address2?: string;
  zipcode: number;
  website?: string;
  socials?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phone_number?: string;
  option: string;
  full_name: string;
}

export interface ForgotPasswordVerifyRequest {
  code: string;
  email: string;
  phone_number: string;
  option: string;
  full_name: string;
}

export interface ForgotPasswordVerifyResponse {
  id: number;
  code: string;
  email: string;
  type: string;
  is_resend: boolean;
}

export interface ResetForgotPasswordRequest {
  code: string | number;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  expired_access: string;
  expired_refresh: string;
  id: number;
  name: string;
  refreshToken: string;
  type: string;
}

export interface UserLoginResponse {
  user: User;
  accessToken: string;
  type: string;
  refreshToken: string;
  role: string;
  contractEndDate?: string;
  permission: {
    id: number;
    tenant_id: number;
    type: string;
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
    updater_application_management: string;
    route_management: string;
    absence_management: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface UserDetailResponse {
  data: unknown;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expired_access: string;
  expired_refresh: string;
}

export interface ChangePasswordMaster {
  passwordNew: string;
  passwordOld: string;
}

export interface UpdateUserInfo {
  full_name: string;
  phone_number: string;
}
