import { BaseIndex } from './base.index';

export class vehicle_route extends BaseIndex {
  customer_id: string;
  topic: string;
  data: vehicleRouteData;
}

export class vehicleRouteData {
  timestamp: Date;
  dispatch_no: string;
  coordinates: string[];
}
