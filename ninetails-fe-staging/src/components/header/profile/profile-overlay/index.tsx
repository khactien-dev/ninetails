import { useFeedback } from '@/hooks/useFeedback';
import { removeCredentials } from '@/stores/auth/auth.slice';
import { useAppDispatch } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from './index.styles';

export const ProfileOverlay: React.FC = ({ ...props }) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { notification } = useFeedback();

  const handleLogout = () => {
    cookies.remove('access_token');
    cookies.remove('refreshToken');
    dispatch(removeCredentials());
    push('/');
    notification.success({ message: t('header.logoutSuccess') });
  };

  return (
    <div {...props}>
      <S.Text>
        <Link href="/profile">{t('header.profile')}</Link>
      </S.Text>
      <S.ItemsDivider />
      <S.Text>
        <div className="logout" onClick={handleLogout}>
          {t('header.logout')}
        </div>
      </S.Text>
    </div>
  );
};
