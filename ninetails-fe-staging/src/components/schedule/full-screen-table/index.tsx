import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import React, { useEffect, useMemo, useState } from 'react';

import { useScheduleContext } from '../context';
import { TableItem } from './table-item';

const MIN_LIMIT = 10;
const MAX_LIMIT = 26;

export const FullScreenTable = () => {
  const [windowSize, setWindowSize] = useState(window.innerHeight);

  useEffect(() => {
    const windowSizeHandler = () => {
      setWindowSize(window.innerHeight);
    };
    window.addEventListener('resize', windowSizeHandler);

    return () => {
      window.removeEventListener('resize', windowSizeHandler);
    };
  }, []);

  const {
    compositeWasteSchedule,
    foodWasteSchedule,
    reusableWasteSchedule,
    taticalMobilityWasteSchedule,
    compositeWasteLoading,
    foodWasteLoading,
    reusableWasteLoading,
    taticalMobilityLoading,
  } = useScheduleContext();

  const limit = useMemo(() => {
    const calcLimit = Math.round((windowSize - 268) / 40);
    return calcLimit < MIN_LIMIT ? MIN_LIMIT : calcLimit > MAX_LIMIT ? MAX_LIMIT : calcLimit;
  }, [windowSize]);

  return (
    <BaseRow gutter={[12, 12]}>
      <BaseCol span={8}>
        <TableItem
          tableTitle="생활반"
          colorTheme="#57BA00"
          scheduleList={compositeWasteSchedule}
          loading={compositeWasteLoading}
          limit={limit}
        />
      </BaseCol>
      <BaseCol span={8}>
        <TableItem
          tableTitle="음식반"
          colorTheme="#0085F7"
          scheduleList={foodWasteSchedule}
          loading={foodWasteLoading}
          limit={limit}
        />
      </BaseCol>
      <BaseCol span={8}>
        <div
          style={{
            height: `calc(64px + ${limit}px * 40 + ${Math.pow(limit, 1.4) * 0.02}rem)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <TableItem
            tableTitle="재활반"
            colorTheme="#F08D14"
            scheduleList={reusableWasteSchedule}
            loading={reusableWasteLoading}
            limit={Math.abs(Math.ceil(limit / 2) - 1) ?? 1}
          />
          <TableItem
            tableTitle="기동반"
            colorTheme="#BD00FF"
            scheduleList={taticalMobilityWasteSchedule}
            loading={taticalMobilityLoading}
            limit={Math.abs(limit - Math.abs(Math.ceil(limit / 2) - 1) - 2) ?? 1}
          />
        </div>
      </BaseCol>
    </BaseRow>
  );
};
