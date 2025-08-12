import { BaseSkeleton } from '@/components/common/base-skeleton';
import { BaseTooltip } from '@/components/common/base-tooltip';
import {
  CrewIcon,
  StatusIcon,
  TruckIcon,
  carInfo,
  crewInfo,
} from '@/components/schedule/left-content/statistic/icon';
import { DATE_FORMAT } from '@/constants';
import {
  ABSENCE_TYPE,
  LEAVE_HAFT_DAY,
  LEAVE_LONG_TERM,
  LEAVE_LONG_TERM_STAFF,
} from '@/constants/settings';
import { useGetAbsenceDetailStaff, useGetAbsenceDetailVehicle } from '@/hooks/features/useSchedule';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import {
  CREW_TYPE,
  IStatisticStaff,
  IStatisticVehicle,
  STATUS,
  VEHICLE_TYPE,
} from '@/interfaces/schedule';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useMemo, useRef, useState } from 'react';

import * as S from './index.styles';

type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

interface IProps {
  staffData?: IStatisticStaff;
  vehicleData?: IStatisticVehicle;
  iconSize: 'sm' | 'md';
  type: 'available' | 'absence';
}

const AbsenceStaffDetail: React.FC<{ data: IStatisticStaff }> = (props) => {
  const { data } = props;
  const { data: absenceData, isPending } = useGetAbsenceDetailStaff(data?.aid);

  const absenceDetail = absenceData?.data;

  const jobContract = useMemo(() => {
    return crewInfo.find((el) => el.type === absenceDetail?.absence_staff?.job_contract);
  }, [absenceDetail]);

  return (
    <S.WrapPopupContent>
      {isPending ? (
        <>
          <BaseSkeleton />
        </>
      ) : (
        <>
          <S.WrapPopupHeader>
            <CrewIcon crew_type={absenceDetail?.absence_staff?.job_contract as CREW_TYPE} />
            <BaseTooltip title={absenceDetail?.absence_staff?.name}>
              <S.WrapAbsenceName>{absenceDetail?.absence_staff?.name}</S.WrapAbsenceName>
            </BaseTooltip>
            <S.WrapJobContract $color={jobContract?.color}>
              [{jobContract?.subLabel}]
            </S.WrapJobContract>
          </S.WrapPopupHeader>

          <ul>
            <li>
              시작:{' '}
              {absenceDetail?.start_date &&
                dayjs(absenceDetail?.start_date).format(DATE_FORMAT?.R_BASIC)}
            </li>
            <li>
              복귀:{' '}
              {absenceDetail?.end_date &&
                dayjs(absenceDetail?.end_date).add(1, 'day').format(DATE_FORMAT?.R_BASIC)}
            </li>
            <li>기간: {absenceDetail?.period}</li>
            <li>사유: {absenceDetail?.absence_type}</li>
            <li>
              <S.Replacer>
                <div>대체: </div>&nbsp;
                <CrewIcon crew_type={absenceDetail?.replacer_staff?.job_contract as CREW_TYPE} />
                <BaseTooltip title={absenceDetail?.replacer_staff?.name}>
                  <S.WrapAbsenceName>{absenceDetail?.replacer_staff?.name}</S.WrapAbsenceName>
                </BaseTooltip>
                {_.includes(
                  LEAVE_LONG_TERM,
                  ABSENCE_TYPE?.[absenceDetail?.absence_type as AbsenceTypeKeys]
                ) ? (
                  <StatusIcon status={STATUS.REPLACE_LONG_TERM} />
                ) : (
                  <StatusIcon status={STATUS.REPLACE_SHORT_TERM} />
                )}
              </S.Replacer>
            </li>
          </ul>
        </>
      )}
    </S.WrapPopupContent>
  );
};

const handleGetPeriod = (type: string, startDate: string, endDate: string) => {
  const isHaftDay = _.includes(LEAVE_HAFT_DAY, ABSENCE_TYPE[type as keyof typeof ABSENCE_TYPE]);
  if (isHaftDay) return '0.5일 [4H]';
  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
  return `${totalDays}일 [${totalDays * 8}H]`;
};

const AbsenceVeicleDetail: React.FC<{ data?: IStatisticVehicle }> = (props) => {
  const { data } = props;
  const { data: absenceData, isPending } = useGetAbsenceDetailVehicle(data?.aid);

  const absenceDetail = absenceData?.data;

  const purpose = useMemo(() => {
    return carInfo.find((el) => el.type === absenceDetail?.absence_vehicle?.purpose);
  }, [absenceDetail]);

  return (
    <S.WrapPopupContent>
      {isPending ? (
        <>
          <BaseSkeleton />
        </>
      ) : (
        <>
          <S.WrapPopupHeader>
            <TruckIcon vehicle_type={absenceDetail?.absence_vehicle?.purpose as VEHICLE_TYPE} />
            <S.WrapAbsenceName>{absenceDetail?.absence_vehicle?.vehicle_number}</S.WrapAbsenceName>
            <S.WrapJobContract $color={purpose?.color}>[{purpose?.subLabel}]</S.WrapJobContract>
          </S.WrapPopupHeader>

          <ul>
            <li>
              시작:{' '}
              {absenceDetail?.start_date &&
                dayjs(absenceDetail?.start_date).format(DATE_FORMAT?.R_BASIC)}
            </li>
            <li>
              복귀:{' '}
              {absenceDetail?.end_date &&
                dayjs(absenceDetail?.end_date).add(1, 'day').format(DATE_FORMAT?.R_BASIC)}
            </li>
            <li>
              기간:{' '}
              {absenceDetail?.absence_type
                ? handleGetPeriod(
                    absenceDetail?.absence_type,
                    absenceDetail?.start_date,
                    absenceDetail?.end_date
                  )
                : ''}
            </li>
            <li>
              사유:{' '}
              {ABSENCE_TYPE?.[absenceDetail?.absence_type as AbsenceTypeKeys] ||
                absenceDetail?.absence_type}
            </li>
            <li>
              <S.Replacer>
                <div>대체: </div>&nbsp;
                <TruckIcon
                  vehicle_type={absenceDetail?.replacement_vehicle?.purpose as VEHICLE_TYPE}
                />
                <S.WrapAbsenceName>
                  {absenceDetail?.replacement_vehicle?.vehicle_number}
                </S.WrapAbsenceName>
                {_.includes(
                  LEAVE_LONG_TERM,
                  ABSENCE_TYPE?.[absenceDetail?.absence_type as AbsenceTypeKeys]
                ) ? (
                  <StatusIcon status={STATUS.REPLACE_LONG_TERM} />
                ) : (
                  <StatusIcon status={STATUS.REPLACE_SHORT_TERM} />
                )}
              </S.Replacer>
            </li>
          </ul>
        </>
      )}
    </S.WrapPopupContent>
  );
};

export const AbsenceInfo: React.FC<IProps> = ({
  staffData,
  type,
  iconSize = 'md',
  vehicleData,
}) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => {
    setIsOpenDropdown(false);
  });

  const renderIcon = (absence_type: AbsenceTypeKeys) => {
    if (vehicleData) {
      return (
        <S.WrapStatusIcon onClick={() => type === 'absence' && setIsOpenDropdown(true)} ref={ref}>
          {type === 'available' ? (
            <>
              {_.includes(LEAVE_LONG_TERM, ABSENCE_TYPE?.[absence_type as AbsenceTypeKeys]) ? (
                <StatusIcon status={STATUS.REPLACE_LONG_TERM} size={iconSize} />
              ) : (
                <StatusIcon status={STATUS.REPLACE_SHORT_TERM} size={iconSize} />
              )}
            </>
          ) : (
            <>
              {_.includes(LEAVE_LONG_TERM, ABSENCE_TYPE?.[absence_type as AbsenceTypeKeys]) ? (
                <StatusIcon status={STATUS.ABSENCE_LONG_TERM} size={iconSize} />
              ) : (
                <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} size={iconSize} />
              )}
            </>
          )}
        </S.WrapStatusIcon>
      );
    }

    return (
      <S.WrapStatusIcon onClick={() => type === 'absence' && setIsOpenDropdown(true)} ref={ref}>
        {type === 'available' ? (
          <>
            {_.includes(LEAVE_LONG_TERM_STAFF, absence_type) ? (
              <StatusIcon status={STATUS.REPLACE_LONG_TERM} size={iconSize} />
            ) : (
              <StatusIcon status={STATUS.REPLACE_SHORT_TERM} size={iconSize} />
            )}
          </>
        ) : (
          <>
            {_.includes(LEAVE_LONG_TERM_STAFF, absence_type) ? (
              <StatusIcon status={STATUS.ABSENCE_LONG_TERM} size={iconSize} />
            ) : (
              <StatusIcon status={STATUS.ABSENCE_SHORT_TERM} size={iconSize} />
            )}
          </>
        )}
      </S.WrapStatusIcon>
    );
  };

  if (staffData || vehicleData) {
    return (
      <S.WrapDropdown>
        <S.Dropdown
          open={isOpenDropdown}
          content={() =>
            staffData ? (
              <AbsenceStaffDetail data={staffData} />
            ) : (
              <AbsenceVeicleDetail data={vehicleData} />
            )
          }
          placement="top"
          destroyTooltipOnHide
        >
          <>
            {renderIcon(
              (staffData ? staffData?.absence_type : vehicleData?.absence_type) as AbsenceTypeKeys
            )}
          </>
        </S.Dropdown>
      </S.WrapDropdown>
    );
  }
};
