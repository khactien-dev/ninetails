import {
  createCongestionCode,
  createMetadata,
  createRoute,
  createSegment,
  createSegmentRoute,
  deleteCongestionCode,
  deleteManySegment,
  deleteMetadata,
  deleteRoute,
  deleteSegmentRoute,
  exportData,
  getCongestionCode,
  getListRevert,
  getListSegment,
  getMetadata,
  getRoute,
  getSchemaData,
  getSegmentsRoute,
  importCongestionCode,
  importMetadata,
  importRoute,
  importSegment,
  importSegmentRoute,
  revertData,
  updateCongestionCode,
  updateMetadata,
  updateRoute,
  updateSegment,
  updateSegmentRoute,
} from '@/api/route';
import {
  createCoreSection,
  deleteCoreSection,
  getCoreSection,
  importCoreSection,
  updateCoreSection,
} from '@/api/route/core-section';
import { createGuide, deleteGuide, getGuide, importGuide, updateGuide } from '@/api/route/guide';
import {
  createGuideCode,
  deleteGuideCode,
  getGuideCode,
  importGuideCode,
  updateGuideCode,
} from '@/api/route/guide-code';
import { createPoint, deletePoint, getPoint, importPoint, updatepoint } from '@/api/route/point';
import {
  createSection,
  deleteSection,
  getSection,
  importSection,
  updateSection,
} from '@/api/route/section';
import useAppMutation from '@/hooks/useAppMutation';
import useAppQuery from '@/hooks/useAppQuery';
import { PaginationParams, RouteParams } from '@/interfaces';

// Erd
export const useGetSchemaData = () => {
  return useAppQuery({
    queryKey: ['schema-route'],
    queryFn: () => getSchemaData(),
  });
};

// Revert data
export const useRevertData = () => {
  return useAppMutation(revertData);
};

export const useGetListRevert = (params: PaginationParams & { table: string }, enabled: boolean) =>
  useAppQuery({
    queryKey: ['revert-list', params],
    queryFn: () => getListRevert(params),
    gcTime: 0,
    enabled,
  });

// Export data
export const useExportData = () => {
  return useAppMutation(exportData);
};

// Section
export const useGetListSection = (params: any) =>
  useAppQuery({
    queryKey: ['section-list', params],
    queryFn: () => getSection(params),
    gcTime: 0,
  });

export const useDeleteManySection = () => {
  return useAppMutation(deleteSection);
};

export const useCreateSection = () => {
  return useAppMutation(createSection);
};

export const useImportSection = () => {
  return useAppMutation(importSection);
};

export const useUpdateSection = () => {
  return useAppMutation(updateSection);
};

// Core Section
export const useGetListCoreSection = (params: any) =>
  useAppQuery({
    queryKey: ['core-section-list', params],
    queryFn: () => getCoreSection(params),
    gcTime: 0,
  });

export const useDeleteManyCoreSection = () => {
  return useAppMutation(deleteCoreSection);
};

export const useCreateCoreSection = () => {
  return useAppMutation(createCoreSection);
};

export const useImportCoreSection = () => {
  return useAppMutation(importCoreSection);
};

export const useUpdateCoreSection = () => {
  return useAppMutation(updateCoreSection);
};

// Point
export const useGetListPoint = (params: any) =>
  useAppQuery({
    queryKey: ['point-list', params],
    queryFn: () => getPoint(params),
    gcTime: 0,
  });

export const useDeleteManyPoint = () => {
  return useAppMutation(deletePoint);
};

export const useCreatePoint = () => {
  return useAppMutation(createPoint);
};

export const useImportPoint = () => {
  return useAppMutation(importPoint);
};

export const useUpdatePoint = () => {
  return useAppMutation(updatepoint);
};

// Segment
export const useGetListSegment = (params: any) =>
  useAppQuery({
    queryKey: ['segment-list', params],
    queryFn: () => getListSegment(params),
    gcTime: 0,
  });

export const useDeleteManySegment = () => {
  return useAppMutation(deleteManySegment);
};

export const useCreateSegment = () => {
  return useAppMutation(createSegment);
};

export const useImportSegment = () => {
  return useAppMutation(importSegment);
};

export const useUpdateSegment = () => {
  return useAppMutation(updateSegment);
};
// Guide
export const useGetGuide = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['guide-list', params],
    queryFn: () => getGuide(params),
  });

export const useImportGuide = () => {
  return useAppMutation(importGuide);
};

export const useUpdateGuide = () => {
  return useAppMutation(updateGuide);
};
export const useCreateGuide = () => {
  return useAppMutation(createGuide);
};

export const useDeleteManyGuide = () => {
  return useAppMutation(deleteGuide);
};

// Guide code
export const useGetGuideCode = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['guide-code-list', params],
    queryFn: () => getGuideCode(params),
    gcTime: 0,
  });

export const useDeleteManyGuideCode = () => {
  return useAppMutation(deleteGuideCode);
};

export const useCreateGuideCode = () => {
  return useAppMutation(createGuideCode);
};

export const useImportGuideCode = () => {
  return useAppMutation(importGuideCode);
};

export const useUpdateGuideCode = () => {
  return useAppMutation(updateGuideCode);
};

// Segment route
export const useCreateSegmentRoute = () => {
  return useAppMutation(createSegmentRoute);
};

export const useImportSegmentRoute = () => {
  return useAppMutation(importSegmentRoute);
};

export const useUpdateSegmentRoute = () => {
  return useAppMutation(updateSegmentRoute);
};

export const useDeleteManySegmentRoute = () => {
  return useAppMutation(deleteSegmentRoute);
};
export const useGetListSegmentRoute = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['segment-route-list', params],
    queryFn: () => getSegmentsRoute(params),
    gcTime: 0,
  });

// Metadata
export const useGetMetadata = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['metadata-list', params],
    queryFn: () => getMetadata(params),
    gcTime: 0,
  });

export const useDeleteManyMetadata = () => {
  return useAppMutation(deleteMetadata);
};

export const useCreateMetadata = () => {
  return useAppMutation(createMetadata);
};

export const useUpdateMetadata = () => {
  return useAppMutation(updateMetadata);
};

export const useImportMetadata = () => {
  return useAppMutation(importMetadata);
};

// Congestion code
export const useGetCongestionCode = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['congestion-code-list', params],
    queryFn: () => getCongestionCode(params),
    gcTime: 0,
  });

export const useDeleteManyCongestionCode = () => {
  return useAppMutation(deleteCongestionCode);
};

export const useCreateCongestionCode = () => {
  return useAppMutation(createCongestionCode);
};

export const useImportCongestionCode = () => {
  return useAppMutation(importCongestionCode);
};

export const useUpdateCongestionCode = () => {
  return useAppMutation(updateCongestionCode);
};

// Route
export const useGetRoute = (params: RouteParams) =>
  useAppQuery({
    queryKey: ['route-list', params],
    queryFn: () => getRoute(params),
    gcTime: 0,
  });

export const useDeleteManyRoute = () => {
  return useAppMutation(deleteRoute);
};

export const useCreateRoute = () => {
  return useAppMutation(createRoute);
};

export const useUpdateRoute = () => {
  return useAppMutation(updateRoute);
};

export const useImportRoute = () => {
  return useAppMutation(importRoute);
};
