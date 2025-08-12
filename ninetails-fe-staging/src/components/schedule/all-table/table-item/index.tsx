import { BaseCheckbox } from '@/components/common/base-checkbox';
import { CrewIcon, TruckIcon } from '@/components/schedule/left-content/statistic/icon';
// import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { IWorker } from '@/interfaces';
import { CREW_TYPE, ISchedule, VEHICLE_TYPE } from '@/interfaces/schedule';
import { ColumnType } from 'antd/es/table';
import React, { Dispatch, SetStateAction, useMemo } from 'react';

import { useScheduleContext } from '../../context';
import { DEFAULT_SELECTED_UPDATING_SCHEDULE } from '../../context/index.utils';
import { AbsenceInfo } from '../../left-content/statistic/absence-info';
import * as S from './index.styles';

interface IProps {
  tableTitle: string;
  colorTheme: string;
  scheduleList: ISchedule[];
  loading: boolean;
  selectedRows: (string | number)[];
  setSelectedRows: Dispatch<SetStateAction<(string | number)[]>>;
  purpose: string;
}

interface IRecord extends ISchedule {
  vehicle_n_collection_area_title: {
    vehicle_number: string;
    collection_area: string;
  };
  driver_title: string;
  crew_1_title: string;
  crew_2_title: string;
  isTitle: true;
}

export const TableItem: React.FC<IProps> = (props) => {
  const { tableTitle, colorTheme, scheduleList, loading, selectedRows, setSelectedRows, purpose } =
    props;
  const { selectedUpdatingSchedule, setSelectedUpdatingSchedule, isDisabledScheduleEdit } =
    useScheduleContext();
  const permission = usePermissions();
  // const { notification } = useFeedback();

  const tableSummary = useMemo(() => {
    return {
      total_driver_n_crew: scheduleList?.length * 3,
      total_driver: scheduleList?.length,
      crew_1: scheduleList?.length,
      crew_2: scheduleList?.length,
    };
  }, [scheduleList]);

  const _renderVehicleCell = (r: IRecord) => {
    const dispatchingVehicle = r?.wsBackupVehicle ?? r?.vehicle;
    const isActive = r?.wsBackupVehicle
      ? dispatchingVehicle?.id === selectedUpdatingSchedule?.backupVehicleId
      : dispatchingVehicle?.id === selectedUpdatingSchedule?.currentVehicleId;

    if (r?.isTitle) {
      return (
        <>
          <S.FakeTitle>{r?.vehicle_n_collection_area_title?.vehicle_number}</S.FakeTitle>
          <S.FakeTitle>{r?.vehicle_n_collection_area_title?.collection_area}</S.FakeTitle>
        </>
      );
    }
    return (
      <S.WrapCellValue>
        <S.CellValueFirstRowTitle
          onClick={() => {
            permission?.updateAble &&
              !isDisabledScheduleEdit &&
              setSelectedUpdatingSchedule((prev) => {
                if (prev?.currentVehicleId === r?.vehicle?.id) {
                  return DEFAULT_SELECTED_UPDATING_SCHEDULE;
                }
                return {
                  ...(prev.targetVehicleId ? { targetVehicleId: prev.targetVehicleId } : {}),
                  id: r?.id,
                  ...(r?.wsBackupVehicle ? { backupVehicleId: dispatchingVehicle?.id } : {}),
                  ...(!r?.wsBackupVehicle ? { currentVehicleId: dispatchingVehicle?.id } : {}),
                  purpose: purpose,
                };
              });
          }}
          $isActive={isActive}
          $selectable={permission?.updateAble && !isDisabledScheduleEdit}
        >
          {dispatchingVehicle.purpose && (
            <TruckIcon vehicle_type={dispatchingVehicle.purpose as VEHICLE_TYPE} />
          )}
          {dispatchingVehicle.vehicle_number}
        </S.CellValueFirstRowTitle>
        <S.CellValueSecondRowTitle>
          <S.WrapRouteName>{r?.route?.name}</S.WrapRouteName>
        </S.CellValueSecondRowTitle>
      </S.WrapCellValue>
    );
  };

  const _renderCell = (
    v: IWorker,
    fieldName: string,
    r: IRecord,
    columnTitle: string,
    backup: IWorker | null
  ) => {
    const dispatchingStaff = backup ? backup : v;
    const absenceStaff = backup ? v : backup;

    try {
      if (r?.isTitle) {
        return (
          <>
            <S.FakeTitle>{columnTitle}</S.FakeTitle>
            <S.FakeTitle>[대체]</S.FakeTitle>
          </>
        );
      }

      const isActive =
        fieldName === 'wsDriver'
          ? dispatchingStaff?.id === selectedUpdatingSchedule.currentDriverId ||
            dispatchingStaff?.id === selectedUpdatingSchedule.backupDriverId
          : fieldName === 'wsFieldAgent1'
          ? dispatchingStaff?.id === selectedUpdatingSchedule.currentStaff1Id ||
            dispatchingStaff?.id === selectedUpdatingSchedule.backupStaff1Id
          : fieldName === 'wsFieldAgent2'
          ? dispatchingStaff?.id === selectedUpdatingSchedule.currentStaff2Id ||
            dispatchingStaff?.id === selectedUpdatingSchedule.backupStaff2Id
          : false;

      return (
        <S.WrapCellValue>
          <S.CellValueFirstRow
            $selectable={permission?.updateAble && !isDisabledScheduleEdit}
            $isActive={isActive}
            onClick={() => {
              permission?.updateAble &&
                !isDisabledScheduleEdit &&
                setSelectedUpdatingSchedule((prev) => {
                  // if (
                  //   (prev.targetDriver &&
                  //     (fieldName == 'wsFieldAgent1' || fieldName === 'wsFieldAgent2')) ||
                  //   (prev?.targetCrew && fieldName === 'wsDriver')
                  // ) {
                  //   notification.error({
                  //     message: `교체 작업이 완료되지 않았습니다. 운전원은 '지원' 인력만 대체 가능합니다.`,
                  //   });
                  // }
                  if (isActive) {
                    return DEFAULT_SELECTED_UPDATING_SCHEDULE;
                  }
                  return {
                    id: r?.id,
                    // agent 1 - 2
                    ...(fieldName === 'wsFieldAgent1' && !absenceStaff
                      ? { currentStaff1Id: dispatchingStaff?.id }
                      : {}),
                    ...(fieldName === 'wsFieldAgent2' && !absenceStaff
                      ? { currentStaff2Id: dispatchingStaff?.id }
                      : {}),
                    ...(fieldName === 'wsFieldAgent1' && absenceStaff
                      ? { backupStaff1Id: dispatchingStaff?.id }
                      : {}),
                    ...(fieldName === 'wsFieldAgent2' && absenceStaff
                      ? { backupStaff2Id: dispatchingStaff?.id }
                      : {}),
                    // driver
                    ...(fieldName === 'wsDriver' && !absenceStaff
                      ? { currentDriverId: dispatchingStaff.id }
                      : {}),
                    ...(fieldName === 'wsDriver' && absenceStaff
                      ? { backupDriverId: dispatchingStaff.id }
                      : {}),
                    targetCrew: prev?.targetCrew,
                    purpose: purpose,
                  };
                });
            }}
          >
            <S.CrewInfo>
              {dispatchingStaff?.replacer_staff?.aid && (
                <AbsenceInfo
                  staffData={{
                    name: dispatchingStaff?.name,
                    absence_type: dispatchingStaff?.replacer_staff?.absence_type,
                    aid: dispatchingStaff?.replacer_staff?.aid,
                  }}
                  iconSize="md"
                  type="available"
                />
              )}
              {dispatchingStaff?.job_contract && (
                <CrewIcon crew_type={dispatchingStaff?.job_contract as CREW_TYPE} />
              )}
              <S.CrewName>{dispatchingStaff?.name}</S.CrewName>
            </S.CrewInfo>
          </S.CellValueFirstRow>
          <S.CellValueSecondRow>
            {absenceStaff && (
              <S.CrewInfo>
                <div onClick={(e) => e.stopPropagation()}>
                  <AbsenceInfo
                    staffData={{
                      name: absenceStaff?.name,
                      absence_type: absenceStaff?.absence_staff?.absence_type,
                      aid: absenceStaff?.absence_staff?.aid,
                    }}
                    iconSize="md"
                    type="absence"
                  />
                </div>
                {absenceStaff.job_contract && (
                  <CrewIcon crew_type={absenceStaff?.job_contract as CREW_TYPE} />
                )}
                <S.CrewName>{absenceStaff?.name}</S.CrewName>
              </S.CrewInfo>
            )}
          </S.CellValueSecondRow>
        </S.WrapCellValue>
      );
    } catch {
      return (
        <S.WrapCellValue>
          <S.CellValueFirstRow $selectable={false} $isActive={false} />
          <S.CellValueSecondRow></S.CellValueSecondRow>
        </S.WrapCellValue>
      );
    }
  };

  const _renderCheckBox = (r: IRecord) => {
    if (scheduleList?.length) {
      if (r?.isTitle) {
        return (
          <BaseCheckbox
            checked={selectedRows?.length === scheduleList?.length && scheduleList?.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(scheduleList?.map((el) => el?.id));
              } else {
                setSelectedRows([]);
              }
            }}
          />
        );
      }
      const checked = selectedRows.includes(r.id);
      return (
        <S.WrapCellValue>
          <S.CellValueFirstRow $selectable={false} $isActive={false}>
            <BaseCheckbox
              checked={checked}
              onChange={() => {
                if (selectedRows.includes(r?.id)) {
                  setSelectedRows((prev) => prev.filter((el) => el !== r?.id));
                } else {
                  setSelectedRows((prev) => [...prev, r?.id]);
                }
              }}
            />
          </S.CellValueFirstRow>
          <S.CellValueSecondRow></S.CellValueSecondRow>
        </S.WrapCellValue>
      );
    }
    return <></>;
  };

  const columns: ColumnType<any>[] = [
    {
      title: () => <span style={{ color: colorTheme }}>{tableTitle}</span>,
      key: 'checkbox',
      render: (v) => _renderCheckBox(v),
      align: 'center',
      width: '10%',
    },
    {
      title: () => <span>총 {tableSummary.total_driver_n_crew} 명</span>,
      key: 'vehicle_n_collection_area',
      render: (v, r: IRecord) => _renderVehicleCell(r),
      align: 'center',
      width: '22.5%',
    },
    {
      title: () => <span>{tableSummary.total_driver} 명</span>,
      key: 'wsDriver',
      render: (v: IWorker, r: IRecord) =>
        _renderCell(v, 'wsDriver', r, '운전원', r?.wsBackupDriver),
      dataIndex: 'wsDriver',
      align: 'center',
      width: '22.5%',
    },
    {
      title: () => <span>{tableSummary.crew_1} 명</span>,
      key: 'wsFieldAgent1',
      dataIndex: 'wsFieldAgent1',
      render: (v: IWorker, r: IRecord) =>
        _renderCell(v, 'wsFieldAgent1', r, '탑승원1', r?.wsBackupFieldAgent1),
      align: 'center',
      width: '22.5%',
    },
    {
      title: () => <span>{tableSummary.crew_2} 명</span>,
      key: 'wsFieldAgent2',
      dataIndex: 'wsFieldAgent2',
      render: (v: IWorker, r: IRecord) =>
        _renderCell(v, 'wsFieldAgent2', r, '탑승원2', r?.wsBackupFieldAgent2),
      align: 'center',
      width: '22.5%',
    },
  ];

  const dataSource = useMemo(() => {
    return [
      {
        vehicle_n_collection_area_title: {
          vehicle_number: '차량번호',
          collection_area: '수거지역',
        },
        driver_title: '운전원',
        crew_1_title: '탑승원1',
        crew_2_title: '탑승원2',
        isTitle: true,
      },
      ...scheduleList,
    ];
  }, [scheduleList]);

  return (
    <S.WrapSectionTable>
      <S.Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
        loading={loading}
      />
    </S.WrapSectionTable>
  );
};
