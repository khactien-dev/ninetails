import { DEFAULT_VIEW_PORT } from '@/components/analysis/graph-builder/graph-builder-form/context';
import { ACTIONS_CHART_KEY, DOMAINS } from '@/constants/charts';
import { useCustomGraphMutation } from '@/hooks/features/useAnalysis';
import {
  ActionsKeyType,
  ChartDataItemType,
  DataTooltipItemType,
  GraphBuilderDataType,
  GraphCustomPayloadType,
} from '@/interfaces';
import { chartColors, getDayKorea, getNameLegend, handleSortChartsData } from '@/utils';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useFullScreenHandle } from 'react-full-screen';

import { useAnalysisContext } from '../../context';

export type ConditionBuilderType = {
  logicalOperator?: 'AND' | 'OR';
  domain: string;
  condition: string;
  value: number;
};

export type FormValuesType = {
  routeName?: string;
  purpose: string;
  period: any;
  yAxises1: string;
  cumulative_y: boolean;
  type1: string;
  conditions1: Array<ConditionBuilderType>;
  yAxises2: string;
  cumulative_y2: boolean;
  type2: string;
  conditions2: Array<ConditionBuilderType>;
};

const YAXIS_DISTANCE_UNITS_OPTIONS = [DOMAINS.COLLECT_DISTANCE, DOMAINS.OTHER_DISTANCE];
const YAXIS_TIME_UNITS_OPTIONS = [DOMAINS.COLLECT_TIME, DOMAINS.OTHER_TIME];

const useGraphBuiderForm = () => {
  const { mutate: graphCustomMutate } = useCustomGraphMutation();
  const { params } = useAnalysisContext();
  const [datas, setDatas] = useState<Array<ChartDataItemType>>([]);
  const [dataTemps, setDataTemps] = useState<Array<ChartDataItemType>>([]);
  const [legendKeys, setLegendKeys] = useState<Array<number | string>>([]);
  const [dataTooltip, setDataTooltip] = useState<Array<DataTooltipItemType> | undefined>();
  const [domains, setDomains] = useState({
    y1: '',
    y2: '',
  });
  const [positionTooltip, setPositionTooltip] = useState<[number, number]>([0, 0]);
  const [viewPort, setViewPort] = useState(DEFAULT_VIEW_PORT);
  const [form] = Form.useForm<FormValuesType>();

  const [payload, setPayload] = useState<GraphCustomPayloadType | undefined>();
  const [loadingChart, setLoadingChart] = useState(false);

  const [actionKeys, setActionKeys] = useState<ActionsKeyType>({
    active: [ACTIONS_CHART_KEY.AVG],
    disable: [ACTIONS_CHART_KEY.TOTAL, ACTIONS_CHART_KEY.CUMULATION],
  });
  const fullScreenChart = useFullScreenHandle();

  const y1Axis = Form.useWatch('yAxises1', form);
  const y2Axis = Form.useWatch('yAxises2', form);
  const typeChartY2 = Form.useWatch('type2', form);
  const typeChartY1 = Form.useWatch('type1', form);

  const getConversionUnit = (yAxis: string) => {
    if (YAXIS_DISTANCE_UNITS_OPTIONS.includes(yAxis)) {
      return 'km';
    } else if (YAXIS_TIME_UNITS_OPTIONS.includes(yAxis)) {
      return 'minute';
    } else {
      return null;
    }
  };

  const y1AxisConversionUnit: 'km' | 'minute' | null = useMemo(() => {
    return getConversionUnit(y1Axis);
  }, [y1Axis]);
  const y2AxisConversionUnit: 'km' | 'minute' | null = useMemo(() => {
    return getConversionUnit(y2Axis);
  }, [y2Axis]);

  const formatYValue = (value: number | null) => {
    return value !== null && typeof value === 'number' ? +value.toFixed(3) : null;
  };

  const formatRouteData = (
    data: GraphBuilderDataType['mainData'],
    payload: FormValuesType,
    activeKeys?: Array<string | number>
  ) => {
    let yValue: Array<ChartDataItemType> = [];
    let y2Value: Array<ChartDataItemType> = [];
    let y2AvgValue: Array<ChartDataItemType> = [];

    const yAvgValue = [
      {
        key: '1',
        type: 'spline',
        color: '#FF96C8',
        visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('1') : true,
        showLegend: true,
        name: '7일 평균' + ` (${getNameLegend(payload.yAxises1)})`,
        axisYKey: payload.yAxises1,
        dataPoints: Object.entries(data.AVG.EWMY1).map(([label, y]) => {
          return {
            label: getDayKorea(label),
            y,
            date: label,
          };
        }),
        markerType: 'circle',
        markerSize: '10',
        markerBorderColor: '#FF96C8',
        markerBorderThickness: 3,
        lineDashType: 'dash',
      },
      {
        key: '2',
        type: 'spline',
        color: '#7f7f7f',
        visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('2') : true,
        showLegend: true,
        name: '배차 평균' + ` (${getNameLegend(payload.yAxises1)})`,
        axisYKey: payload.yAxises1,
        dataPoints: Object.entries(data.AVG.averageY1).map(([label, y]) => {
          return {
            label: getDayKorea(label),
            y,
            date: label,
          };
        }),
        markerType: 'circle',
        markerSize: '10',
        markerBorderColor: '#7f7f7f',
        markerBorderThickness: 3,
        lineDashType: 'dash',
      },
    ];

    if (payload.type1 === 'bar') {
      yValue = [
        {
          key: '10',
          type: 'column',
          color: 'green',
          visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('10') : true,
          showLegend: true,
          axisYKey: payload.yAxises1,
          name: getNameLegend(payload.yAxises1),
          dataPoints: Object.entries(data.total.totalY1).map(([label, y]) => {
            return {
              label: getDayKorea(label),
              y: formatYValue(y),
              date: label,
            };
          }),
        },
      ];
    } else {
      yValue = Object.entries(data.routeY1).map(([key, value], index) => {
        const oldValue = dataTemps.find((item) => item.key === key);
        const color = oldValue ? oldValue.color : '';
        return {
          key: key,
          type: payload.type1 === 'line' ? 'line' : 'column',
          color: color ? color : payload.type1 === 'line' ? chartColors[index + 1] : 'green',
          visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes(key) : true,
          showLegend: true,
          axisYKey: payload.yAxises1,
          name: payload.yAxises1 ? key + ` (${getNameLegend(payload.yAxises1)})` : key,
          dataPoints: Object.entries(value).map(([label, y]) => {
            return {
              label: getDayKorea(label),
              y: formatYValue(y[payload.yAxises1]),
              date: label,
            };
          }),
        };
      });
    }

    if (payload.yAxises2) {
      y2AvgValue = [
        {
          axisYType: 'secondary',
          key: '3',
          type: 'spline',
          color: '#e41177',
          visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('3') : true,
          showLegend: true,
          axisYKey: payload.yAxises2,
          name: '7일 평균' + ` (${getNameLegend(payload.yAxises2)})`,
          dataPoints: Object.entries(data.AVG.EWMY2).map(([label, y]) => {
            return {
              label: getDayKorea(label),
              y,
              date: label,
            };
          }),
          markerType: 'circle',
          markerSize: '10',
          markerBorderColor: '#e41177',
          markerBorderThickness: 3,
          lineDashType: 'dash',
        },
        {
          axisYType: 'secondary',
          key: '4',
          type: 'spline',
          color: '#050505',
          visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('4') : true,
          showLegend: true,
          axisYKey: payload.yAxises2,
          name: '배차 평균' + ` (${getNameLegend(payload.yAxises2)})`,
          dataPoints: Object.entries(data.AVG.averageY2).map(([label, y]) => {
            return {
              label: getDayKorea(label),
              y,
              date: label,
            };
          }),
          markerType: 'circle',
          markerSize: '10',
          markerBorderColor: '#050505',
          markerBorderThickness: 3,
          lineDashType: 'dash',
        },
      ];
      if (payload.type2 === 'bar') {
        y2Value = [
          {
            axisYType: 'secondary',
            key: '11',
            type: 'column',
            color: 'blue',
            visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes('11') : true,
            axisYKey: payload.yAxises2,
            showLegend: true,
            name: getNameLegend(payload.yAxises2),
            dataPoints: Object.entries(data.total.totalY2).map(([label, y]) => {
              return {
                label: getDayKorea(label),
                y: formatYValue(y),
                date: label,
              };
            }),
          },
        ];
      } else {
        y2Value = Object.entries(data.routeY2).map(([key, value], index) => {
          const keyValue = key + 'secondary';
          const oldValue = dataTemps.find((item) => item.key === keyValue);
          const color = oldValue ? oldValue.color : '';
          return {
            axisYType: 'secondary',
            key: keyValue,
            type: payload.type2 === 'line' ? 'line' : 'column',
            name: key + ` (${getNameLegend(payload.yAxises2)})`,
            axisYKey: payload.yAxises2,
            color: color
              ? color
              : payload.type1 === 'line'
              ? chartColors[yValue.length + index + 1]
              : 'green',
            visible: activeKeys && activeKeys?.length > 0 ? activeKeys.includes(keyValue) : true,
            showLegend: true,
            dataPoints: Object.entries(value).map(([label, y]) => {
              return {
                label: getDayKorea(label),
                y: formatYValue(y[payload.yAxises2]),
              };
            }),
          };
        });
      }
    }

    return [...yValue, ...y2Value, ...yAvgValue, ...y2AvgValue];
  };

  const generateChart = (
    routesY1: string,
    routesY2: string,
    legendKeys?: Array<string | number>
  ) => {
    if (payload) {
      setLoadingChart(true);
      setDataTooltip(undefined);
      graphCustomMutate(
        {
          ...payload,
          routeName1: routesY1,
          routeName2: payload.yAxises2 ? routesY2 : undefined,
        },
        {
          onSuccess: (data) => {
            const newChartDatas = formatRouteData(
              data.data.mainData,
              form.getFieldsValue(),
              legendKeys
            );

            setDatas(handleSortChartsData(newChartDatas));
            setLoadingChart(false);
            setViewPort({
              min: 0,
              max: dayjs(payload.endDate).diff(dayjs(payload.startDate), 'day') + 1,
            });
          },
        }
      );
    }
  };

  const onFinish = (value: FormValuesType) => {
    if (value.yAxises1 === value.yAxises2) {
      form.setFields([
        {
          name: 'yAxises1',
          errors: ['이 옵션이 이미 선택되었습니다. 다른 옵션을 선택해 주세요.'],
        },
      ]);
      return;
    }

    const payload: GraphCustomPayloadType = {
      routeName1: params.routeName ?? '',
      yAxises1: value.yAxises1,
      yAxises2: value.yAxises2,
      conditions1:
        value.conditions1 && value.conditions1.length > 0 ? value.conditions1 : undefined,
      conditions2:
        value.conditions2 && value.conditions2.length > 0 ? value.conditions1 : undefined,
      startDate: dayjs(value.period[0]).format('YYYY-MM-DD'),
      endDate: dayjs(value.period[1]).format('YYYY-MM-DD'),
      routeName2: value.yAxises2 ? params.routeName ?? '' : undefined,
      cumulation_y1: value.cumulative_y ? 1 : 0,
      cumulation_y2: value.cumulative_y2 ? 1 : 0,
    };

    setLoadingChart(true);

    graphCustomMutate(payload, {
      onSuccess: (data) => {
        const newChartDatas = formatRouteData(data.data.mainData, value);
        const chartKeys = newChartDatas.map((chart) => chart?.key);
        setDatas(handleSortChartsData(newChartDatas));
        setDataTemps(newChartDatas);
        setLegendKeys(chartKeys);
        setDomains({
          y1: payload.yAxises1,
          y2: payload.yAxises2,
        });
        setPayload(payload);
        setLoadingChart(false);
        setViewPort({
          min: 0,
          max: dayjs(payload.endDate).diff(dayjs(payload.startDate), 'day') + 1,
        });
      },
    });
    return;
  };

  const onChangeYAxis = (
    value: string,
    cumulative: string,
    conditionType: 'conditions1' | 'conditions2'
  ) => {
    if (value === DOMAINS.STANDARD_CORE) {
      form.setFieldsValue({
        [cumulative]: false,
        ...(conditionType === 'conditions1'
          ? {
              type1: 'line',
            }
          : {
              type2: 'line',
            }),
      });
    }

    const formValue = form.getFieldsValue();

    if (Array.isArray(formValue[conditionType])) {
      const updateDomains = formValue[conditionType].map((item: ConditionBuilderType) => ({
        ...item,
        domain: null,
      }));

      form.setFieldValue(conditionType, updateDomains);
    }
  };

  const onChangeChartType = (value: string, cumulative: string) => {
    if (value === 'bar') {
      form.setFieldsValue({
        [cumulative]: false,
      });
    }
  };

  // Xử lý khi người dùng chọn ngày
  const handleRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      let start = dates[0];
      let end = dates[1];

      const startToEndDiff = end.diff(start, 'day');

      if (startToEndDiff > 90) {
        end = start.clone().add(90, 'day');
      }

      form.setFieldsValue({ period: [start, end] });
    }
  };

  useEffect(() => {
    const newActive = fullScreenChart.active
      ? [...actionKeys.active, ACTIONS_CHART_KEY.FULL_SCREEN]
      : actionKeys.active.filter((key) => key !== ACTIONS_CHART_KEY.FULL_SCREEN);

    setActionKeys({ ...actionKeys, active: newActive });
  }, [fullScreenChart.active]);

  return {
    form,
    datas,
    dataTemps,
    domains,
    dataTooltip,
    legendKeys,
    positionTooltip,
    viewPort,
    payload,
    loadingChart,
    y1AxisConversionUnit,
    y2AxisConversionUnit,
    setLoadingChart,
    setPayload,
    setLegendKeys,
    setDataTooltip,
    setDatas,
    setDataTemps,
    setPositionTooltip,
    setViewPort,
    fullScreenChart,
    actionKeys,
    setActionKeys,
    onFinish,
    onChangeYAxis,
    y1Axis,
    typeChartY1,
    y2Axis,
    typeChartY2,
    onChangeChartType,
    generateChart,
    handleRangeChange,
  };
};

export default useGraphBuiderForm;
