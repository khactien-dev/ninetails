import { DATE_FORMAT } from '@/constants';
import { COLLECT_VIEW, MARKER_TYPE } from '@/constants/map';
import { useGetAreas } from '@/hooks/features/useControlStatus';
import { useGetMetrics, useGetRoute } from '@/hooks/features/useIllegalStatus';
import { IIllegalData } from '@/interfaces';
import { TabsProps } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import dayjs from 'dayjs';
// import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import React from 'react';
import { PolygonProps } from 'react-naver-maps';

import { IMarker } from '../map/marker';

export interface SelectData {
  value: string | number | null;
  label: string;
}

export interface ICreateData {
  image: React.ReactNode;
  title: string;
  value: string;
  check?: boolean;
}

export interface ICollectTime {
  title: string;
  value: React.ReactNode;
}

export interface ICase {
  id: number;
  title: string;
  value: React.ReactNode;
}

export const DATE_FILTER = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

interface Utils {
  map: any;
  timeOptions: SelectData[];
  routeOptions: SelectData[];
  isVisibleLastUpdated: boolean;
  markers: IMarker[];
  params: IParams;
  isLoading: boolean;
  setMap: any;
  view: string;
  tabsFilter: TabsProps['items'] | undefined;
  collectTime: ICollectTime[];
  caseData: ICase[];
  dateType: string | null;
  illegalData: IIllegalData;
  areaPolygons: PolygonProps[];
  onClearAreaPolygons: () => void;
  setView: React.Dispatch<React.SetStateAction<string>>;
  onChangeParams: (params: IParams) => void;
  onTimeChange: (val: RangePickerProps['value']) => void;
  setDateType: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmitChange: () => void;
  refetch: () => void;
  onChangeFilter: (key: string) => void;
  onChangeRoute: (value: string) => void;
}

export interface IParams {
  route_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

const collectTime = [
  {
    title: '평균',
    value: 'avg',
  },
  {
    title: '최대',
    value: 'max',
  },
  {
    title: '최소',
    value: 'min',
  },
];

const caseData = [
  {
    id: 1,
    title: '음식물 혼입',
    value: 'food',
  },
  {
    id: 2,
    title: '위험물/불연성',
    value: 'hazardous',
  },
  {
    id: 3,
    title: '함수량 50+%',
    value: 'moisture',
  },
  {
    id: 4,
    title: '재활용/비닐 5%',
    value: 'recycling',
  },
];

const tabsFilter = [
  {
    key: '1',
    label: '1일',
  },
  {
    key: '2',
    label: '1주일',
  },
  {
    key: '3',
    label: '1개월',
  },
];

export default function useControlStatus(): Utils {
  // const { query } = useRouter();
  // const { routeName: initRouteName } = query;
  const [map, setMap] = useState<any>(null);
  const [isVisibleLastUpdated] = useState(true);
  const [dateType, setDateType] = useState<string | null>(DATE_FILTER.DAY);
  const [view, setView] = useState<string>(COLLECT_VIEW.ALL);
  const [activeArea, setActiveArea] = useState<boolean>(true);

  const [params, setParams] = useState<IParams>({
    route_name: null,
    start_date: dayjs().format(DATE_FORMAT.R_BASIC),
    end_date: dayjs().format(DATE_FORMAT.R_BASIC),
  });
  const { data: areas } = useGetAreas();
  const { data: routeData } = useGetRoute();
  const { data: { data: collectData } = {}, refetch, isLoading } = useGetMetrics(params);

  const routeOptions: SelectData[] = useMemo(() => {
    if (!routeData?.data)
      return [
        {
          value: null,
          label: '000-전체차량',
        },
      ];

    const options = routeData?.data?.map((item: string) => ({
      value: item,
      label: item,
    }));
    return [
      {
        value: null,
        label: '000-전체차량',
      },
      ...options,
    ];
  }, [routeData]);

  const areaPolygons = useMemo(() => {
    if (!areas || !activeArea) return [];
    return [
      {
        paths: areas?.data?.features?.[0]?.geometry?.coordinates?.[0],
        strokeWeight: 4,
        strokeColor: '#57BA00',
        fillColor: activeArea ? '#57BA00' : 'transparent',
        fillOpacity: 0.2,
        clickable: false,
        visible: true,
        zIndex: 1,
      },
    ];
  }, [areas, activeArea]);

  const illegalData = useMemo(() => {
    try {
      if (!collectData?.items)
        return {
          markers: [],
          aggregate_hour: {
            max: 0,
            min: 0,
            avg: 0,
          },
          count: {
            all: {
              classifications: [],
              within_1_week: 0,
              within_2_week: 0,
              more_than_2_week: 0,
            },
            collection: {
              classifications: [],
              within_1_week: 0,
              within_2_week: 0,
              more_than_2_week: 0,
            },
            produce: {
              classifications: [],
              within_1_week: 0,
              within_2_week: 0,
              more_than_2_week: 0,
            },
          },
          last_updated: '--',
        };

      let newData;
      if (view === COLLECT_VIEW.ALL) {
        newData = collectData?.items;
      } else if (view === COLLECT_VIEW.COLLECTED) {
        newData = collectData?.items?.filter((item) => !!item.collection);
      } else if (view === COLLECT_VIEW.NOT_COLLECTED) {
        newData = collectData?.items?.filter((item) => !item.collection);
      }

      const markers: IMarker[] =
        newData?.map((item) => ({
          type: item.collection ? MARKER_TYPE.ILL_C : MARKER_TYPE.ILL,
          data: { ...item, lat: item?.gps_y, lng: item?.gps_x },
        })) || [];

      const collection = collectData?.count?.collection?.classifications;
      const produce = collectData?.count?.produce?.classifications;
      const mergedObject = [...(collection ?? []), ...(produce ?? [])].reduce<
        Record<string, { key: string; count: number }>
      >((acc, curr) => {
        if (!curr) return acc;
        acc[curr.key] = acc[curr.key] || { key: curr.key, count: 0 };
        acc[curr.key].count += curr.count;
        return acc;
      }, {});

      return {
        ...collectData,
        markers: markers || [],
        count: {
          ...collectData?.count,
          all: {
            ...collectData?.count?.all,
            classifications: Object.values(mergedObject),
          },
        },
        last_updated: collectData?.last_updated
          ? dayjs(collectData?.last_updated).format(DATE_FORMAT.DATE_YT)
          : '--',
      };
    } catch (error) {
      console.error(error);
    }
  }, [collectData, view]);

  const timeOptions: SelectData[] = [
    { value: 10000, label: '10초' },
    { value: 20000, label: '20초' },
    { value: 30000, label: '30초' },
    { value: 60000, label: '60초' },
  ];

  // useEffect(() => {
  //   initRouteName && onChangeParams({ route_name: initRouteName as string });
  // }, [initRouteName]);

  const onChangeParams = (params: IParams) => setParams((prev) => ({ ...prev, ...params }));

  const onTimeChange = (values: RangePickerProps['value']) => {
    setDateType(null);
    if (values) {
      onChangeParams({
        start_date: values?.[0]?.format(DATE_FORMAT.R_BASIC),
        end_date: values?.[1]?.format(DATE_FORMAT.R_BASIC),
      });
    } else {
      setDateType(DATE_FILTER.DAY);
      onChangeParams({
        start_date: dayjs().format(DATE_FORMAT.R_BASIC),
        end_date: dayjs().format(DATE_FORMAT.R_BASIC),
      });
    }
  };

  const onChangeRoute = (value: string) => {
    onChangeParams({ route_name: value });
  };

  const onSubmitChange = () => refetch();

  const onChangeFilter = (key: string) => {
    console.log(key);
  };

  const onClearAreaPolygons = useCallback(() => {
    if (!activeArea) return;
    setActiveArea(false);
  }, [activeArea]);

  return {
    map,
    timeOptions,
    routeOptions,
    isVisibleLastUpdated,
    markers: illegalData?.markers || [],
    params,
    isLoading,
    dateType,
    view,
    illegalData: illegalData as IIllegalData,
    tabsFilter,
    collectTime,
    caseData,
    areaPolygons,
    onClearAreaPolygons,
    setView,
    setMap,
    refetch,
    onChangeParams,
    onTimeChange,
    setDateType,
    onSubmitChange,
    onChangeFilter,
    onChangeRoute,
  };
}
