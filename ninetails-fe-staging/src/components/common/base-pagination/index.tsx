import { ConfigProvider, PaginationProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BasePaginationProps = PaginationProps;

export const BasePagination: React.FC<BasePaginationProps> = (props) => (
  <ConfigProvider
    theme={{
      components: { Pagination: { wireframe: props.size !== 'small' } },
    }}
  >
    <S.Pagination {...props} />
  </ConfigProvider>
);
