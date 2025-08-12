import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import Notification from '@/components/notification';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { getLabel } from '@/utils';
import React from 'react';

import * as S from '../index.styles';

interface MobileHeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleSider, isSiderOpened }) => {
  const user = useAppSelector(selectCurrentUser);
  const titleHeader = getLabel() || '설정';
  const hasNotification = user?.permission?.notification?.includes('read');

  return (
    <BaseRow justify="space-between" align="middle">
      <BaseCol>
        <S.Title>
          <S.Text>{titleHeader}</S.Text>
          {user && hasNotification && <Notification />}
        </S.Title>
      </BaseCol>

      <S.BurgerCol>
        <S.MobileBurger onClick={toggleSider} isCross={isSiderOpened} />
      </S.BurgerCol>
    </BaseRow>
  );
};
