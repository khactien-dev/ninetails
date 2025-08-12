import { BaseIndex } from './base.index';

export class drive_metrics extends BaseIndex {
  customer_id: string; // Ex: "GS011"
  topic: string; // "drive_metrics"
  data: driveMetricsData;
}

export class driveMetricsData {
  timestamp: Date; // "2024-09-25T02:51:38.705Z"
  drive_mode: number; // 7
  vehicle_id: string; // "341가5678"
  section_name: string; // "Section 11"
  route_name: string; // "011-강남구"
  gps_x: number; // 126.80395
  gps_y: number; // 35.1739996
  angle: number; // 220
  eco_score: number; // 10
  trip_time: string; // "00:00:10"
  trip_distance: number; // 1
  distance: number; // 1
  velocity: number; // 50
  speeding: number; // 50
  sudden_accel: number; // 0
  sudden_break: number; // 0
  route_id: string;
  section_id: number;
}

export const driveMetricMapping = {
  mappings: {
    properties: {
      change_mode: {
        type: 'boolean',
      },
      customer_id: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      data: {
        properties: {
          angle: {
            type: 'long',
          },
          dispatch_no: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          drive_mode: {
            type: 'long',
          },
          eco_score: {
            type: 'long',
          },
          gps_x: {
            type: 'float',
          },
          gps_y: {
            type: 'float',
          },
          route_name: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          section_name: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          speeding: {
            type: 'long',
          },
          sudden_accel: {
            type: 'long',
          },
          sudden_break: {
            type: 'long',
          },
          timestamp: {
            type: 'date',
          },
          trip_distance: {
            type: 'float',
          },
          trip_time: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          vehicle_id: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          velocity: {
            type: 'long',
          },
        },
      },
      topic: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
    },
  },
};
