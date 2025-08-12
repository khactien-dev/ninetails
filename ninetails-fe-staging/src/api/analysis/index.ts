import { request } from '@/api/request';
import {
  CollectCountPayloadType,
  DataRouteGraphType,
  DrivingRouteDataType,
  GetCollectionStatistics,
  GetRouteList,
  GetWidgetDataset,
  GraphBuilderDataType,
  GraphCustomPayloadType,
  GraphPayloadType,
  IAnalysisParam,
  ICoreDataSetConfig,
  ICoreDataSetParams,
  IRawCoreDataItems,
  IWeightMetricResponse,
  IWidgetDatasetParam,
  ResponseData,
} from '@/interfaces';

export const getCollectionStatistics = (params?: IAnalysisParam) => {
  const { routeName, ...restParams } = params || {};
  return request.get<IAnalysisParam, ResponseData<GetCollectionStatistics>>(
    'base-metric/operation-analysis',
    {
      ...restParams,
      routeNames: routeName,
    }
  );
};

export const getRouteList = (params: null) =>
  request.get<null, GetRouteList>('base-metric/route-list', params);

export const getCoreDataSet = (params: ICoreDataSetParams) =>
  request.get<
    ICoreDataSetParams,
    {
      data: IRawCoreDataItems;
    }
  >('base-metric/core-dataset', params);

export const getWidgetDatasets = (params?: IWidgetDatasetParam) =>
  request.get<IWidgetDatasetParam, ResponseData<GetWidgetDataset>>(
    'base-metric/widget-dataset',
    params
  );

export const getDrivingRouteGraph = (params: GraphPayloadType) =>
  request.get<GraphPayloadType, ResponseData<DataRouteGraphType & DrivingRouteDataType>>(
    'base-metric/driving-route-graph',
    params
  );

export const getCollectCountGraph = (params: CollectCountPayloadType) =>
  request.get<CollectCountPayloadType, ResponseData<DataRouteGraphType>>(
    'base-metric/collect-count-graph',
    params
  );

export const getChartCustom = (payload: GraphCustomPayloadType) =>
  request.post<GraphCustomPayloadType, ResponseData<GraphBuilderDataType>>(
    'base-metric/custom-graph',
    payload
  );

export const getModuleDataSet = (body: any) =>
  request.post<any, { data: IRawCoreDataItems }>('base-metric/module-dataset', body);

export const getMetricWeight = () =>
  request.get<unknown, IWeightMetricResponse>('base-metric/metric-weight');

export const updateMetricWeight = (body: ICoreDataSetConfig) =>
  request.put<ICoreDataSetConfig, IWeightMetricResponse>('base-metric/metric-weight', body);
