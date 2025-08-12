import CalendarIcon from '@/assets/images/svg/icon-calendar.svg';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import React from 'react';

import * as S from '../index.style';
import { IParams } from '../index.utils';

interface CalendarProps {
  params: IParams;
  onTimeChange: (val: RangePickerProps['value']) => void;
}

const Calendar: React.FC<CalendarProps> = ({ params, onTimeChange }) => {
  return (
    <S.CalendarLeft
      suffixIcon={<CalendarIcon />}
      allowClear={false}
      value={[dayjs(params.start_date), dayjs(params.end_date)]}
      onChange={onTimeChange}
    />
  );
};

export default Calendar;
