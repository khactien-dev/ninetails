import type { BreadcrumbProps } from 'antd';
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { FC } from 'react';

import * as S from './index.styles';

export type BaseBreadcrumbItemType = BreadcrumbItemType;

export type BaseBreadcrumbProps = BreadcrumbProps;

export const BaseBreadcrumb: FC<BaseBreadcrumbProps> = (props) => {
  return <S.Breadcrumb {...props} />;
};
