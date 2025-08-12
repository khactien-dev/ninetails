export interface IJwtPayload {
  id: number;
  email?: string;
  role?: string;
  staff_id?: number;
  tenant?: string;
  full_name?: string;
  contractEndDate?: Date | string;
  contractStartDate?: Date | string;
  tenant_id?: number;
  permission?: any;
}

export interface IJwtRefreshToken {
  id: number;
  exp?: Date;
  opLogin?: boolean;
}
