import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

import { BaseTabs } from '../common/base-tabs';

export const TabContainer = styled.div`
  display: flex;
  align-items: end;
  flex: 1;
`;

export const PseudoLine = styled.div`
  border: 1px solid var(--border-color);
`;

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
      .ant-tabs-nav-list {
        width: 100%;
        .ant-tabs-tab {
          padding: 0;
          margin: 0;
          text-align: center;
          border-radius: 12px 12px 0 0;
          border-bottom: 1px solid var(--border-color);
          display: block;
          cursor: pointer;
          .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.4);
            font-size: ${FONT_SIZE.md};
            font-weight: ${FONT_WEIGHT.medium};
            height: 42px;
            line-height: 33px;
            padding: 0;
            letter-spacing: -0.5px;
            width: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            @media only screen and ${media.sm} {
              font-size: 15px;
              letter-spacing: 0;
              padding: 0 20px;
              width: 200px;
            }
          }
        }
        .ant-tabs-tab-btn {
          padding: 0 1.6rem !important;
        }
        .ant-tabs-tab-active {
          border: 1px solid var(--border-color);
          border-bottom: none;
          .ant-tabs-tab-btn {
            color: #0085f7 !important;
            text-shadow: none;
            padding: 0 1.6rem;
          }
        }
        &:after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color) !important;
        }
      }
    }
  }
`;

export const WrapTab = styled('div')`
  .ant-table-column-sorter-up.active,
  .ant-table-column-sorter-down.active {
    color: #0085f7 !important;
  }

  .ant-table-column-title {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #0085f7 !important;
    border-color: #0085f7 !important;
  }

  .ant-checkbox:not(.ant-checkbox-disabled):hover .ant-checkbox-inner {
    border-color: #0085f7 !important;
  }

  .ant-checkbox-indeterminate .ant-checkbox-inner:after {
    background-color: #0085f7 !important;
  }
`;

export const TableCellEllipsis = styled('div')`
  max-width: 300px;
`;
export const WrapContent = styled.div``;
