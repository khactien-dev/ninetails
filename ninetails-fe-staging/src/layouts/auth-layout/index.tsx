import { HomeHeader } from '@/components/home/header';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import * as S from './index.styles';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const router = useRouter();

  const [isOpenLoginForm, setIsOpenLoginForm] = useState(false);
  const toggleOpen = () => {
    setIsOpenLoginForm(!isOpenLoginForm);
  };
  useEffect(() => {
    setIsOpenLoginForm(false);
  }, [router]);
  return (
    <S.Wrapper>
      <HomeHeader toggleOpen={toggleOpen} isScrolled={false} isOpenLoginForm={isOpenLoginForm} />
      <S.BackgroundWrapper>
        <S.LoginWrapper>{children}</S.LoginWrapper>
      </S.BackgroundWrapper>
    </S.Wrapper>
  );
};

export default AuthLayout;
