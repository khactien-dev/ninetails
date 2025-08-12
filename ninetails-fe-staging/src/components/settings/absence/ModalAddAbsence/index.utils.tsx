import { TYPE_TABS } from '@/components/settings/absence/index.utils';
import {
  ABSENCE_TYPE,
  ABSENCE_TYPE_STAFF,
  ABSENCE_TYPE_VEHICLE,
  LEAVE_HAFT_DAY,
  LEAVE_HAFT_DAY_STAFF,
  STAFF_LABEL,
  STATUS,
  VEHICLE_LABEL,
} from '@/constants/settings';
import { IVehicleList, IWorker, RecordTypes } from '@/interfaces';
import { renderJobContract, renderPurpose } from '@/utils';
import { FormInstance } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import { useMemo, useState } from 'react';

export const countSundays = (startDate: Dayjs, endDate: Dayjs) => {
  let start = dayjs(startDate);
  const end = dayjs(endDate);
  let sundayCount = 0;
  while (start.isBefore(end) || start.isSame(end)) {
    if (start.day() === 0) {
      sundayCount++;
    }
    start = start.add(1, 'day');
  }
  return sundayCount;
};

export function useModelAddAbsence(
  form: FormInstance,
  type: string,
  optionList?: RecordTypes[] | IWorker[]
) {
  const [isHaftDayLeave, setIsHaftDayLeave] = useState(false);

  const isHaftDay = (leave: string | unknown) => {
    if (type === TYPE_TABS.VEHICLE) {
      return _.includes(LEAVE_HAFT_DAY, leave);
    } else {
      return _.includes(LEAVE_HAFT_DAY_STAFF, leave);
    }
  };
  const LABEL = TYPE_TABS.VEHICLE === type ? VEHICLE_LABEL : STAFF_LABEL;
  const title =
    type === TYPE_TABS.STAFF ? '직원을 위한 새로운 휴가 추가' : '차량의 새로운 휴무 추가';

  const handleChangeAbsence = (absence: unknown) => {
    const startDate = form.getFieldValue('start_date');
    const endDate = form.getFieldValue('end_date');
    const getAbsenceType = () => {
      if (type === TYPE_TABS.VEHICLE) {
        return ABSENCE_TYPE[absence as keyof typeof ABSENCE_TYPE];
      }
      const key = _.findKey(ABSENCE_TYPE_STAFF, (value) => value === absence);
      return key ? ABSENCE_TYPE_STAFF[key as keyof typeof ABSENCE_TYPE_STAFF] : undefined;
    };

    const absence_type = getAbsenceType();
    const leaveHaftDay = isHaftDay(absence_type);
    if (leaveHaftDay) {
      form.setFieldValue('end_date', startDate);
      form.setFieldValue('period', '0.5일 [4H]');
      return;
    }

    if (!startDate || !endDate) {
      form.setFieldValue('period', '');
      return;
    }

    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

    form.setFieldValue('period', totalDays > 0 ? `${totalDays}일 [${totalDays * 8}H]` : '');
  };

  const handleOnSelectAbsence = (id: number) => {
    if (type === TYPE_TABS.STAFF) {
      const list = optionList as IWorker[];
      const worker = list?.find(
        (item: IWorker): item is IWorker => 'status' in item && item.id === id
      );
      form.setFieldValue('purpose', renderJobContract(worker?.job_contract ?? ''));
    } else {
      const list = optionList as RecordTypes[];
      const vehicle = list?.find(
        (item: RecordTypes): item is RecordTypes => 'purpose' in item && item.id === id
      );
      if (vehicle && 'purpose' in vehicle) {
        form.setFieldValue('purpose', renderPurpose(vehicle?.purpose));
      }
    }
  };

  const disablePastDates = (current: Dayjs) => {
    return (current && current.isBefore(dayjs().endOf('day'))) || (current && current.day() === 0);
  };

  const optionVehicleList = useMemo(() => {
    if (!optionList) return [];

    if (type === TYPE_TABS.VEHICLE) {
      const list = optionList as IVehicleList;
      if (Array.isArray(list) && list.every((item) => 'vehicle_number' in item)) {
        return list.reduce<{ value: number; label: string }[]>((acc, vehicle) => {
          if (vehicle.status !== STATUS.RESIGNED) {
            acc.push({ value: vehicle?.id, label: vehicle?.vehicle_number ?? '' });
          }
          return acc;
        }, []);
      }
    } else {
      if (isWorkerArray(optionList)) {
        return optionList.reduce<{ value: number; label: string }[]>((acc, worker) => {
          if (worker.status !== STATUS.RESIGNED) {
            acc.push({ value: worker?.id, label: worker?.name ?? '' });
          }
          return acc;
        }, []);
      }
    }
    return [];
  }, [optionList, type]);

  function isWorkerArray(list: any): list is IWorker[] {
    return Array.isArray(list) && list.length > 0 && 'status' in list[0];
  }

  const absenceTypeList = useMemo(() => {
    if (type === TYPE_TABS.STAFF) {
      return Object.keys(ABSENCE_TYPE_STAFF).map((type) => ({
        label: ABSENCE_TYPE_STAFF[type as keyof typeof ABSENCE_TYPE_STAFF],
        value: ABSENCE_TYPE_STAFF[type as keyof typeof ABSENCE_TYPE_STAFF],
      }));
    } else {
      return ABSENCE_TYPE_VEHICLE.map((type) => {
        return {
          label: type.label,
          value: type.value,
        };
      });
    }
  }, [type]);

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  const daysInMonth = dayjs(`${currentYear}-${currentMonth}`).daysInMonth();

  return {
    isHaftDayLeave,
    handleChangeAbsence,
    handleOnSelectAbsence,
    disablePastDates,
    LABEL,
    title,
    optionVehicleList,
    STAFF_LABEL,
    absenceTypeList,
    daysInMonth,
    isHaftDay,
    setIsHaftDayLeave,
  };
}
