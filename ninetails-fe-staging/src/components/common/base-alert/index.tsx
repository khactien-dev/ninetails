import type { AlertProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseAlertProps = AlertProps;

export const BaseAlert: React.FC<BaseAlertProps> = (props) => {
  return <S.Alert {...props} />;
};
