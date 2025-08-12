import IconPrev from '@/assets/images/svg/icon-p-prev2.png';
import IconPrev2 from '@/assets/images/svg/icon-p-prev2w.png';
import { BurgerIcon } from '@/components/common/base-burger/BurgerIcon';
import { BaseButton } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseLayout } from '@/components/common/base-layout';
import { BaseTypography } from '@/components/common/base-typography';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { LAYOUT } from '@/constants';
import Link from 'next/link';
import styled, { css } from 'styled-components';

interface Collapse {
  $isCollapsed: boolean;
  $isShow: boolean;
  $setWidth: string | number;
  $fixedContent: boolean;
}

export const Sider = styled(BaseLayout.Sider)<Collapse>`
  &.ant-layout-sider {
    margin: 20px auto;
    text-align: center;
    font-size: ${FONT_SIZE.xs};
    font-weight: ${FONT_WEIGHT.regular};
    background: var(--white);
    padding: 15px;
    transition: all 0s;
    z-index: 2;

    ${(props) =>
      props.$fixedContent
        ? css`
            padding: 0;
            margin: 0;
            position: absolute;
            width: calc(100% - 60px) !important;
            min-width: auto !important;
            height: 100%;
            left: 0;
            top: 0;
            z-index: 3;
          `
        : css``}

    ${(props) =>
      props.$isCollapsed
        ? css``
        : css`
            border: none;
          `}


    @media only screen and ${media.custom} {
      top: 0;
      margin: 0 auto;
      text-align: left;
      height: calc(100vh - 4.375rem);
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.07);
      overflow-y: auto;
      z-index: 2;
      width: auto;
      left: 0;
      border-radius: unset;
      border: none;

      ${(props) =>
        props.$fixedContent
          ? css`
              position: absolute;
            `
          : css`
              position: sticky;
            `}

      ${(props) =>
        props.$isCollapsed
          ? css`
              padding: 0;
            `
          : css`
              padding: 0;
            `}
    }

    /* * {
      color: var(--text);
    } */
  }

  overflow: visible;
  max-height: 100vh;
  color: var(--text-secondary-color);
`;

export const ExtraContent = styled.div<{
  $isCollapsed?: boolean;
  $setWidth?: string | number;
  $fixedContent?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  height: 100%;
  min-width: 360px;
  background: #f7f6f9;
  @media only screen and ${media.custom} {
    left: ${({ $setWidth, $isCollapsed }) => ($isCollapsed ? `${$setWidth}px !important` : '0')};
  }
`;

export const CollapseButton = styled(BaseButton)<Collapse>`
  position: absolute;
  border: 1px solid var(--border-color);
  border-left: none !important;
  z-index: 9;
  background: var(--green) url('${IconPrev2.src}') center no-repeat;
  background-size: 6px 10px;
  top: 100px;
  left: 0;
  width: 24px;
  height: 50px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-left: none !important;
  border-radius: 0 10px 10px 0;
  transition: all 0.2s ease;
  display: ${({ $isShow, $isCollapsed }) => ($isShow && !$isCollapsed ? 'block' : 'none')};
  outline: none;
  z-index: 9;
  &:focus {
    outline: none;
    border-color: ${({ $isShow }) =>
      $isShow ? 'var(--border-color)' : 'var(--primary-color)'} !important;
  }

  @media only screen and ${media.custom} {
    background-image: url(${IconPrev2.src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 6px 12px !important;
    width: 24px;
    height: 50px;
    top: 100px;
    left: 0;
    padding: 0;
    border: 1px solid var(--border-color);
    border-left: none !important;
    transition: all 0s;
    border-radius: 0 10px 10px 0;
    ${(props) =>
      props.$isCollapsed &&
      props.$isShow &&
      css`
        left: calc(${props.$setWidth}px + 62px);
        background: var(--white) url('${IconPrev.src}') center no-repeat !important;
        background-size: 6px 12px !important;
        border: 1px solid var(--border-color);
        transition: all 0s;
        @media only screen and ${media.custom} {
          left: calc(${props.$setWidth}px);
          width: 24px;
          height: 50px;
          display: block;
        }
      `}
  }

  color: var(--text-secondary-color);
`;

export const CollapseButtonMobile = styled(BaseButton)<Collapse>`
  position: absolute;
  right: 10px;
  top: 0;
  z-index: 70;
  border: none;
  border-radius: 0 4px 4px 0 !important;

  &:hover {
    color: var(--primary-color) !important;
  }

  @media only screen and ${media.custom} {
    display: none;
  }

  ${(props) =>
    props.$isCollapsed &&
    props.$isShow &&
    css`
      display: block;
    `}
`;

export const SiderContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  max-height: calc(100vh - ${LAYOUT.mobile.headerHeight});

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

export const Text = styled(BaseTypography.Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  transition: all 0.3s;
  position: absolute;
  bottom: 40px;
  left: 20px;
  width: 90px;
  text-align: center;

  & > a {
    display: block;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    margin-right: 5px;

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

export const LogoSuperAdmin = styled.div`
  padding: 50px 30px 0;
`;
export const TitleSuperAdmin = styled.div`
  display: flex;
  align-items: center;

  span {
    text-align: left;
    font-size: 18px;
    line-height: 24px;
    font-weight: 700;
    padding: 4px 0 0 10px;
    display: block;
    color: rgba(64, 64, 64, 1);
  }
`;

export const IdSuperAdmin = styled.div`
  margin: 46px 0 0;
  text-align: center;
  font-size: 15px;
  line-height: 23px;
  color: #222;
  font-weight: ${FONT_WEIGHT.bold};
  span {
    font-weight: ${FONT_WEIGHT.bold};
    color: #0085f7;
  }
`;

export const Logout = styled(BaseButton)`
  margin: 50px 30px 0;
  background: #0085f7;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.medium};
  height: 24px;
  * {
    color: var(--white) !important;
  }
`;
