import { defaultPaddings } from '@/constants';
import { useResponsive } from '@/hooks/useResponsive';
import { CardProps } from 'antd';
import React from 'react';

import * as S from './index.styles';

export interface BaseCardProps extends CardProps {
  className?: string;
  padding?: string | number | [number, number];
  autoHeight?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  className,
  padding,
  size,
  autoHeight = true,
  children,
  ...props
}) => {
  const { isTablet, isDesktop } = useResponsive();

  return (
    <S.Card
      size={size ? size : isTablet ? 'default' : 'small'}
      className={className}
      bordered={false}
      $padding={
        padding || padding === 0
          ? padding
          : (isDesktop && defaultPaddings.desktop) ||
            (isTablet && defaultPaddings.tablet) ||
            defaultPaddings.mobile
      }
      $autoHeight={autoHeight}
      {...props}
    >
      {children}
    </S.Card>
  );
};
