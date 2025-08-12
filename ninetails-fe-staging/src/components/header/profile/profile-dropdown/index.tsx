import UserIcon from '@/assets/images/svg/icon-user-circle.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { USER_ROLE } from '@/constants/settings';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { subString } from '@/utils';
import { Tooltip } from 'antd';
import React from 'react';

import * as S from './index.styles';

export const ProfileDropdown: React.FC = () => {
  const { isTablet } = useResponsive();
  const user = useAppSelector(selectCurrentUser);
  const router = useRouterWithAuthorize();

  return user ? (
    <S.ProfileDropdownHeader as={BaseRow} gutter={[10, 0]} justify="center" align="middle">
      <BaseCol>
        <UserIcon
          onClick={() =>
            user.role === USER_ROLE.ADMIN ? '' : router.pushWithAuthorize('/auth/information')
          }
        />
      </BaseCol>
      {isTablet && (
        <BaseCol>
          {/* Waiting api */}

          {user.role === USER_ROLE.ADMIN ? (
            <>
              <span className="company">광주과학기술원 AI 대학원</span>
              <Tooltip placement="topRight" title="Super admin">
                <span>Super admin</span>
              </Tooltip>
              <span className="email">( {user.email} )</span>
            </>
          ) : (
            <>
              <Tooltip placement="topRight" title={user.organization}>
                <span className="company">{user ? user.organization : ''}</span>
              </Tooltip>
              <Tooltip placement="topRight" title={user ? user.full_name + ' 님' : ''}>
                <span>{subString(user?.full_name, 15)} 님</span>
              </Tooltip>
              <span className="email">( {user.email} )</span>
            </>
          )}
        </BaseCol>
      )}
    </S.ProfileDropdownHeader>
  ) : // </BasePopover>
  null;
};
