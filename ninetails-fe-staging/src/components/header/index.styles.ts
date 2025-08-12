import { LAYOUT, media } from '@/constants';
import styled, { css } from 'styled-components';

import { BurgerIcon } from '../common/base-burger/BurgerIcon';
import { BaseButton } from '../common/base-button';
import { BaseCol } from '../common/base-col';
import { BaseCollapse } from '../common/base-collapse/base-collapse';

export const HeaderActionWrapper = styled.div`
  cursor: pointer;

  & > .ant-btn span[role='img'],
  .ant-badge {
    font-size: 1.25rem;

    @media only screen and ${media.md} {
      font-size: 1.625rem;
    }
  }

  & .ant-badge {
    display: inline-block;
  }
`;

export const DropdownCollapse = styled(BaseCollapse)`
  & > .ant-collapse-item > .ant-collapse-header {
    font-weight: 600;
    font-size: 0.875rem;

    color: var(--primary-color);

    @media only screen and ${media.md} {
      font-size: 1rem;
    }
  }

  & > .ant-collapse-item-disabled > .ant-collapse-header {
    cursor: default;

    & > span[role='img'] {
      display: none;
    }
  }
`;

export const BurgerCol = styled(BaseCol)`
  display: none;
  z-index: 999;
`;

export const MobileBurger = styled(BurgerIcon)`
  width: 1.75rem;
  height: 1.75rem;
  margin-right: -0.5rem;
  color: var(--text-main-color);

  ${(props) =>
    props.isCross &&
    css`
      color: var(--text-secondary-color);
    `};
`;

export const SearchColumn = styled(BaseCol)`
  padding: ${LAYOUT.desktop.paddingVertical} ${LAYOUT.desktop.paddingHorizontal};
`;

interface ProfileColumnProps {
  $isTwoColumnsLayout: boolean;
}

export const ProfileColumn = styled(BaseCol)<ProfileColumnProps>`
  @media only screen and ${media.md} {
    ${(props) =>
      props?.$isTwoColumnsLayout &&
      css`
        background-color: var(--sider-background-color);
        padding: ${LAYOUT.desktop.paddingVertical} ${LAYOUT.desktop.paddingHorizontal};
      `}
  }
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  /* div {
    position: relative;
    font-size: 22px;
    font-weight: 700;
    line-height: 26px;
    position: relative;
    text-align: left;
    color: var(--text);
    &::after {
      content: '';
      display: block;
      position: absolute;
      background: var(--green);
      width: 5px;
      height: 5px;
      top: 3px;
      right: -7px;
    }
  } */
`;

export const Text = styled.div`
  /* display: flex;
  align-items: center;
  gap: 20px;
  div { */
  position: relative;
  font-size: 22px;
  font-weight: 700;
  line-height: 26px;
  position: relative;
  text-align: left;
  color: var(--text);
  &::after {
    content: '';
    display: block;
    position: absolute;
    background: var(--green);
    width: 8px;
    height: 8px;
    top: -10px;
    right: -10px;
  }
  /* } */
`;

export const Live = styled(BaseButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  font-size: 14px !important;
  font-weight: 700;
  border-radius: 6px;
  color: #ff2929;
  border: 2px solid #ff2929;
  &.ant-btn.ant-btn-sm {
    height: 28px;
    line-height: 24px;
  }
`;
