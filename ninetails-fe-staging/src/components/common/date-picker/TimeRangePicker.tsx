import { BaseDatePicker } from '@/components/common/date-picker';
import { AppDate, Dates } from '@/utils';
import React, { useMemo } from 'react';

const clearDate = Dates.getToday().hour(0).minute(0).second(0).millisecond(0);
const clearDateMs = +clearDate;

interface TimePickerProps {
  timeRange: number[];
  setTimeRange: (timeRange: number[]) => void;
}

export const TimeRangePicker: React.FC<TimePickerProps> = ({ timeRange, setTimeRange }) => {
  const timeRangePrepared = useMemo(
    () => timeRange.map((time) => clearDate.add(time)),
    [timeRange]
  );

  const onChange = (timeRange: any) => {
    const timeRangeSinceTodayMs = timeRange
      .map((time: AppDate) => time.subtract(clearDateMs, 'ms'))
      .map((time: AppDate) => +time);

    setTimeRange(timeRangeSinceTodayMs);
  };

  return (
    <BaseDatePicker.RangePicker
      value={[timeRangePrepared[0], timeRangePrepared[1]]}
      picker="time"
      format="HH:mm"
      onChange={onChange}
      allowClear={false}
      order={false}
    />
  );
};
