import Logout from '@/assets/images/common/icon-nav-quit3.png';
import LogoSuperAdmin from '@/assets/images/common/logo-gist.png';
import { BaseImage } from '@/components/common/base-image';
import { USER_ROLE } from '@/constants/settings';
import { useFeedback } from '@/hooks/useFeedback';
import { useResponsive } from '@/hooks/useResponsive';
import { removeCredentials, selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import { CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as S from './index.styles';

interface LeftProps {
  hasCollapseBtn?: boolean;
  width: number;
  children: React.ReactNode;
  fixedContent?: boolean;
  isSuperAdmin?: boolean;
  extraContent?: React.ReactNode;
}

const LeftContent = ({
  children,
  hasCollapseBtn = false,
  fixedContent = false,
  width,
  isSuperAdmin = false,
  extraContent,
  ...props
}: LeftProps) => {
  const { isDesktop, isLaptop } = useResponsive();
  const { t } = useTranslation('common');
  const [isToggle, setIsToggle] = useState(fixedContent ? fixedContent && isDesktop : true);
  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { notification } = useFeedback();

  const toggleSider = () => {
    setIsToggle(!isToggle);
  };

  const handleLogout = () => {
    cookies.remove('access_token');
    cookies.remove('refreshToken');
    dispatch(removeCredentials());
    push('/');
    notification.success({ message: t('header.logoutSuccess') });
  };

  return (
    <>
      <S.Sider
        trigger={null}
        collapsed={isToggle}
        $setWidth={isLaptop ? (width as number) : '100%'}
        $isCollapsed={isToggle}
        $isShow={hasCollapseBtn}
        collapsedWidth={isLaptop ? width : '95%'}
        width={isDesktop ? 0 : 0}
        {...props}
        $fixedContent={fixedContent}
      >
        {isSuperAdmin && (
          <S.LogoSuperAdmin>
            <S.TitleSuperAdmin>
              <BaseImage src={LogoSuperAdmin.src} preview={false} width={60} height={56} />
              <p>
                <span>광주과학기술원</span>
                <span>AI 대학원</span>
              </p>
            </S.TitleSuperAdmin>
            <S.IdSuperAdmin>
              {currentUser?.full_name ? (
                currentUser?.role === USER_ROLE.ADMIN ? (
                  <p>
                    Welcome&nbsp;<span>[Super admin]</span>!
                  </p>
                ) : (
                  <p>
                    Welcome<span>[{currentUser?.full_name}]</span>!
                  </p>
                )
              ) : null}
            </S.IdSuperAdmin>
          </S.LogoSuperAdmin>
        )}
        {isToggle && (
          <S.SiderContent>
            {fixedContent && (
              <S.CollapseButtonMobile
                size="small"
                $isCollapsed={isToggle}
                $setWidth={width}
                $isShow={hasCollapseBtn}
                onClick={toggleSider}
                $fixedContent={fixedContent}
              >
                <CloseOutlined />
              </S.CollapseButtonMobile>
            )}
            {children}

            {isSuperAdmin && (
              <S.Logout type={'default'} onClick={handleLogout}>
                로그아웃
                <BaseImage src={Logout.src} width={10} preview={false} />
              </S.Logout>
            )}
          </S.SiderContent>
        )}
      </S.Sider>
      <S.CollapseButton
        type="primary"
        $isCollapsed={isToggle}
        $setWidth={width}
        $isShow={hasCollapseBtn}
        onClick={toggleSider}
        $fixedContent={fixedContent}
      ></S.CollapseButton>
      {extraContent && (
        <S.ExtraContent $setWidth={width} $isCollapsed={isToggle} $fixedContent={fixedContent}>
          {extraContent}
        </S.ExtraContent>
      )}
    </>
  );
};

export default LeftContent;
