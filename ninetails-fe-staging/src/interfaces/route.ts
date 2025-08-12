import { ColumnTitle, Key } from 'antd/es/table/interface';

import { PaginationParams } from './common';

export interface ColumnOption {
  value: Key | undefined;
  label: ColumnTitle<any>;
}

export interface RouteQuery {
  column: string;
  operator: string;
  value: number | string;
  logical?: string;
}

export interface RouteParams extends PaginationParams {
  query?: RouteQuery[];
  current?: number;
}

export interface IRollbackHistory {
  id: number;
  key: string;
  new_data: string;
  old_data: string;
  table: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  version_id: string | null;
}

// export interface RouteParams {
//   [query: string]: {
//     operator: string;
//     value: string;
//     column: string;
//     logical?: string;
//   };
// }

export interface RouteRequest<T> {
  data: T;
}

export interface SectionDataset {
  id: number;
  route_id: number;
  name: string;
  point_index: number;
  point_count: number;
  congestion: number;
  distance: number;
  collect_count: number;
  duration: number;
  collect_volume: number;
}

export interface SegmentDataset {
  title: string;
  key: string;
  dataIndex: string;
  name: string;
  congestion: number;
  must_pass: boolean;
  manual_collect: boolean;
  distance: number;
  collect_count: number;
  segment_line: number[][];
  id: number;
  operator: string;
  duration: number;
  collect_volume: number;
}

export interface CoreSectionDataset {
  id: number;
  name: string;
  segment_id: number;
  route_id: number;
  type: string;
  point_index: number;
  route_type: string;
}

export interface PointDataset {
  id: number;
  name: string;
  segment_id: number;
  point_index: number;
}

export interface SegmentRouteDataset {
  id: number;
  segment_id: number;
  route_id: number;
  section_id: number;
}

export interface MetadataDataset {
  id: number;
  table_name: string;
  version: string;
  update_by: string;
  update_time: string;
}

export interface GuideDataset {
  id: number;
  route_id: number;
  point_index: number;
  type: number;
  instructions: string;
  distance: number;
  duration: number;
  bbox: number[][][];
  point_count: number;
}

export interface GuideCodeDataset {
  id: number;
  code: number;
  description: string;
}

export interface CongestionCodeDataset {
  id: number;
  code: number;
  description: string;
}

export interface RouteDataset {
  id: number;
  name: string;
  start: number[];
  goal: number[];
  distance: number;
  duration: number;
  bbox: number[][][];
  path: number[][];
  collect_count: number;
  collect_volume: number;
  type: string;
}
