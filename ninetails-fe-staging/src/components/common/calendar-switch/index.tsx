import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';

import { BaseButton } from '../base-button';
import * as S from './index.styles';

export interface CalendarSwitchProps {
  dateFormatted: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onToday: () => void;
}

export const CalendarSwitch: React.FC<CalendarSwitchProps> = ({
  dateFormatted,
  onIncrease,
  onDecrease,
  onToday,
}) => {
  return (
    <S.CalendarSwitch>
      <S.Text>{dateFormatted}</S.Text>
      <S.ButtonGroup>
        <BaseButton type="text" onClick={onDecrease} size="small">
          <LeftOutlined />
        </BaseButton>
        <BaseButton type="text" onClick={onToday} size="small">
          today
        </BaseButton>
        <BaseButton type="text" onClick={onIncrease} size="small">
          <RightOutlined />
        </BaseButton>
      </S.ButtonGroup>
    </S.CalendarSwitch>
  );
};
