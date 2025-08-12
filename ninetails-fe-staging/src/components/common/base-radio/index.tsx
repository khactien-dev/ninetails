import { Radio, RadioProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseRadioProps = RadioProps;

interface IBaseRadio extends React.FC<BaseRadioProps> {
  Group: typeof Radio.Group;
  Button: typeof Radio.Button;
}

export const BaseRadio: IBaseRadio = (props) => {
  return <S.Radio {...props} />;
};

BaseRadio.Group = Radio.Group;
BaseRadio.Button = S.RadioButton;
