import type { ColProps } from 'antd';
import { forwardRef } from 'react';

import * as S from './index.styles';

export type BaseColProps = ColProps;

// eslint-disable-next-line react/display-name
export const BaseCol = forwardRef<HTMLDivElement, BaseColProps>((props, ref) => (
  <S.Col ref={ref} {...props} />
));
