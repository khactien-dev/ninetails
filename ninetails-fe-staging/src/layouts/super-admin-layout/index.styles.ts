import { BaseLayout } from '@/components/common/base-layout';
import { LAYOUT, media } from '@/constants';
import Link from 'next/link';
import styled from 'styled-components';

export const Section = styled.section`
  background-color: var(--white);
`;

export const Main = styled(BaseLayout.Content)`
  height: calc(100vh - 70px);
  overflow-y: auto;
  @media only screen and ${media.lg} {
    height: calc(100vh - 4.375rem);
    overflow-y: auto;
  }

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--green);
  }
`;

export const Header = styled(BaseLayout.Header)`
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
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  height: 70px;

  .anticon {
    color: var(--white);

    svg {
      height: 2.7rem;
      width: 2.7rem;
    }
  }
`;
