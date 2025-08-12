import { useAnalysisContext } from '@/components/analysis/context';
import { DATE_FORMAT } from '@/constants';
import { CHART_TABS } from '@/constants/charts';
import dayjs from 'dayjs';
import { useState } from 'react';

import { getDefaultEndDateParams, getDefaultStartDateParams } from '../context/index.utils';

export default function useLeftMenuAnalysis() {
  const {
    params: paramsAnalysis,
    setParams: setParamsAnalysis,
    setArea,
    tabActive,
    setIsCollapse,
    setViewPort,
    setParamsWidgetDataset,
  } = useAnalysisContext();

  const [routeName, setRouteName] = useState<string>(paramsAnalysis?.routeName ?? '');
  const [date, setDate] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    getDefaultStartDateParams().date,
    getDefaultEndDateParams().date,
  ]);

  const [setActiveKey, isSetActiveKey] = useState('1');
  const itemsData = [
    {
      key: '1',
      label: '합계',
    },
    {
      key: '2',
      label: '차량 평균',
    },
  ];

  const onSearch = () => {
    setArea(routeName ?? null);
    setParamsAnalysis({
      startDate: dayjs(date[0]).format(DATE_FORMAT.R_BASIC),
      endDate: dayjs(date[1]).format(DATE_FORMAT.R_BASIC),
      routeName: routeName ?? null,
    });
    setParamsWidgetDataset({
      startDate: dayjs(date[0]).format(DATE_FORMAT.R_BASIC),
      endDate: dayjs(date[1]).format(DATE_FORMAT.R_BASIC),
      routeName: routeName ?? null,
    });
    if (tabActive !== CHART_TABS.GRAPH_BUILDER_SETTING) {
      setIsCollapse(false);
    }
    setViewPort({
      min: 0,
      max: dayjs(date[1]).diff(dayjs(date[0]), 'day') + 1,
    });
  };

  const onDateChange = (dates: [dayjs.Dayjs, dayjs.Dayjs]) => {
    setDate(dates);
  };

  const handleChangeKey = (value: string) => {
    isSetActiveKey(value);
  };

  const onChangeRadio = (e: any) => {
    const value = e.target.value;
    const today = dayjs();
    let startDate = today;
    let endDate = today;

    if (value === 'day') {
      startDate = today.hour() < 11 ? today.subtract(1, 'day') : today;
      endDate = today.hour() < 11 ? today.subtract(1, 'day') : today;
    } else if (value === 'week') {
      startDate = today.subtract(6, 'day');
      endDate = today.hour() < 11 ? today.subtract(1, 'day') : today;
    } else if (value === 'month') {
      startDate = today.subtract(29, 'day');
      endDate = today.hour() < 11 ? today.subtract(1, 'day') : today;
    }

    setDate([startDate, endDate]);
  };

  return {
    setActiveKey,
    itemsData,
    handleChangeKey,
    onChangeRadio,
    onSearch,
    onDateChange,
    date,
    setDate,
    routeName,
    setRouteName,
  };
}
