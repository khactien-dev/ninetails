import { TableProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

type AnyRecord = Record<PropertyKey, any>;

export type BaseTableProps<T extends AnyRecord> = TableProps<T>;

// TODO make generic!
export const BaseTable = <T extends AnyRecord>(props: BaseTableProps<T>): React.JSX.Element => {
  return <S.Table {...props} />;
};
