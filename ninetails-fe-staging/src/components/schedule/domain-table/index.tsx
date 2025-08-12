import { TableItem } from '@/components/schedule/all-table/table-item';
import { useGetSchedulePurposeStatistic } from '@/hooks/features/useSchedule';
import { ISchedule } from '@/interfaces/schedule';
import React, { Dispatch, SetStateAction, useState } from 'react';

import { ScheduleCollapse } from '../collapse';
import { useScheduleContext } from '../context';
import { DEFAULT_PURPOSE_STATISTIC } from '../context/index.utils';
import { TableSummary } from '../table-summary';
import * as S from './index.styles';

interface IProps {
  colorTheme: string;
  domain: {
    en: string;
    kr: string;
  };
  scheduleList: ISchedule[];
  loading: boolean;
  selectedRows: (string | number)[];
  setSelectedRows: Dispatch<SetStateAction<(string | number)[]>>;
  isFullScreen: boolean;
}

export const DomainTable: React.FC<IProps> = (props) => {
  const { domain, colorTheme, scheduleList, loading, selectedRows, setSelectedRows, isFullScreen } =
    props;
  const { params } = useScheduleContext();

  const [isOpenSummary, setIsOpenSummary] = useState<boolean>(true);

  const { data: scheduleStatisticData, isLoading: statisticLoading } =
    useGetSchedulePurposeStatistic({
      working_date: params?.working_date,
      purpose: domain.en,
    });

  return (
    <S.WrapDomainTable>
      {!isFullScreen && (
        <ScheduleCollapse
          title="근무 배치 통계"
          isOpen={isOpenSummary}
          textSize="xl"
          onToogle={() => setIsOpenSummary((prev) => !prev)}
        />
      )}

      {isOpenSummary && !isFullScreen && (
        <TableSummary
          collection_department={domain.kr}
          purposeStatistic={scheduleStatisticData?.data?.statistics ?? DEFAULT_PURPOSE_STATISTIC}
          loading={statisticLoading}
          totalSChedule={scheduleStatisticData?.data?.pagination?.total ?? 0}
        />
      )}

      <S.WrapTable>
        <TableItem
          tableTitle={`${domain.kr}반`}
          colorTheme={colorTheme}
          scheduleList={scheduleList}
          loading={loading}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          purpose={domain.en}
        />
      </S.WrapTable>
    </S.WrapDomainTable>
  );
};
