import { request } from '@/api/request';
import { DashboardRequest, ResponseData } from '@/interfaces';
import { DashboardData } from '@/interfaces';

interface LogoData {
  id: number;
  image: string;
}

export const getDashboardData = (params: DashboardRequest) =>
  request.get<DashboardRequest, ResponseData<DashboardData>>('/base-metric/dashboard', params);

export const updateLogo = (data: FormData) =>
  request.post<FormData, ResponseData<LogoData>>('/user/upload-logo', data);
