import { DATE_FORMAT } from '@/constants';
import { MARKER_TYPE } from '@/constants/map';
import { useGetMetricWeighQuery } from '@/hooks/features/useAnalysis';
import { useGetAreas, useGetMetrics } from '@/hooks/features/useControlStatus';
import { IDataType, IMetricDetail, IMetrics } from '@/interfaces';
import { exportToPDF } from '@/utils/common';
import { convertScore, kmConversion } from '@/utils/control';
import { CollapseProps } from 'antd';
import dayjs from 'dayjs';
import { chain, toArray } from 'lodash';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PolygonProps, PolylineProps } from 'react-naver-maps';

import { IMarker } from '../map/marker';
import InfoCar from './car-info';
import CarIcon from './car-info/car-icon';
import * as S from './index.style';

export interface CarInfo {
  id: string;
  title: string;
}

export interface SelectData {
  value: string | number | null;
  label: string;
  position?: {
    lat: number;
    lng: number;
  };
}

export interface OperationTable {
  title: React.ReactNode;
  content: string[];
}

export interface OperationTableValue {
  title: string;
  content: string[];
}

export interface DetailStatus {
  title: string;
  value: React.ReactNode;
}

interface Utils {
  map: any;
  timeOptions: SelectData[];
  isVisibleCondition: boolean;
  isVisibleLastUpdated: boolean;
  allStatus: CollapseProps['items'];
  areaOptions: SelectData[];
  statistics: DetailStatus[];
  zScore: IDataType;
  isSingleVehicle: boolean;
  markers: IMarker[];
  polygons: PolylineProps[];
  areaPolygons: PolygonProps[];
  metricInfo: any;
  lastUpdated: string | null;
  params: IParams;
  isLoading: boolean;
  isError: boolean;
  refetch: unknown;
  setMap: any;
  contentRef: React.RefObject<HTMLDivElement>;
  preview: boolean;
  detailModal: boolean;
  metricData: IMetrics | undefined;
  weightRatio: { [key: string]: number };
  onClearAreaPolygons: () => void;
  setPreview: (preview: boolean) => void;
  setDetailModal: React.Dispatch<React.SetStateAction<boolean>>;
  onScreenExport: () => void;
  toggleCondition: () => void;
  onChangeParams: (params: IParams) => void;
  onToggleAllRoute: () => void;
  getCurrentAreaLocation: () => void;
}

export interface IParams {
  vehicleNumber?: string | null;
  routeName?: string | null;
  // startDate?: string | null;
  // endDate?: string | null;
  date?: string | null;
  updateTime?: number | null;
  isArea?: boolean;
  isRealTime?: boolean;
  allRoute?: boolean | null;
}

export const driveStatus = [
  {
    id: 0,
    label: '기타운행 (미선택)',
    color: 'red',
  },
  {
    id: 1,
    label: '수거지로 이동',
    color: 'orange',
  },
  {
    id: 2,
    label: '매립지로 이동',
    color: 'yellow',
  },
  {
    id: 3,
    label: '차고지로 복귀 ',
    color: 'green',
  },
  {
    id: 4,
    label: '식당으로 이동',
    color: 'blue',
  },
  {
    id: 5,
    label: '수거운행',
    color: 'pink',
  },
  {
    id: 6,
    label: '대기 (공회전)',
    color: 'purple',
  },
  {
    id: 7,
    label: '미관제',
    color: 'gray',
  },
  {
    id: 8,
    label: '운행종료 (휴식)',
    color: 'black',
  },
];

const defaultAreaOptions = [
  {
    value: null,
    label: '000-전체차량',
  },
];

const tooltipConfig: { [key: string]: string } = {
  'd-0': '운행모드 (= 목적지) 설정 없이 운행 중인 상태',
  'd-6': '정지~시속 2km 이하로 5분 이상 경과한 상태',
  'd-7': '엣지 신호를 연속 3회 이상 미수신한 상태 (약 30초)',
  'd-8': '엣지 신호를 연속 10회 이상 미수신한 상태 (약 1분 40초)',
};

export default function useControlStatus(): Utils {
  const { query } = useRouter();
  const { routeName: initRouteName, date: initDate } = query;
  const [isVisibleCondition, setIsVisibleCondition] = useState<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isVisibleLastUpdated] = useState(true);
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [activeArea, setActiveArea] = useState<boolean>(true);
  const [params, setParams] = useState<IParams>({
    vehicleNumber: null,
    routeName: null,
    // startDate: dayjs().format(DATE_FORMAT.R_BASIC),
    date: initDate as string,
    updateTime: 10000,
    isArea: true,
    isRealTime: true,
    allRoute: null,
  });

  const [preview, setPreview] = useState<boolean>(false);
  const { data, refetch, isLoading, isSuccess, isError } = useGetMetrics(params);
  const { data: areas } = useGetAreas();
  const { data: weightMetric } = useGetMetricWeighQuery();
  const metricData = data?.data;
  const metricInfo = data?.data?.totals;
  const currentMetricState = data?.data?.latestDriveMetric;
  const lastUpdated = data?.data?.lastUpdated
    ? dayjs(data?.data?.lastUpdated).format(DATE_FORMAT.DATE_YT)
    : null;

  const weightRatio: { [key: string]: number } = useMemo(() => {
    if (!weightMetric)
      return {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
      };
    return {
      A: weightMetric?.data?.percentageAE ? weightMetric?.data?.percentageAE * 100 : 0,
      B: weightMetric?.data?.percentageBD ? weightMetric?.data?.percentageBD * 100 : 0,
      C: weightMetric?.data?.percentageC ? weightMetric?.data?.percentageC * 100 : 0,
      D: weightMetric?.data?.percentageBD ? weightMetric?.data?.percentageBD * 100 : 0,
      E: weightMetric?.data?.percentageAE ? weightMetric?.data?.percentageAE * 100 : 0,
    };
  }, [weightMetric]);

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

  const zScore = useMemo(
    () => ({
      ...convertScore(metricData?.zScore),
      rankScore: metricData?.zScore?.rankScore || '',
    }),
    [metricData?.zScore]
  );

  const garageLandfill = useMemo(() => {
    try {
      if (!metricData?.garageAndLandfill || !metricData?.garageAndLandfill?.length) return {};

      const garage = metricData?.garageAndLandfill?.find(
        (item) => item.type === MARKER_TYPE.GARAGE
      );

      const landfill = metricData?.garageAndLandfill?.find(
        (item) => item.type === MARKER_TYPE.LANDFILL
      );

      return {
        garage: {
          marker: {
            type: MARKER_TYPE.GARAGE,
            data: {
              hasDetail: false,
              lat: garage?.segment_line?.[0]?.[1],
              lng: garage?.segment_line?.[0]?.[0],
            },
          },
          polygon: {
            path: garage?.segment_line?.map((item: number[]) => item),
            strokeColor: '#57BA00',
            strokeOpacity: 0.5,
            strokeWeight: 15,
          },
        },
        landfill: {
          marker: {
            type: MARKER_TYPE.LANDFILL,
            data: {
              hasDetail: false,
              lat: landfill?.segment_line?.[0]?.[1],
              lng: landfill?.segment_line?.[0]?.[0],
            },
          },
          polygon: {
            path: landfill?.segment_line?.map((item: number[]) => item),
            strokeColor: '#57BA00',
            strokeOpacity: 0.5,
            strokeWeight: 15,
          },
        },
      };
    } catch (error) {
      return {};
    }
  }, [metricData?.garageAndLandfill]);

  const scheduledRoutes = useMemo(() => {
    if (!metricData?.vehicleRoute || !metricData?.vehicleRoute?.length) return [];
    return metricData.vehicleRoute.map((route) => ({
      path: route.path || [],
      strokeColor: '#555555',
      strokeOpacity: 0.5,
      strokeWeight: 15,
    }));
  }, [metricData?.vehicleRoute]);

  const currentRoutes = useMemo(() => {
    try {
      if (!metricData?.detailDriveMetric || !metricData?.detailDriveMetric.length) return [];
      return metricData?.detailDriveMetric?.map((metric: any) => ({
        path: [toArray(metric?.start_coords), toArray(metric?.end_coords)] as any,
        strokeColor:
          driveStatus.find((drive) => drive.id == Number(metric?.drive_mode))?.color || '#ffffff',
        strokeOpacity: 0.5,
        strokeWeight: 15,
      }));
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }, [metricData?.detailDriveMetric]);

  const groupStatusMetric = useMemo(() => {
    try {
      if (!metricData) return [];
      return chain(metricData?.uniqueDriveMetrics)
        .groupBy('drive_mode')
        ?.map((value, key) => ({ drive_mode: key, metrics: value }))
        .value();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }, [metricData]);

  const allVehicles = useMemo(
    () =>
      metricData && metricData?.uniqueDriveMetrics?.length
        ? metricData?.uniqueDriveMetrics?.map((metric: any) => ({
            type: MARKER_TYPE.CAR,
            data: {
              ...metric,
              lat: metric?.gps_y,
              lng: metric?.gps_x,
              hasDetail: true,
              updateTime: params.updateTime,
              date: params.date,
              onClick: () => {
                setParams((prev) => ({
                  ...prev,
                  vehicleNumber: metric?.vehicle_number,
                  routeName: metric?.route_name,
                  isArea: false,
                }));
              },
            },
          }))
        : [],
    [metricData, params.date, params.updateTime]
  );

  const markers = useMemo(() => {
    if (currentMetricState)
      return [
        {
          type: MARKER_TYPE.CAR,
          data: {
            ...currentMetricState,
            lat: currentMetricState?.gps_y,
            lng: currentMetricState?.gps_x,
            vehicle_number: metricData?.vehicleInfo?.[0]?.vehicle_number,
            route_name: metricData?.vehicleRoute?.[0]?.route_name,
            hasDetail: true,
            updateTime: params.updateTime,
            date: params.date,
            onClick: () => {
              setParams((prev) => ({
                ...prev,
                vehicleNumber: currentMetricState?.vehicle_number,
                routeName: currentMetricState?.route_name,
                isArea: false,
              }));
            },
          },
        },
        ...(params.allRoute
          ? [garageLandfill?.garage?.marker, garageLandfill?.landfill?.marker]
          : []),
      ] as IMarker[];
    return allVehicles;
  }, [
    currentMetricState,
    metricData?.vehicleInfo,
    metricData?.vehicleRoute,
    params.updateTime,
    params.date,
    params.allRoute,
    garageLandfill?.garage?.marker,
    garageLandfill?.landfill?.marker,
    allVehicles,
  ]);

  const polygons = useMemo(
    () =>
      [
        ...(scheduledRoutes || []),
        ...(currentRoutes || []),
        ...(params.allRoute
          ? [garageLandfill?.garage?.polygon, garageLandfill?.landfill?.polygon].filter(Boolean)
          : []),
      ].filter(Boolean),
    [
      scheduledRoutes,
      currentRoutes,
      params.allRoute,
      garageLandfill?.garage?.polygon,
      garageLandfill?.landfill?.polygon,
    ]
  );

  const areaOptions = useMemo(() => {
    try {
      if (!metricData) return defaultAreaOptions;
      const newOption = metricData?.uniqueDriveMetrics?.map((metric: any) => ({
        value: metric?.route_name,
        label: metric?.route_name,
        position: {
          lat: metric?.gps_y,
          lng: metric?.gps_x,
        },
      }));
      return newOption ? [...defaultAreaOptions, ...newOption] : defaultAreaOptions;
    } catch (error) {
      return defaultAreaOptions;
    }
  }, [metricData]);

  useEffect(() => {
    if (currentMetricState) {
      setDetailModal(true);
    }

    if (isSuccess && currentMetricState) {
      const routes = data?.data?.dispatchHistory;
      routes && onMapfitBounds(routes, params.allRoute ? data?.data?.garageAndLandfill : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentMetricState,
    data?.data?.dispatchHistory,
    data?.data?.garageAndLandfill,
    isSuccess,
    params.allRoute,
  ]);

  useEffect(() => {
    (initRouteName || initDate) &&
      onChangeParams({ routeName: initRouteName as string, date: initDate as string });
  }, [initRouteName, initDate]);

  const onChangeParams = (params: IParams) => setParams((prev) => ({ ...prev, ...params }));

  const toggleCondition = () => setIsVisibleCondition(!isVisibleCondition);

  const allStatus = useMemo(
    () =>
      driveStatus?.map((drive) => {
        const current = groupStatusMetric?.find((metric) => Number(metric.drive_mode) == drive.id);
        return {
          key: drive.id,
          label: (
            <S.CarStatus>
              <CarIcon color={drive.color} />
              <S.CarStatusTitle>
                {drive.label}
                {tooltipConfig[`d-${drive.id}`] && (
                  <S.Tooltip
                    placement="bottom"
                    title={tooltipConfig[`d-${drive.id}`]}
                    getPopupContainer={(triggerNode) => triggerNode}
                  >
                    ?
                  </S.Tooltip>
                )}
              </S.CarStatusTitle>
              <span>{current?.metrics?.length || 0}</span>
              {current?.metrics?.length && <div className="collapse-icon"></div>}
            </S.CarStatus>
          ),
          children: <InfoCar data={current?.metrics || []} onChangeParams={onChangeParams} />,
        };
      }),
    [groupStatusMetric]
  );

  const getTime = (data?: number) => {
    if (!data && data !== 0)
      return (
        <>
          <>
            <span>--</span> 분 &nbsp;<span>--</span> 초
          </>
        </>
      );

    const time = data / 60;
    const minute = Math.trunc(time);
    const second = Math.ceil((time - Math.trunc(time)) * 60);

    if (minute == 0)
      return (
        <>
          <span>{second}</span>초
        </>
      );

    if (second == 0)
      return (
        <>
          <span>{minute}</span>분
        </>
      );

    return (
      <>
        <span>{minute}</span>분 &nbsp;<span>{second}</span>초
      </>
    );
  };

  const statistics: DetailStatus[] = useMemo(
    () => [
      {
        title: '연속운전',
        value: getTime(metricInfo?.trip_time),
      },
      {
        title: '이동거리',
        value: (
          <>
            <span>
              {metricInfo?.trip_distance || metricInfo?.trip_distance === 0
                ? kmConversion(metricInfo?.trip_distance)
                : '--'}
            </span>{' '}
            km
          </>
        ),
      },
      {
        title: '과속',
        value: (
          <>
            <span>
              {metricInfo?.speeding || metricInfo?.speeding === 0
                ? metricInfo?.speeding?.toFixed(0)
                : '--'}
            </span>{' '}
            회
          </>
        ),
      },
      {
        title: '공회전',
        value: getTime(metricInfo?.idling),
      },
      {
        title: '급가속',
        value: (
          <>
            <span>
              {metricInfo?.sudden_accel || metricInfo?.sudden_accel === 0
                ? metricInfo?.sudden_accel
                : '--'}
            </span>{' '}
            회
          </>
        ),
      },
      {
        title: '급제동',
        value: (
          <>
            <span>
              {metricInfo?.sudden_break || metricInfo?.sudden_break === 0
                ? metricInfo?.sudden_break
                : '--'}
            </span>{' '}
            회
          </>
        ),
      },
      {
        title: '미관제',
        value: getTime(metricInfo?.not_managed),
      },
      {
        title: '운행종료',
        value: getTime(metricInfo?.out_of_control),
      },
    ],
    [metricInfo]
  );

  const timeOptions: SelectData[] = [
    { value: 10000, label: '10초' },
    { value: 20000, label: '20초' },
    { value: 30000, label: '30초' },
    { value: 60000, label: '60초' },
  ];

  const onScreenExport = () => {
    contentRef.current && exportToPDF(contentRef.current);
  };

  const onClearAreaPolygons = useCallback(() => {
    if (!activeArea) return;
    setActiveArea(false);
  }, [activeArea]);

  const getPolygonBounds = (dispatchHistory: IMetricDetail[], other?: any[]) => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    dispatchHistory.forEach((entry: IMetricDetail) => {
      const { y: startLat, x: startLng } = entry.start_coords;
      const { y: endLat, x: endLng } = entry.end_coords;

      // Update bounds
      minLat = Math.min(minLat, startLat, endLat);
      maxLat = Math.max(maxLat, startLat, endLat);
      minLng = Math.min(minLng, startLng, endLng);
      maxLng = Math.max(maxLng, startLng, endLng);
    });

    if (other) {
      other.forEach((entry: any) =>
        entry?.segment_line?.map((item: any) => {
          // Update bounds
          minLat = Math.min(minLat, item?.[1]);
          maxLat = Math.max(maxLat, item?.[1]);
          minLng = Math.min(minLng, item?.[0]);
          maxLng = Math.max(maxLng, item?.[0]);
        })
      );
    }

    return { minLat, maxLat, minLng, maxLng };
  };

  const onMapfitBounds = (routes: IMetricDetail[], other?: any[]) => {
    try {
      const { minLat, maxLat, minLng, maxLng } = getPolygonBounds(routes, other);
      // Create a LatLngBounds object
      // eslint-disable-next-line no-undef
      const bounds = new naver.maps.LatLngBounds(
        // eslint-disable-next-line no-undef
        new naver.maps.LatLng(minLat, minLng),
        // eslint-disable-next-line no-undef
        new naver.maps.LatLng(maxLat, maxLng)
      );
      // Fit the map to the bounds
      map.panToBounds(bounds);
    } catch (error) {
      console.log(error);
    }
  };

  const onToggleAllRoute = async () => {
    const routes = data?.data?.dispatchHistory;
    if (!routes) return;
    await onMapfitBounds(routes, data?.data?.garageAndLandfill);
    onChangeParams({ ...params, allRoute: params.allRoute === true ? null : true });
  };

  const getCurrentAreaLocation = async () => {
    const routes = data?.data?.dispatchHistory;
    if (!routes) return;
    await onMapfitBounds(routes);
    onChangeParams({ ...params, allRoute: params.allRoute === false ? null : false });
  };

  return {
    map,
    timeOptions,
    isVisibleCondition,
    allStatus,
    isVisibleLastUpdated,
    zScore,
    areaOptions,
    statistics,
    isSingleVehicle: params.routeName !== null,
    markers,
    polygons: params.routeName ? (polygons.filter(Boolean) as PolylineProps[]) : [],
    areaPolygons,
    metricInfo,
    lastUpdated,
    params,
    isLoading,
    isError,
    contentRef,
    preview,
    detailModal,
    metricData,
    weightRatio,
    onClearAreaPolygons,
    setDetailModal,
    setPreview,
    setMap,
    refetch,
    toggleCondition,
    onChangeParams,
    onScreenExport,
    onToggleAllRoute,
    getCurrentAreaLocation,
  };
}
