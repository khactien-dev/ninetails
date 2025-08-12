import { BaseIndex } from './base.index';

export class edge_state extends BaseIndex {
  customer_id: string; // Ex: "GS011"
  topic: string; // "drive_metrics"
  data: edgeStateData;
}

export class edgeStateData {
  timestamp: Date; // "2024-09-25T02:51:38.705Z"
  // dispatch_no: string; // "20240531-S011"
  route_id: number;
  temperature: {
    cpu_avg_degree: number;
    gpu_avg_degree: number;
    soc_avg_degree: number;
  };
  utilization: {
    'cpu_avg_%': number;
    'gpu_avg_%': number;
    'mem_avg_%': number;
    'disk_avg_%': number;
  };
  data_io: {
    lte_in_total_byte: number;
    lte_out_total_byte: number;
    camera_total_byte: number;
    dtg_total_byte: number;
    disk_total_byte: number;
  };
}
