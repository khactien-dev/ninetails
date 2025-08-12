import Logout from '@/assets/images/common/icon-nav-quit3.png';
import UserIcon from '@/assets/images/common/icon-user.png';
import { BaseImage } from '@/components/common/base-image';
import { Overlay } from '@/components/common/overlay';
import { USER_ROLE } from '@/constants/settings';
import { useFeedback } from '@/hooks/useFeedback';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { removeCredentials, selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import { sessionRemoveBackupData } from '@/utils/sessionStorage';
import { debounce } from 'lodash';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SiderMenu from '../sider-menu';
import { SiderLogo } from '../sider-menu/SiderLogo';
import * as S from './index.styles';

interface MainSiderProps {
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

const MainSider: React.FC<MainSiderProps> = ({ isCollapsed, setCollapsed, ...props }) => {
  const { mobileOnly, tabletOnly, isDesktop } = useResponsive();
  const { t } = useTranslation('common');
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const { push, query } = useRouter();
  const { notification } = useFeedback();
  const router = useRouterWithAuthorize();
  const isOPlogged = query.opId && query.schema;

  const isCollapsible = useMemo(() => mobileOnly && tabletOnly, [mobileOnly, tabletOnly]);

  const toggleSider = () => setCollapsed(!isCollapsed);

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> | undefined = debounce(() => {
    if (!isDesktop) return;
    if (isCollapsed) setCollapsed(false);
  }, 100);

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> | undefined = debounce(() => {
    if (!isDesktop) return;
    if (!isCollapsed) setCollapsed(true);
  }, 300);

  const handleLogout = () => {
    cookies.remove('access_token');
    cookies.remove('refreshToken');
    dispatch(removeCredentials());
    push('/');
    notification.success({ message: t('header.logoutSuccess') });
    sessionRemoveBackupData();
  };

  return (
    <>
      <S.Sider
        trigger={null}
        collapsed={isCollapsed}
        collapsedWidth={isDesktop ? 62 : 0}
        collapsible={isCollapsible}
        width={isDesktop ? 260 : '100%'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <SiderLogo isSiderCollapsed={isCollapsed} />
        <S.SiderContent>
          <SiderMenu setCollapsed={setCollapsed} />
          <S.Flex>
            {!isDesktop && user?.email && (
              <S.MobileUserInfor>
                <div>
                  <BaseImage
                    onClick={() => {
                      if (user.role !== USER_ROLE.ADMIN) {
                        router.pushWithAuthorize('/auth/information');
                        setCollapsed(true);
                      }
                    }}
                    src={UserIcon.src}
                    alt="User"
                    width={20}
                    preview={false}
                  />
                </div>
                <S.ShinkDiv>
                  {user.role === USER_ROLE.ADMIN ? (
                    <>
                      <S.EllipsisText>광주과학기술원 AI 대학원 Super admin</S.EllipsisText>
                      <S.EllipsisText className="email">({user?.email})</S.EllipsisText>
                    </>
                  ) : (
                    <>
                      <S.EllipsisText>
                        {user ? user.organization : ''} {user?.full_name + ' 님'}
                      </S.EllipsisText>
                      <S.EllipsisText className="email">({user?.email})</S.EllipsisText>
                    </>
                  )}

                  {/* <S.EllipsisText>광주시 광산구청 {user?.full_name}</S.EllipsisText>
                  <S.EllipsisText className="email">({user?.email})</S.EllipsisText> */}
                </S.ShinkDiv>
              </S.MobileUserInfor>
            )}
            {!isCollapsed && !isOPlogged && (
              <S.Text>
                <div className="logout" onClick={handleLogout}>
                  {'로그아웃'}
                </div>
                <BaseImage src={Logout.src} width={10} preview={false} />
              </S.Text>
            )}
          </S.Flex>
        </S.SiderContent>
      </S.Sider>
      {!isDesktop && <Overlay onClick={toggleSider} show={!isCollapsed} />}
      {!isDesktop && (
        <S.BurgerCol>
          <S.MobileBurger onClick={toggleSider} isCross={!isCollapsed} />
        </S.BurgerCol>
      )}
    </>
  );
};

export default MainSider;
