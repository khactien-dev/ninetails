import { Dates } from '@/utils';
import React, { useMemo } from 'react';

import { BaseSelect, BaseSelectProps, Option } from '../base-select';

export const MonthSelect: React.FC<BaseSelectProps> = ({ className, ...props }) => {
  const months = Dates.getMonths();

  const monthsOptions = useMemo(
    () =>
      months.map((month, index) => (
        <Option key={index} value={index}>
          {month}
        </Option>
      )),
    [months]
  );

  return (
    <BaseSelect className={className} {...props}>
      {monthsOptions}
    </BaseSelect>
  );
};
