import { BaseButton } from '@/components/common/base-button';
import { BaseLayout } from '@/components/common/base-layout';
import { BaseRow } from '@/components/common/base-row';
import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT, media } from '@/constants';
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
      .ant-tabs-nav-list {
        width: 100%;
        .ant-tabs-tab {
          padding: 0;
          margin: 0;
          text-align: center;
          border-radius: 8px 8px 0 0;
          border-bottom: 1px solid var(--border-base-color);
          display: block;
          cursor: pointer;
          .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.4);
            font-size: 12px;
            height: 34px;
            line-height: 33px;
            padding: 0;
            letter-spacing: -0.5px;
            width: 120px;
            @media only screen and ${media.sm} {
              font-size: 15px;
              letter-spacing: 0;
              padding: 0 20px;
            }
          }
        }
        .ant-tabs-tab-btn {
          font-weight: ${FONT_WEIGHT.regular};
          padding: 0 1.6rem !important;
        }
        .ant-tabs-tab-active {
          border: 1px solid var(--border-base-color);
          border-bottom: none;
          font-weight: ${FONT_WEIGHT.bold} !important;
          .ant-tabs-tab-btn {
            color: var(--primary-color) !important;
            text-shadow: none;
            padding: 0 1.6rem;
          }
        }
        &:after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-base-color) !important;
        }
      }
    }
  }
`;

export const WrapFullScreenContent = styled.div<{ $isFullScreen: boolean }>`
  padding: ${(props) => (props.$isFullScreen ? '2rem' : 0)};
`;

export const FullScreenContainer = styled.div``;

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

export const WrapFullScreenHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const BackButton = styled(BaseButton)`
  height: 33px !important;
  background-color: rgba(230, 242, 229, 1) !important;
  color: rgba(14, 128, 1, 1) !important;
  border-color: none !important;
  font-size: ${FONT_SIZE.xs};
`;

export const WrapDate = styled.div`
  font-size: ${FONT_SIZE.lg};
  font-weight: ${FONT_WEIGHT.bold};
`;

export const UserProfileRow = styled(BaseRow)`
  display: none;
  @media only screen and ${media.sm} {
    display: flex;
  }
`;

export const WrapPreviewPdf = styled.div`
  height: 0;
  overflow: hidden;
`;
