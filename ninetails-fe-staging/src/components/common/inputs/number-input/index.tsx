import { InputNumberProps as AntdInputNumberProps } from 'antd';
import React, { ReactNode } from 'react';

import * as S from './index.styles';

export interface InputNumberProps extends AntdInputNumberProps {
  block?: boolean;
  children?: ReactNode;
}

// eslint-disable-next-line react/display-name
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ children, block, ...props }, ref) => (
    <S.InputNumber ref={ref} $block={block} {...props}>
      {children}
    </S.InputNumber>
  )
);
