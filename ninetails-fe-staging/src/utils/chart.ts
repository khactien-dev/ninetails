import { daysKorea } from '@/constants';
import { DOMAINS, trashBagType, yOptions } from '@/constants/charts';
import {
  ChartDataItemType,
  DataRouteGraphType,
  DrivingRouteDataType,
  SortedChartData,
} from '@/interfaces';
import LegendManager from '@/utils/colors';
import dayjs from 'dayjs';

export const chartColors: string[] = [
  '#FF5733', // Màu 1
  '#33FF57', // Màu 2
  '#3357FF', // Màu 3
  '#F1C40F', // Màu 4
  '#8E44AD', // Màu 5
  '#E67E22', // Màu 6
  '#2ECC71', // Màu 7
  '#3498DB', // Màu 8
  '#9B59B6', // Màu 9
  '#1ABC9C', // Màu 10
  '#34495E', // Màu 11
  '#F39C12', // Màu 12
  '#D35400', // Màu 13
  '#C0392B', // Màu 14
  '#7F8C8D', // Màu 15
  '#2980B9', // Màu 16
  '#8E44AD', // Màu 17
  '#2C3E50', // Màu 18
  '#E74C3C', // Màu 19
  '#F1C40F', // Màu 20
  '#16A085', // Màu 21
  '#27AE60', // Màu 22
  '#2980B9', // Màu 23
  '#8E44AD', // Màu 24
  '#D35400', // Màu 25
  '#C0392B', // Màu 26
  '#7F8C8D', // Màu 27
  '#34495E', // Màu 28
  '#F39C12', // Màu 29
  '#2ECC71', // Màu 30
];

const DRIVING_EXTENDS_COLOR = [
  '#4EC8F4',
  '#0070C0',
  '#00B0F0',
  '#FFDF7E',
  '#C55C10',
  '#F89645',
  '#C8E7A7',
  '#068C44',
  '#92D051',
  '#FFABD3',
  '#BC226D',
  '#FF2F91',
];

enum LEGEND_KEY {
  AVG = 'average',
  EWM = 'EWM',
  TOTAL = 'total',
}

export const getDayKorea = (date: string) => {
  return `${dayjs(date).format('M/D')} ${daysKorea[dayjs(date).day()]}`;
};

export const formatDateKorea = (date: string) =>
  `${dayjs(date).format('YYYY년 MM/DD')} ${daysKorea[dayjs(date).day()]}요일`;

export const isEWM = (type: string) => type === LEGEND_KEY.EWM;

export const handleAVGData = (data: DataRouteGraphType['AVG']) => {
  const excludeKeys = LegendManager.getExcludeKeys();

  return Object.entries(data)
    .reverse()
    .map(([key, value], index) => ({
      key: (index + 1).toString(),
      name: isEWM(key) ? '7일 평균' : '배차 평균',
      dataPoints: Object.entries(value).map(([label, y]) => ({
        label: getDayKorea(label),
        y: y ? +y.toFixed(3) : null,
        date: label,
      })),
      visible: excludeKeys.length === 0 ? true : excludeKeys.includes((index + 1).toString()),
      markerType: 'circle',
      markerSize: '10',
      markerBorderColor: isEWM(key) ? '#FF96C8' : '#7F7F7F',
      markerBorderThickness: 3,
      showLegend: true,
      showChildLegend: false,
      connectNullData: true,
      color: isEWM(key) ? '#FF96C8' : '#7F7F7F',
      type: 'spline',
      lineDashType: 'dash',
    }));
};

const handleRouteLineData = (data: DataRouteGraphType['route'], isExtend?: boolean) => {
  const colorRoutes = LegendManager.getAllRouteColors();
  const result = Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value], index) => {
      return {
        key: key,
        name: key,
        dataPoints: Object.entries(value).map(([label, y]) => ({
          label: getDayKorea(label),
          y: y ? +y.toFixed(3) : null,
          date: label,
        })),
        visible: true,
        showLegend: true,
        showChildLegend: false,
        connectNullData: true,
        color: colorRoutes[key] ?? chartColors[index],
        type: 'line',
        childrenKeys: isExtend ? ['123'] : [],
      };
    });

  return result;
};

export const formatDataDrivingRoute = (data: DrivingRouteDataType, extend: boolean) => {
  const excludeKeys = LegendManager.getExcludeKeys();
  const routeData: ChartDataItemType[] = handleRouteLineData(data.mainData.route);

  const routeLength = Object.keys(data.mainData.route).length;

  const avgData: ChartDataItemType[] = handleAVGData(data.mainData.AVG);

  const collectDistance: ChartDataItemType[] = Object.entries(data.extended?.collectDistance || {})
    .reverse()
    .map(([key, value], index) => {
      const idxKey = (index + 1).toString();
      const isTotal = key === 'total';
      const legendName =
        key === LEGEND_KEY.EWM
          ? '수거 거리: 7일 평균'
          : key === LEGEND_KEY.AVG
          ? '수거 거리: 배차 평균'
          : '수거 거리: 전체 지역';
      const isVisible =
        excludeKeys.length === 0 ? isTotal : excludeKeys.includes(isTotal ? 'total1' : idxKey);
      const color = DRIVING_EXTENDS_COLOR[index];

      return {
        key: isTotal ? 'total1' : idxKey,
        name: legendName,
        dataPoints: Object.entries(value).map(([label, y]) => {
          return {
            label: getDayKorea(label),
            y: y ? +y.toFixed(3) : null,
            date: label,
            routeLength,
          };
        }),
        visible: isVisible,
        markerType: 'circle',
        markerSize: '10',
        markerBorderColor: color,
        markerBorderThickness: 3,
        showLegend: true,
        showChildLegend: false,
        connectNullData: true,
        color,
        type: 'line',
        lineDashType: key === 'total' ? 'solid' : 'dash',
      };
    });

  const otherDistance: ChartDataItemType[] = Object.entries(data.extended?.otherDistance || {})
    .reverse()
    .map(([key, value], index) => {
      const idxKey = (index + 4).toString();
      const isTotal = key === 'total';
      const legendName =
        key === LEGEND_KEY.EWM
          ? '기타 거리: 7일 평균'
          : key === LEGEND_KEY.AVG
          ? '기타 거리: 배차 평균'
          : '기타 거리: 전체 지역';
      const isVisible =
        excludeKeys.length === 0 ? isTotal : excludeKeys.includes(isTotal ? 'total2' : idxKey);
      const color = DRIVING_EXTENDS_COLOR[index + 3];

      return {
        key: isTotal ? 'total2' : idxKey,
        name: legendName,
        dataPoints: Object.entries(value).map(([label, y]) => ({
          label: getDayKorea(label),
          y: y ? +y.toFixed(3) : null,
          date: label,
          routeLength,
        })),
        visible: isVisible,
        markerType: 'square',
        markerSize: '10',
        markerBorderColor: color,
        markerBorderThickness: 3,
        showLegend: true,
        showChildLegend: false,
        connectNullData: true,
        color,
        type: 'line',
        lineDashType: isTotal ? 'solid' : 'dash',
      };
    });

  const collectDuration: ChartDataItemType[] = Object.entries(data.extended?.collectDuration || {})
    .reverse()
    .map(([key, value], index) => {
      const idxKey = (index + 7).toString();
      const isTotal = key === 'total';
      const legendName =
        key === LEGEND_KEY.EWM
          ? '수거 시간: 7일 평균'
          : key === LEGEND_KEY.AVG
          ? '수거 시간: 배차 평균'
          : '수거 시간: 전체 지역';
      const isVisible =
        excludeKeys.length === 0 ? isTotal : excludeKeys.includes(isTotal ? 'total3' : idxKey);
      const color = DRIVING_EXTENDS_COLOR[index + 6];
      return {
        key: isTotal ? 'total3' : idxKey,
        name: legendName,
        dataPoints: Object.entries(value).map(([label, y]) => ({
          label: getDayKorea(label),
          y: y ? +y.toFixed(3) : null,
          date: label,
          routeLength,
        })),
        visible: isVisible,
        markerType: 'circle',
        markerSize: '10',
        markerBorderColor: color,
        markerBorderThickness: 3,
        showLegend: true,
        showChildLegend: false,
        connectNullData: true,
        color,
        type: 'line',
        lineDashType: key === 'total' ? 'solid' : 'dash',
        axisYType: 'secondary',
      };
    });

  const otherDuration: ChartDataItemType[] = Object.entries(data.extended?.otherDuration || {})
    .reverse()
    .map(([key, value], index) => {
      const idxKey = (index + 10).toString();
      const isTotal = key === 'total';
      const legendName =
        key === LEGEND_KEY.EWM
          ? '기타 시간: 7일 평균'
          : key === LEGEND_KEY.AVG
          ? '기타 시간: 배차 평균'
          : '기타 시간: 전체 지역';
      const isVisible =
        excludeKeys.length === 0 ? isTotal : excludeKeys.includes(isTotal ? 'total4' : idxKey);
      const color = DRIVING_EXTENDS_COLOR[index + 9];
      return {
        key: isTotal ? 'total4' : idxKey,
        name: legendName,
        dataPoints: Object.entries(value).map(([label, y]) => ({
          label: getDayKorea(label),
          y: y ? +y.toFixed(3) : null,
          date: label,
          routeLength,
        })),
        visible: isVisible,
        markerType: 'square',
        markerSize: '10',
        markerBorderColor: color,
        markerBorderThickness: 3,
        showLegend: true,
        showChildLegend: false,
        connectNullData: true,
        color,
        type: 'line',
        lineDashType: key === 'total' ? 'solid' : 'dash',
        axisYType: 'secondary',
      };
    });

  return extend
    ? [...collectDistance, ...otherDistance, ...collectDuration, ...otherDuration]
    : [...avgData, ...routeData];
};

// collection count line
export const formatDataCollectCount = (data: DataRouteGraphType, isExtend?: boolean) => {
  const avgData = handleAVGData(data.AVG);
  const route = handleRouteLineData(data.route, isExtend);

  return [...avgData, ...route];
};

export const formatDataCollectCountOneRoute = (data: DataRouteGraphType, area: string) => {
  const avgData = handleAVGData(data.AVG);
  const routeData = {
    type: 'line',
    key: '3',
    name: area,
    visible: true,
    showLegend: true,
    dataPoints: Object.entries(data.route[area]).map(([label, value]) => ({
      label: getDayKorea(label),
      y: value,
      // average: values['average'],
      // max: values['max'],
      // min: values['average'],
      date: label,
    })),
    color: 'green',
    showChildLegend: false,
    childrenKeys: ['123'],
  };

  return [...avgData, routeData];
};

// use Collect count column
export const formatDataCollectCountColumn = (data: DataRouteGraphType) => {
  const totalData = {
    type: 'column',
    key: 'totalOfDay',
    name: '배차합계: 수량',
    visible: true,
    showLegend: true,
    dataPoints: Object.entries(data.route).map(([label, values]) => ({
      label: getDayKorea(label),
      y: values['totalOfDay'],
      average: values['average'],
      max: values['max'],
      min: values['min'],
      date: label,
    })),
    color: 'green',
    showChildLegend: false,
    childrenKeys: ['123'],
  };

  const avgData = handleAVGData(data.AVG);

  return [totalData, ...avgData];
};

// collecttion count extend
export const formatDataCollectCountColumnExtended = (
  data: DataRouteGraphType,
  isSection?: boolean,
  isBag?: boolean,
  routeName?: string
) => {
  let sectionColors: Record<string, string> = {};
  let trashBagColors: Record<string, string> = {};

  const firstKey = Object.keys(data.route)[0];

  const colorRoutes = LegendManager.getAllRouteColors();

  const excludeKeys = LegendManager.getExcludeKeys();

  if (isBag) {
    trashBagColors = LegendManager.getL4TypeColors();
  }

  if (isSection) {
    LegendManager.initializeSectionColors(data.sectionList ?? []);
    sectionColors = LegendManager.getSectionColors();
  }

  const keys =
    isSection && data.sectionList
      ? ['totalOfDay', ...data.sectionList]
      : (Object.keys(data.route[firstKey]) as Array<keyof (typeof data.route)['2024-10-07']>);

  const mappedData = keys.map((key) => {
    let isVisible = true;
    if (excludeKeys.length === 0) {
      isVisible = true;
    } else if (key === 'totalOfDay') {
      isVisible =
        excludeKeys.filter((item) => !Number(+item) && item !== 'totalOfDay').length ===
        (isBag
          ? trashBagType.length
          : isSection
          ? LegendManager.getSections().length
          : LegendManager.getRoutes().length);
    } else {
      isVisible = excludeKeys.includes(key);
    }
    return {
      type: key === 'totalOfDay' ? 'column' : 'stackedColumn',
      key,
      name:
        key === 'totalOfDay'
          ? isSection
            ? routeName ?? '수량'
            : '배차합계: 수량'
          : isSection
          ? key
          : `배차 합계: ${key} `,
      visible: isVisible,
      showLegend: true,
      dataPoints: Object.entries(data.route).map(([label, values]) => {
        return {
          label: getDayKorea(label),
          y: key === 'totalOfDay' ? null : values[key] ?? null,
          date: label,
        };
      }),
      color:
        key === 'totalOfDay'
          ? 'green'
          : isBag
          ? trashBagColors[key]
          : isSection
          ? sectionColors[key]
          : colorRoutes[key],
      showChildLegend: true,
      childrenKeys: key === 'totalOfDay' ? keys.filter((item) => item !== 'totalOfDay') : [],
      parentKey: key === 'totalOfDay' ? '' : 'totalOfDay',
      hiddenInTooltip: routeName && key === 'totalOfDay' ? true : false,
    };
  });

  const avgData = handleAVGData(data.AVG);

  return [...mappedData, ...avgData];
};

export const getDomain = (type: string) => {
  switch (type) {
    case DOMAINS.STANDARD_CORE:
      return [
        {
          label: 'L1 Standard Score',
          value: type,
        },
      ];
    case DOMAINS.COLLECT_DISTANCE:
      return [
        {
          label: 'L2 Collect Distance',
          value: type,
        },
      ];
    case DOMAINS.COLLECT_TIME:
      return [
        {
          label: 'L2 Collect Time',
          value: type,
        },
      ];
    case DOMAINS.OTHER_DISTANCE:
    case DOMAINS.OTHER_TIME:
      return [
        {
          label: type === DOMAINS.OTHER_DISTANCE ? 'L2 Other Distance' : 'L2 Other Time',
          value: type,
        },
        ...Array.from({ length: 5 }, (_, k) => ({
          label: `L3 Drive Mode ${k}`,
          value: `driveMode${k}`,
        })),
      ];
    case DOMAINS.COLLECT_COUNT:
      return [
        {
          label: 'L2 Collect Count',
          value: type,
        },
        ...Array.from({ length: trashBagType.length }, (_, k) => ({
          label: `L3 Trash bag type ${k}`,
          value: trashBagType[k],
        })),
      ];
  }
};

export const getUnitChartBuilder = (type: string) => {
  switch (type) {
    case DOMAINS.STANDARD_CORE:
      return '점';

    case DOMAINS.COLLECT_DISTANCE:
    case DOMAINS.OTHER_DISTANCE:
      return 'km';

    case DOMAINS.COLLECT_TIME:
    case DOMAINS.OTHER_TIME:
      return '분';

    case DOMAINS.COLLECT_COUNT:
      return ' 개';

    default:
      return '';
  }
};

export const getNameLegend = (key: string) => {
  const result = yOptions.find((item) => item.value === key);
  return result ? result.label : '';
};

export const handleSortChartsData = (data: Array<ChartDataItemType>, lineBefore?: boolean) => {
  const legendSpLines = data.filter((item) => item.type === 'spline');

  const legendLines = data.filter((item) => item.type === 'line');

  const legendColumns = data.filter((item) => item.type !== 'line' && item.type !== 'spline');

  return lineBefore
    ? [...legendSpLines, ...legendLines, ...legendColumns]
    : [...legendColumns, ...legendSpLines, ...legendLines];
};

export const sortDataChart = (data: Array<ChartDataItemType>): SortedChartData => {
  return data.reduce<SortedChartData>(
    (acc, item) => {
      if (item.type === 'spline') {
        acc.legendSpLines.push(item);
      } else if (item.type === 'line') {
        acc.legendLines.push(item);
      } else if (item.type === 'column') {
        acc.legendColumns.push(item);
      } else {
        acc.legendStackColumns.push(item);
      }
      return acc;
    },
    { legendSpLines: [], legendLines: [], legendColumns: [], legendStackColumns: [] }
  );
};
