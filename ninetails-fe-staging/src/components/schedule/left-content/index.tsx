import NextDay from '@/assets/images/driving-diary/next-day.svg';
import NextMonth from '@/assets/images/driving-diary/next-month.svg';
import PrevDay from '@/assets/images/driving-diary/prev-day.svg';
import PrevMonth from '@/assets/images/driving-diary/prev-month.svg';
import Calendar from '@/assets/images/schedule/icon-calendar.svg';
import IconQuestion from '@/assets/images/svg/icon-bi_question-circle-fill.svg';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { DATE_FORMAT } from '@/constants';
import dayjs from 'dayjs';
import React from 'react';

import { useScheduleContext } from '../context';
import * as S from './index.styles';
import { Statistic } from './statistic';

const LeftSchedule: React.FC = () => {
  const { params, setParams } = useScheduleContext();

  const onChangeDate = (value: number, unit: 'month' | 'day') => {
    const selectedDate = dayjs(params?.working_date);
    const newDate = selectedDate.add(value, unit);
    setParams({
      working_date: newDate.format(DATE_FORMAT.R_BASIC),
    });
  };

  const customDateFormatKorea = (value: any): string => {
    return value ? dayjs(value).format(DATE_FORMAT.DATE_KOREA_DAY_OF_WEEK) : '';
  };

  return (
    <S.Wrapper>
      <S.SelectDatePicker>
        <S.WrapDateSelect>
          <S.SelectDate
            allowClear={false}
            format={customDateFormatKorea}
            suffixIcon={<Calendar />}
            value={dayjs(params?.working_date)}
            onChange={(v) =>
              setParams({
                working_date: dayjs(v).format(DATE_FORMAT.R_BASIC),
              })
            }
          />

          <S.WrapDateButtons>
            <S.WrapIcon onClick={() => onChangeDate(-1, 'month')}>
              <PrevMonth />
            </S.WrapIcon>
            <S.WrapIcon onClick={() => onChangeDate(-1, 'day')}>
              <PrevDay />
            </S.WrapIcon>
            <S.FocusDateButton
              type="primary"
              onClick={() =>
                setParams({
                  working_date: dayjs().format(DATE_FORMAT.R_BASIC),
                })
              }
            >
              당일
            </S.FocusDateButton>
            <S.WrapIcon onClick={() => onChangeDate(1, 'day')}>
              <NextDay />
            </S.WrapIcon>
            <S.WrapIcon onClick={() => onChangeDate(1, 'month')}>
              <NextMonth />
            </S.WrapIcon>
          </S.WrapDateButtons>
        </S.WrapDateSelect>
        <S.WrapTooltip>
          <BaseTooltip title={'근무배치 기록의 수정은 당일 또는 이후 시점에 한해서만 가능합니다'}>
            <IconQuestion />
          </BaseTooltip>
        </S.WrapTooltip>
      </S.SelectDatePicker>
      <Statistic />
    </S.Wrapper>
  );
};

export default LeftSchedule;
