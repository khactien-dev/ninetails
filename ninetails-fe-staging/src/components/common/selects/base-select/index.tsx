import IconDropdown from '@/assets/images/svg/icon-dropdown.svg';
import { Dimension } from '@/interfaces';
import { Select as AntSelect } from 'antd';
import { RefSelectProps } from 'antd/lib/select';
import React, { ComponentProps } from 'react';

import * as S from './index.styles';

export const { Option } = AntSelect;

export interface BaseSelectProps extends ComponentProps<typeof AntSelect> {
  width?: Dimension;
  shadow?: boolean;
  className?: string;
}

// eslint-disable-next-line react/display-name
export const BaseSelect = React.forwardRef<RefSelectProps, BaseSelectProps>(
  ({ className, width, shadow, children, suffixIcon = <IconDropdown />, ...props }, ref) => (
    <S.Select
      getPopupContainer={(triggerNode) => triggerNode}
      ref={ref}
      className={className}
      $width={width}
      $shadow={shadow}
      suffixIcon={suffixIcon}
      {...props}
    >
      {children}
    </S.Select>
  )
);
