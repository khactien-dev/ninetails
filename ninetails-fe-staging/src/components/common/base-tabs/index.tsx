import { TabsProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseTabsProps = TabsProps;

export const BaseTabs: React.FC<BaseTabsProps> = ({ children, ...props }) => {
  return <S.Tabs {...props}>{children}</S.Tabs>;
};
