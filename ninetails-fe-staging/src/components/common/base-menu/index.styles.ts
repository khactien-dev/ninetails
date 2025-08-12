import { FONT_SIZE } from '@/constants';
import { Menu as AntMenu } from 'antd';
import styled from 'styled-components';

export const Menu = styled(AntMenu)`
  &.ant-menu .ant-menu-item-icon {
    opacity: 0.75;
    font-size: ${FONT_SIZE.xl};
    width: 24px;
  }

  .ant-menu-item,
  .ant-menu-submenu {
    font-size: ${FONT_SIZE.xs};
    border-radius: 0;
  }

  .ant-menu-item {
    fill: currentColor;
    min-height: 54px;
  }

  .ant-menu-inline,
  .ant-menu-vertical {
    border-right: 0;
  }
`;
