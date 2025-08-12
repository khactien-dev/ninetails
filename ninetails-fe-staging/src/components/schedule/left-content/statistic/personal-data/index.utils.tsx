import ChevronOppsive from '@/assets/images/schedule/chevron-opposive.svg';
import { useScheduleContext } from '@/components/schedule/context';
import { DEFAULT_SELECTED_UPDATING_SCHEDULE } from '@/components/schedule/context/index.utils';
import * as S from '@/components/schedule/left-content/statistic/index.styles';
import { WholeTable } from '@/components/schedule/left-content/statistic/whole-table';
import { usePermissions } from '@/hooks/usePermissions';
import { CREW_TYPE, IStatisticStaff } from '@/interfaces/schedule';
import { truncateName } from '@/utils';
import { Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';

import { AbsenceInfo } from '../absence-info';

const colors = {
  green: '#0E8001',
  blue: '#043961',
  orange: 'rgba(255, 122, 0, 1)',
  violet: 'rgba(189, 0, 255, 1)',
  red: 'rgba(254, 0, 4, 1)',
  pink: '#ffadff',
  azureBlue: '#0072C6',
  lightBlue: '#5FC5ED',
  lightGreen: '#83C257',
  yellow: '#EFE837',
};

enum PAGE {
  FIRST_PAGE = 'FIRST_PAGE',
  SECOND_PAGE = 'SECOND_PAGE',
}

const COLUMNS: {
  [key: string]: {
    key?: string;
    dataIndex?: string;
    width: string;
    align: 'center';
    title?: string;
    crew_type?: CREW_TYPE;
  };
} = {
  driving_regular: {
    key: 'driving_regular',
    dataIndex: 'driving_regular',
    width: '25%',
    align: 'center',
  },
  collect_regular: {
    key: 'collect_regular',
    dataIndex: 'collect_regular',
    width: '25%',
    align: 'center',
  },
  support_regular: {
    key: 'support_regular',
    dataIndex: 'support_regular',
    width: '25%',
    align: 'center',
  },
  collect_monthly: {
    key: 'collect_monthly',
    dataIndex: 'collect_monthly',
    width: '25%',
    align: 'center',
  },
  collect_fixed_term: {
    key: 'collect_fixed_term',
    dataIndex: 'collect_fixed_term',
    width: '25%',
    align: 'center',
  },
  support_fixed_term: {
    key: 'support_fixed_term',
    dataIndex: 'support_fixed_term',
    width: '25%',
    align: 'center',
  },
  empty: {
    title: '',
    width: '25%',
    align: 'center',
  },
};

export const usePersonalData = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [waitingPage, setWaitingPage] = useState<PAGE>(PAGE.FIRST_PAGE);
  const [maintenancePage, setMaintenancePage] = useState<PAGE>(PAGE.FIRST_PAGE);
  const [isOpenBackToWork, setIsOpenBackToWork] = useState<boolean>(false);
  const {
    wholeStaffDataSource,
    availableStaff,
    absenceStaff,
    statisticLoading,
    staffDispatchingCount,
    staffActiveCount,
    staffAbsenceCount,
    selectedUpdatingSchedule,
    isDisabledScheduleEdit,
    setSelectedUpdatingSchedule,
  } = useScheduleContext();
  const permission = usePermissions();
  // const { notification } = useFeedback();

  const wholeTitle = useMemo(() => {
    const total = staffAbsenceCount + staffActiveCount + staffDispatchingCount;
    return [
      {
        title: '전체 인력',
        value: total,
        unit: '명',
      },
      {
        title: '운용률',
        value: total > 0 ? ((staffDispatchingCount / total) * 100)?.toFixed() : 0,
        unit: '%',
        withBracket: true,
      },
    ];
  }, [staffAbsenceCount, staffActiveCount, staffDispatchingCount]);

  const waitTitle = useMemo(() => {
    return [
      {
        title: '대기 인력',
        value: staffActiveCount,
        unit: '명',
      },
    ];
  }, [staffActiveCount]);

  const maintenanceTitle = useMemo(() => {
    return [
      {
        title: '정비 인력',
        value: staffAbsenceCount,
        unit: '명',
      },
    ];
  }, [staffAbsenceCount]);

  const renderCell = (
    data: { value: IStatisticStaff; isSummary?: boolean; total?: number },
    color: string,
    type: 'absence' | 'available'
  ) => {
    if (data?.isSummary)
      return <S.WaitingSummaryCell color={color}>{data?.total}</S.WaitingSummaryCell>;

    if (data?.value)
      return (
        <S.WaitingCell
          $isActive={selectedUpdatingSchedule?.targetCrew === data?.value?.id}
          $isEditAble={permission?.updateAble && type === 'available' && !isDisabledScheduleEdit}
          onClick={() => {
            permission?.updateAble &&
              type === 'available' &&
              !isDisabledScheduleEdit &&
              setSelectedUpdatingSchedule((prev) => {
                if (selectedUpdatingSchedule?.targetCrew === data?.value?.id) {
                  return DEFAULT_SELECTED_UPDATING_SCHEDULE;
                }
                return {
                  id: prev.id,
                  //  agent 1 - 2
                  ...(prev.currentStaff1Id ? { currentStaff1Id: prev.currentStaff1Id } : {}),
                  ...(prev.currentStaff2Id ? { currentStaff2Id: prev.currentStaff2Id } : {}),
                  ...(prev.backupStaff1Id ? { backupStaff1Id: prev.backupStaff1Id } : {}),
                  ...(prev.backupStaff2Id ? { backupStaff2Id: prev.backupStaff2Id } : {}),
                  // driver
                  ...(prev.currentDriverId ? { currentDriverId: prev.currentDriverId } : {}),
                  ...(prev.backupDriverId ? { backupDriverId: prev.backupDriverId } : {}),
                  targetCrew: data?.value?.id,
                  purpose: prev?.purpose,
                };
              });
          }}
        >
          {(data?.value?.absence_type || data?.value?.replacer_staff_id) && (
            <S.WrapCellStatus onClick={(e) => e.stopPropagation()}>
              <AbsenceInfo
                staffData={data?.value}
                iconSize="sm"
                type={data?.value?.replacer_staff_id ? 'available' : 'absence'}
              />
            </S.WrapCellStatus>
          )}

          <Tooltip title={data?.value.name}>
            <S.WrapNameElipsis
              $isActive={selectedUpdatingSchedule?.targetCrew === data?.value?.id}
              $color={color}
            >
              {truncateName(data?.value.name, 7)}
            </S.WrapNameElipsis>
          </Tooltip>
        </S.WaitingCell>
      );

    return '';
  };

  const _renderFirstColumnTitle = (
    setState: (v: PAGE) => void,
    v: PAGE,
    title: string,
    subTitle: string
  ) => {
    return (
      <S.WrapWaitingTableHeader>
        <div onClick={() => setState(v)}>
          <ChevronOppsive />
        </div>
        <S.WaitingTableHeader>
          {title}
          <S.WaitingTableSubHeader>{subTitle}</S.WaitingTableSubHeader>
        </S.WaitingTableHeader>
      </S.WrapWaitingTableHeader>
    );
  };

  const _renderColumnTitle = (title: string, subTitle: string) => {
    return (
      <S.WaitingTableHeader>
        {title}
        <S.WaitingTableSubHeader>{subTitle}</S.WaitingTableSubHeader>
      </S.WaitingTableHeader>
    );
  };

  const availableFirstPageColumn: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setWaitingPage, PAGE.SECOND_PAGE, '운전', '[정]'),
      render: (v) => renderCell(v, colors.blue, 'available'),
      ...COLUMNS.driving_regular,
    },
    {
      title: _renderColumnTitle('지원', '[정]'),
      render: (v) => renderCell(v, colors.azureBlue, 'available'),
      ...COLUMNS.support_regular,
    },
    {
      title: _renderColumnTitle('지원', '[계]'),
      render: (v) => renderCell(v, colors.lightBlue, 'available'),
      ...COLUMNS.support_fixed_term,
    },
  ];

  const availableSecondPageColumn: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setWaitingPage, PAGE.FIRST_PAGE, '탑승', '[정]'),
      render: (v) => renderCell(v, colors.green, 'available'),
      ...COLUMNS.collect_regular,
    },
    {
      title: _renderColumnTitle('탑승', '[단]'),
      render: (v) => renderCell(v, colors.lightGreen, 'available'),
      ...COLUMNS.collect_monthly,
    },
    {
      title: _renderColumnTitle('탑승', '[계]'),
      render: (v) => renderCell(v, colors.yellow, 'available'),
      ...COLUMNS.collect_fixed_term,
    },
  ];

  const absenceFirstPageColumn: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setMaintenancePage, PAGE.SECOND_PAGE, '운전', '[정]'),
      render: (v) => renderCell(v, colors.blue, 'absence'),
      ...COLUMNS.driving_regular,
    },
    {
      title: _renderColumnTitle('지원', '[정]'),
      render: (v) => renderCell(v, colors.azureBlue, 'absence'),
      ...COLUMNS.support_regular,
    },
    {
      title: _renderColumnTitle('지원', '[계]'),
      render: (v) => renderCell(v, colors.lightBlue, 'absence'),
      ...COLUMNS.support_fixed_term,
    },
  ];

  const absenceSecondPageColumn: ColumnType<any>[] = [
    {
      title: () => _renderFirstColumnTitle(setMaintenancePage, PAGE.FIRST_PAGE, '탑승', '[정]'),
      render: (v) => renderCell(v, colors.green, 'absence'),
      ...COLUMNS.collect_regular,
    },
    {
      title: _renderColumnTitle('탑승', '[단]'),
      render: (v) => renderCell(v, colors.lightGreen, 'absence'),
      ...COLUMNS.collect_monthly,
    },
    {
      title: _renderColumnTitle('탑승', '[계]'),
      render: (v) => renderCell(v, colors.yellow, 'absence'),
      ...COLUMNS.collect_fixed_term,
    },
  ];

  const _renderWhole = () => {
    return (
      <WholeTable dataSource={wholeStaffDataSource} loading={statisticLoading} section="staff" />
    );
  };

  const _renderWait = () => {
    switch (waitingPage) {
      case PAGE.FIRST_PAGE:
        return (
          <S.WaitingTable
            columns={availableFirstPageColumn}
            pagination={false}
            dataSource={availableStaff.firstPage}
            loading={statisticLoading}
          />
        );
      case PAGE.SECOND_PAGE:
        return (
          <S.WaitingTable
            columns={availableSecondPageColumn}
            pagination={false}
            dataSource={availableStaff.secondPage}
            loading={statisticLoading}
          />
        );
    }
  };

  const _renderMaitenance = () => {
    switch (maintenancePage) {
      case PAGE.FIRST_PAGE:
        return (
          <S.WaitingTable
            columns={absenceFirstPageColumn}
            dataSource={absenceStaff.firstPage}
            pagination={false}
            loading={statisticLoading}
          />
        );
      case PAGE.SECOND_PAGE:
        return (
          <S.WaitingTable
            columns={absenceSecondPageColumn}
            dataSource={absenceStaff.secondPage}
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
