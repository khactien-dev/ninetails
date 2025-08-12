import { BaseOptionType } from 'antd/es/select';

export enum ACTIONS_CHART_KEY {
  AVG = 'avg',
  CUMULATION = 'cumulation',
  TOTAL = 'total',
  FULL_SCREEN = 'full_screen',
  PLAY = 'play',
}

export enum CHART_TABS {
  DRIVING_ROUTE = 'driving_route',
  DRIVING_ROUTE_EXTENDED = 'driving_route_extended',
  COLLECT_COUNT = 'collect_count',
  COLLECT_COUNT_EXTENDED = 'collect_count_extended',
  GRAPH_BUILDER_SETTING = 'graph_builder_setting',
}

export enum TOOLTIP_TABS {
  DISTANCE = 'distance',
  TIME = 'time',
  QUANTITY = 'quantity',
  WEIGHT = 'weight',
  VOLUME = 'volume',
}

export enum CHART_TYPE {
  COMMON = 'common',
  DRIVING_ROUTE = 'driving_route',
  DRIVING_ROUTE_EXTENDED = 'driving_route_extended',
  COLLECT_COUNT_COLUMN = 'collect_count_column',
  COLLECT_COUNT_COLUMN_EXTENDED = 'collect_count_column_extended',
  COLLECT_COUNT_LINE = 'collect_count_line',
  COLLECT_COUNT_LINE_EXTENDED = 'collect_count_line_extended',
}

export const TOOLTIP_COLLECT_COUNT_TABS = [
  {
    key: TOOLTIP_TABS.QUANTITY,
    label: '수량',
  },

  {
    key: TOOLTIP_TABS.WEIGHT,
    label: '무게',
  },

  {
    key: TOOLTIP_TABS.VOLUME,
    label: '부피',
  },
];

export const TOOLTIP_DRIVING_ROUTE_TABS = [
  {
    key: TOOLTIP_TABS.DISTANCE,
    label: '거리',
  },

  {
    key: TOOLTIP_TABS.TIME,
    label: '시간',
  },
];

export const trashBagType = [
  '5L_gen',
  '10L_gen',
  '10L_reu',
  '20L_gen',
  '20L_reu',
  '30L_gen',
  '50L_gen',
  '50L_pub',
  '75L_gen',
  '75L_pub',
  'ext',
  'etc',
];

export const opratorOptions: Array<BaseOptionType> = [
  {
    label: 'AND',
    value: 'AND',
  },
  {
    label: 'OR',
    value: 'OR',
  },
];

export const purposeOptions: Array<BaseOptionType> = [
  {
    label: '추세 분석',
    value: 'trend',
  },
  {
    label: '상관 분석',
    value: 'correlation ',
    disabled: true,
  },
  {
    label: '기술 분석',
    value: 'descriptive ',
    disabled: true,
  },
  {
    label: '분산 분석',
    value: 'ANOVA',
    disabled: true,
  },
  {
    label: '군집 분석',
    value: 'clustering',
    disabled: true,
  },
];

export const xOptions: Array<BaseOptionType> = [
  {
    label: 'TimeStamp',
    value: 'timestamp',
  },
];

export const DOMAINS = {
  STANDARD_CORE: 'standardScore',
  COLLECT_DISTANCE: 'collectDistance',
  OTHER_DISTANCE: 'otherDistance',
  COLLECT_TIME: 'collectTime',
  OTHER_TIME: 'otherTime',
  COLLECT_COUNT: 'collectCount',
};

export const yOptions: Array<BaseOptionType> = [
  {
    label: 'L1 Standard Score',
    value: DOMAINS.STANDARD_CORE,
  },
  {
    label: 'L2 Collect Distance',
    value: DOMAINS.COLLECT_DISTANCE,
  },
  {
    label: 'L2 Other Distance',
    value: DOMAINS.OTHER_DISTANCE,
  },
  {
    label: 'L2 Collect Time',
    value: DOMAINS.COLLECT_TIME,
  },
  {
    label: 'L2 Other Time',
    value: DOMAINS.OTHER_TIME,
  },
  {
    label: 'L2 Collect Count',
    value: DOMAINS.COLLECT_COUNT,
  },
];

export const chartTypeOptions = (disableBar: boolean): Array<BaseOptionType> => {
  return [
    {
      label: '바',
      value: 'bar',
      disabled: disableBar,
    },
    {
      label: '라인',
      value: 'line',
    },
    {
      label: '산점도',
      value: 'scatterPlot',
      disabled: true,
    },
    {
      label: '도수분포',
      value: 'histogram',
      disabled: true,
    },
  ];
};

export const conditionOptions: Array<BaseOptionType> = [
  {
    label: 'Equals',
    value: 'Equals',
  },
  {
    label: 'Greater than',
    value: 'Greater than',
  },
  {
    label: 'Greater than or equals',
    value: 'Greater than or equals',
  },
  {
    label: 'Less than',
    value: 'Less than',
  },
  {
    label: 'Less than or equals',
    value: 'Less than or equals',
  },
  {
    label: 'Not equal',
    value: 'Not equal',
  },
];
export const L2_TYPE_EN = {
  OTHER_DISTANCE: 'otherDistance',
  OTHER_DURATION: 'otherDuration',
  COLLECT_DISTANCE: 'collectDistance',
  COLLECT_DURATION: 'collectDuration',
  COLLECT_COUNT: 'collectCount',
};
export const L2_TYPE_KR = {
  OTHER_DISTANCE: '기타 거리',
  OTHER_DURATION: '기타 시간',
  COLLECT_DISTANCE: '수거 거리',
  COLLECT_DURATION: '수거 시간',
  COLLECT_COUNT: '수거량',
};
