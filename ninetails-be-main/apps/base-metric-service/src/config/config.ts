export const Config = {
  rabbitmq: {
    user: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASS || 'guest',
    host: process.env.RABBITMQ_HOST || 'localhost:5672',
    queues: [
      'drive_metrics',
      'vehicle_route',
      'vehicle_info',
      'edge_state_metrics',
      'collect_metrics',
      // 'illegal_discharges',
      'zscore_rollup',
      'sample_queue',
    ],
  },
  opensearch: {
    indexNames: [
      'drive_metrics',
      'vehicle_route',
      'vehicle_info',
      'edge_state_metrics',
      'collect_metrics',
      // 'illegal_discharges',
      'zscore_rollup',
      'sample_queue',
    ],
  },
};
