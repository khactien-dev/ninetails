import { WithChildrenProps } from '@/interfaces';
import React from 'react';
import { CustomArrowProps } from 'react-slick';

import * as S from './index.styles';

export const CarouselArrow: React.FC<WithChildrenProps<CustomArrowProps>> = ({
  children,
  ...props
}) => {
  return <S.ArrowWrapper {...props}>{children}</S.ArrowWrapper>;
};
