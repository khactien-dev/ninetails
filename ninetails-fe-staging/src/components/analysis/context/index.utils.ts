import { DATE_FORMAT } from '@/constants';
import {
  ACTIONS_CHART_KEY,
  CHART_TABS,
  CHART_TYPE,
  L2_TYPE_EN,
  L2_TYPE_KR,
} from '@/constants/charts';
import {
  useGetCollectCountGraphMutation,
  useGetCollectionStatistics,
  useGetDrivingRouteGraphMutation,
  useGetRouteList,
  useGetWidgetDataset,
} from '@/hooks/features/useAnalysis';
import { useFeedback } from '@/hooks/useFeedback';
import {
  ActionsKeyType,
  ChartDataItemType,
  DataTooltipType,
  IAnalysisParam,
  ICoreDataSetConfig,
  ICoreDataSetSections,
  IDataAnalysis,
  IWidgetDataset,
  IWidgetDatasetCollect,
  IWidgetDatasetParam,
} from '@/interfaces';
import {
  formatDataCollectCount,
  formatDataCollectCountColumn,
  formatDataCollectCountColumnExtended,
  formatDataDrivingRoute,
} from '@/utils';
import LegendManager from '@/utils/colors';
import { Form } from 'antd';
import { BaseOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import saveAs from 'file-saver';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FullScreenHandle, useFullScreenHandle } from 'react-full-screen';
import * as XLSX from 'xlsx';

const DEFAULT_VIEW_PORT = {
  min: 0,
  max: 10,
};

export const DEFAULT_CORE_DATASET_CONFIG = {
  distanceRatioRate: 15,
  durationRatioRate: 15,
  collectDistanceRate: 15,
  collectDurationRate: 15,
  collectCountRate: 30,
  manualCollectTimeRate: 10,
  alpha: 10,
  pValue: 5,
  percentageAE: 10,
  percentageBD: 20,
  percentageC: 40,
};

export const DEFAULT_SEARCH_DAYS = 11;

export const DATA_CLOSING_TIME = {
  hour: 23,
  minute: 59,
  second: 59,
  milisecond: 59,
};

const closing_time = dayjs()
  .set('hour', DATA_CLOSING_TIME.hour)
  .set('minute', DATA_CLOSING_TIME.minute)
  .set('second', DATA_CLOSING_TIME.second)
  .set('millisecond', DATA_CLOSING_TIME.milisecond);

export const getDefaultStartDateParams = () => {
  // if today is sunday, monday or tuesday the date range will spread 2 sunday. (default 10 working days)
  const dateParams = new URLSearchParams(window?.location?.search).get('date');
  const routeNameParams = new URLSearchParams(window?.location?.search).get('routeName');
  const lastDay = dayjs().isBefore(closing_time) ? dayjs().subtract(1, 'day') : dayjs();

  if (routeNameParams) {
    return {
      date: dateParams ? dayjs(dateParams) : lastDay,
      dateFormat: dateParams ?? lastDay.format(DATE_FORMAT.R_BASIC),
    };
  }

  const isTwoSunday = lastDay.weekday() === 1 || lastDay.weekday() === 2 || lastDay.weekday() === 0;
  const date = dayjs().isBefore(closing_time)
    ? dayjs().subtract(DEFAULT_SEARCH_DAYS + (isTwoSunday ? 1 : 0), 'day')
    : dayjs().subtract(DEFAULT_SEARCH_DAYS - 1 + (isTwoSunday ? 1 : 0), 'day');
  return {
    date: date,
    dateFormat: date.format(DATE_FORMAT.R_BASIC),
  };
};

export const getDefaultEndDateParams = () => {
  const dateParams = new URLSearchParams(window?.location?.search).get('date');
  const routeNameParams = new URLSearchParams(window?.location?.search).get('routeName');
  if (routeNameParams) {
    return {
      date: dateParams ? dayjs(dateParams) : dayjs(),
      dateFormat: dateParams ?? dayjs().format(DATE_FORMAT.R_BASIC),
    };
  }

  const date = dayjs().isBefore(closing_time) ? dayjs().subtract(1, 'day') : dayjs();
  return {
    date: date,
    dateFormat: date.format(DATE_FORMAT.R_BASIC),
  };
};

interface IDataOperation {
  label: string;
  icon: boolean;
  col2: string;
  col1: string;
  key: string;
  unit: string;
  onclick: () => void;
}
interface DownloadData {
  No: number;
  'Start Date': string | null | undefined;
  'End Date': string | null | undefined;
  'L2 Value': string | undefined;
  'Value type': string;
  [key: string]: any;
}
interface IAnalysisContext {
  chartDatas: Array<ChartDataItemType>;
  widgetDatas: Array<IWidgetDataset | IWidgetDatasetCollect>;
  paramsUseWidgetDataset: any;
  setParamsWidgetDataset: any;
  dataOperation: Array<IDataOperation>;
  operationStatistics: any;
  legendKeys: Array<number | string>;
  openTooltip: boolean;
  tabActive: CHART_TABS;
  dataTooltip: DataTooltipType;
  positionTooltip: [number, number];
  isCollapse: boolean;
  chartType: CHART_TYPE;
  collapseLegendRef: React.RefObject<HTMLDivElement> | null;
  actionKeys: ActionsKeyType;
  area: string;
  fullScreenChart: FullScreenHandle;
  params: IAnalysisParam;
  routeList: Array<BaseOptionType>;
  viewPort: {
    min: number;
    max: number;
  };
  legendsTemp?: Array<ChartDataItemType>;
  unitCollectCount: string;
  L3Extension: boolean;
  coreDataSetConfig: ICoreDataSetConfig | null;
  coreDataSetSections: ICoreDataSetSections;
  loadingChart: boolean;
  coreDataSetSelectedRoutes: string[];
  collectionStatistics?: IDataAnalysis;
  setCoreDataSetSelectedRoutes: Dispatch<SetStateAction<string[]>>;
  setCoreDataSetSections: Dispatch<SetStateAction<ICoreDataSetSections>>;
  setCoreDataSetConfig: React.Dispatch<React.SetStateAction<ICoreDataSetConfig | null>>;
  setChartDatas: Dispatch<SetStateAction<Array<ChartDataItemType>>>;
  setLegendKeys: Dispatch<SetStateAction<Array<number | string>>>;
  setPositionTooltip: Dispatch<SetStateAction<[number, number]>>;
  setOpenTooltip: Dispatch<SetStateAction<boolean>>;
  setDataTooltip: Dispatch<SetStateAction<DataTooltipType>>;
  setTabActive: Dispatch<SetStateAction<CHART_TABS>>;
  setIsCollapse: Dispatch<SetStateAction<boolean>>;
  setChartType: Dispatch<SetStateAction<CHART_TYPE>>;
  setActionKeys: Dispatch<SetStateAction<ActionsKeyType>>;
  setArea: Dispatch<SetStateAction<string>>;
  setLoadingChart: Dispatch<SetStateAction<boolean>>;
  generateChart: (
    tabActive: CHART_TABS,
    isCollapse: boolean,
    area: string,
    actionsKeys: Array<ACTIONS_CHART_KEY>,
    showLegendChildren?: boolean,
    unit?: string,
    isSetLegendTemp?: boolean,
    extendKeys?: string
  ) => Promise<any> | void;
  handleItemClick: (key: string, index: number) => void;
  handleItemClickRouteName: (key: string) => void;
  setParams: Dispatch<SetStateAction<IAnalysisParam>>;
  setViewPort: Dispatch<SetStateAction<{ min: number; max: number }>>;
  setLegendsTemp: Dispatch<SetStateAction<Array<ChartDataItemType> | undefined>>;
  setUnitCollectCount: Dispatch<SetStateAction<string>>;
  setL3Extension: Dispatch<SetStateAction<boolean>>;
  takeScreenshot: (e: HTMLElement) => void;
  activeKey: number | string;
  modeMapping: Record<string, 'total' | 'average'>;
  setModeMappings: Dispatch<SetStateAction<Record<string, 'total' | 'average'>>>;
  getShortString: (value: any, routeName: string) => string;
  handleModeChange: (routeName: string) => void;
  isExportModalVisible: boolean;
  setIsExportModalVisible: (visible: boolean) => void;
  fileName: string;
  setFileName: (name: string) => void;
  fileType: 'csv' | 'xlsx';
  setFileType: (type: 'csv' | 'xlsx') => void;
  isOpenPreviewPdf: boolean;
  setIsOpenPreviewPdf: (visible: boolean) => void;
  isOpenExport: boolean;
  setIsOpenExport: (visible: boolean) => void;
  handleDownload: (value: { fileName: string; fileType: 'csv' | 'pdf' | 'xlsx' }) => void;
}

export const AnalysisContext = createContext<IAnalysisContext>({
  chartDatas: [],
  widgetDatas: [],
  paramsUseWidgetDataset: {},
  setParamsWidgetDataset: {},
  dataOperation: [],
  operationStatistics: {},
  legendKeys: [],
  openTooltip: false,
  tabActive: CHART_TABS.DRIVING_ROUTE,
  dataTooltip: {
    type: CHART_TABS.DRIVING_ROUTE,
    data: [],
  },
  actionKeys: {
    active: [ACTIONS_CHART_KEY.AVG],
    disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
  },
  positionTooltip: [0, 0],
  isCollapse: false,
  chartType: CHART_TYPE.COMMON,
  collapseLegendRef: null,
  area: '',
  routeList: [],
  viewPort: DEFAULT_VIEW_PORT,
  legendsTemp: [],
  unitCollectCount: '',
  L3Extension: false,
  coreDataSetConfig: DEFAULT_CORE_DATASET_CONFIG,
  coreDataSetSections: {
    collectDistance: [],
    collectionDuration: [],
    collectAmount: [],
  },
  loadingChart: false,
  coreDataSetSelectedRoutes: [],
  setCoreDataSetSelectedRoutes: () => {},
  setCoreDataSetSections: () => {},
  setCoreDataSetConfig: () => {},
  setChartDatas: () => {},
  setLegendKeys: () => {},
  setPositionTooltip: () => {},
  setOpenTooltip: () => {},
  setDataTooltip: () => {},
  setTabActive: () => {},
  generateChart: () => {},
  setIsCollapse: () => {},
  setChartType: () => {},
  handleItemClick: () => {},
  handleItemClickRouteName: () => {},
  setActionKeys: () => {},
  setArea: () => {},
  fullScreenChart: {
    active: true,
    enter: () => Promise.resolve(),
    exit: () => Promise.resolve(),
    node: React.createRef<HTMLDivElement>(),
  },
  params: {
    date: null,
    startDate: null,
    endDate: null,
    vehicleId: null,
    routeName: null,
    // updateTime: null,
  },
  setParams: () => {},
  setViewPort: () => {},
  setLegendsTemp: () => {},
  setUnitCollectCount: () => {},
  setL3Extension: () => {},
  setLoadingChart: () => {},
  takeScreenshot: () => {},
  activeKey: '',
  modeMapping: {},
  setModeMappings: () => {},
  getShortString: () => '',
  handleModeChange: () => {},
  isExportModalVisible: false,
  setIsExportModalVisible: () => {},
  fileName: '',
  setFileName: () => {},
  fileType: 'csv',
  setFileType: () => {},
  isOpenPreviewPdf: false,
  setIsOpenPreviewPdf: () => {},
  isOpenExport: false,
  setIsOpenExport: () => {},
  handleDownload: () => {},
});

const dataLabel = [
  {
    label: '수거/기타 거리 %',
    key: 'distanceRatios',
    icon: false,
    unit: 'percentage',
  },
  {
    label: '수거 거리 km',
    key: 'collectDistance',
    icon: true,
    unit: 'km',
  },
  {
    label: '기타 거리 km',
    key: 'otherDistance',
    icon: true,
    unit: 'km',
  },
  {
    label: '수거/기타 시간 %',
    key: 'durationRatios',
    icon: false,
    unit: 'percentage',
  },
  {
    label: '수거 시간 분',
    key: 'collectDuration',
    icon: true,
    unit: 'minute',
  },
  {
    label: '기타 시간 분',
    key: 'otherDuration',
    icon: true,
    unit: 'minute',
  },
  {
    label: '수거량 개',
    icon: true,
    key: 'collectCount',
    unit: 'count',
  },
  {
    label: '도보수거 거리 km',
    icon: false,
    key: 'manualCollectDistance',
    unit: 'km',
  },
  {
    label: '도보수거 시간 분',
    icon: false,
    key: 'manualCollectTime',
    unit: 'minute',
  },
];
const convertData = (data: Record<string, any>) => {
  const mergedCollect = Object.values(data).flatMap((item) => item.collect);
  return { collect: mergedCollect };
};

export const useChart = () => {
  const [modeMapping, setModeMappings] = useState<Record<string, 'total' | 'average'>>({});
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'csv' | 'xlsx'>('csv');
  const [isOpenPreviewPdf, setIsOpenPreviewPdf] = useState<boolean>(false);
  const [isOpenExport, setIsOpenExport] = useState<boolean>(false);
  const [chartDatas, setChartDatas] = useState<Array<ChartDataItemType>>([]);
  const [formWidgetDataset] = Form.useForm();
  const [legendKeys, setLegendKeys] = useState<Array<number | string>>([]);
  const [positionTooltip, setPositionTooltip] = useState<[number, number]>([0, 0]);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [dataTooltip, setDataTooltip] = useState<DataTooltipType>({
    type: CHART_TABS.DRIVING_ROUTE,
    data: [],
  });
  const [tabActive, setTabActive] = useState(CHART_TABS.DRIVING_ROUTE);
  const [chartType, setChartType] = useState<CHART_TYPE>(CHART_TYPE.COMMON);
  const [actionKeys, setActionKeys] = useState<ActionsKeyType>({
    active: [ACTIONS_CHART_KEY.AVG],
    disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
  });

  const [params, setParams] = useState<IAnalysisParam>({
    date: null,
    startDate: getDefaultStartDateParams().dateFormat,
    endDate: getDefaultEndDateParams().dateFormat,
    vehicleId: null,
    routeName: new URLSearchParams(window.location.search).get('routeName') ?? null,
    // updateTime: null,
  });

  const [coreDataSetConfig, setCoreDataSetConfig] = useState<ICoreDataSetConfig | null>(
    DEFAULT_CORE_DATASET_CONFIG
  );
  const [coreDataSetSections, setCoreDataSetSections] = useState<ICoreDataSetSections>({
    collectDistance: [],
    collectionDuration: [],
    collectAmount: [],
  });
  const [coreDataSetSelectedRoutes, setCoreDataSetSelectedRoutes] = useState<string[]>([]);

  const [legendsTemp, setLegendsTemp] = useState<Array<ChartDataItemType>>();
  const [area, setArea] = useState('');
  const [activeKey, setActiveKey] = useState(0);
  const hasCalledOnce = useRef(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const collapseLegendRef = useRef<HTMLDivElement | null>(null);
  const [modeMappings] = useState<Record<string, 'total' | 'average'>>({});
  const [paramsUseWidgetDataset, setParamsWidgetDataset] = useState<IWidgetDatasetParam>();
  const [viewPort, setViewPort] = useState(DEFAULT_VIEW_PORT);
  const [unitCollectCount, setUnitCollectCount] = useState('');
  const [L3Extension, setL3Extension] = useState(false);

  const fullScreenChart = useFullScreenHandle();
  const [loadingChart, setLoadingChart] = useState(false);
  const { notification } = useFeedback();

  const { data: dataRouteList } = useGetRouteList();
  const { mutateAsync: drivingRouteMutate } = useGetDrivingRouteGraphMutation();
  const { mutateAsync: collectCountMutate } = useGetCollectCountGraphMutation();

  const routeList = useMemo(() => {
    if (dataRouteList?.data) {
      const routes = dataRouteList?.data?.map((item: string) => ({
        value: item,
        label: item,
      }));

      return [
        {
          value: '',
          label: '000-전체구역',
        },
        ...routes,
      ];
    }

    return [];
  }, [dataRouteList]);

  const generateChart = async (
    tabActive: CHART_TABS,
    isCollapse: boolean,
    area: string,
    actionKeys: Array<ACTIONS_CHART_KEY>,
    showLegendChildren?: boolean,
    unitCollect?: string,
    isSetLegendTemp?: boolean,
    extendsKeys?: string
  ) => {
    let newChartDatas: Array<ChartDataItemType> = [];
    let chartType = CHART_TYPE.COMMON;
    let newLegendTemp: Array<ChartDataItemType> | undefined = legendsTemp;
    setLoadingChart(true);

    switch (tabActive) {
      case CHART_TABS.DRIVING_ROUTE:
        {
          const { data: drivingRouteData } = await drivingRouteMutate({
            routeNames: !area ? undefined : area,
            startDate: params.startDate ?? '',
            endDate: params.endDate ?? '',
            aggregation: actionKeys.includes(ACTIONS_CHART_KEY.TOTAL),
            cumulation: +actionKeys.includes(ACTIONS_CHART_KEY.CUMULATION),
          });

          newChartDatas = formatDataDrivingRoute(drivingRouteData, isCollapse);
          chartType = isCollapse ? CHART_TYPE.DRIVING_ROUTE_EXTENDED : CHART_TYPE.DRIVING_ROUTE;
        }

        break;
      case CHART_TABS.COLLECT_COUNT:
        {
          const unitCollectvalue = unitCollect ?? unitCollectCount;
          if (isCollapse) {
            const { data: collectData } = await collectCountMutate({
              routeNames: area ?? '',
              startDate: params.startDate ?? '',
              endDate: params.endDate ?? '',
              aggregation: actionKeys.includes(ACTIONS_CHART_KEY.TOTAL),
              cumulation: +actionKeys.includes(ACTIONS_CHART_KEY.CUMULATION),
              L4Extension: true,
              unit: unitCollect,
              trashBagType: extendsKeys ?? '',
            });

            const isTotal = actionKeys.includes(ACTIONS_CHART_KEY.TOTAL);
            newChartDatas =
              isTotal || area
                ? formatDataCollectCountColumnExtended(collectData, false, true)
                : formatDataCollectCount(collectData);
            chartType = CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED;
          } else {
            if (actionKeys.includes(ACTIONS_CHART_KEY.TOTAL)) {
              let payload = {
                routeNames: !area ? undefined : area,
                startDate: params.startDate ?? '',
                endDate: params.endDate ?? '',
                aggregation: actionKeys.includes(ACTIONS_CHART_KEY.TOTAL),
                ...(showLegendChildren && { L3Extension: true }),
                unit: unitCollectvalue,
              };
              const { data: collectData } = await collectCountMutate(payload);
              newChartDatas = showLegendChildren
                ? formatDataCollectCountColumnExtended(collectData)
                : formatDataCollectCountColumn(collectData);

              chartType = showLegendChildren
                ? CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED
                : CHART_TYPE.COLLECT_COUNT_COLUMN;
            } else {
              if (!area) {
                const { data: collectData } = await collectCountMutate({
                  startDate: params.startDate ?? '',
                  endDate: params.endDate ?? '',
                  cumulation: +actionKeys.includes(ACTIONS_CHART_KEY.CUMULATION),
                  unit: unitCollectvalue,
                });
                newChartDatas = formatDataCollectCount(collectData);

                chartType = CHART_TYPE.COLLECT_COUNT_LINE;
              } else {
                let payload = {
                  routeNames: area,
                  startDate: params.startDate ?? '',
                  endDate: params.endDate ?? '',
                  cumulation: +actionKeys.includes(ACTIONS_CHART_KEY.CUMULATION),
                  ...(showLegendChildren && { L3Extension: true }),
                  unit: unitCollectvalue,
                  ...(showLegendChildren && { sectionName: extendsKeys }),
                };
                const { data: collectData } = await collectCountMutate(payload);

                if (showLegendChildren) {
                  const sectionsLegend = LegendManager.getSections();

                  if (!sectionsLegend.length) {
                    const excludeKeys = LegendManager.getExcludeKeys();
                    const sections = collectData.sectionList ?? [];
                    LegendManager.updateSections(sections);
                    LegendManager.updateExcludeKeys(
                      excludeKeys.length === 0
                        ? []
                        : Array.from(
                            new Set([
                              ...excludeKeys.filter((item) => !isNaN(+item)),
                              ...sections,
                              'totalOfDay',
                            ])
                          )
                    );
                  }
                  chartType = CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED;
                  newChartDatas = formatDataCollectCountColumnExtended(
                    collectData,
                    true,
                    undefined,
                    area
                  );
                } else {
                  chartType = CHART_TYPE.COLLECT_COUNT_LINE;
                  newChartDatas = formatDataCollectCount(collectData, true);
                }
              }
            }
          }
        }
        break;
      default:
        break;
    }
    const chartKeys = newChartDatas.filter((item) => item.visible).map((chart) => chart?.key);

    setLegendKeys(chartKeys);

    if (isSetLegendTemp) {
      newLegendTemp = newChartDatas;
      setLegendsTemp(newLegendTemp);
    }

    setChartDatas(newChartDatas);
    setOpenTooltip(false);
    setChartType(chartType);

    setLoadingChart(false);

    setViewPort({
      min: 0,
      max: dayjs(params.endDate).diff(dayjs(params.startDate), 'day') + 1,
    });

    return newChartDatas;
  };

  const takeScreenshot = useCallback((element: HTMLElement) => {
    if (element) {
      html2canvas(element).then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard
              .write([new ClipboardItem({ 'image/png': blob })])
              .then(() => {
                notification.success({ message: 'Screenshot copied to clipboard' });
              })
              .catch((err) => {
                console.log('Screenshot copied to clipboard', err);
              });
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    if (dataRouteList) {
      LegendManager.generateRouteColors(dataRouteList.data);
      if (hasCalledOnce.current) {
        setIsRefetch(true);
      } else {
        generateChart(
          CHART_TABS.DRIVING_ROUTE,
          false,
          '',
          [ACTIONS_CHART_KEY.AVG],
          undefined,
          undefined,
          true
        );

        hasCalledOnce.current = true;
      }
    }
  }, [params, hasCalledOnce, dataRouteList]);

  useEffect(() => {
    if (isRefetch) {
      generateChart(
        tabActive,
        isCollapse,
        area,
        actionKeys.active,
        undefined,
        unitCollectCount,
        true
      );
      setIsRefetch(false);
    }
  }, [isRefetch, tabActive, isCollapse, area, actionKeys, unitCollectCount]);
  const getShortString = (value: any, routeName: string): string => {
    const isTotal = modeMapping[routeName] !== 'average';
    if (typeof value === 'object' && value !== null) {
      const selectedValue = isTotal ? value.sum : value.average;
      return typeof selectedValue === 'number'
        ? parseFloat(selectedValue.toFixed(3)).toString()
        : selectedValue;
    }
    if (typeof value === 'number') {
      return parseFloat(value.toFixed(3)).toString();
    }
    return value;
  };
  const handleModeChange = useCallback((routeName: string) => {
    setModeMappings((prev) => ({
      ...prev,
      [routeName]: prev[routeName] === 'average' ? 'total' : 'average',
    }));
  }, []);

  const { data: metricData } = useGetCollectionStatistics(params);
  // const metricData = data?.data;

  // collectionStatistics: metricData?.collectionStatistics,
  // operationStatistics: metricData?.operationStatistics,
  // const { operationStatistics } = useLeftMenuAnalysis();
  const mean = metricData?.data?.operationStatistics?.mean || {};
  const standardDeviation = metricData?.data?.operationStatistics?.standardDeviation || {};

  const dataOperation = dataLabel.map((item, index) => ({
    label: item.label,
    icon: item.icon,
    col2: standardDeviation[item.key],
    col1: mean[item.key],
    key: item.key,
    unit: item.unit,
    onclick: () => {
      handleItemClick(item.key, index);
    },
  }));

  const updateParams = () => {
    const formValues = formWidgetDataset.getFieldsValue(['statisticMode', 'routeNames']);
    setParamsWidgetDataset((prevParams) => ({
      ...prevParams,
      statisticMode: formValues.statisticMode || '',
      startDate: params?.startDate,
      endDate: params?.endDate,
      routeNames: params?.routeName || formValues.routeNames,
    }));
  };

  const handleItemClick = useCallback(
    (key: string, index: number) => {
      setActiveKey(index);
      formWidgetDataset.setFieldsValue({ statisticMode: key });
      updateParams();
      setModeMappings((prev) => {
        const newMappings = { ...prev };
        Object.keys(newMappings).forEach((routeName) => {
          newMappings[routeName] = 'total';
        });
        return newMappings;
      });
    },
    [formWidgetDataset, updateParams, activeKey]
  );
  const handleItemClickRouteName = useCallback(
    (key: string) => {
      if (key === undefined) {
        formWidgetDataset.setFieldsValue({ statisticMode: '' });
        formWidgetDataset.setFieldsValue({ routeNames: '' });
      }
      formWidgetDataset.setFieldsValue({ routeNames: key });
      updateParams();
    },
    [formWidgetDataset]
  );
  useEffect(() => {
    setModeMappings((prev) => {
      const newMappings = { ...prev };
      Object.keys(newMappings).forEach((routeName) => {
        newMappings[routeName] = 'total';
      });
      return newMappings;
    });
  }, [activeKey]);
  const { data: rawData } = useGetWidgetDataset(paramsUseWidgetDataset);

  const widgetDataOther = useMemo(() => {
    if (!rawData?.data) return [];

    if (
      paramsUseWidgetDataset?.statisticMode === 'otherDistance' ||
      paramsUseWidgetDataset?.statisticMode === 'otherDuration'
    ) {
      if (!Array.isArray(rawData.data.routes)) return [];

      const mappedRoutes = rawData.data.routes.map((item: IWidgetDataset) => {
        const modifiedItem = Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            key,
            paramsUseWidgetDataset?.statisticMode === 'otherDistance' && typeof value === 'number'
              ? value / 1000
              : value,
          ])
        );
        return {
          ...modifiedItem,
          mode: modeMappings[item.routeName] ?? 'total',
        };
      });

      const dataTotal = rawData?.data?.total
        ? {
            ...rawData?.data?.total,
            ...Object.fromEntries(
              Object.entries(rawData?.data?.total).map(([key, value]) => [
                key,
                paramsUseWidgetDataset?.statisticMode === 'otherDistance' &&
                typeof value === 'number'
                  ? value / 1000
                  : value,
              ])
            ),
            mode: modeMappings[rawData?.data?.total?.routeName] ?? 'total',
            routeName: '전체',
          }
        : null;

      return dataTotal ? [dataTotal, ...mappedRoutes] : mappedRoutes;
    } else if (paramsUseWidgetDataset?.statisticMode === 'collectCount') {
      const newDataRaw = convertData(rawData?.data);
      const dataColectCount =
        newDataRaw.collect?.map((item: IWidgetDatasetCollect) => ({
          ...item,
        })) || [];

      return dataColectCount;
    } else {
      const dataColectDistance =
        rawData?.data?.collect?.map((item: any) => {
          const modifiedItem =
            paramsUseWidgetDataset?.statisticMode === 'collectDistance'
              ? {
                  ...item,
                  ...Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [
                      key,
                      typeof value === 'number' ? value / 1000 : value,
                    ])
                  ),
                  sections: item.sections.map((section: any) =>
                    Object.fromEntries(
                      Object.entries(section).map(([key, value]) => [
                        key,
                        typeof value === 'number' ? value / 1000 : value,
                      ])
                    )
                  ),
                }
              : item;

          return {
            ...modifiedItem,
          };
        }) || [];
      return dataColectDistance;
    }
  }, [rawData?.data, modeMappings, paramsUseWidgetDataset?.statisticMode]);
  const renderL2Type = (typeValue: any) => {
    switch (typeValue) {
      case L2_TYPE_EN.OTHER_DISTANCE:
        return L2_TYPE_KR.OTHER_DISTANCE;
      case L2_TYPE_EN.OTHER_DURATION:
        return L2_TYPE_KR.OTHER_DURATION;
      case L2_TYPE_EN.COLLECT_DISTANCE:
        return L2_TYPE_KR.COLLECT_DISTANCE;
      case L2_TYPE_EN.COLLECT_DURATION:
        return L2_TYPE_KR.COLLECT_DURATION;
      case L2_TYPE_EN.COLLECT_COUNT:
        return L2_TYPE_KR.COLLECT_COUNT;
      default:
        break;
    }
  };

  const handleDownload = (value: { fileName: string; fileType: 'csv' | 'pdf' | 'xlsx' }) => {
    let countColumn = 1;
    let dataToDownload: any = null;
    if (
      paramsUseWidgetDataset?.statisticMode === 'otherDistance' ||
      paramsUseWidgetDataset?.statisticMode === 'otherDuration'
    ) {
      const downloadData = [
        {
          label: 'Total Value',
          getValue: (record: any) => ({
            sum: record?.totalOfAllSum,
            average: record?.totalOfAllAverage,
          }),
        },
        {
          label: '기타 운행',
          getValue: (record: any) => ({
            sum: record?.otherNotSelected_sum,
            average: record?.otherNotSelected_average,
          }),
        },
        {
          label: '수거지로 이동',
          getValue: (record: any) => ({
            sum: record?.goingToCollectionArea_sum,
            average: record?.goingToCollectionArea_average,
          }),
        },
        {
          label: '매립지로 이동',
          getValue: (record: any) => ({
            sum: record?.goingToTheLandfill_sum,
            average: record?.goingToTheLandfill_average,
          }),
        },
        {
          label: '차고지로 복귀',
          getValue: (record: any) => ({
            sum: record?.returnToGarage_sum,
            average: record?.returnToGarage_average,
          }),
        },
        {
          label: '식당으로 이동',
          getValue: (record: any) => ({
            sum: record?.goingToRestaurant_sum,
            average: record?.goingToRestaurant_average,
          }),
        },
        {
          label: '대기 (공회전)',
          getValue: (record: any) => ({
            sum: record?.idling_sum,
            average: record?.idling_average,
          }),
        },
        {
          label: '미관제',
          getValue: (record: any) => ({
            sum: record?.notManaged_sum,
            average: record?.notManaged_average,
          }),
        },
        {
          label: '운행종료 (휴식)',
          getValue: (record: any) => ({
            sum: record?.outOfControl_sum,
            average: record?.outOfControl_average,
          }),
        },
      ];

      dataToDownload = widgetDataOther.map((record) => {
        const data: DownloadData = {
          No: countColumn++,
          'Start Date': paramsUseWidgetDataset?.startDate,
          'End Date': paramsUseWidgetDataset?.endDate,
          'L2 Value': renderL2Type(paramsUseWidgetDataset?.statisticMode),
          'Value type': modeMapping[record?.routeName] === 'average' ? '합계' : '평균',
        };

        downloadData.forEach(({ label, getValue }) => {
          const { sum, average } = getValue(record);
          data[label] = getShortString({ sum, average }, record?.routeName);
        });

        return data;
      });
    } else {
      dataToDownload = widgetDataOther.map((record) => {
        const sectionData = record.sections.reduce((acc: any, section: any) => {
          acc[`${section?.section_name}`] = getShortString(
            {
              sum: section?.total,
              average: section?.average,
            },
            record?.route_name
          );
          return acc;
        }, {});

        return {
          No: countColumn++,
          'Start Date': paramsUseWidgetDataset?.startDate,
          'End Date': paramsUseWidgetDataset?.endDate,
          'Route Name': record?.route_name,
          'L2 Value': renderL2Type(paramsUseWidgetDataset?.statisticMode),
          'Value type': modeMapping[record?.route_name] === 'average' ? '합계' : '평균',
          'Total Value': getShortString(
            {
              sum: record?.totalOfAll,
              average: record?.totalOfAllAverage,
            },
            record?.route_name
          ),
          ...sectionData,
        };
      });
    }

    if (value.fileType === 'csv') {
      const csv = Papa.unparse(dataToDownload);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${value.fileName}.csv`);
    } else if (value.fileType === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DrivingDiary');
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
      saveAs(blob, `${value.fileName}.xlsx`);
    }
  };

  return {
    chartDatas,
    widgetDatas: widgetDataOther,
    paramsUseWidgetDataset,
    setParamsWidgetDataset,
    operationStatistics: metricData?.data?.operationStatistics,
    collectionStatistics: metricData?.data?.collectionStatistics,
    dataOperation,
    handleItemClick,
    formWidgetDataset,
    updateParams,
    legendKeys,
    openTooltip,
    tabActive,
    dataTooltip,
    positionTooltip,
    isCollapse,
    chartType,
    collapseLegendRef,
    actionKeys,
    area,
    routeList,
    viewPort,
    legendsTemp,
    unitCollectCount,
    L3Extension,
    coreDataSetConfig,
    coreDataSetSections,
    loadingChart,
    setLoadingChart,
    coreDataSetSelectedRoutes,
    setCoreDataSetSelectedRoutes,
    setCoreDataSetSections,
    setCoreDataSetConfig,
    setViewPort,
    setArea,
    setChartDatas,
    setLegendKeys,
    setPositionTooltip,
    setOpenTooltip,
    setDataTooltip,
    setTabActive,
    setIsCollapse,
    generateChart,
    setChartType,
    setActionKeys,
    fullScreenChart,
    params,
    setParams,
    setLegendsTemp,
    setUnitCollectCount,
    setL3Extension,
    takeScreenshot,
    activeKey,
    handleItemClickRouteName,
    setActiveKey,
    modeMapping,
    setModeMappings,
    getShortString,
    handleModeChange,
    isExportModalVisible,
    setIsExportModalVisible,
    fileName,
    setFileName,
    fileType,
    setFileType,
    isOpenPreviewPdf,
    setIsOpenPreviewPdf,
    isOpenExport,
    setIsOpenExport,
    handleDownload,
  };
};
