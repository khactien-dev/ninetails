import React from 'react';

import { HomeHeader } from './header-layout';
import * as S from './index.styles';
import useMainLayout from './index.utils';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { toggleOpen, isScrolled, isOpenLoginForm } = useMainLayout();

  return (
    <>
      <S.Section>
        <HomeHeader
          toggleOpen={toggleOpen}
          isScrolled={isScrolled}
          isOpenLoginForm={isOpenLoginForm}
        />
        <S.Main>{children}</S.Main>
      </S.Section>
      <S.Footer>{'Copyright 2024. SuperBucket © all rights reserved.'} </S.Footer>
    </>
  );
};

export default MainLayout;
