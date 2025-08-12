import React from 'react';

import { SuperAdminHeader } from './header';
import * as S from './index.styles';

const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <S.Section>
      <S.Header>
        <SuperAdminHeader />
      </S.Header>
      <S.Main>{children}</S.Main>
    </S.Section>
  );
};

export default SuperAdminLayout;
