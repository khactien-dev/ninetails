import { ISchedulePurposeStatistic } from '@/interfaces/schedule';
import { roundToDecimal } from '@/utils/control';
import { ColumnType } from 'antd/es/table';
import React from 'react';

import * as S from './index.styles';

interface IProps {
  collection_department: string;
  purposeStatistic: ISchedulePurposeStatistic;
  loading: boolean;
  totalSChedule: number;
}

export const TableSummary: React.FC<IProps> = (props) => {
  const { collection_department, purposeStatistic, loading, totalSChedule } = props;

  const renderColumnCell = (
    v: { regular: number | null; replace: number | null },
    unit: string
  ) => {
    return (
      <S.WrapCell>
        <S.WrapTotalText>
          {(v?.regular ?? 0) + (v?.replace ?? 0)} {unit}
        </S.WrapTotalText>
        <S.WrapCellField>
          <S.WrapOutlineLabel>정규</S.WrapOutlineLabel>
          <S.WrapFieldValue>
            {v.regular} {unit}
          </S.WrapFieldValue>
        </S.WrapCellField>
        <S.WrapCellField>
          <S.WrapOutlineLabel>대체</S.WrapOutlineLabel>
          <S.WrapFieldValue>
            {v.replace} {unit}
          </S.WrapFieldValue>
        </S.WrapCellField>
      </S.WrapCell>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: '수거 부서',
      dataIndex: 'collection_department',
      key: 'collection_department',
      width: '14.3%',
      align: 'center',
      render: () => <S.WrapCellText>{collection_department}</S.WrapCellText>,
    },
    {
      title: '배차 지역',
      key: 'route_id',
      width: '14.3%',
      align: 'center',
      render: (r: ISchedulePurposeStatistic) => <S.WrapCellText>{r?.routeCount} 개</S.WrapCellText>,
    },
    {
      title: '거리',
      key: 'distance',
      width: '14.3%',
      align: 'center',
      render: (r: ISchedulePurposeStatistic) => {
        const colDistance = (r?.sumCollectDistance ?? 0) / 1000;
        const nonColDistance = (r?.sumNonCollectDistance ?? 0) / 1000;
        const total = ((r?.sumCollectDistance ?? 0) + (r?.sumNonCollectDistance ?? 0)) / 1000;
        return (
          <S.WrapCell>
            <S.WrapTotalText>{roundToDecimal(total, 3)} km</S.WrapTotalText>
            <S.WrapCellField>
              <S.WrapFilledLabel>수거</S.WrapFilledLabel>
              <S.WrapFieldValue>{roundToDecimal(colDistance, 3)} km</S.WrapFieldValue>
            </S.WrapCellField>
            <S.WrapCellField>
              <S.WrapFilledLabel>비수거</S.WrapFilledLabel>
              <S.WrapFieldValue>{roundToDecimal(nonColDistance, 3)} km</S.WrapFieldValue>
            </S.WrapCellField>
          </S.WrapCell>
        );
      },
    },

    {
      title: '배차 차량',
      key: 'dispatch vehicle',
      width: '14.3%',
      align: 'center',
      render: (r: ISchedulePurposeStatistic) =>
        renderColumnCell(
          {
            regular: r?.vehicleRegularCount,
            replace: r?.vehicleBackupCount,
          },
          '대'
        ),
    },
    {
      title: '운전원',
      key: 'driver',
      align: 'center',
      width: '14.3%',
      render: (r: ISchedulePurposeStatistic) =>
        renderColumnCell(
          {
            regular: r?.driverRegularCount,
            replace: r?.driverBackupCount,
          },
          '명'
        ),
    },
    {
      title: '탑승원',
      key: 'crew',
      width: '14.3%',
      align: 'center',
      render: (r: ISchedulePurposeStatistic) =>
        renderColumnCell(
          {
            regular: r?.collectRegularCount,
            replace: r?.collectBackupCount,
          },
          '명'
        ),
    },
    {
      title: '대체 투입',
      key: 'subtitle_input',
      width: '14.3%',
      align: 'center',
      render: (r: ISchedulePurposeStatistic) => (
        <S.WrapTrend>
          <S.Growth>{roundToDecimal((r?.replacementRate ?? 0) * 100, 3)}%</S.Growth>
          <S.GrowthRate>
            {(purposeStatistic?.driverBackupCount ?? 0) +
              (purposeStatistic?.collectBackupCount ?? 0)}
            /{totalSChedule * 3} 명
          </S.GrowthRate>
        </S.WrapTrend>
      ),
    },
  ];

  return (
    <S.WrapTableSummary>
      <S.Table
        columns={columns}
        dataSource={[purposeStatistic]}
        pagination={false}
        scroll={{ x: 'max-content' }}
        loading={loading}
      />
    </S.WrapTableSummary>
  );
};
