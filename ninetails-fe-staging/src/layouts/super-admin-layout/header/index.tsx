import SBlogo from '@/assets/images/common/icon-sb_logo3.png';
import { BaseCol } from '@/components/common/base-col';
import { BaseImage } from '@/components/common/base-image';
import { BaseRow } from '@/components/common/base-row';
import { ProfileDropdown } from '@/components/header/profile/profile-dropdown';
import * as S from '@/layouts/super-admin-layout/index.styles';
import React from 'react';

export const SuperAdminHeader: React.FC = () => {
  return (
    <BaseRow justify="space-between" align="middle">
      <BaseCol lg={10} xl={8} xxl={8}>
        <S.LogoLink href={'/'}>
          <BaseImage src={SBlogo.src} preview={false} width={165} />
        </S.LogoLink>
      </BaseCol>
      <BaseRow align="middle" justify="end" gutter={[5, 5]}>
        <BaseCol>
          <ProfileDropdown />
        </BaseCol>
      </BaseRow>
    </BaseRow>
  );
};
