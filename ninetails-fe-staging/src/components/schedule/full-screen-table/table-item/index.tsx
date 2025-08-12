import { CrewIcon, StatusIcon, TruckIcon } from '@/components/schedule/left-content/statistic/icon';
import { IWorker } from '@/interfaces';
import { CREW_TYPE, ISchedule, STATUS, VEHICLE_TYPE } from '@/interfaces/schedule';
import React, { useEffect, useMemo, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  tableTitle: string;
  colorTheme: string;
  scheduleList: ISchedule[];
  loading: boolean;
  limit: number;
}

interface IRecord extends ISchedule {
  vehicle_n_collection_area_title: {
    vehicle_number: string;
    collection_area: string;
  };
  driver_title: string;
  crew_1_title: string;
  crew_2_title: string;
  isTitle: boolean;
}

const TIME_LIMIT = 10000;

export const TableItem: React.FC<IProps> = (props) => {
  const { tableTitle, colorTheme, scheduleList, loading, limit } = props;
  const [page, setPage] = useState<number>(0);
  const totalPage = Math.ceil(scheduleList?.length / limit);

  const _renderVehicleCell = (r: IRecord) => {
    const dispatchingVehicle = r?.wsBackupVehicle ? r?.wsBackupVehicle : r?.vehicle;
    if (r?.isTitle) {
      return (
        <>
          <S.FakeTitle>{r?.vehicle_n_collection_area_title?.vehicle_number}</S.FakeTitle>
        </>
      );
    }
    return (
      <S.WrapCellValue>
        <S.CellValueFirstRowTitle $isActive={false}>
          {dispatchingVehicle?.purpose && (
            <TruckIcon vehicle_type={dispatchingVehicle?.purpose as VEHICLE_TYPE} />
          )}
          {dispatchingVehicle?.vehicle_number}
        </S.CellValueFirstRowTitle>
      </S.WrapCellValue>
    );
  };

  const _renderCell = (v: IWorker, r: IRecord, columnTitle: string, backup: IWorker | null) => {
    const dispatchingCrew = backup ? backup : v;

    try {
      if (r?.isTitle) {
        return (
          <>
            <S.FakeTitle>{columnTitle}</S.FakeTitle>
          </>
        );
      }

      return (
        <S.WrapCellValue>
          <S.CellValueFirstRow $selectable={true} $isActive={false}>
            <S.CrewInfo>
              {dispatchingCrew?.status && <StatusIcon status={dispatchingCrew?.status as STATUS} />}
              {dispatchingCrew?.job_contract && (
                <CrewIcon crew_type={dispatchingCrew?.job_contract as CREW_TYPE} />
              )}
              <S.CrewName>{dispatchingCrew?.name}</S.CrewName>
            </S.CrewInfo>
          </S.CellValueFirstRow>

          {/* <S.CellValueSecondRow>
            <S.CrewInfo>
              {v?.status && <StatusIcon status={v?.status as STATUS} />}
              {v?.job_contract && <CrewIcon crew_type={v?.job_contract as CREW_TYPE} />}
              <S.CrewName>{v?.name}</S.CrewName>
            </S.CrewInfo>
          </S.CellValueSecondRow> */}
        </S.WrapCellValue>
      );
    } catch {
      return (
        <S.WrapCellValue>
          <S.CellValueFirstRow $selectable={false} $isActive={false}></S.CellValueFirstRow>
          <S.CellValueSecondRow></S.CellValueSecondRow>
        </S.WrapCellValue>
      );
    }
  };

  const columns = [
    {
      title: () => (
        <S.WrapTableTitle>
          <S.TableTitle style={{ color: colorTheme }}>{tableTitle}</S.TableTitle>
          <div>총 근무 일정: {scheduleList?.length} 개</div>
          <div>
            {!!totalPage && (
              <>
                page {page + 1} / {totalPage}
              </>
            )}
          </div>
        </S.WrapTableTitle>
      ),
      key: 'table_key',
      children: [
        {
          title: '차량번호',
          key: 'vehicle_n_collection_area',
          render: (v: any) => _renderVehicleCell(v),
          align: 'center',
          width: '22.5%',
        },
        {
          title: '운전원',
          key: 'wsDriver',
          render: (v: IWorker, r: IRecord) => _renderCell(v, r, '운전원', r?.wsBackupDriver),
          dataIndex: 'wsDriver',
          align: 'center',
          width: '22.5%',
        },
        {
          title: '탑승원1',
          key: 'wsFieldAgent1',
          dataIndex: 'wsFieldAgent1',
          render: (v: IWorker, r: IRecord) => _renderCell(v, r, '탑승원1', r?.wsBackupFieldAgent1),
          align: 'center',
          width: '22.5%',
        },
        {
          title: '탑승원2',
          key: 'wsFieldAgent2',
          dataIndex: 'wsFieldAgent2',
          render: (v: IWorker, r: IRecord) => _renderCell(v, r, '탑승원2', r?.wsBackupFieldAgent2),
          align: 'center',
          width: '22.5%',
        },
      ],
    },
  ];

  const pagination = useMemo(() => {
    let schedulePagi: {
      data: ISchedule[];
    }[] = [];

    for (let i = 0; i < totalPage; i++) {
      for (let j = 0; j < limit; j++) {
        if (scheduleList[limit * i + j]) {
          const currentPagi = schedulePagi[i];
          schedulePagi[i] = {
            data: [...(currentPagi?.data ?? []), scheduleList[limit * i + j]],
          };
        }
      }
    }
    return schedulePagi;
  }, [scheduleList, limit]);

  const pageData: ISchedule[] = useMemo(() => {
    if (pagination[page]?.data) {
      return pagination[page]?.data;
    }
    return [];
  }, [page, pagination]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPage((prev) => {
        const totalPage = Math.ceil(scheduleList?.length / limit);
        if (prev + 1 < totalPage) {
          return prev + 1;
        }
        return 0;
      });
    }, TIME_LIMIT);
    return () => clearInterval(intervalId);
  }, [scheduleList, limit]);

  return (
    <S.WrapSectionTable>
      <S.Table
        columns={columns}
        dataSource={pageData}
        pagination={false}
        bordered
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </S.WrapSectionTable>
  );
};
