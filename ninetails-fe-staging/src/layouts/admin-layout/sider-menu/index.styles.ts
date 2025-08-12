import { BaseMenu } from '@/components/common/base-menu';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const Menu = styled(BaseMenu)`
  padding-bottom: 70px;
  a {
    width: 100%;
    display: block;
  }

  margin-top: 29px;
  &.ant-menu-inline-collapsed .ant-menu-item.ant-menu-item-selected {
    background: #53b400 !important;
  }

  &.ant-menu-inline-collapsed .ant-menu-item .ant-menu-title-content {
    display: none;
    margin-left: 0;
  }

  .ant-menu-item {
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: start;
  }

  .ant-menu-item.ant-menu-item-selected {
    color: #fff;
    background: #53b400 !important;
    font-weight: ${FONT_WEIGHT.bold};
  }

  .ant-menu-item.ant-menu-item-selected .ant-menu-item-icon + span,
  .ant-menu-item.ant-menu-item-selected .ant-menu-item-icon {
    opacity: 1;
  }

  .ant-menu-item.ant-menu-item-disabled .ant-menu-item-icon + span,
  .ant-menu-item.ant-menu-item-disabled .ant-menu-item-icon {
    opacity: 0.8 !important;
  }

  .ant-menu-item .ant-menu-item-icon {
    margin-right: -6px;
  }

  .ant-menu-item:hover .ant-menu-item-icon {
    opacity: 1;
  }

  .ant-menu-item .ant-menu-item-icon + span {
    opacity: 0.8;
  }

  .ant-menu-item.ant-menu-item-selected::after {
    border-color: var(--primary-color);
  }

  .ant-menu-item.ant-menu-item-selected::before,
  .ant-menu-item:hover::before {
    display: block;
    content: '';
    position: absolute;
    width: 5px;
    height: 100%;
    top: 0;
    left: 0;
    background: #fff;
    z-index: 999;
  }

  .ant-menu-item:hover::before {
    opacity: 0.8;
  }

  .ant-menu-item:not(:last-child),
  .ant-menu-submenu-title {
    margin-bottom: 20px;
    margin-top: 0;
  }
`;
