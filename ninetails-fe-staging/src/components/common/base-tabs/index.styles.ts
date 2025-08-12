import { FONT_WEIGHT } from '@/constants';
import { Tabs as AntdTabs } from 'antd';
import styled from 'styled-components';

export const Tabs = styled(AntdTabs)`
  .ant-tabs-tab-btn {
    color: rgba(34, 34, 34, 1) !important;
    font-weight: ${FONT_WEIGHT.regular} !important;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    font-weight: ${FONT_WEIGHT.bold} !important;
  }

  .ant-tabs-tab.ant-tabs-tab-disabled {
    color: var(--disabled-color);
  }

  &.ant-tabs .ant-tabs-tab:not(.ant-tabs-tab-active) {
    .ant-tabs-tab-btn,
    .ant-tabs-tab-remove {
      &:focus-visible {
        color: var(--ant-primary-7);
      }
    }
  }
`;
