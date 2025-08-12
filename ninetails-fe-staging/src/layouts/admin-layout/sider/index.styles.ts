import { BurgerIcon } from '@/components/common/base-burger/BurgerIcon';
import { BaseButton } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseLayout } from '@/components/common/base-layout';
import { BaseTypography } from '@/components/common/base-typography';
import { media } from '@/constants';
import { LAYOUT } from '@/constants';
import Link from 'next/link';
import styled, { css } from 'styled-components';

export const Sider = styled(BaseLayout.Sider)`
  &.ant-layout-sider {
    position: fixed !important;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    transition: all 0.23s ease-in-out;
  }

  overflow: visible;
  right: 0;
  z-index: 10;
  height: 100dvh;

  color: var(--text-secondary-color);

  @media only screen and ${media.md} {
    right: unset;
    left: 0;
  }

  @media only screen and ${media.xl} {
    &.ant-layout-sider {
      position: unset;
    }
  }
`;

interface Collapse {
  $isCollapsed: boolean;
}

export const CollapseButton = styled(BaseButton)<Collapse>`
  background: var(--green);

  border: 1px solid var(--border-color);
  transition: all 0.5s ease;
  position: absolute;
  left: 240px;

  ${(props) =>
    props.$isCollapsed &&
    css`
      left: 40px;
    `}

  color: var(--text-secondary-color);

  &.ant-btn:not(:disabled):hover,
  &.ant-btn:not(:disabled):focus {
    color: var(--text-secondary-color);
    background: var(--primary-color);
    border: 1px solid var(--border-color);
  }
`;

export const SiderContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100dvh - ${LAYOUT.mobile.headerHeight});

  @media only screen and ${media.md} {
    max-height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  }
`;

export const SiderLogoLink = styled(Link)`
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

export const SiderLogoDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 11px;
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  @media only screen and ${media.md} {
    height: ${LAYOUT.desktop.headerHeight};
    padding-top: ${LAYOUT.desktop.paddingVertical};
    padding-bottom: ${LAYOUT.desktop.paddingVertical};
  }
`;

export const BrandSpan = styled.span`
  margin: 0 1rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--white);
`;

export const Text = styled(BaseTypography.Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  transition: all 0.3s;
  width: 90px;
  text-align: center;

  & > .logout {
    display: block;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    margin-right: 5px;
    cursor: pointer;
    &:hover {
      color: #fff;
    }
  }

  @media only screen and ${media.md} {
    font-size: 1rem;
  }
`;

export const BurgerCol = styled(BaseCol)`
  z-index: 999;
  display: flex;
  position: fixed;
  right: 36px;
  top: 20px;
`;

export const MobileBurger = styled(BurgerIcon)`
  width: 1.75rem;
  height: 1.75rem;
  margin-right: -0.5rem;
  color: var(--green);

  ${(props) =>
    props.isCross &&
    css`
      color: var(--white);
    `};
`;

export const MobileUserInfor = styled.div`
  display: flex;
  align-items: start;
  gap: 0.625rem;
  margin: 3rem 0 1rem;
  border: 1px #ffffff33 solid;
  border-radius: 0.5rem;
  padding: 0.875rem;
  width: 100%;
`;

export const Flex = styled.div`
  display: flex;
  align-items: start;
  flex-direction: column;
  padding: 0 24px;
  max-width: 100%;
  min-width: 100%;
  margin-bottom: 3rem;
`;

export const EllipsisText = styled.span`
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
`;

export const ShinkDiv = styled.div`
  width: 100%;
`;
