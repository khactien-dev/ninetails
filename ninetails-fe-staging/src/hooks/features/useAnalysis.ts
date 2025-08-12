import {
  getChartCustom,
  getCollectCountGraph,
  getCollectionStatistics,
  getCoreDataSet,
  getDrivingRouteGraph,
  getMetricWeight,
  getModuleDataSet,
  getRouteList,
  getWidgetDatasets,
  updateMetricWeight,
} from '@/api/analysis';
import useAppQuery from '@/hooks/useAppQuery';
import {
  GraphCustomPayloadType,
  IAnalysisParam,
  ICoreDataSetConfig,
  ICoreDataSetParams,
  IWidgetDatasetParam,
} from '@/interfaces';
import { CollectCountPayloadType, GraphPayloadCommonType } from '@/interfaces/chart';

import useAppMutation from '../useAppMutation';

export const useGetCollectionStatistics = (params?: IAnalysisParam) =>
  useAppQuery({
    queryKey: ['collection-statistics', params],
    queryFn: () => getCollectionStatistics(params),
    enabled: !!params?.startDate || !!params?.endDate || !!params?.routeName,
  });

export const useGetRouteList = () =>
  useAppQuery({
    queryKey: ['route-list'],
    queryFn: () => getRouteList(null),
  });

export const useGetCoreDataSet = (params: ICoreDataSetParams) =>
  useAppQuery({
    queryKey: ['core-dataset', params],
    queryFn: () => getCoreDataSet(params),
  });

export const useGetWidgetDataset = (params?: IWidgetDatasetParam) =>
  useAppQuery({
    queryKey: ['widget-dataset', params],
    queryFn: () => getWidgetDatasets(params),
  });

export const useGetDrivingRouteGraphMutation = () =>
  useAppMutation((params: GraphPayloadCommonType) => getDrivingRouteGraph(params));

export const useGetCollectCountGraphMutation = () =>
  useAppMutation((params: CollectCountPayloadType) => getCollectCountGraph(params));

export const useCustomGraphMutation = () =>
  useAppMutation((payload: GraphCustomPayloadType) => getChartCustom(payload));

export const useGetModuleDataSetMutation = () =>
  useAppMutation((body: any) => getModuleDataSet(body));

export const useGetMetricWeighQuery = () =>
  useAppQuery({
    queryKey: ['metric-weight'],
    queryFn: () => getMetricWeight(),
  });

export const useUpdateMetricMutation = () =>
  useAppMutation((body: ICoreDataSetConfig) => updateMetricWeight(body));
