import { mapBadgeStatus } from '@/utils';
import { Badge, BadgeProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export type BaseBadgeProps = BadgeProps;

interface IBaseBadge extends React.FC<BaseBadgeProps> {
  Ribbon: typeof Badge.Ribbon;
}

export const BaseBadge: IBaseBadge = ({ status, children, count, ...props }) => {
  const countSeverityStatus = count ? { count, $severity: mapBadgeStatus(status) } : { status };
  const transformedProps = status ? countSeverityStatus : { count };
  return (
    <S.Badge {...transformedProps} {...props}>
      {children}
    </S.Badge>
  );
};

BaseBadge.Ribbon = Badge.Ribbon;
