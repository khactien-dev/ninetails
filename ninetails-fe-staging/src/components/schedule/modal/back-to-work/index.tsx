import { BaseTooltip } from '@/components/common/base-tooltip';
import { useScheduleContext } from '@/components/schedule/context';
import { CrewIcon, TruckIcon } from '@/components/schedule/left-content/statistic/icon';
import { DATE_FORMAT } from '@/constants';
import {
  ABSENCE_TYPE,
  LEAVE_HAFT_DAY,
  LEAVE_LONG_TERM,
  LEAVE_LONG_TERM_STAFF,
} from '@/constants/settings';
import { useGetReturnToWorkStaff, useGetReturnToWorkVehicle } from '@/hooks/features/useSchedule';
import { IAbsenceData, IAbsenceStaffData } from '@/interfaces';
import { CREW_TYPE, VEHICLE_TYPE } from '@/interfaces/schedule';
import { renderJobContract, renderPurpose } from '@/utils';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  initialTab: 'staff' | 'vehicle';
  onCancel: () => void;
}

type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

export const BackToWorkModal: React.FC<IProps> = (props) => {
  const { initialTab, onCancel } = props;
  const { params } = useScheduleContext();
  const dayBeForeWorkingDate = useMemo(() => {
    return dayjs(params?.working_date).subtract(1, 'day').format(DATE_FORMAT?.R_BASIC);
  }, [params?.working_date]);

  const { data: returnToWorkStaffData, isLoading: staffLoading } = useGetReturnToWorkStaff({
    date: dayjs(params?.working_date).format(DATE_FORMAT?.R_BASIC),
  });

  const { data: returnToWorkVehicleData, isLoading: vehicleLoading } = useGetReturnToWorkVehicle({
    end_date: dayBeForeWorkingDate,
  });

  const [activeKey, setActiveKey] = useState<'staff' | 'vehicle'>(initialTab);

  const handleGetPeriod = (type: string, startDate: string, endDate: string) => {
    const isHaftDay = _.includes(LEAVE_HAFT_DAY, ABSENCE_TYPE[type as keyof typeof ABSENCE_TYPE]);
    if (isHaftDay) return '0.5일 [4H]';
    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    return `${totalDays}일 [${totalDays * 8}H]`;
  };

  const formatedReturnToWorkStaff = useMemo(() => {
    return returnToWorkStaffData?.data?.filter((el) => el.back_to_work === params?.working_date);
  }, [returnToWorkStaffData, params?.working_date]);

  const columnsVehicle: ColumnType<any>[] = [
    {
      title: () => <S.TableTitle>차번</S.TableTitle>,
      dataIndex: 'vehicle',
      render: (v, r: IAbsenceData) => (
        <S.WrapVehicle>
          {/* <StatusIcon status={v.status} /> */}
          <TruckIcon vehicle_type={r?.absence_vehicle?.purpose as VEHICLE_TYPE} />
          {r?.absence_vehicle?.vehicle_number}
        </S.WrapVehicle>
      ),
      width: '25%',
      align: 'center',
    },
    {
      title: () => (
        <S.TableTitle>
          용도
          <S.TableSubTitle>&nbsp;[유형]</S.TableSubTitle>
        </S.TableTitle>
      ),
      dataIndex: 'use',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceData) => <>{renderPurpose(r?.absence_vehicle?.purpose)}</>,
    },
    {
      title: () => <S.TableTitle>부재 기간</S.TableTitle>,
      dataIndex: 'absence_period',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceData) => (
        <> {r?.absence_type ? handleGetPeriod(r?.absence_type, r?.start_date, r?.end_date) : ''}</>
      ),
    },
    {
      title: () => <S.TableTitle>부재 항목</S.TableTitle>,
      dataIndex: 'absent_item',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceData) => (
        <S.WrapAbsenceItem>
          {_.includes(LEAVE_LONG_TERM, ABSENCE_TYPE?.[r?.absence_type as AbsenceTypeKeys]) && (
            <S.WrapTime>장기</S.WrapTime>
          )}
          {ABSENCE_TYPE?.[r?.absence_type as AbsenceTypeKeys] || r?.absence_type}
        </S.WrapAbsenceItem>
      ),
    },
  ];

  const columnsStaff: ColumnType<any>[] = [
    {
      title: () => <S.TableTitle>이름</S.TableTitle>,
      dataIndex: 'staff',
      render: (v, r: IAbsenceStaffData) => (
        <S.WrapVehicle>
          <CrewIcon crew_type={r?.absence_staff?.job_contract as CREW_TYPE} />
          <BaseTooltip title={r?.absence_staff?.name}>
            <S.WrapStaffName>{r?.absence_staff?.name}</S.WrapStaffName>
          </BaseTooltip>
        </S.WrapVehicle>
      ),
      width: '25%',
      align: 'center',
    },
    {
      title: () => (
        <S.TableTitle>
          직무
          <S.TableSubTitle>&nbsp;[계약]</S.TableSubTitle>
        </S.TableTitle>
      ),
      dataIndex: 'use',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceStaffData) => <>{renderJobContract(r?.absence_staff?.job_contract)}</>,
    },
    {
      title: () => <S.TableTitle>부재 기간</S.TableTitle>,
      dataIndex: 'absence_period',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceStaffData) => <>{r?.period}</>,
    },
    {
      title: () => <S.TableTitle>부재 항목</S.TableTitle>,
      dataIndex: 'absent_item',
      width: '25%',
      align: 'center',
      render: (v, r: IAbsenceStaffData) => (
        <S.WrapAbsenceItem>
          {_.includes(LEAVE_LONG_TERM_STAFF, r.absence_type) && <S.WrapTime>장기</S.WrapTime>}
          {r?.absence_type}
        </S.WrapAbsenceItem>
      ),
    },
  ];

  return (
    <S.WrapBackToWorkModalContent>
      <S.WrapGroupButton>
        <S.GroupButton
          options={[
            { label: '인력', value: 'staff' },
            { label: '차량', value: 'vehicle' },
          ]}
          optionType="button"
          buttonStyle="solid"
          value={activeKey}
          onChange={(e) => setActiveKey(e.target.value)}
        />
        <S.ModalTitle>부재 복귀</S.ModalTitle>
      </S.WrapGroupButton>

      {activeKey === 'staff' ? (
        <S.Table
          columns={columnsStaff}
          dataSource={formatedReturnToWorkStaff ?? []}
          pagination={false}
          loading={staffLoading}
        />
      ) : (
        <S.Table
          columns={columnsVehicle}
          dataSource={returnToWorkVehicleData?.data?.data ?? []}
          pagination={false}
          loading={vehicleLoading}
        />
      )}

      <S.WrapButton>
        <S.Button type="primary" onClick={() => onCancel()}>
          확인
        </S.Button>
      </S.WrapButton>
    </S.WrapBackToWorkModalContent>
  );
};
