import { Input, InputProps, InputRef } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseInputRef = InputRef;

export type BaseInputProps = InputProps;

interface IBaseInput
  extends React.ForwardRefExoticComponent<InputProps & React.RefAttributes<InputRef>> {
  Group: typeof Input.Group;
  Search: typeof Input.Search;
  TextArea: typeof Input.TextArea;
  Password: typeof Input.Password;
}

// eslint-disable-next-line react/display-name
const InternalInput = React.forwardRef<BaseInputRef, BaseInputProps>(
  ({ className, children, ...props }, ref) => (
    <S.Input ref={ref} className={className} {...props}>
      {children}
    </S.Input>
  )
);

export const BaseInput = InternalInput as IBaseInput;

BaseInput.Group = Input.Group;
BaseInput.Search = Input.Search;
BaseInput.TextArea = Input.TextArea;
BaseInput.Password = Input.Password;
