export class zscore_rollup {
  latest: latestData;
  mean: meanData;
  standardDeviation: standardDeviationData;
  rankScore: string;
  vehicle_id: string;
  route_name: string;
  timestamp: Date;
}

class latestData {
  distanceRatios: number;
  durationRatios: number;
  collectDistance: number;
  collectDuration: number;
  collectCount: number;
}

class meanData extends latestData {}
class standardDeviationData extends latestData {}
