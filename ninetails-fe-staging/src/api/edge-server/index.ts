import { request } from '@/api/request';
import { IWeightConfig, IWeightConfigResponse, ResponseData } from '@/interfaces';
import { IEdgeServer, IEdgeServerListResponse, IEdgeServerResponse } from '@/interfaces';
import { Key } from 'react';

export const getEdgeServers = (params?: any) =>
  request.get<any, ResponseData<IEdgeServerListResponse>>('/user/edge-serve', params);

export const getEdgeServerDetail = (params: { id: number }) =>
  request.get<{ id: number }, ResponseData<IEdgeServerResponse>>(`/user/edge-serve/${params.id}`);

export const updateEdgeServer = (data: { id: number; body: Partial<IEdgeServer> }) =>
  request.put<Partial<IEdgeServer>, ResponseData<IEdgeServerResponse>>(
    `/user/edge-serve/${data.id}`,
    data.body
  );

export const deleteEdgeServer = (params: { id: number }) =>
  request.delete<IEdgeServer, ResponseData<IEdgeServerResponse>>(`/user/edge-serve/${params.id}`);

export const createEdgeServer = (body: IEdgeServer) =>
  request.post<IEdgeServer, ResponseData<IEdgeServerResponse>>(`/user/edge-serve/create`, body);

export const updateManyEdgeServers = (data: { ids: Key[]; input: any }) =>
  request.patch(`/user/edge-serve/update-many`, data);

export const deleteManyEdgeServers = (data: { ids: Key[] }) =>
  request.delete(`/user/edge-serve/delete-many`, data);

export const getWeightConfig = () =>
  request.get<unknown, ResponseData<IWeightConfigResponse>>('/user/config-weight');

export const updateWeightConfig = (body: IWeightConfig) =>
  request.post<IWeightConfig, ResponseData<unknown>>('/user/config-weight', body);
