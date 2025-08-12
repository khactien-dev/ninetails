import { BaseIndex } from './base.index';

export class collect_metrics extends BaseIndex {
  customer_id: string; // Ex: "GS011"
  topic: string; // "drive_metrics"
  data: collectMetricsData;
}

export class collectMetricsData {
  timestamp: Date; // "2024-09-25T02:51:38.705Z"
  dispatch_no: string; // "20240531-S011"
  drive_mode: number; // 7
  section_name: string; // "광주 85사 0011"
  segment_id: number;
  route_id: number;
  section_id: number;
  '5L_gen': number[];
  '10L_gen': number[];
  '10L_reu': number[];
  '20L_gen': number[];
  '20L_reu': number[];
  '30L_gen': number[];
  '50L_gen': number[];
  '50L_pub': number[];
  '75L_gen': number[];
  '75L_pub': number[];
  ext: number[];
  etc: number[];
}
