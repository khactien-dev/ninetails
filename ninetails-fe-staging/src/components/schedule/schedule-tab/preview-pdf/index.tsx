import Calendar from '@/assets/images/schedule/icon-calendar.svg';
import { TableItem } from '@/components/schedule/all-table/table-item';
import { TableSummary } from '@/components/schedule/table-summary';
import { DATE_FORMAT } from '@/constants';
import { PURPOSE_VALUE } from '@/constants/settings';
import dayjs from 'dayjs';
import React from 'react';

import { useScheduleContext } from '../../context';
import * as S from './index.styles';

interface IProps {
  activeTab: string;
}

export const PreviewPdf: React.FC<IProps> = ({ activeTab }) => {
  const {
    params,
    allPurposeStatistic,
    statisticLoading,
    totalSchedule,
    compositeWasteSchedule,
    foodWasteSchedule,
    reusableWasteSchedule,
    taticalMobilityWasteSchedule,
  } = useScheduleContext();

  return (
    <S.WrapPreviewPdf>
      <S.Title>근무 배치 통계</S.Title>
      <S.Date>{dayjs(params?.working_date).format(DATE_FORMAT.DATE_KOREA_DAY_OF_WEEK)}</S.Date>
      <S.SelectDate value={dayjs(params?.working_date)} suffixIcon={<Calendar />} />
      <S.Title>근무 배치 통계</S.Title>

      <S.WrapTableSummary>
        <TableSummary
          collection_department="통합"
          purposeStatistic={allPurposeStatistic}
          loading={statisticLoading}
          totalSChedule={totalSchedule}
        />
      </S.WrapTableSummary>

      {activeTab === 'all' ? (
        <>
          <S.WrapTableItem>
            <TableItem
              tableTitle="생활반"
              colorTheme="rgba(0, 87, 255, 1)"
              scheduleList={compositeWasteSchedule}
              loading={false}
              selectedRows={[]}
              setSelectedRows={() => null}
              purpose={PURPOSE_VALUE?.COMPOSITE_WASTES}
            />
          </S.WrapTableItem>
          <S.WrapTableItem>
            <TableItem
              tableTitle="음식반"
              colorTheme="rgba(14, 128, 1, 1)"
              scheduleList={foodWasteSchedule}
              loading={false}
              selectedRows={[]}
              setSelectedRows={() => null}
              purpose={PURPOSE_VALUE?.FOOD_WASTES}
            />
          </S.WrapTableItem>
          <S.WrapTableItem>
            <TableItem
              tableTitle="재활반"
              colorTheme="rgba(255, 122, 0, 1)"
              scheduleList={reusableWasteSchedule}
              loading={false}
              selectedRows={[]}
              setSelectedRows={() => null}
              purpose={PURPOSE_VALUE?.REUSABLE_WASTES}
            />
          </S.WrapTableItem>
          <S.WrapTableItem>
            <TableItem
              tableTitle="기동반"
              colorTheme="rgba(189, 0, 255, 1)"
              scheduleList={taticalMobilityWasteSchedule}
              loading={false}
              selectedRows={[]}
              setSelectedRows={() => null}
              purpose={PURPOSE_VALUE?.TACTICAL_MOBILITY}
            />
          </S.WrapTableItem>
        </>
      ) : activeTab === PURPOSE_VALUE.COMPOSITE_WASTES ? (
        <S.WrapTableItem>
          <TableItem
            tableTitle="생활반"
            colorTheme="rgba(0, 87, 255, 1)"
            scheduleList={compositeWasteSchedule}
            loading={false}
            selectedRows={[]}
            setSelectedRows={() => null}
            purpose={PURPOSE_VALUE?.COMPOSITE_WASTES}
          />
        </S.WrapTableItem>
      ) : activeTab === PURPOSE_VALUE.FOOD_WASTES ? (
        <S.WrapTableItem>
          <TableItem
            tableTitle="음식반"
            colorTheme="rgba(14, 128, 1, 1)"
            scheduleList={foodWasteSchedule}
            loading={false}
            selectedRows={[]}
            setSelectedRows={() => null}
            purpose={PURPOSE_VALUE?.FOOD_WASTES}
          />
        </S.WrapTableItem>
      ) : activeTab === PURPOSE_VALUE.REUSABLE_WASTES ? (
        <S.WrapTableItem>
          <TableItem
            tableTitle="재활반"
            colorTheme="rgba(255, 122, 0, 1)"
            scheduleList={reusableWasteSchedule}
            loading={false}
            selectedRows={[]}
            setSelectedRows={() => null}
            purpose={PURPOSE_VALUE?.REUSABLE_WASTES}
          />
        </S.WrapTableItem>
      ) : activeTab === PURPOSE_VALUE.TACTICAL_MOBILITY ? (
        <S.WrapTableItem>
          <TableItem
            tableTitle="기동반"
            colorTheme="rgba(189, 0, 255, 1)"
            scheduleList={taticalMobilityWasteSchedule}
            loading={false}
            selectedRows={[]}
            setSelectedRows={() => null}
            purpose={PURPOSE_VALUE?.TACTICAL_MOBILITY}
          />
        </S.WrapTableItem>
      ) : null}
    </S.WrapPreviewPdf>
  );
};
