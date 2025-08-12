import { StepsProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseStepsProps = StepsProps;

export const BaseSteps: React.FC<BaseStepsProps> = ({ children, ...otherProps }) => {
  return <S.Steps {...otherProps}>{children}</S.Steps>;
};
