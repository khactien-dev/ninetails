import { CheckboxProps, CheckboxRef } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseCheckboxProps = CheckboxProps;

// eslint-disable-next-line react/display-name
const Checkbox = React.forwardRef<CheckboxRef, BaseCheckboxProps>((props, ref) => {
  return <S.Checkbox {...props} ref={ref} />;
});

type CheckboxForwardRef = typeof Checkbox;

interface IBaseCheckbox extends CheckboxForwardRef {
  Group: typeof S.CheckboxGroup;
}

export const BaseCheckbox = Checkbox as IBaseCheckbox;

BaseCheckbox.Group = S.CheckboxGroup;
