export class BaseIndex {
  customer_id: string;
  topic: string;
}

export enum IndexName {
  'collect_metrics' = 'collect_metrics',
  'drive_metrics' = 'drive_metrics',
  'edge_state_metrics' = 'edge_state_metrics',
  'vehicle_info' = 'vehicle_info',
  'zscore_rollup' = 'zscore_rollup',
  'illegal_discharges' = 'illegal_discharges',
  'dashboard_for_day' = 'dashboard_for_day',
  'zscore_collect_amount_rollup' = 'zscore_collect_amount_rollup',
  'zscore_coredata_rollup' = 'zscore_coredata_rollup',
  'zscore_expand_collect_rollup' = 'zscore_expand_collect_rollup',
  'zscore_expand_other_rollup' = 'zscore_expand_other_rollup',
  'zscore_trash_bags_type_rollup' = 'zscore_trash_bags_type_rollup',
}
