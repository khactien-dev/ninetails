import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

import { BaseSpin } from '../../base-spin';
import { BaseInputProps, BaseInputRef } from '../base-input';
import * as S from './index.styles';

interface SearchInputProps extends BaseInputProps {
  loading?: boolean;
  filter?: React.ReactNode;
  onSearch?: (
    value: string,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void;
  enterButton?: React.ReactNode;
  inputPrefixCls?: string;
}

// eslint-disable-next-line react/display-name
export const SearchInput = React.forwardRef<BaseInputRef, SearchInputProps>(
  ({ loading, filter, ...props }, ref) => {
    return (
      <S.SearchInput
        ref={ref}
        prefix={<SearchOutlined />}
        {...(filter && {
          suffix: (
            <S.Space align="center">
              {loading && <BaseSpin size="small" />}
              {filter}
            </S.Space>
          ),
        })}
        {...props}
      />
    );
  }
);
