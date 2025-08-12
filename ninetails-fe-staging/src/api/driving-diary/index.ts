import { request } from '@/api/request';
import { DATE_FORMAT } from '@/constants';
import { PaginationParams, ResponseData } from '@/interfaces';
import {
  CreateLandfillTypes,
  DataTableParams,
  DrivingRecordInterface,
  ExportDrivingDiaryParams,
  GetDrivingRecordPrams,
  GetSignatureParams,
  LandfillRecord,
  RecordDataTable,
  SignSignatureParams,
  SignatureParams,
} from '@/interfaces/driving-diary';

interface RouteListResponse {
  data: any[];
  total: number;
}
export const getRouteList = (params: PaginationParams) =>
  request.post<PaginationParams, ResponseData<RouteListResponse>>('/user/route/list', params);

export const getCurrentSignature = () =>
  request.get<unknown, ResponseData<any>>('/user/signature/get');

export const createSignature = (params: SignatureParams) =>
  request.post<SignatureParams, ResponseData<RouteListResponse>>('/user/signature/create', params);

export const getSignature = (params: GetSignatureParams) =>
  request.post<GetSignatureParams, ResponseData<any>>('/user/signature/signed', {
    ...params,
    date: (params.date as any).format(DATE_FORMAT.DEFAULT),
  });

export const signSignature = (params: SignSignatureParams) =>
  request.post<SignSignatureParams, ResponseData<any>>('/user/signature/sign', params);

export const deleteSignature = (params: SignSignatureParams) =>
  request.delete<SignSignatureParams, ResponseData<any>>('/user/signature/delete', params);

export const getDrivingRecord = (params: GetDrivingRecordPrams) =>
  request.post<GetDrivingRecordPrams, ResponseData<any>>('/user/driving-record/drive/get', params);

export const saveDrivingRecord = (params: DrivingRecordInterface) =>
  request.post<DrivingRecordInterface, ResponseData<any>>(
    '/user/driving-record/drive/save',
    params
  );

export const createLandfill = (params: CreateLandfillTypes) =>
  request.post<CreateLandfillTypes, ResponseData<any>>(
    '/user/driving-record/landfill/create',
    params
  );

export const updateLandfill = (params: CreateLandfillTypes) =>
  request.put<CreateLandfillTypes, ResponseData<any>>(
    `/user/driving-record/landfill/update/${params.id}`,
    params
  );

export const getLandfill = (params: PaginationParams) =>
  request.get<PaginationParams, ResponseData<LandfillRecord>>(
    '/user/driving-record/landfill/get',
    params
  );

export const getDataTable = (params: DataTableParams) =>
  request.post<DataTableParams, ResponseData<RecordDataTable[]>>(
    '/user/driving-diary/data-table',
    params
  );

export const exportDrivingDiary = (params: ExportDrivingDiaryParams) =>
  request.post<ExportDrivingDiaryParams, Blob>('/user/driving-diary/export', params, {
    responseType: 'blob',
  });
