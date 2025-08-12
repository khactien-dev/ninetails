import type { RowProps } from 'antd';
import { forwardRef } from 'react';

import * as S from './index.styles';

export type BaseRowProps = RowProps;

// eslint-disable-next-line react/display-name
export const BaseRow = forwardRef<HTMLDivElement, BaseRowProps>((props, ref) => (
  <S.Row ref={ref} {...props} />
));
