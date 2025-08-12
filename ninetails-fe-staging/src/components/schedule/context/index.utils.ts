import { DATE_FORMAT } from '@/constants';
import {
  useGetCompositeWasteSchedule,
  useGetFoodWasteSchedule,
  useGetReusableWasteSchedule,
  useGetScheduleStatistic,
  useGetTaticalMobilitySchedule,
  useUpdateSchedule,
} from '@/hooks/features/useSchedule';
import { useFeedback } from '@/hooks/useFeedback';
import {
  ICrewCount,
  ICrewOnPurpose,
  ICrewStatusDataSourceItem,
  ISchedule,
  ISchedulePurposeStatistic,
  IVehicleCount,
  IVehicleOnPurpose,
  IVehicleStatusDataSourceItem,
  IWholeDataTree,
} from '@/interfaces/schedule';
import { queryClient } from '@/utils/react-query';
import dayjs from 'dayjs';
import { max } from 'lodash';
import { Dispatch, SetStateAction, createContext, useEffect, useMemo, useState } from 'react';

interface IAnalysisContext {
  params: IScheduleParams;
  setParams: Dispatch<SetStateAction<IScheduleParams>>;
  wholeStaffDataSource: IWholeDataTree[];
  wholeVehicleDataSource: IWholeDataTree[];
  availableStaff: {
    firstPage: ICrewStatusDataSourceItem[];
    secondPage: ICrewStatusDataSourceItem[];
  };
  absenceStaff: {
    firstPage: ICrewStatusDataSourceItem[];
    secondPage: ICrewStatusDataSourceItem[];
  };
  absenceVehicle: {
    firstPage: IVehicleStatusDataSourceItem[];
    secondPage: IVehicleStatusDataSourceItem[];
  };
  availableVehicle: {
    firstPage: IVehicleStatusDataSourceItem[];
    secondPage: IVehicleStatusDataSourceItem[];
  };
  isDisabledScheduleEdit: boolean;
  compositeWasteSchedule: ISchedule[];
  foodWasteSchedule: ISchedule[];
  reusableWasteSchedule: ISchedule[];
  taticalMobilityWasteSchedule: ISchedule[];
  statisticLoading: boolean;
  compositeWasteLoading: boolean;
  foodWasteLoading: boolean;
  reusableWasteLoading: boolean;
  taticalMobilityLoading: boolean;
  staffDispatchingCount: number;
  staffActiveCount: number;
  staffAbsenceCount: number;
  vehicleDispatchingCount: number;
  vehicleActiveCount: number;
  vehicleAbsenceCount: number;
  allPurposeStatistic: ISchedulePurposeStatistic;
  selectedComposite: (string | number)[];
  selectedFood: (string | number)[];
  selectedReusable: (string | number)[];
  selectedTactical: (string | number)[];
  selectedUpdatingSchedule: ISelectedUpdatingSchedule;
  isOpenConfirmUpdate: boolean;
  totalSchedule: number;
  setIsOpenConfirmUpdate: Dispatch<SetStateAction<boolean>>;
  setSelectedUpdatingSchedule: Dispatch<SetStateAction<ISelectedUpdatingSchedule>>;
  setSelectedComposite: Dispatch<SetStateAction<(string | number)[]>>;
  setSelectedFood: Dispatch<SetStateAction<(string | number)[]>>;
  setSelectedReusable: Dispatch<SetStateAction<(string | number)[]>>;
  setSelectedTatical: Dispatch<SetStateAction<(string | number)[]>>;
}

export const DEFAULT_PURPOSE_STATISTIC = {
  routeCount: 0,
  vehicleRegularCount: 0,
  vehicleBackupCount: 0,
  driverRegularCount: 0,
  driverBackupCount: 0,
  collectRegularCount: 0,
  collectBackupCount: 0,
  sumNonCollectDistance: 0,
  sumCollectDistance: 0,
  replacementRate: 0,
};

export const DEFAULT_SELECTED_UPDATING_SCHEDULE: ISelectedUpdatingSchedule = {
  id: null,
  currentVehicleId: null,
  currentDriverId: null,
  currentStaff1Id: null,
  currentStaff2Id: null,
  targetVehicleId: null,
  backupVehicleId: null,
  backupDriverId: null,
  backupStaff1Id: null,
  backupStaff2Id: null,
  targetCrew: null,
  purpose: null,
};

export const ScheduleContext = createContext<IAnalysisContext>({
  params: {
    working_date: dayjs().format(DATE_FORMAT.R_BASIC),
  },
  setParams: () => {},
  wholeStaffDataSource: [],
  wholeVehicleDataSource: [],
  availableStaff: {
    firstPage: [],
    secondPage: [],
  },
  absenceStaff: {
    firstPage: [],
    secondPage: [],
  },
  absenceVehicle: {
    firstPage: [],
    secondPage: [],
  },
  availableVehicle: {
    firstPage: [],
    secondPage: [],
  },
  isDisabledScheduleEdit: false,
  compositeWasteSchedule: [],
  foodWasteSchedule: [],
  reusableWasteSchedule: [],
  taticalMobilityWasteSchedule: [],
  statisticLoading: false,
  compositeWasteLoading: false,
  foodWasteLoading: false,
  reusableWasteLoading: false,
  taticalMobilityLoading: false,
  staffDispatchingCount: 0,
  staffActiveCount: 0,
  staffAbsenceCount: 0,
  vehicleDispatchingCount: 0,
  vehicleActiveCount: 0,
  vehicleAbsenceCount: 0,
  allPurposeStatistic: DEFAULT_PURPOSE_STATISTIC,
  selectedComposite: [],
  selectedFood: [],
  selectedReusable: [],
  selectedTactical: [],
  selectedUpdatingSchedule: DEFAULT_SELECTED_UPDATING_SCHEDULE,
  isOpenConfirmUpdate: false,
  totalSchedule: 0,
  setIsOpenConfirmUpdate: () => {},
  setSelectedUpdatingSchedule: () => {},
  setSelectedComposite: () => {},
  setSelectedFood: () => {},
  setSelectedReusable: () => {},
  setSelectedTatical: () => {},
});

export interface IScheduleParams {
  working_date: string;
  purpose?: string;
  pageSize?: number;
}

interface ISelectedUpdatingSchedule {
  id?: string | number | null;
  currentVehicleId?: string | number | null;
  currentDriverId?: string | number | null;
  currentStaff1Id?: string | number | null;
  currentStaff2Id?: string | number | null;
  backupDriverId?: string | number | null;
  backupStaff1Id?: string | number | null;
  backupStaff2Id?: string | number | null;
  backupVehicleId?: string | number | null;
  targetVehicleId?: string | number | null;
  targetCrew?: string | number | null;
  purpose?: string | null;
}

const DEFAULT_STAFF_COUNT: ICrewCount = {
  DRIVING_CREW_REGULAR: [0, 0, 0],
  COLLECT_CREW_REGULAR: [0, 0, 0],
  COLLECT_CREW_MONTHLY: [0, 0, 0],
  COLLECT_CREW_FIXED_TERM: [0, 0, 0],
  SUPPORT_CREW_REGULAR: [0, 0, 0],
  SUPPORT_CREW_FIXED_TERM: [0, 0, 0],
};

const DEFAULT_VEHICLE_COUNT: IVehicleCount = {
  COMPOSITE_REGULAR: [0, 0, 0],
  COMPOSITE_SUPPORT: [0, 0, 0],
  FOOD_REGULAR: [0, 0, 0],
  FOOD_SUPPORT: [0, 0, 0],
  REUSABLE_REGULAR: [0, 0, 0],
  REUSABLE_SUPPORT: [0, 0, 0],
  TATICAL_MOBILITY_REGULAR: [0, 0, 0],
  TATICAL_MOBILITY_SUPPORT: [0, 0, 0],
};

const getStaffWholeDataSource = (staffCount: ICrewCount): IWholeDataTree[] => {
  const totalDrivingRegular =
    staffCount.DRIVING_CREW_REGULAR[0] +
    staffCount.DRIVING_CREW_REGULAR[1] +
    staffCount.DRIVING_CREW_REGULAR[2];

  const totalCollectRegular =
    staffCount.COLLECT_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_REGULAR[2];

  const totalCollectMonthly =
    staffCount.COLLECT_CREW_MONTHLY[0] +
    staffCount.COLLECT_CREW_MONTHLY[1] +
    staffCount.COLLECT_CREW_MONTHLY[2];

  const totalCollectFixedTerm =
    staffCount.SUPPORT_CREW_FIXED_TERM[0] +
    staffCount.SUPPORT_CREW_FIXED_TERM[1] +
    staffCount.SUPPORT_CREW_FIXED_TERM[2];

  const totalSupportRegular =
    staffCount.SUPPORT_CREW_REGULAR[0] +
    staffCount.SUPPORT_CREW_REGULAR[1] +
    staffCount.SUPPORT_CREW_REGULAR[2];

  const totalSupportFixedTerm =
    staffCount.SUPPORT_CREW_FIXED_TERM[0] +
    staffCount.SUPPORT_CREW_FIXED_TERM[1] +
    staffCount.SUPPORT_CREW_FIXED_TERM[2];

  const totalDispatching =
    staffCount.DRIVING_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_MONTHLY[0] +
    staffCount.COLLECT_CREW_FIXED_TERM[0] +
    staffCount.SUPPORT_CREW_REGULAR[0] +
    staffCount.SUPPORT_CREW_FIXED_TERM[0];

  const totalAvailabel =
    staffCount.DRIVING_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_MONTHLY[1] +
    staffCount.COLLECT_CREW_FIXED_TERM[1] +
    staffCount.SUPPORT_CREW_REGULAR[1] +
    staffCount.SUPPORT_CREW_FIXED_TERM[1];

  const totalAbsent =
    staffCount.DRIVING_CREW_REGULAR[2] +
    staffCount.COLLECT_CREW_REGULAR[2] +
    staffCount.COLLECT_CREW_MONTHLY[2] +
    staffCount.COLLECT_CREW_FIXED_TERM[2] +
    staffCount.SUPPORT_CREW_REGULAR[2] +
    staffCount.SUPPORT_CREW_FIXED_TERM[2];

  const totalDrivingDispatching = staffCount.DRIVING_CREW_REGULAR[0];
  const totalDrivingAvailabel = staffCount.DRIVING_CREW_REGULAR[1];
  const totalDrivingAbsent = staffCount.DRIVING_CREW_REGULAR[2];

  const totalCollectDispatching =
    staffCount.COLLECT_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_MONTHLY[0] +
    staffCount.COLLECT_CREW_FIXED_TERM[0];
  const totalCollectAvailabel =
    staffCount.COLLECT_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_MONTHLY[1] +
    staffCount.COLLECT_CREW_FIXED_TERM[1];
  const totalCollectAbsent =
    staffCount.COLLECT_CREW_REGULAR[2] +
    staffCount.COLLECT_CREW_MONTHLY[2] +
    staffCount.COLLECT_CREW_FIXED_TERM[2];

  const totalSupportDispatching =
    staffCount.SUPPORT_CREW_REGULAR[0] + staffCount.SUPPORT_CREW_FIXED_TERM[0];
  const totalSupportAvailabel =
    staffCount.SUPPORT_CREW_REGULAR[1] + staffCount.SUPPORT_CREW_FIXED_TERM[1];
  const totalSupportAbsent =
    staffCount.SUPPORT_CREW_REGULAR[2] + staffCount.SUPPORT_CREW_FIXED_TERM[2];

  return [
    {
      key: 'total_staff',
      key_indicator: '전체 인력',
      dispatching: totalDispatching,
      available: totalAvailabel,
      absent: totalAbsent,
      total: totalDispatching + totalAvailabel + totalAbsent,
      bolds: ['dispatching', 'available', 'absent', 'total'],
      layer: 1,
    },
    {
      key: 'driving',
      key_indicator: '운전',
      dispatching: totalDrivingDispatching,
      available: totalDrivingAvailabel,
      absent: totalDrivingAbsent,
      total: totalDrivingDispatching + totalDrivingAvailabel + totalDrivingAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'driving_regular',
          key_indicator: '정규',
          dispatching: staffCount.DRIVING_CREW_REGULAR[0],
          available: staffCount.DRIVING_CREW_REGULAR[1],
          absent: staffCount.DRIVING_CREW_REGULAR[2],
          total: totalDrivingRegular,
          layer: 2,
        },
      ],
    },

    {
      key: 'support',
      key_indicator: '지원',
      dispatching: totalSupportDispatching,
      available: totalSupportAvailabel,
      absent: totalSupportAbsent,
      total: totalSupportDispatching + totalSupportAvailabel + totalSupportAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'support_regular',
          key_indicator: '정규',
          dispatching: staffCount.SUPPORT_CREW_REGULAR[0],
          available: staffCount.SUPPORT_CREW_REGULAR[1],
          absent: staffCount.SUPPORT_CREW_REGULAR[2],
          total: totalSupportRegular,
          layer: 2,
        },
        {
          key: 'support_fixed_term',
          key_indicator: '계약',
          dispatching: staffCount.SUPPORT_CREW_FIXED_TERM[0],
          available: staffCount.SUPPORT_CREW_FIXED_TERM[1],
          absent: staffCount.SUPPORT_CREW_FIXED_TERM[2],
          total: totalSupportFixedTerm,
          layer: 2,
        },
      ],
    },
    {
      key: 'collect',
      key_indicator: '탑승',
      dispatching: totalCollectDispatching,
      available: totalCollectAvailabel,
      absent: totalCollectAbsent,
      total: totalCollectDispatching + totalCollectAvailabel + totalCollectAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'collect_regular',
          key_indicator: '정규',
          dispatching: staffCount.COLLECT_CREW_REGULAR[0],
          available: staffCount.COLLECT_CREW_REGULAR[1],
          absent: staffCount.COLLECT_CREW_REGULAR[2],
          total: totalCollectRegular,
          layer: 2,
        },
        {
          key: 'collect_monthly',
          key_indicator: '단기',
          dispatching: staffCount.COLLECT_CREW_MONTHLY[0],
          available: staffCount.COLLECT_CREW_MONTHLY[1],
          absent: staffCount.COLLECT_CREW_MONTHLY[2],
          total: totalCollectMonthly,
          layer: 2,
        },
        {
          key: 'collect_fixed_term',
          key_indicator: '계약',
          dispatching: staffCount.SUPPORT_CREW_FIXED_TERM[0],
          available: staffCount.SUPPORT_CREW_FIXED_TERM[1],
          absent: staffCount.SUPPORT_CREW_FIXED_TERM[2],
          total: totalCollectFixedTerm,
          layer: 2,
        },
      ],
    },
  ];
};

const getStaffStatusDataSource = (staffStatus: ICrewOnPurpose) => {
  const dataSourceFirstPage: ICrewStatusDataSourceItem[] = [
    {
      driving_regular: {
        total: staffStatus.DRIVING_CREW_REGULAR?.length,
        isSummary: true,
      },
      support_regular: {
        total: staffStatus.SUPPORT_CREW_REGULAR?.length,
        isSummary: true,
      },
      support_fixed_term: { total: staffStatus?.SUPPORT_CREW_FIXED_TERM?.length, isSummary: true },
    },
  ];
  const dataSourceSecondPage: ICrewStatusDataSourceItem[] = [
    {
      collect_regular: {
        total: staffStatus.COLLECT_CREW_REGULAR?.length,
        isSummary: true,
      },
      collect_monthly: {
        total: staffStatus.COLLECT_CREW_MONTHLY?.length,
        isSummary: true,
      },
      collect_fixed_term: { total: staffStatus?.COLLECT_CREW_FIXED_TERM?.length, isSummary: true },
    },
  ];
  const rowCountFirstPage =
    max([
      staffStatus.DRIVING_CREW_REGULAR?.length,
      staffStatus.SUPPORT_CREW_REGULAR?.length,
      staffStatus.SUPPORT_CREW_FIXED_TERM?.length,
    ]) ?? 0;
  for (let i = 0; i < rowCountFirstPage; i++) {
    dataSourceFirstPage.push({
      driving_regular: { value: staffStatus.DRIVING_CREW_REGULAR[i] },
      support_regular: { value: staffStatus.SUPPORT_CREW_REGULAR[i] },
      support_fixed_term: { value: staffStatus.SUPPORT_CREW_FIXED_TERM[i] },
    });
  }

  const rowCounSecondPage =
    max([
      staffStatus.COLLECT_CREW_REGULAR?.length,
      staffStatus.COLLECT_CREW_MONTHLY?.length,
      staffStatus.COLLECT_CREW_FIXED_TERM?.length,
    ]) ?? 0;

  for (let i = 0; i < rowCounSecondPage; i++) {
    dataSourceSecondPage.push({
      collect_regular: { value: staffStatus.COLLECT_CREW_REGULAR[i] },
      collect_monthly: { value: staffStatus.COLLECT_CREW_MONTHLY[i] },
      collect_fixed_term: { value: staffStatus.COLLECT_CREW_FIXED_TERM[i] },
    });
  }

  return {
    firstPage: dataSourceFirstPage,
    secondPage: dataSourceSecondPage,
  };
};

const getVehicleWholeDataSource = (vehicleCount: IVehicleCount) => {
  const totalCompositeRegular =
    vehicleCount.COMPOSITE_REGULAR[0] +
    vehicleCount.COMPOSITE_REGULAR[1] +
    vehicleCount.COMPOSITE_REGULAR[2];

  const totalFoodRegular =
    vehicleCount.FOOD_REGULAR[0] + vehicleCount.FOOD_REGULAR[1] + vehicleCount.FOOD_REGULAR[2];

  const totalReusableRegular =
    vehicleCount.REUSABLE_REGULAR[0] +
    vehicleCount.REUSABLE_REGULAR[1] +
    vehicleCount.REUSABLE_REGULAR[2];

  const totalTaticalMobitlityRegluar =
    vehicleCount.TATICAL_MOBILITY_REGULAR[0] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[1] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[2];

  const totalCompositeSupport =
    vehicleCount.COMPOSITE_SUPPORT[0] +
    vehicleCount.COMPOSITE_SUPPORT[1] +
    vehicleCount.COMPOSITE_SUPPORT[2];

  const totalFoodSupport =
    vehicleCount.FOOD_SUPPORT[0] + vehicleCount.FOOD_SUPPORT[1] + vehicleCount.FOOD_SUPPORT[2];

  const totalReusableSupport =
    vehicleCount.REUSABLE_SUPPORT[0] +
    vehicleCount.REUSABLE_SUPPORT[1] +
    vehicleCount.REUSABLE_SUPPORT[2];

  const totalTaticalMobilitySupport =
    vehicleCount.TATICAL_MOBILITY_SUPPORT[0] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[1] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[2];

  const totalDispatching =
    vehicleCount.COMPOSITE_REGULAR[0] +
    vehicleCount.FOOD_REGULAR[0] +
    vehicleCount.REUSABLE_REGULAR[0] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[0] +
    vehicleCount.COMPOSITE_SUPPORT[0] +
    vehicleCount.FOOD_SUPPORT[0] +
    vehicleCount.REUSABLE_SUPPORT[0] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[0];

  const totalAvailabel =
    vehicleCount.COMPOSITE_REGULAR[1] +
    vehicleCount.FOOD_REGULAR[1] +
    vehicleCount.REUSABLE_REGULAR[1] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[1] +
    vehicleCount.COMPOSITE_SUPPORT[1] +
    vehicleCount.FOOD_SUPPORT[1] +
    vehicleCount.REUSABLE_SUPPORT[1] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[1];

  const totalAbsent =
    vehicleCount.COMPOSITE_REGULAR[2] +
    vehicleCount.FOOD_REGULAR[2] +
    vehicleCount.REUSABLE_REGULAR[2] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[2] +
    vehicleCount.COMPOSITE_SUPPORT[2] +
    vehicleCount.FOOD_SUPPORT[2] +
    vehicleCount.REUSABLE_SUPPORT[2] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[2];

  const totalCompositeDispatching =
    vehicleCount.COMPOSITE_REGULAR[0] + vehicleCount.COMPOSITE_SUPPORT[0];
  const totalCompositeAvailable =
    vehicleCount.COMPOSITE_REGULAR[1] + vehicleCount.COMPOSITE_SUPPORT[1];
  const totalCompositeAbsent =
    vehicleCount.COMPOSITE_REGULAR[2] + vehicleCount.COMPOSITE_SUPPORT[2];

  const totalFoodDispatching = vehicleCount.FOOD_REGULAR[0] + vehicleCount.FOOD_SUPPORT[0];
  const totalFoodAvailable = vehicleCount.FOOD_REGULAR[1] + vehicleCount.FOOD_SUPPORT[1];
  const totalFoodAbsent = vehicleCount.FOOD_REGULAR[2] + vehicleCount.FOOD_SUPPORT[2];

  const totalReusableDispatching =
    vehicleCount.REUSABLE_REGULAR[0] + vehicleCount.REUSABLE_SUPPORT[0];
  const totalReusableAvailable =
    vehicleCount.REUSABLE_REGULAR[1] + vehicleCount.REUSABLE_SUPPORT[1];
  const totalReusableAbsent = vehicleCount.REUSABLE_REGULAR[2] + vehicleCount.REUSABLE_SUPPORT[2];

  const totalTaticalDispatching =
    vehicleCount.TATICAL_MOBILITY_REGULAR[0] + vehicleCount.TATICAL_MOBILITY_SUPPORT[0];
  const totalTacticalAvailable =
    vehicleCount.TATICAL_MOBILITY_REGULAR[1] + vehicleCount.TATICAL_MOBILITY_SUPPORT[1];
  const totalTacticalAbsent =
    vehicleCount.TATICAL_MOBILITY_REGULAR[2] + vehicleCount.TATICAL_MOBILITY_SUPPORT[2];

  return [
    {
      key: 'total_vehicle',
      key_indicator: '전체차량',
      dispatching: totalDispatching,
      available: totalAvailabel,
      absent: totalAbsent,
      total: totalDispatching + totalAvailabel + totalAbsent,
      bolds: ['dispatching', 'available', 'absent', 'total'],
      layer: 1,
    },
    {
      key: 'composite',
      key_indicator: '생활반',
      dispatching: totalCompositeDispatching,
      available: totalCompositeAvailable,
      absent: totalCompositeAbsent,
      total: totalCompositeDispatching + totalCompositeAvailable + totalCompositeAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'composite_regular',
          key_indicator: '정규',
          dispatching: vehicleCount.COMPOSITE_REGULAR[0],
          available: vehicleCount.COMPOSITE_REGULAR[1],
          absent: vehicleCount.COMPOSITE_REGULAR[2],
          total: totalCompositeRegular,
          layer: 2,
        },
        {
          key: 'composite_support',
          key_indicator: '지원',
          dispatching: vehicleCount.COMPOSITE_SUPPORT[0],
          available: vehicleCount.COMPOSITE_SUPPORT[1],
          absent: vehicleCount.COMPOSITE_SUPPORT[2],
          total: totalCompositeSupport,
          layer: 2,
        },
      ],
    },
    {
      key: 'food',
      key_indicator: '음식반',
      dispatching: totalFoodDispatching,
      available: totalFoodAvailable,
      absent: totalFoodAbsent,
      total: totalFoodDispatching + totalFoodAvailable + totalFoodAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'food_regular',
          key_indicator: '정규',
          dispatching: vehicleCount.FOOD_REGULAR[0],
          available: vehicleCount.FOOD_REGULAR[1],
          absent: vehicleCount.FOOD_REGULAR[2],
          total: totalFoodRegular,
          layer: 2,
        },
        {
          key: 'food_support',
          key_indicator: '지원',
          dispatching: vehicleCount.FOOD_SUPPORT[0],
          available: vehicleCount.FOOD_SUPPORT[1],
          absent: vehicleCount.FOOD_SUPPORT[2],
          total: totalFoodSupport,
          layer: 2,
        },
      ],
    },
    {
      key: 'reusable',
      key_indicator: '재활반',
      dispatching: totalReusableDispatching,
      available: totalReusableAvailable,
      absent: totalReusableAbsent,
      total: totalReusableDispatching + totalReusableAvailable + totalReusableAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'reusable_regular',
          key_indicator: '정규',
          dispatching: vehicleCount.REUSABLE_REGULAR[0],
          available: vehicleCount.REUSABLE_REGULAR[1],
          absent: vehicleCount.REUSABLE_REGULAR[2],
          total: totalReusableRegular,
          layer: 2,
        },
        {
          key: 'reusable_support',
          key_indicator: '지원',
          dispatching: vehicleCount.FOOD_SUPPORT[0],
          available: vehicleCount.FOOD_SUPPORT[1],
          absent: vehicleCount.FOOD_SUPPORT[2],
          total: totalReusableSupport,
          layer: 2,
        },
      ],
    },
    {
      key: 'tatical_mobility',
      key_indicator: '기동반',
      dispatching: totalTaticalDispatching,
      available: totalTacticalAvailable,
      absent: totalTacticalAbsent,
      total: totalTaticalDispatching + totalTacticalAvailable + totalTacticalAbsent,
      layer: 1,
      bolds: ['total'],
      children: [
        {
          key: 'tatical_mobility_regular',
          key_indicator: '정규',
          dispatching: vehicleCount.TATICAL_MOBILITY_REGULAR[0],
          available: vehicleCount.TATICAL_MOBILITY_REGULAR[1],
          absent: vehicleCount.TATICAL_MOBILITY_REGULAR[2],
          total: totalTaticalMobitlityRegluar,
          layer: 2,
        },
        {
          key: 'tatical_mobility_support',
          key_indicator: '지원',
          dispatching: vehicleCount.TATICAL_MOBILITY_SUPPORT[0],
          available: vehicleCount.TATICAL_MOBILITY_SUPPORT[1],
          absent: vehicleCount.TATICAL_MOBILITY_SUPPORT[2],
          total: totalTaticalMobilitySupport,
          layer: 2,
        },
      ],
    },
  ];
};

const getVehicleStatusDataSource = (vehicleStatus: IVehicleOnPurpose) => {
  const dataSourceFirstPage: IVehicleStatusDataSourceItem[] = [
    {
      composite_regular: {
        total: vehicleStatus.COMPOSITE_REGULAR?.length,
        isSummary: true,
      },
      food_regular: {
        total: vehicleStatus.FOOD_REGULAR?.length,
        isSummary: true,
      },
      reusable_regular: {
        total: vehicleStatus.REUSABLE_REGULAR?.length,
        isSummary: true,
      },
      tatical_mobility_regular: {
        total: vehicleStatus.TATICAL_MOBILITY_REGULAR?.length,
        isSummary: true,
      },
    },
  ];
  const dataSourceSecondPage: IVehicleStatusDataSourceItem[] = [
    {
      composite_support: { total: vehicleStatus?.COMPOSITE_SUPPORT?.length, isSummary: true },
      food_support: { total: vehicleStatus?.FOOD_SUPPORT?.length, isSummary: true },
      reusable_support: { total: vehicleStatus?.REUSABLE_SUPPORT?.length, isSummary: true },
      tatical_mobility_support: {
        total: vehicleStatus?.TATICAL_MOBILITY_SUPPORT?.length,
        isSummary: true,
      },
    },
  ];
  const rowCountFirstPage =
    max([
      vehicleStatus.COMPOSITE_REGULAR?.length,
      vehicleStatus.FOOD_REGULAR?.length,
      vehicleStatus.REUSABLE_REGULAR?.length,
      vehicleStatus.TATICAL_MOBILITY_REGULAR?.length,
    ]) ?? 0;
  for (let i = 0; i < rowCountFirstPage; i++) {
    dataSourceFirstPage.push({
      composite_regular: { value: vehicleStatus.COMPOSITE_REGULAR[i] },
      food_regular: { value: vehicleStatus.FOOD_REGULAR[i] },
      reusable_regular: { value: vehicleStatus.REUSABLE_REGULAR[i] },
      tatical_mobility_regular: { value: vehicleStatus.TATICAL_MOBILITY_REGULAR[i] },
    });
  }

  const rowCounSecondPage =
    max([
      vehicleStatus.COMPOSITE_SUPPORT?.length,
      vehicleStatus.FOOD_SUPPORT?.length,
      vehicleStatus.REUSABLE_SUPPORT?.length,
      vehicleStatus.TATICAL_MOBILITY_SUPPORT?.length,
    ]) ?? 0;

  for (let i = 0; i < rowCounSecondPage; i++) {
    dataSourceSecondPage.push({
      composite_support: { value: vehicleStatus.COMPOSITE_SUPPORT[i] },
      food_support: { value: vehicleStatus.FOOD_SUPPORT[i] },
      reusable_support: { value: vehicleStatus.REUSABLE_SUPPORT[i] },
      tatical_mobility_support: { value: vehicleStatus.TATICAL_MOBILITY_SUPPORT[i] },
    });
  }

  return {
    firstPage: dataSourceFirstPage,
    secondPage: dataSourceSecondPage,
  };
};

const getVehicleCount = (vehicleCount: IVehicleCount) => {
  const vehicleDispatchingCount =
    vehicleCount.COMPOSITE_REGULAR[0] +
    vehicleCount.COMPOSITE_SUPPORT[0] +
    vehicleCount.FOOD_REGULAR[0] +
    vehicleCount.FOOD_SUPPORT[0] +
    vehicleCount.REUSABLE_REGULAR[0] +
    vehicleCount.REUSABLE_SUPPORT[0] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[0] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[0];
  const vehicleActiveCount =
    vehicleCount.COMPOSITE_REGULAR[1] +
    vehicleCount.COMPOSITE_SUPPORT[1] +
    vehicleCount.FOOD_REGULAR[1] +
    vehicleCount.FOOD_SUPPORT[1] +
    vehicleCount.REUSABLE_REGULAR[1] +
    vehicleCount.REUSABLE_SUPPORT[1] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[1] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[1];

  const vehicleAbsenceCount =
    vehicleCount.COMPOSITE_REGULAR[2] +
    vehicleCount.COMPOSITE_SUPPORT[2] +
    vehicleCount.FOOD_REGULAR[2] +
    vehicleCount.FOOD_SUPPORT[2] +
    vehicleCount.REUSABLE_REGULAR[2] +
    vehicleCount.REUSABLE_SUPPORT[2] +
    vehicleCount.TATICAL_MOBILITY_REGULAR[2] +
    vehicleCount.TATICAL_MOBILITY_SUPPORT[2];

  return {
    vehicleDispatchingCount,
    vehicleActiveCount,
    vehicleAbsenceCount,
  };
};

const getStaffCount = (staffCount: ICrewCount) => {
  const staffDispatchingCount =
    staffCount.DRIVING_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_REGULAR[0] +
    staffCount.COLLECT_CREW_MONTHLY[0] +
    staffCount.COLLECT_CREW_FIXED_TERM[0] +
    staffCount.SUPPORT_CREW_REGULAR[0] +
    staffCount.SUPPORT_CREW_FIXED_TERM[0];

  const staffActiveCount =
    staffCount.DRIVING_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_REGULAR[1] +
    staffCount.COLLECT_CREW_MONTHLY[1] +
    staffCount.COLLECT_CREW_FIXED_TERM[1] +
    staffCount.SUPPORT_CREW_REGULAR[1] +
    staffCount.SUPPORT_CREW_FIXED_TERM[1];

  const staffAbsenceCount =
    staffCount.DRIVING_CREW_REGULAR[2] +
    staffCount.COLLECT_CREW_REGULAR[2] +
    staffCount.COLLECT_CREW_MONTHLY[2] +
    staffCount.COLLECT_CREW_FIXED_TERM[2] +
    staffCount.SUPPORT_CREW_REGULAR[2] +
    staffCount.SUPPORT_CREW_FIXED_TERM[2];

  return {
    staffDispatchingCount,
    staffActiveCount,
    staffAbsenceCount,
  };
};

export const useSchedule = () => {
  const [params, setParams] = useState<IScheduleParams>({
    working_date: dayjs().format(DATE_FORMAT.R_BASIC),
  });

  const { data: statisticData, isLoading: statisticLoading } = useGetScheduleStatistic(params);
  const updateScheduleMutation = useUpdateSchedule();
  const isDisabledScheduleEdit = useMemo(() => {
    return !dayjs(params.working_date).isSameOrAfter(dayjs(), 'date');
  }, [params]);

  const {
    data: compositeWasteScheduleData,
    isFetched: compositeWasteScheduleFetched,
    isLoading: compositeWasteLoading,
  } = useGetCompositeWasteSchedule(params, !statisticLoading);

  const {
    data: foodWasteScheduleData,
    isFetched: foodWasteScheduleFetched,
    isLoading: foodWasteLoading,
  } = useGetFoodWasteSchedule(params, compositeWasteScheduleFetched && !compositeWasteLoading);

  const {
    data: reusableWasteScheduleData,
    isFetched: reusableWasteScheduleFetched,
    isLoading: reusableWasteLoading,
  } = useGetReusableWasteSchedule(
    params,
    foodWasteScheduleFetched && !foodWasteLoading && !compositeWasteLoading
  );

  const { data: taticalMobilityWasteScheduleData, isLoading: taticalMobilityLoading } =
    useGetTaticalMobilitySchedule(
      params,
      reusableWasteScheduleFetched &&
        !reusableWasteLoading &&
        !compositeWasteLoading &&
        !foodWasteLoading
    );

  const wholeStaffDataSource: IWholeDataTree[] = useMemo(() => {
    const dataSource = getStaffWholeDataSource(
      statisticData?.data?.staffSection?.staffCount ?? DEFAULT_STAFF_COUNT
    );
    return dataSource;
  }, [statisticData]);

  const wholeVehicleDataSource: IWholeDataTree[] = useMemo(() => {
    const dataSource = getVehicleWholeDataSource(
      statisticData?.data?.vehicleSection?.vehicleCount ?? DEFAULT_VEHICLE_COUNT
    );
    return dataSource;
  }, [statisticData]);

  const availableStaff: {
    firstPage: ICrewStatusDataSourceItem[];
    secondPage: ICrewStatusDataSourceItem[];
  } = useMemo(() => {
    const availableStaff = statisticData?.data?.staffSection?.staffAvailable;
    if (availableStaff) {
      return getStaffStatusDataSource(availableStaff);
    }
    return {
      firstPage: [],
      secondPage: [],
    };
  }, [statisticData]);

  const absenceStaff: {
    firstPage: ICrewStatusDataSourceItem[];
    secondPage: ICrewStatusDataSourceItem[];
  } = useMemo(() => {
    const availableStaff = statisticData?.data?.staffSection?.staffAbsence;
    if (availableStaff) {
      return getStaffStatusDataSource(availableStaff);
    }
    return {
      firstPage: [],
      secondPage: [],
    };
  }, [statisticData]);

  const availableVehicle: {
    firstPage: IVehicleStatusDataSourceItem[];
    secondPage: IVehicleStatusDataSourceItem[];
  } = useMemo(() => {
    const availableVehicle = statisticData?.data?.vehicleSection.vehicleAvailable;
    if (availableVehicle) {
      return getVehicleStatusDataSource(availableVehicle);
    }
    return {
      firstPage: [],
      secondPage: [],
    };
  }, [statisticData]);

  const absenceVehicle: {
    firstPage: IVehicleStatusDataSourceItem[];
    secondPage: IVehicleStatusDataSourceItem[];
  } = useMemo(() => {
    const absenceVehicle = statisticData?.data?.vehicleSection.vehicleAbsence;
    if (absenceVehicle) {
      return getVehicleStatusDataSource(absenceVehicle);
    }
    return {
      firstPage: [],
      secondPage: [],
    };
  }, [statisticData]);

  const staffCount = useMemo(() => {
    const dataSource = getStaffCount(
      statisticData?.data?.staffSection?.staffCount ?? DEFAULT_STAFF_COUNT
    );
    return dataSource;
  }, [statisticData]);

  const vehicleCount = useMemo(() => {
    const dataSource = getVehicleCount(
      statisticData?.data?.vehicleSection?.vehicleCount ?? DEFAULT_VEHICLE_COUNT
    );
    return dataSource;
  }, [statisticData]);

  const [selectedComposite, setSelectedComposite] = useState<(string | number)[]>([]);
  const [selectedFood, setSelectedFood] = useState<(string | number)[]>([]);
  const [selectedReusable, setSelectedReusable] = useState<(string | number)[]>([]);
  const [selectedTactical, setSelectedTatical] = useState<(string | number)[]>([]);
  const [selectedUpdatingSchedule, setSelectedUpdatingSchedule] =
    useState<ISelectedUpdatingSchedule>(DEFAULT_SELECTED_UPDATING_SCHEDULE);

  useEffect(() => {
    setSelectedUpdatingSchedule(DEFAULT_SELECTED_UPDATING_SCHEDULE);
  }, [params?.working_date]);

  const [isOpenConfirmUpdate, setIsOpenConfirmUpdate] = useState<boolean>(false);

  const { notification } = useFeedback();

  useEffect(() => {
    const {
      id,
      currentVehicleId,
      currentDriverId,
      currentStaff1Id,
      currentStaff2Id,
      backupDriverId,
      backupStaff2Id,
      backupStaff1Id,
      backupVehicleId,
      targetVehicleId,
      targetCrew,
      purpose,
    } = selectedUpdatingSchedule;

    if (
      (id && targetVehicleId && (currentVehicleId || backupVehicleId) && purpose) ||
      (id &&
        (currentDriverId ||
          currentStaff1Id ||
          currentStaff2Id ||
          backupDriverId ||
          backupStaff1Id ||
          backupStaff2Id ||
          currentDriverId ||
          backupDriverId) &&
        targetCrew &&
        purpose)
    ) {
      setIsOpenConfirmUpdate(true);

      updateScheduleMutation.mutate(
        {
          body: {
            ...(currentVehicleId ? { vehicle_id: targetVehicleId } : {}),
            ...(backupVehicleId ? { backup_vehicle_id: targetVehicleId } : {}),

            ...(currentDriverId ? { driver: targetCrew } : {}),
            ...(backupDriverId ? { backup_driver: targetCrew } : {}),

            ...(currentStaff1Id ? { field_agent_1: targetCrew } : {}),
            ...(currentStaff2Id ? { field_agent_2: targetCrew } : {}),
            ...(backupStaff1Id ? { backup_field_agent_1: targetCrew } : {}),
            ...(backupStaff2Id ? { backup_field_agent_2: targetCrew } : {}),
          },
          id: id,
        },
        {
          onSuccess() {
            notification.success({ message: '작업 일정이 성공적으로 업데이트되었습니다!' });
            queryClient.invalidateQueries({
              queryKey: [`schedule-statistic`, { working_date: params?.working_date }],
            });
            queryClient.invalidateQueries({
              queryKey: [`SCHEDULE_${purpose}`, { working_date: params?.working_date }],
            });
            setSelectedUpdatingSchedule(DEFAULT_SELECTED_UPDATING_SCHEDULE);
          },
          onError() {
            setSelectedUpdatingSchedule(DEFAULT_SELECTED_UPDATING_SCHEDULE);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUpdatingSchedule]);

  return {
    params,
    setParams,
    wholeStaffDataSource,
    wholeVehicleDataSource,
    availableStaff,
    absenceStaff,
    availableVehicle,
    absenceVehicle,
    compositeWasteSchedule: compositeWasteScheduleData?.data?.data ?? [],
    foodWasteSchedule: foodWasteScheduleData?.data?.data ?? [],
    reusableWasteSchedule: reusableWasteScheduleData?.data?.data ?? [],
    taticalMobilityWasteSchedule: taticalMobilityWasteScheduleData?.data?.data ?? [],
    statisticLoading,
    compositeWasteLoading,
    foodWasteLoading,
    reusableWasteLoading,
    taticalMobilityLoading,
    staffDispatchingCount: staffCount?.staffDispatchingCount,
    staffActiveCount: staffCount?.staffActiveCount,
    staffAbsenceCount: staffCount?.staffAbsenceCount,
    vehicleDispatchingCount: vehicleCount?.vehicleDispatchingCount,
    vehicleActiveCount: vehicleCount?.vehicleActiveCount,
    vehicleAbsenceCount: vehicleCount?.vehicleAbsenceCount,
    allPurposeStatistic: statisticData?.data?.statistics ?? DEFAULT_PURPOSE_STATISTIC,
    selectedComposite,
    selectedFood,
    selectedReusable,
    selectedTactical,
    selectedUpdatingSchedule,
    isOpenConfirmUpdate,
    totalSchedule: statisticData?.data?.pagination?.total ?? 0,
    isDisabledScheduleEdit,
    setIsOpenConfirmUpdate,
    setSelectedUpdatingSchedule,
    setSelectedComposite,
    setSelectedFood,
    setSelectedReusable,
    setSelectedTatical,
  };
};
