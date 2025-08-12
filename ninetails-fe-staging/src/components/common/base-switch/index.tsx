import { SwitchProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseSwitchProps = SwitchProps;

export const BaseSwitch: React.FC<SwitchProps> = (props) => {
  return <S.Switch {...props} />;
};
