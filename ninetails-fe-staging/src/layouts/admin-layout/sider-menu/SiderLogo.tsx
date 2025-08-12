import Logo2 from '@/assets/images/common/s-logo.png';
import Logo from '@/assets/images/common/sb-logo2.png';
import { BaseImage } from '@/components/common/base-image';
// import { useResponsive } from '@/hooks/useResponsive';
// import { RightOutlined } from '@ant-design/icons';
import React from 'react';

import * as S from '../sider/index.styles';

interface SiderLogoProps {
  isSiderCollapsed: boolean;
  // toggleSider: () => void;
}

export const SiderLogo: React.FC<SiderLogoProps> = ({ isSiderCollapsed }) => {
  // const { isDesktop } = useResponsive();

  return (
    <>
      <S.SiderLogoDiv>
        <S.SiderLogoLink href="/">
          {!isSiderCollapsed ? (
            <BaseImage src={Logo.src} width={200} preview={false} />
          ) : (
            <BaseImage src={Logo2.src} width={18} height={27} preview={false} />
          )}
        </S.SiderLogoLink>
        {/*{!isDesktop && (*/}
        {/*  <S.CollapseButton*/}
        {/*    shape="circle"*/}
        {/*    size="small"*/}
        {/*    $isCollapsed={isSiderCollapsed}*/}
        {/*    icon={<RightOutlined rotate={isSiderCollapsed ? 0 : 180} />}*/}
        {/*    onClick={toggleSider}*/}
        {/*  />*/}
        {/*)}*/}
      </S.SiderLogoDiv>
    </>
  );
};
