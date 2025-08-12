import { ComboBoxType } from './common';

export interface ITenant {
  organization: string;
  department: ComboBoxType | string | number;
  position: ComboBoxType | string | number;
  operator: string;
  email: string;
  phone: string;
  proof1: string;
  proof2: string;
  filename_proof1: string;
  filename_proof2: string;
  id?: string | number;
}
export interface ITenantCustom {
  organization: string;
  operator: string;
  email: string;
  phone: string;
  proof1: string;
  proof2: string;
  filename_proof1: string;
  filename_proof2: string;
  id?: string | number;
}
export interface IRegisterRequest extends ITenant {
  otp?: string | null;
  password?: string;
}

export interface IRegisterResponse extends ITenantCustom {
  id: string;
  key?: string | number;
  token?: string;
  approved_time?: string;
  schema: string;
  createdAt: string;
  department: ComboBoxType | string;
  position: ComboBoxType | string;
}

export interface IRegisterForm extends ITenant {
  guidelines?: boolean;
  terms?: boolean;
  policy?: boolean;
  conFirmMailCode?: null | string;
}

export interface IVerifyMailRequest {
  email: string;
}

export interface IVerifyOtpRequest {
  otp: string;
}

export interface IVerifyOtpResponse {
  otp: string;
}

export interface IUploadFileResponse {
  url: string;
  key: string;
  isPublic: boolean;
  result: any;
}

export interface IContract {
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  type: string;
  status: number;
}

export interface ICustomer extends ITenantCustom {
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  id: number;
  schema: string;
  department: ComboBoxType | string;
  position: ComboBoxType | string;
  token: string;
  is_agree: boolean;
  key: string;
  approved_time: string;
  contracts: IContract[];
  is_backup: boolean;
  logo: {
    image: string;
    name: string;
  };
  users: {
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    id: 18;
    email: string;
    password: string;
    role: string;
    full_name: string;
    tenant_id: 31;
    last_login: null | string;
  }[];
}

export interface ICustomerListResponse {
  data: ICustomer[];
}

export interface ICustomerResponse {
  data: ICustomer;
}

export interface ITenantRegisterListResponse {
  data: ITenant[];
}

export interface IUpdateCustomerRequest extends ITenant {
  is_agree: true;
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: any;
  contractType: any;
  password: string;
}

export interface IApproveTenantRequest {
  customerId: string | number;
}

export interface IOPLoginRequest {
  opId: string | number;
}
export interface ParamsGetPermission {
  tenant_id?: number;
}
export interface IPermission {
  id?: number | string;
  tenant_id?: number | string;
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
}
export interface IPermissionListResponse {
  data: IPermission[];
}
export interface IPermissionRequest {
  tenant_id: number | string;
  name: string;
  dashboard: string[];
  work_shift: string[];
  realtime_activity: string[];
  operation_analysis: string[];
  illegal_disposal: string[];
  driving_diary: string[];
  notification: string[];
  user_management: string[];
  staff_management: string[];
  vehicle_management: string[];
  absence_management: string[];
  company_management: string[];
  route_management: string[];
  updater_application_management: string[];
}
