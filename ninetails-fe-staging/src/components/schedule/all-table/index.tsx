import { BaseCol } from '@/components/common/base-col';
import { TableSummary } from '@/components/schedule/table-summary';
import { PURPOSE_VALUE } from '@/constants/settings';
import React, { useState } from 'react';

import { ScheduleCollapse } from '../collapse';
import { useScheduleContext } from '../context';
import * as S from './index.styles';
import { TableItem } from './table-item';

interface IProps {
  isFullScreen: boolean;
}

export const AllTable: React.FC<IProps> = ({ isFullScreen }) => {
  const [isOpenSummary, setIsOpenSummary] = useState<boolean>(true);

  const {
    compositeWasteSchedule,
    foodWasteSchedule,
    reusableWasteSchedule,
    taticalMobilityWasteSchedule,
    compositeWasteLoading,
    foodWasteLoading,
    reusableWasteLoading,
    taticalMobilityLoading,
    allPurposeStatistic,
    statisticLoading,
    selectedComposite,
    selectedFood,
    selectedReusable,
    selectedTactical,
    totalSchedule,
    setSelectedComposite,
    setSelectedFood,
    setSelectedReusable,
    setSelectedTatical,
  } = useScheduleContext();

  return (
    <S.WrapAllTable>
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
          collection_department="통합"
          purposeStatistic={allPurposeStatistic}
          loading={statisticLoading}
          totalSChedule={totalSchedule}
        />
      )}
      <S.Row gutter={[12, 12]}>
        <BaseCol xxl={12} xl={24} lg={24} md={24} sm={24} xs={24}>
          <TableItem
            tableTitle="생활반"
            colorTheme="#57BA00"
            scheduleList={compositeWasteSchedule}
            loading={compositeWasteLoading}
            selectedRows={selectedComposite}
            setSelectedRows={setSelectedComposite}
            purpose={PURPOSE_VALUE?.COMPOSITE_WASTES}
          />
        </BaseCol>
        <BaseCol xxl={12} xl={24} lg={24} md={24} sm={24} xs={24}>
          <TableItem
            tableTitle="음식반"
            colorTheme="#0085F7"
            scheduleList={foodWasteSchedule}
            loading={foodWasteLoading}
            selectedRows={selectedFood}
            setSelectedRows={setSelectedFood}
            purpose={PURPOSE_VALUE?.FOOD_WASTES}
          />
        </BaseCol>
        <BaseCol xxl={12} xl={24} lg={24} md={24} sm={24} xs={24}>
          <TableItem
            tableTitle="재활반"
            colorTheme="#F08D14"
            scheduleList={reusableWasteSchedule}
            loading={reusableWasteLoading}
            selectedRows={selectedReusable}
            setSelectedRows={setSelectedReusable}
            purpose={PURPOSE_VALUE?.REUSABLE_WASTES}
          />
        </BaseCol>
        <BaseCol xxl={12} xl={24} lg={24} md={24} sm={24} xs={24}>
          <TableItem
            tableTitle="기동반"
            colorTheme="#BD00FF"
            scheduleList={taticalMobilityWasteSchedule}
            loading={taticalMobilityLoading}
            selectedRows={selectedTactical}
            setSelectedRows={setSelectedTatical}
            purpose={PURPOSE_VALUE?.TACTICAL_MOBILITY}
          />
        </BaseCol>
      </S.Row>
    </S.WrapAllTable>
  );
};
