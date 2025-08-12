import {
  createSchedule,
  deleteSchedule,
  getAbsenceDetailStaff,
  getAbsenceDetailVehicle,
  getReturnToWorkStaff,
  getReturnToWorkVehicle,
  getScheduleStaff,
  getWorkingSchedule,
  getWorkingScheduleById,
  getWorkingScheduleStatistic,
  updateSchedule,
} from '@/api/schedule';
import { IScheduleParams } from '@/components/schedule/context/index.utils';
import { PURPOSE_VALUE } from '@/constants/settings';
import useAppMutation, { AppMutationOptions } from '@/hooks/useAppMutation';
import { PaginationParams } from '@/interfaces';
import { IReturnToWorkParams } from '@/interfaces/schedule';

import useAppQuery from '../useAppQuery';

const PAGE_SIZE = 500;

export const useCreatSchedule = (options?: AppMutationOptions) => {
  return useAppMutation(
    createSchedule,
    {
      useAppMutationProps: options,
    },
    { toast: false }
  );
};

export const useDeleteSchedule = () => {
  return useAppMutation(deleteSchedule);
};

export const useUpdateSchedule = () => {
  return useAppMutation(updateSchedule);
};

export const useGetScheduleById = (params: IScheduleParams, id: string | number) =>
  useAppQuery({
    queryKey: ['schedule-on-purpose', params],
    queryFn: () => getWorkingScheduleById(params, id),
  });

export const useGetScheduleStatistic = (params: IScheduleParams) =>
  useAppQuery({
    queryKey: ['schedule-statistic', params],
    queryFn: () => getWorkingScheduleStatistic(params),
  });

export const useGetSchedule = (params: IScheduleParams) =>
  useAppQuery({
    queryKey: ['schedule-all-purpose', params],
    queryFn: () => getWorkingSchedule(params),
  });

export const useGetCompositeWasteSchedule = (params: IScheduleParams, enabled: boolean) =>
  useAppQuery({
    queryKey: [`SCHEDULE_${PURPOSE_VALUE.COMPOSITE_WASTES}`, params],
    queryFn: () =>
      getWorkingSchedule({
        ...params,
        purpose: PURPOSE_VALUE.COMPOSITE_WASTES,
        pageSize: PAGE_SIZE,
      }),
    enabled: enabled,
  });

export const useGetFoodWasteSchedule = (params: IScheduleParams, enabled: boolean) =>
  useAppQuery({
    queryKey: [`SCHEDULE_${PURPOSE_VALUE.FOOD_WASTES}`, params],
    queryFn: () =>
      getWorkingSchedule({
        ...params,
        purpose: PURPOSE_VALUE.FOOD_WASTES,
        pageSize: PAGE_SIZE,
      }),
    enabled,
  });

export const useGetReusableWasteSchedule = (params: IScheduleParams, enabled: boolean) =>
  useAppQuery({
    queryKey: [`SCHEDULE_${PURPOSE_VALUE.REUSABLE_WASTES}`, params],
    queryFn: () =>
      getWorkingSchedule({
        ...params,
        purpose: PURPOSE_VALUE.REUSABLE_WASTES,
        pageSize: PAGE_SIZE,
      }),
    enabled,
  });

export const useGetTaticalMobilitySchedule = (params: IScheduleParams, enabled: boolean) =>
  useAppQuery({
    queryKey: [`SCHEDULE_${PURPOSE_VALUE.TACTICAL_MOBILITY}`, params],
    queryFn: () =>
      getWorkingSchedule({
        ...params,
        purpose: PURPOSE_VALUE.TACTICAL_MOBILITY,
        pageSize: PAGE_SIZE,
      }),
    enabled,
  });

export const useGetAgentStaff = (params: PaginationParams) =>
  useAppQuery({
    queryKey: ['agent_staff'],
    queryFn: () =>
      getScheduleStaff({
        job_contract: ['COLLECT_CREW_REGULAR', 'COLLECT_CREW_MONTHLY', 'COLLECT_CREW_FIXED_TERM'],
        status: 'NORMAL',
        pageSize: params.pageSize,
      }),
  });

export const useGetDrivingRegularStaff = (params: PaginationParams) =>
  useAppQuery({
    queryKey: ['driving_regular_staff'],
    queryFn: () =>
      getScheduleStaff({
        job_contract: ['DRIVING_CREW_REGULAR', 'SUPPORT_CREW_REGULAR', 'SUPPORT_CREW_FIXED_TERM'],
        status: 'NORMAL',
        pageSize: params.pageSize,
      }),
  });

export const useGetSchedulePurposeStatistic = (params: IScheduleParams) =>
  useAppQuery({
    queryKey: ['schedule_purpose_statistic', params],
    queryFn: () => getWorkingScheduleStatistic(params),
  });

export const useGetReturnToWorkStaff = (params: { date: string }) =>
  useAppQuery({
    queryKey: ['return_to_work_staff', params],
    queryFn: () => getReturnToWorkStaff(params),
  });

export const useGetReturnToWorkVehicle = (params: IReturnToWorkParams) =>
  useAppQuery({
    queryKey: ['return_to_work_vehicle', params],
    queryFn: () => getReturnToWorkVehicle(params),
  });

export const useGetAbsenceDetailStaff = (id?: number) =>
  useAppQuery({
    queryKey: ['absence_detail_staff', id],
    queryFn: () => getAbsenceDetailStaff(id),
    enabled: !!id,
  });

export const useGetAbsenceDetailVehicle = (id?: number) =>
  useAppQuery({
    queryKey: ['absence_detail_vehicle', id],
    queryFn: () => getAbsenceDetailVehicle(id),
    enabled: !!id,
  });
