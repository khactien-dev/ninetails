export interface IJwtPayload {
  id: number;
  email?: string;
  role?: string;
  staff_id?: number;
  tenant?: string;
  contractEndDate: string;
}

export interface IJwtRefreshToken {
  id: number;
  exp?: Date;
}
