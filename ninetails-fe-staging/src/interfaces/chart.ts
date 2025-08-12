import { ACTIONS_CHART_KEY, CHART_TABS } from '@/constants/charts';

export type DataTooltipItemType = {
  color: string;
  label: string;
  name: string;
  visible: boolean;
  x: number;
  y: number;
  lineDashType?: string;
  date?: string;
  average?: number;
  max?: number;
  min?: number;
  routeLength?: number;
  yKey?: string;
  hiddenInTooltip?: boolean;
};

export type DataTooltipType = {
  type: CHART_TABS;
  data: Array<DataTooltipItemType>;
};

export type DataPointItemType = {
  label: string;
  x?: string;
  y: number | null;
  color?: string;
  date?: string;
};

export type ChartDataItemType = {
  type: string;
  key: string;
  axisYType?: string;
  axisYKey?: string;
  visible: boolean;
  showLegend: boolean;
  name: string;
  markerSize?: string;
  markerType?: string;
  markerColor?: string;
  markerBorderColor?: string;
  markerBorderThickness?: number;
  lineDashType?: string;
  color: string;
  parentKey?: string;
  childrenKeys?: Array<string>;
  showChildLegend?: boolean;
  dataPoints: Array<DataPointItemType>;
  dataPointWidth?: number;
};

export type ActionsKeyType = {
  active: Array<ACTIONS_CHART_KEY>;
  disable: Array<ACTIONS_CHART_KEY>;
};

export type GraphPayloadType = {
  startDate: string;
  endDate: string;
  routeNames?: string;
  trashBagType?: string;
};

export type GraphPayloadCommonType = GraphPayloadType & {
  cumulation?: number;
  aggregation?: boolean;
  L3Extension?: boolean;
  L4Extension?: boolean;
};

export type CollectCountPayloadType = GraphPayloadType & {
  cumulation?: number;
  aggregation?: boolean;
  L3Extension?: boolean;
  L4Extension?: boolean;
  unit?: string;
};

export type SortedChartData = {
  legendSpLines: ChartDataItemType[];
  legendLines: ChartDataItemType[];
  legendColumns: ChartDataItemType[];
  legendStackColumns: ChartDataItemType[];
};
