import CarIcon from '@/components/control-status/car-info/car-icon';
import { CREW_TYPE, STATUS, VEHICLE_TYPE } from '@/interfaces/schedule';
import React from 'react';

import { WrapCrewIcon, WrapEntityIcon } from '../../index.styles';
import { StatusIconStyled } from '../index.styles';

export const carInfo = [
  {
    id: 0,
    label: '생활(정규) 차량',
    subLabel: '생활[정]',
    color: '#0E8001',
    type: VEHICLE_TYPE.COMPOSITE_REGULAR,
  },
  {
    id: 1,
    label: '음식(정규) 차량',
    subLabel: '음식[정]',
    color: '#0072C6',
    type: VEHICLE_TYPE.FOOD_REGULAR,
  },
  {
    id: 2,
    label: '재활(정규) 차량',
    subLabel: '재활[정]',
    color: '#ED9201',
    type: VEHICLE_TYPE.REUSABLE_REGULAR,
  },
  {
    id: 3,
    label: '기동(정규) 차량',
    subLabel: '기동[정]',
    color: '#8A29AF',
    type: VEHICLE_TYPE.TATICAL_MOBILITY_REGULAR,
  },
  {
    id: 4,
    label: '생활(지원) 차량',
    subLabel: '생활[지]',
    color: '#83C257',
    type: VEHICLE_TYPE.COMPOSITE_SUPPORT,
  },
  {
    id: 5,
    label: '음식(지원) 차량',
    subLabel: '음식[지]',
    color: '#5FC5ED',
    type: VEHICLE_TYPE.FOOD_SUPPORT,
  },
  {
    id: 6,
    label: '재활(지원) 차량',
    subLabel: '재활[지]',
    color: '#EFE837',
    type: VEHICLE_TYPE.REUSABLE_SUPPORT,
  },
  {
    id: 7,
    label: '기동(지원) 차량',
    subLabel: '기동[지]',
    color: '#DB00FF',
    type: VEHICLE_TYPE.TATICAL_MOBILITY_SUPPORT,
  },
];

export const crewInfo = [
  {
    id: 0,
    label: '운전(정규) 요원',
    subLabel: '운전(정규)',
    color: '#043961',
    type: CREW_TYPE.DRIVING_CREW_REGULAR,
  },

  {
    id: 2,
    label: '지원(정규) 요원',
    subLabel: '지원(정규)',
    color: '#0072C6',
    type: CREW_TYPE.SUPPORT_CREW_REGULAR,
  },
  {
    id: 5,
    label: '지원(계약) 요원',
    subLabel: '탑승(계약)',
    color: '#5FC5ED',
    type: CREW_TYPE.SUPPORT_CREW_FIXED_TERM,
  },

  {
    id: 1,
    label: '탑승(정규) 요원',
    subLabel: '탑승(정규)',
    color: '#0E8001',
    type: CREW_TYPE.COLLECT_CREW_REGULAR,
  },
  {
    id: 3,
    label: '탑승(단기) 요원',
    subLabel: '탑승(단기)',
    color: '#83C257',
    type: CREW_TYPE.COLLECT_CREW_MONTHLY,
  },
  {
    id: 4,
    label: '탑승(계약) 요원',
    subLabel: '탑승(계약)',
    color: '#EFE837',
    type: CREW_TYPE.COLLECT_CREW_FIXED_TERM,
  },
];

export const statusInfo = [
  {
    id: 0,
    label: '장기 열외',
    type: STATUS.ABSENCE_LONG_TERM,
  },
  {
    id: 1,
    label: '단기 열외',
    type: STATUS.ABSENCE_SHORT_TERM,
  },
  {
    id: 2,
    label: '장기 대체',
    type: STATUS.REPLACE_LONG_TERM,
  },
  {
    id: 3,
    label: '단기 대체',
    type: STATUS.REPLACE_SHORT_TERM,
  },
];

export const StatusIcon = (props: { status: STATUS | string; size?: 'sm' | 'md' }) => {
  const { status, size = 'md' } = props;

  if (status === STATUS.ABSENCE_LONG_TERM) {
    return (
      <WrapEntityIcon>
        <StatusIconStyled $size={size} $bg="#404040">
          장
        </StatusIconStyled>
      </WrapEntityIcon>
    );
  }

  if (status === STATUS.ABSENCE_SHORT_TERM) {
    return (
      <WrapEntityIcon>
        <StatusIconStyled $size={size} $bg="#7F7F7F">
          단
        </StatusIconStyled>
      </WrapEntityIcon>
    );
  }

  if (status === STATUS.REPLACE_LONG_TERM) {
    return (
      <WrapEntityIcon>
        <StatusIconStyled $size={size} $bg="#FF2E92">
          장
        </StatusIconStyled>
      </WrapEntityIcon>
    );
  }

  if (status === STATUS.REPLACE_SHORT_TERM) {
    return (
      <WrapEntityIcon>
        <StatusIconStyled $size={size} $bg="#FCACEE">
          단
        </StatusIconStyled>
      </WrapEntityIcon>
    );
  }

  return '';
};

export const TruckIcon = (props: { vehicle_type: VEHICLE_TYPE }) => {
  const { vehicle_type } = props;
  const findCar = carInfo.find((item) => item.type === vehicle_type);

  return <CarIcon color={findCar?.color} />;
};

export const CrewIcon = (props: { crew_type: CREW_TYPE }) => {
  const { crew_type } = props;

  const findCrew = crewInfo.find((item) => item.type === crew_type);

  return (
    <WrapCrewIcon>
      <svg
        width="18"
        height="20"
        viewBox="0 0 18 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 10C11.7614 10 14 7.76142 14 5C14 2.23858 11.7614 0 9 0C6.23858 0 4 2.23858 4 5C4 7.76142 6.23858 10 9 10Z"
          fill={findCrew?.color}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 14C3.79086 14 2 15.7909 2 18V19C2 19.5523 1.55228 20 1 20C0.44772 20 0 19.5523 0 19V18C0 14.6863 2.68629 12 6 12H12C15.3137 12 18 14.6863 18 18V19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19V18C16 15.7909 14.2091 14 12 14H6Z"
          fill={findCrew?.color}
        />
      </svg>
    </WrapCrewIcon>
  );
};
