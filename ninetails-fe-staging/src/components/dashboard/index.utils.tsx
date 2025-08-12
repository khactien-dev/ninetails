import { BaseUpload, BaseUploadProps } from '@/components/common/base-upload';
import { DATE_FORMAT } from '@/constants';
import { USER_ROLE } from '@/constants/settings';
import { useGetDashboard, useUpdateLogo } from '@/hooks/features/useDashboard';
import { useFeedback } from '@/hooks/useFeedback';
import { DashboardRequest } from '@/interfaces';
import { ConvertDashboardDataOutput, IDashboardData } from '@/interfaces/dashboard';
import {
  selectCurrentUser,
  selectUserOperationInfo,
  updateUserOperationInfo,
} from '@/stores/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { detectDate } from '@/utils';
import { unitConverted } from '@/utils/control';
import cookies from '@/utils/cookie';
import type { TabsProps, UploadFile } from 'antd';
import dayjs, { OpUnitType } from 'dayjs';
import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile<any>;
  fileList: UploadFile<any>[];
}

export interface ViewConfig {
  [key: string]: boolean;
}

interface DataInfoItem {
  key: number;
  name: string;
  value: string;
}

export interface DataCardListItem {
  key: string;
  title: string;
  desc: string;
  type?: string;
  date?: string;
  unit?: string;
}

export interface RadioItem {
  key: string;
  name: string;
}

export interface CheckboxItem {
  key: string;
  label: string;
  span: string;
}

export interface SelectData {
  value: string | number | null;
  label: string;
  position?: {
    lat: number;
    lng: number;
  };
}

export enum ANALYSIS_TIME {
  TODAY_YESTERDAY = 'day',
  ONE_WEEK = 'week',
  ONE_MONTH = 'month',
  ONE_YEAR = 'year',
}

export const ANALYSIS_TIME_KEY = {
  day: '1일',
  week: '1주',
  month: '1달',
  year: '1년',
};

export enum TABS {
  AVERAGE = 'average',
  TOTAL = 'total',
}

const viewDefault: ViewConfig = {
  vehicleOperatingRate: true,
  ecoOperationScore: true,
  operatingTime: true,
  drivingDistance: true,
  collectionAmount: true,
  collectionWeight: true,
  collectionTime: true,
  collectionDistance: true,
  speeding: false,
  idling: false,
  suddenAcceleration: false,
  suddenBraking: false,
};

interface Utils {
  loading: boolean;
  logoUrl: string;
  view: ViewConfig;
  params: DashboardRequest;
  dataInfo: DataInfoItem[];
  cardList: DataCardListItem[];
  tabs: TabsProps['items'];
  radios: RadioItem[];
  checkboxs: CheckboxItem[];
  timeOptions: SelectData[];
  dashboardData: IDashboardData | null;
  tab: string;
  uploadProps: BaseUploadProps;
  isUpdateLogoPending: boolean;
  userOperationInfo: {
    logo: string;
    organization: string;
  };
  getDatetitle: {
    current: string;
    previous: string;
  };
  setView: React.Dispatch<React.SetStateAction<ViewConfig>>;
  refetch: () => void;
  handleChangeParams: (params: DashboardRequest) => void;
  handleChangeTime: (date: string) => void;
  onChangeTab: (activeKey: string) => void;
}

export default function useDashboard(): Utils {
  const { notification } = useFeedback();
  const dispatch = useAppDispatch();
  const userOperationInfo = useAppSelector(selectUserOperationInfo);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentView = cookies.get('view');
  const [tab, setTab] = useState<string>(TABS.AVERAGE);
  const [view, setView] = useState<ViewConfig>(currentView ? JSON.parse(currentView) : viewDefault);
  const [params, setParams] = useState<DashboardRequest>(() => {
    const view = currentView ? JSON.parse(currentView) : viewDefault;
    return {
      analysisTime: view.time || ANALYSIS_TIME.TODAY_YESTERDAY,
      updateTime: 10000,
      ...detectDate(view.time),
    };
  });

  const { data, isLoading, refetch } = useGetDashboard(params);
  const { mutate: updateLogo, isPending: isUpdateLogoPending } = useUpdateLogo();
  const lastUpdate = dayjs(data?.data.dataNow.last_updated).format('mm/dd');

  const dashboardData = useMemo((): IDashboardData | null => {
    try {
      if (!data?.data) return null;
      const {
        dataNow,
        dataOld,
        last_updated,
        numberOfRegisterVehicleNow,
        numberOfRouterNow,
        numberOfStaffNow,
        totalActiveVehicleNow,
      } = data.data;

      const newData = {
        dataNow: omit(dataNow, [
          'numberOfRegisterVehicle',
          'numberOfRouter',
          'numberOfStaff',
          'totalActiveVehicle',
        ]),
        dataOld: omit(dataOld, [
          'numberOfRegisterVehicle',
          'numberOfRouter',
          'numberOfStaff',
          'totalActiveVehicle',
        ]),
      };

      return {
        lastUpdate: last_updated ? dayjs(last_updated).format(DATE_FORMAT.DATE_YT) : '--',
        totalAnalysisData: {
          numberOfRegisterVehicleNow,
          numberOfRouterNow,
          numberOfStaffNow,
          totalActiveVehicleNow,
          now: {
            numberOfRegisterVehicle: dataNow.numberOfRegisterVehicle,
            numberOfRouter: dataNow.numberOfRouter,
            numberOfStaff: dataNow.numberOfStaff,
            totalActiveVehicle: dataNow.totalActiveVehicle,
          },
        },
        analysisData: unitConverted(newData, tab) as ConvertDashboardDataOutput,
      };
    } catch (error) {
      return null;
    }
  }, [data, tab]);

  const dataInfo = useMemo(() => {
    return [
      // {
      //   key: 1,
      //   name: '면적',
      //   value: '222.78 km',
      // },
      {
        key: 2,
        name: '수거구',
        value: dashboardData?.totalAnalysisData?.numberOfRouterNow + '개',
      },
      {
        key: 3,
        name: '등록차량',
        value: dashboardData?.totalAnalysisData?.numberOfRegisterVehicleNow + '대',
      },
      {
        key: 4,
        name: '배차인원',
        value: dashboardData?.totalAnalysisData?.numberOfStaffNow + '명',
      },
    ];
  }, [dashboardData]);

  const dataCardList = [
    {
      key: 'vehicleOperatingRate',
      title: '차량운행률',
      desc: '전체 차량 중 운행 중인 차량',
      type: 'percent',
      date: lastUpdate,
      unit: '%',
    },
    {
      key: 'ecoOperationScore',
      title: '에코운행점수',
      desc: '안전 x 경제운행 점수',
      type: 'percent',
      date: lastUpdate,
      unit: '',
    },
    {
      key: 'operatingTime',
      title: '운행시간',
      desc: '차량당 전체구간 운행시간',
      unit: '분',
      date: lastUpdate,
    },
    {
      key: 'drivingDistance',
      title: '운행거리',
      desc: '차량당 전체구간 운행거리',
      unit: 'km',
      date: lastUpdate,
    },
    {
      key: 'collectionAmount',
      title: '수거량',
      desc: '차량당 수거 개수',
      unit: '개',
      date: lastUpdate,
    },
    {
      key: 'collectionWeight',
      title: '수거무게',
      desc: '차량당 수거 무게',
      unit: 'kg',
      date: lastUpdate,
    },
    {
      key: 'collectionTime',
      title: '수거시간',
      desc: '차량당 수거구간 내 운행시간',

      unit: '분',
      date: lastUpdate,
    },
    {
      key: 'collectionDistance',
      title: '수거거리',
      desc: '차량당 수거구간 내 운행거리',
      unit: 'km',
      date: lastUpdate,
    },
    {
      key: 'speeding',
      title: '과속',
      desc: '도로 속도제한 대비 20km/h 이상 초과 횟수',
      unit: '회',
      date: lastUpdate,
    },
    {
      key: 'idling',
      title: '공회전',
      desc: '시동 상태에서 0km/h 지속 시간',
      unit: '분',
      date: lastUpdate,
    },
    {
      key: 'suddenAcceleration',
      title: '급가속',
      desc: '초속 기준 6km/h 이상 가속 횟수',
      unit: '회',
      date: lastUpdate,
    },
    {
      key: 'suddenBraking',
      title: '급제동',
      desc: '초속 기준 9km/h 이상 감속 횟수',
      unit: '회',
      date: lastUpdate,
    },
  ];

  const cardList = useMemo(() => {
    return dataCardList.filter((card) => view[card.key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const tabs: TabsProps['items'] = [
    {
      key: TABS.AVERAGE,
      label: '평균',
    },
    {
      key: TABS.TOTAL,
      label: '합계',
    },
  ];

  const radios = [
    {
      key: ANALYSIS_TIME.TODAY_YESTERDAY,
      name: '1일: 오늘 vs. 어제',
    },
    {
      key: ANALYSIS_TIME.ONE_WEEK,
      name: '1주: 이번 주 vs. 지난 주',
    },
    {
      key: ANALYSIS_TIME.ONE_MONTH,
      name: '1달: 이번 달 vs. 지난 달',
    },
    {
      key: ANALYSIS_TIME.ONE_YEAR,
      name: '1년: 올해 vs. 지난 해',
    },
  ];

  const checkboxs = [
    {
      key: 'vehicleOperatingRate',
      label: '차량운행률',
      span: '전체 차량 중 운행 중인 차량',
    },
    {
      key: 'ecoOperationScore',
      label: '에코운행점수',
      span: '안전 x 경제운행 점수',
    },
    {
      key: 'operatingTime',
      label: '운행시간',
      span: '차량당 전체구간 운행시간',
    },
    {
      key: 'drivingDistance',
      label: '운행거리',
      span: '차량당 전체구간 운행거리',
    },
    {
      key: 'collectionAmount',
      label: '수거량',
      span: '차량당 수거 개수',
    },
    {
      key: 'collectionWeight',
      label: '수거무게',
      span: '차량당 수거 무게',
    },
    {
      key: 'collectionTime',
      label: '수거시간',
      span: '차량당 수거구간 내 운행시간',
    },
    {
      key: 'collectionDistance',
      label: '수거거리',
      span: '차량당 수거구간 내 운행거리',
    },
    {
      key: 'speeding',
      label: '과속',
      span: '도로 속도제한 대비 20km/h 이상 초과 횟수',
    },
    {
      key: 'idling',
      label: '공회전',
      span: '시동 상태에서 0km/h 지속 시간',
    },
    {
      key: 'suddenAcceleration',
      label: '급가속',
      span: '초속 기준 6km/h 이상 가속 횟수',
    },
    {
      key: 'suddenBraking',
      label: '급제동',
      span: '초속 기준 9km/h 이상 감속 횟수',
    },
  ];

  const timeOptions: SelectData[] = [
    { value: 1, label: '1일' },
    { value: 7, label: '1주' },
    { value: 30, label: '1달' },
    { value: 365, label: '1년' },
  ];

  const getDatetitle = useMemo(() => {
    switch (params.analysisTime) {
      case ANALYSIS_TIME.TODAY_YESTERDAY:
        return {
          current: '오늘',
          previous: '어제',
        };

      case ANALYSIS_TIME.ONE_WEEK:
        return {
          current: '이번 주',
          previous: '지난 주',
        };

      case ANALYSIS_TIME.ONE_MONTH:
        return {
          current: '이번 달',
          previous: '지난 달',
        };

      case ANALYSIS_TIME.ONE_YEAR:
        return {
          current: '올해',
          previous: '지난 해',
        };

      default:
        return {
          current: '',
          previous: '',
        };
    }
  }, [params.analysisTime]);

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      await updateLogo(formData, {
        onSuccess: (response) => {
          dispatch(updateUserOperationInfo({ logo: response?.data?.image }));
          onSuccess('Ok');
        },
        onError: (error) => {
          notification.error({ message: 'Failed to update logo' });
          onError({ error });
        },
      });
    } catch (err) {
      notification.error({ message: 'An error occurred' });
      onError({ err });
    }
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
    return (
      <div className={file.status === 'done' ? 'ant-upload-list-item' : ''}>
        {originNode.props.children}{' '}
      </div>
    );
  };

  const uploadProps: BaseUploadProps = {
    name: 'image',
    multiple: false,
    maxCount: 1,
    disabled: currentUser?.role !== USER_ROLE.OP && currentUser?.role !== USER_ROLE.BACKUP,
    listType: 'picture-card',
    onPreview,
    accept: '.jpg, .jpeg, .png',
    itemRender: (originNode, file, fileList) => (
      <DraggableUploadListItem originNode={originNode} file={file} fileList={fileList} />
    ),
    beforeUpload: (file) => {
      const isImage =
        file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
      if (!isImage) {
        notification.error({ message: 'JPEG, JPG, PNG 파일만 허용됩니다.' });
        return BaseUpload.LIST_IGNORE;
      }
      if (file.size > 10 * 1024 * 1024) {
        notification.error({
          message: '파일이 너무 큽니다. 10MB 이하의 파일을 업로드해 주세요.',
        });
        return BaseUpload.LIST_IGNORE;
      }

      return true;
    },
    customRequest,
    showUploadList: false,
  };

  const handleChangeParams = (params: DashboardRequest) =>
    setParams((prev) => ({ ...prev, ...params }));

  const handleChangeTime = (date: string) => {
    if (!date) return;
    setParams((prev) => ({
      ...prev,
      analysisTime: date,
      ...detectDate(date as OpUnitType),
    }));
  };

  const onChangeTab = (activeKey: string) => {
    setTab(activeKey);
  };

  return {
    loading: isLoading,
    isUpdateLogoPending,
    tab,
    view,
    dataInfo,
    cardList,
    tabs,
    radios,
    checkboxs,
    timeOptions,
    params,
    dashboardData,
    uploadProps,
    logoUrl: userOperationInfo?.logo?.image,
    userOperationInfo,
    getDatetitle,
    setView,
    refetch,
    handleChangeParams,
    handleChangeTime,
    onChangeTab,
  };
}
