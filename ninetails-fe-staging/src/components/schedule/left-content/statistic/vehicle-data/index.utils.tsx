import ChevronOppsive from '@/assets/images/schedule/chevron-opposive.svg';
import { useScheduleContext } from '@/components/schedule/context';
import { DEFAULT_SELECTED_UPDATING_SCHEDULE } from '@/components/schedule/context/index.utils';
import * as S from '@/components/schedule/left-content/statistic/index.styles';
import { usePermissions } from '@/hooks/usePermissions';
import { IStatisticVehicle, STATUS } from '@/interfaces/schedule';
import { ColumnType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { AbsenceInfo } from '../absence-info';
import { WholeTable } from '../whole-table';

export interface IWaitingValue {
  value: string | number;
  isSummary?: boolean;
  status: STATUS;
}

export const colors = {
  green: 'rgba(0, 169, 37, 1)',
  blue: 'rgba(0, 87, 255, 1)',
  orange: '#ED9201',
  violet: '#8A29AF',
  light_blue: '#5FC5ED',
  light_green: '#30AF5B',
  yellow: '#EFE837',
  light_purple: '#DB00FF',
};

export enum PAGE {
  FIRST_PAGE = 'FIRST_PAGE',
  SECOND_PAGE = 'SECOND_PAGE',
}

export enum ENTITY_STATUS {
  AVAILABLE = 'AVAILABLE',
  ABSENCE = 'ABSENCE',
}

const COLUMNS: {
  [key: string]: {
    key: string;
    dataIndex: string;
    width: string;
    align: any;
  };
} = {
  composite_regular: {
    key: 'composite_regular',
    dataIndex: 'composite_regular',
    width: '20%',
    align: 'center',
  },
  food_regular: {
    key: 'food_regular',
    dataIndex: 'food_regular',
    width: '20%',
    align: 'center',
  },
  reusable_regular: {
    key: 'reusable_regular',
    dataIndex: 'reusable_regular',
    width: '20%',
    align: 'center',
  },
  tatical_mobility_regular: {
    key: 'tatical_mobility_regular',
    dataIndex: 'tatical_mobility_regular',
    width: '20%',
    align: 'center',
  },
  composite_support: {
    key: 'composite_support',
    dataIndex: 'composite_support',
    width: '20%',
    align: 'center',
  },
  food_support: {
    key: 'food_support',
    dataIndex: 'food_support',
    width: '20%',
    align: 'center',
  },
  reusable_support: {
    key: 'reusable_support',
    dataIndex: 'reusable_support',
    width: '20%',
    align: 'center',
  },
  tatical_mobility_support: {
    key: 'tatical_mobility_support',
    dataIndex: 'tatical_mobility_support',
    width: '20%',
    align: 'center',
  },
};

export const useVehicleData = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [waitingPage, setWaitingPage] = useState<PAGE>(PAGE.FIRST_PAGE);
  const [maintenacePage, setMaintenacePage] = useState<PAGE>(PAGE.FIRST_PAGE);
  const [isOpenBackToWork, setIsOpenBackToWork] = useState<boolean>(false);
  const {
    wholeVehicleDataSource,
    absenceVehicle,
    availableVehicle,
    statisticLoading,
    vehicleAbsenceCount,
    vehicleActiveCount,
    vehicleDispatchingCount,
    selectedUpdatingSchedule,
    isDisabledScheduleEdit,
    setSelectedUpdatingSchedule,
  } = useScheduleContext();
  const permission = usePermissions();

  const waitTitle = useMemo(() => {
    return [
      {
        title: '대기 차량',
        value: vehicleActiveCount,
        unit: '대',
      },
    ];
  }, [vehicleActiveCount]);

  const maintenanceTitle = useMemo(() => {
    return [
      {
        title: '정비 차량',
        value: vehicleAbsenceCount,
        unit: '대',
      },
    ];
  }, [vehicleAbsenceCount]);

  const wholeTitle = useMemo(() => {
    const total = vehicleActiveCount + vehicleAbsenceCount + vehicleDispatchingCount;
    return [
      {
        title: '전체 차량',
        value: total,
        unit: '대',
      },
      {
        title: '운용률',
        value: total > 0 ? ((vehicleDispatchingCount / total) * 100)?.toFixed() : 0,
        unit: '%',
        withBracket: true,
      },
    ];
  }, [vehicleActiveCount, vehicleAbsenceCount, vehicleDispatchingCount]);

  const _renderColumnTitle = (title: string, subTitle: string) => {
    return (
      <S.WaitingTableHeader>
        {title}
        <S.WaitingTableSubHeader>{subTitle}</S.WaitingTableSubHeader>
      </S.WaitingTableHeader>
    );
  };

  const renderWaitingCell = (
    data: {
      value?: IStatisticVehicle;
      isSummary?: boolean;
      total?: number;
    },
    color: string,
    type: 'absence' | 'available'
  ) => {
    if (data?.isSummary)
      return <S.WaitingSummaryCell color={color}>{data?.total}</S.WaitingSummaryCell>;
    if (data?.value)
      return (
        <S.WaitingCell
          $isActive={selectedUpdatingSchedule?.targetVehicleId === data?.value?.id}
          $isEditAble={permission?.updateAble && type === 'available' && !isDisabledScheduleEdit}
          onClick={() => {
            permission?.updateAble &&
              type === 'available' &&
              !isDisabledScheduleEdit &&
              setSelectedUpdatingSchedule((prev) => {
                if (selectedUpdatingSchedule?.targetVehicleId === data?.value?.id) {
                  return DEFAULT_SELECTED_UPDATING_SCHEDULE;
                }
                return {
                  id: prev.id,
                  ...(prev.currentVehicleId ? { currentVehicleId: prev.currentVehicleId } : {}),
                  ...(prev.backupVehicleId ? { backupVehicleId: prev.backupVehicleId } : {}),
                  targetVehicleId: data?.value?.id,
                  purpose: prev?.purpose,
                };
              });
          }}
        >
          {data?.value?.absence_type && (
            <S.WrapCellStatus onClick={(e) => e.stopPropagation()}>
              <AbsenceInfo vehicleData={data?.value} iconSize="sm" type={type} />
            </S.WrapCellStatus>
          )}

          <S.WrapName
            $isActive={selectedUpdatingSchedule?.targetVehicleId === data?.value?.id}
            $color={color}
          >
            {data?.value?.vehicle_number}
          </S.WrapName>
        </S.WaitingCell>
      );

    return '';
  };

  const _renderFirstColumnTitle = (setState: (v: PAGE) => void, v: PAGE, subTitle: string) => {
    return (
      <S.WrapWaitingTableHeader>
        <div onClick={() => setState(v)}>
          <ChevronOppsive />
        </div>
        <S.WaitingTableHeader>
          생활
          <S.WaitingTableSubHeader>[{subTitle}]</S.WaitingTableSubHeader>
        </S.WaitingTableHeader>
      </S.WrapWaitingTableHeader>
    );
  };

  const waitingFirstPageColumns: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setWaitingPage, PAGE.SECOND_PAGE, '정'),
      render: (v) => renderWaitingCell(v, colors.green, 'available'),
      ...COLUMNS.composite_regular,
    },
    {
      title: _renderColumnTitle('음식', '[정]'),
      render: (v) => renderWaitingCell(v, colors.blue, 'available'),
      ...COLUMNS.food_regular,
    },
    {
      title: _renderColumnTitle('재활', '[정]'),
      render: (v) => renderWaitingCell(v, colors.orange, 'available'),
      ...COLUMNS.reusable_regular,
    },
    {
      title: _renderColumnTitle('기동', '[정]'),
      render: (v) => renderWaitingCell(v, colors.violet, 'available'),
      ...COLUMNS.tatical_mobility_regular,
    },
  ];

  const waitingSecondPageColumns: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setWaitingPage, PAGE.FIRST_PAGE, '지'),
      render: (v) => renderWaitingCell(v, colors.light_green, 'available'),
      ...COLUMNS.composite_support,
    },
    {
      title: _renderColumnTitle('음식', '[지]'),
      render: (v) => renderWaitingCell(v, colors.light_blue, 'available'),
      ...COLUMNS.food_support,
    },
    {
      title: _renderColumnTitle('재활', '[지]'),
      render: (v) => renderWaitingCell(v, colors.yellow, 'available'),
      ...COLUMNS.reusable_support,
    },
    {
      title: _renderColumnTitle('기동', '[지]'),
      render: (v) => renderWaitingCell(v, colors.light_purple, 'available'),
      ...COLUMNS.tatical_mobility_support,
    },
  ];

  const maintenanceFirstPageColumns: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setMaintenacePage, PAGE.SECOND_PAGE, '정'),
      render: (v) => renderWaitingCell(v, colors.blue, 'absence'),
      ...COLUMNS.composite_regular,
    },
    {
      title: _renderColumnTitle('음식', '[정]'),
      render: (v) => renderWaitingCell(v, colors.green, 'absence'),
      ...COLUMNS.food_regular,
    },
    {
      title: _renderColumnTitle('재활', '[정]'),
      render: (v) => renderWaitingCell(v, colors.orange, 'absence'),
      ...COLUMNS.reusable_regular,
    },
    {
      title: _renderColumnTitle('기동', '[정]'),
      render: (v) => renderWaitingCell(v, colors.violet, 'absence'),
      ...COLUMNS.tatical_mobility_regular,
    },
  ];

  const maintenanceSecondPageColumns: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setMaintenacePage, PAGE.FIRST_PAGE, '지'),
      render: (v) => renderWaitingCell(v, colors.light_blue, 'absence'),
      ...COLUMNS.composite_support,
    },
    {
      title: _renderColumnTitle('음식', '[지]'),
      render: (v) => renderWaitingCell(v, colors.light_green, 'absence'),
      ...COLUMNS.food_support,
    },
    {
      title: _renderColumnTitle('재활', '[지]'),
      render: (v) => renderWaitingCell(v, colors.yellow, 'absence'),
      ...COLUMNS.reusable_support,
    },
    {
      title: _renderColumnTitle('기동', '[지]'),
      render: (v) => renderWaitingCell(v, colors.light_purple, 'absence'),
      ...COLUMNS.tatical_mobility_support,
    },
  ];

  const _renderWhole = () => {
    return (
      <WholeTable
        dataSource={wholeVehicleDataSource}
        loading={statisticLoading}
        section="vehicle"
      />
    );
  };

  const _renderWait = () => {
    switch (waitingPage) {
      case PAGE.FIRST_PAGE:
        return (
          <S.WaitingTable
            columns={waitingFirstPageColumns}
            pagination={false}
            dataSource={availableVehicle.firstPage}
            loading={statisticLoading}
          />
        );
      default:
        return (
          <S.WaitingTable
            columns={waitingSecondPageColumns}
            pagination={false}
            dataSource={availableVehicle.secondPage}
            loading={statisticLoading}
          />
        );
    }
  };

  const _renderMaitenance = () => {
    switch (maintenacePage) {
      case PAGE.FIRST_PAGE:
        return (
          <S.WaitingTable
            columns={maintenanceFirstPageColumns}
            dataSource={absenceVehicle.firstPage}
            pagination={false}
            loading={statisticLoading}
          />
        );
      default:
        return (
          <S.WaitingTable
            columns={maintenanceSecondPageColumns}
            dataSource={absenceVehicle.secondPage}
            pagination={false}
            loading={statisticLoading}
          />
        );
    }
  };

  return {
    _renderMaitenance,
    _renderWhole,
    _renderWait,
    isOpenBackToWork,
    setIsOpenBackToWork,
    wholeTitle,
    maintenanceTitle,
    waitTitle,
    isOpen,
    setIsOpen,
  };
};
