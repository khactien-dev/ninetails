import { FindOptionsOrderValue } from 'typeorm';
import { SORTBY } from './constants/common.constant';

export interface IPaginate {
  take: number;
  skip: number;
  order: { [key: string]: SORTBY | FindOptionsOrderValue };
}

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
