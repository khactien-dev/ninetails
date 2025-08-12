import { CalendarFullCell } from '@/components/settings/absence/index.styles';
import { TYPE_TABS } from '@/components/settings/absence/index.utils';
import { ABSENCE_TYPE, LEAVE_LONG_TERM, LEAVE_LONG_TERM_STAFF } from '@/constants/settings';
import { IAbsenceData, IAbsenceStaffData } from '@/interfaces';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import _ from 'lodash';
import React from 'react';

import * as S from '../index.styles';

dayjs.locale('ko');

interface Props {
  currentMonth: Dayjs;
  listAbsence?: IAbsenceData[] | IAbsenceStaffData[];
  type: string;
}

const CalendarDateCell: React.FC<Props> = ({ currentMonth, listAbsence, type }) => {
  const monthCellRender = (value: Dayjs) => {
    const num = value.month() === 8 ? 1394 : undefined;
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const getListData = (
    value: Dayjs,
    listAbsence?: (IAbsenceData | IAbsenceStaffData)[]
  ): (IAbsenceData | IAbsenceStaffData)[] => {
    const list = listAbsence || [];
    return list.filter((absence) => {
      if (type === TYPE_TABS.VEHICLE) {
        return (
          (absence as IAbsenceData).start_date &&
          dayjs((absence as IAbsenceData).start_date).isSame(value, 'day')
        );
      } else if (type === TYPE_TABS.STAFF) {
        return (
          (absence as IAbsenceStaffData).start_date &&
          dayjs((absence as IAbsenceStaffData).start_date).isSame(value, 'day')
        );
      }
      return false;
    });
  };

  const filterAbsenceType = (listRecord: (IAbsenceData | IAbsenceStaffData)[]) => {
    const leaveLongTerm = TYPE_TABS.VEHICLE === type ? LEAVE_LONG_TERM : LEAVE_LONG_TERM_STAFF;
    return listRecord.reduce(
      (result, record) => {
        const key = leaveLongTerm.includes(record?.absence_type)
          ? 'matchingRecords'
          : 'nonMatchingRecords';
        result[key].push(record);
        return result;
      },
      {
        matchingRecords: [] as (IAbsenceData | IAbsenceStaffData)[],
        nonMatchingRecords: [] as (IAbsenceData | IAbsenceStaffData)[],
      }
    );
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value, listAbsence);
    if (listData.length === 1) {
      const [record] = listData;
      const LONG_TERM = type === TYPE_TABS.VEHICLE ? LEAVE_LONG_TERM : LEAVE_LONG_TERM_STAFF;
      type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;
      return (
        <S.AbsenceTag
          $isLongTerm={_.includes(
            LONG_TERM,
            ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys] || record?.absence_type
          )}
        >
          {'absence_vehicle' in record
            ? record?.absence_vehicle?.vehicle_number
            : record?.absence_staff?.name}
          &nbsp;
          {ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys] || record?.absence_type}
        </S.AbsenceTag>
      );
    }
    if (listData.length > 1) {
      const { matchingRecords, nonMatchingRecords } = filterAbsenceType(
        listData as IAbsenceData[] | IAbsenceStaffData[]
      );
      return (
        <S.CalendarTag>
          {matchingRecords.length > 0 && (
            <S.AbsenceTag $isLongTerm={true} $padding={'0px 8px'}>
              {matchingRecords.length}
            </S.AbsenceTag>
          )}
          {nonMatchingRecords.length > 0 && (
            <S.AbsenceTag $isLongTerm={false} $padding={'0px 8px'}>
              {nonMatchingRecords.length}
            </S.AbsenceTag>
          )}
        </S.CalendarTag>
      );
    }

    return null;
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return monthCellRender(current);
    return info.originNode;
  };

  return (
    <CalendarFullCell
      value={currentMonth || dayjs()}
      cellRender={cellRender}
      headerRender={() => null}
    />
  );
};

export default CalendarDateCell;
