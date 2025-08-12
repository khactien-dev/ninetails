import Logo from '@/assets/images/common/sb-logo2.png';
import { BaseImage } from '@/components/common/base-image';
import { HomePageLogin } from '@/components/home/login';
import { USER_ROLE } from '@/constants/settings';
import { useFeedback } from '@/hooks/useFeedback';
import { removeCredentials, selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { nameRoutePath, subString } from '@/utils';
import cookies from '@/utils/cookie';
import { Tooltip } from 'antd';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import s from './index.module.css';

interface HomePageHeaderProps {
  toggleOpen: () => void;
  isScrolled: boolean;
  isOpenLoginForm: boolean;
}

export const HomeHeader: React.FC<HomePageHeaderProps> = ({
  isOpenLoginForm,
  isScrolled,
  toggleOpen,
}) => {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const { notification } = useFeedback();
  const getAccessibleRoutes = (permissions: Record<string, string>): Record<string, string> => {
    const accessibleRoutes: Record<string, string> = {};

    for (const [key, value] of Object.entries(permissions)) {
      if (value === 'read' && nameRoutePath[key as keyof typeof nameRoutePath]) {
        accessibleRoutes[key as keyof typeof accessibleRoutes] =
          nameRoutePath[key as keyof typeof nameRoutePath];
      }
    }

    return accessibleRoutes;
  };
  const hasPermissionS = Object.entries(user?.permission || {}).reduce((acc: any, [key, value]) => {
    if (typeof value === 'string' && value.includes('read')) {
      acc[key] = 'read';
    }
    return acc;
  }, {});
  let firstAccessibleRoute: any = null;
  const accessibleRoutes = getAccessibleRoutes(hasPermissionS);
  if (accessibleRoutes && Object.keys(accessibleRoutes).length > 0) {
    firstAccessibleRoute = Object.entries(accessibleRoutes)[0][1];
  }

  const scrollToOtherRouter = (path: string, id: string) => {
    router.push({
      pathname: '/',
      query: { id },
    });
  };

  const handleAuthorize = () => {
    if (!cookies.get('access_token') && !isEmpty(user)) {
      dispatch(removeCredentials());
      notification.error({ message: 'You have been logged out' });
      return;
    }
    if (!isEmpty(user) && user.role == USER_ROLE.ADMIN) return router.push('/super-admin');
    if (!isEmpty(user) && user.role !== USER_ROLE.ADMIN && firstAccessibleRoute)
      return router.push(firstAccessibleRoute);
    toggleOpen();
  };

  return (
    <>
      <header className={`${s.normalHeader} ${isScrolled ? s.active : ''}`}>
        <div className={s.centerWrap}>
          <Link href="/" className={s.logo}>
            <BaseImage src={Logo.src} preview={false} />
          </Link>
          <div className={s.floatRight}>
            <div className={s.normalMenuWrap}>
              <button
                type="button"
                className={`${s.normalMenu} ${s.homepageHeaderButton} home buttonLink1`}
                onClick={() => scrollToOtherRouter('/', 'homeSection3')}
              >
                기술개요
              </button>
              <button
                type="button"
                className={`${s.normalMenu} ${s.homepageHeaderButton} home buttonLink2`}
                onClick={() => scrollToOtherRouter('/', 'homeSection4a')}
              >
                주요기능
              </button>
              <Link href="/contact" className={s.normalMenu}>
                문의
              </Link>
              <Link href="/request" className={s.normalMenu}>
                데모신청
              </Link>
            </div>
            <button className={`${s.headerLogin}`} type="button" onClick={handleAuthorize}>
              <Tooltip placement="topRight" title={user ? user.full_name : ''}>
                <span>{isEmpty(user) ? '로그인' : subString(user.full_name, 5)}</span>
              </Tooltip>
            </button>
            {isEmpty(user) ? (
              <button className={`${s.headerMenu}`} type="button" onClick={() => toggleOpen()}>
                <span>메뉴</span>
              </button>
            ) : (
              <button className={`${s.loggedHeaderMenu}`} type="button" onClick={handleAuthorize}>
                <span>{user ? subString(user?.full_name, 15) : '로그인'}</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {isOpenLoginForm && <HomePageLogin toggleOpen={toggleOpen} />}
    </>
  );
};
