import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Tabs = styled(BaseTabs)`
  .ant-tabs-nav {
    margin: 20px 0 30px;
    &:before {
      border: none !important;
    }
    .ant-tabs-ink-bar {
      display: none;
    }
    .ant-tabs-nav-wrap {
      width: 100%;
      .ant-tabs-nav-list {
        width: 100%;
        .ant-tabs-tab {
          padding: 0;
          margin: 0;
          width: calc(100% / 3) !important;
          text-align: center;
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid #c0c0c0;
          display: block;
          cursor: pointer;
          .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            font-weight: ${FONT_WEIGHT.medium};
            height: 34px;
            line-height: 33px;
            padding: 0;
            letter-spacing: -0.5px;
            @media only screen and ${media.sm} {
              font-size: 15px;
              letter-spacing: 0;
              padding: 0 20px;
            }
          }
        }
        .ant-tabs-tab-active {
          border: 1px solid #c0c0c0;
          border-bottom: none;
          .ant-tabs-tab-btn {
            color: var(--green) !important;
            text-shadow: none;
          }
        }
      }
    }
  }
`;
