import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';

import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';

interface HeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
  isTwoColumnsLayout: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  toggleSider,
  isSiderOpened,
  isTwoColumnsLayout,
}) => {
  const { isDesktop } = useResponsive();

  return isDesktop ? (
    <DesktopHeader isTwoColumnsLayout={isTwoColumnsLayout} />
  ) : (
    <MobileHeader toggleSider={toggleSider} isSiderOpened={isSiderOpened} />
  );
};
