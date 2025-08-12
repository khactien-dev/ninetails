import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import Notification from '@/components/notification';
import { ROUTER_PATH } from '@/constants';
import { USER_ROLE } from '@/constants/settings';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { getLabel } from '@/utils';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from '../index.styles';
import { ProfileDropdown } from '../profile/profile-dropdown';

interface DesktopHeaderProps {
  isTwoColumnsLayout: boolean;
}

export const roleNotifications = [USER_ROLE.OP, USER_ROLE.BACKUP, USER_ROLE.DISPATCH];

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ isTwoColumnsLayout }) => {
  const router = useRouter();
  const { pathname } = router;
  const user = useAppSelector(selectCurrentUser);
  const titleHeader = getLabel() || '설정';
  const hasNotification = user?.permission?.notification?.includes('read');

  return (
    <BaseRow justify="space-between" align="middle">
      <BaseCol lg={10} xl={8} xxl={8}>
        <S.Title>
          <S.Text>{titleHeader}</S.Text>
          {user && hasNotification && <Notification />}
          {pathname === ROUTER_PATH.ADMIN_REALTIME_ACTIVITY && (
            <S.Live danger size="small">
              Live
            </S.Live>
          )}
        </S.Title>
      </BaseCol>
      <S.ProfileColumn xl={16} xxl={12} $isTwoColumnsLayout={isTwoColumnsLayout}>
        <BaseRow align="middle" justify="end" gutter={[5, 5]}>
          <BaseCol>
            <ProfileDropdown />
          </BaseCol>
        </BaseRow>
      </S.ProfileColumn>
    </BaseRow>
  );
};
