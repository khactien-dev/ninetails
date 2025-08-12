import { BaseIndex } from './base.index';

export class vehicle_info extends BaseIndex {
  customer_id: string; // Ex: "GS011"
  topic: string; // "vehicle_info"
  data: vehicleInfoData;
}

export class vehicleInfoData {
  timestamp: Date; // "2024-09-25T02:51:38.705Z"
  dispatch_no: string; // "341가5678"
  type: string; // "압착진개차_5T"
  model: string; // "5톤 덤프식"
  vendor: string; //
  capacity_m3: number;
  capacity_kg: number;
  operation_start: Date;
  operation_end: Date;
  dispatch_status: string;
  last_maintenance: Date;
  next_maintenance: Date;
  usage: string;
  note: string;
}
