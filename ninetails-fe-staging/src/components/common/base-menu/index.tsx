import type { MenuProps } from 'antd';
import { FC } from 'react';

import * as S from './index.styles';

export type BaseMenuProps = MenuProps;

export const BaseMenu: FC<BaseMenuProps> = (props) => {
  return <S.Menu {...props} />;
};
