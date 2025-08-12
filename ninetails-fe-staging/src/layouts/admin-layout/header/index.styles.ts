import { BaseLayout } from '@/components/common/base-layout';
import { LAYOUT } from '@/constants';
import { media } from '@/constants';
import styled, { css } from 'styled-components';

interface HeaderProps {
  $isTwoColumnsLayoutHeader: boolean;
}

export const Header = styled(BaseLayout.Header)<HeaderProps>`
  position: relative;
  z-index: 10;
  width: 100%;
  background: #fff;
  box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.1);

  .ant-row {
    height: 100%;
  }

  @media only screen and ${media.xl} {
    padding: 0 30px 0 40px;
    height: ${LAYOUT.desktop.headerHeight};
  }

  @media only screen and ${media.md} {
    ${(props) =>
      props?.$isTwoColumnsLayoutHeader &&
      css`
        padding: 0;
      `}
  }
`;
