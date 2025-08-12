import { BaseButton } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 34px 42px 50px;
`;

export const PageWrapper = styled.div`
  width: 100%;
  height: auto;
  display: block;
  flex-direction: row;
  position: relative;
  @media only screen and ${media.custom} {
    display: flex;
    flex-direction: row;
  }
  .ant-tabs-tab-btn {
    font-weight: ${FONT_WEIGHT.medium};
  }
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--primary-color) !important;
  }
`;

export const WrapContent = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
  padding: 8px;
  background-color: #f6f6f9;

  @media only screen and ${media.lg} {
    padding: 30px 24px;
  }
`;

export const Box = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 24px 28px 30px;
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
        .ant-tabs-tab-btn {
          font-weight: ${FONT_WEIGHT.semibold} !important;
          padding: 0 1.6rem !important;
        }
        .ant-tabs-tab-active {
          border: 1px solid #c0c0c0;
          border-bottom: none;
          .ant-tabs-tab-btn {
            color: var(--primary-color) !important;
            text-shadow: none;
            padding: 0 1.6rem;
          }
        }
        &:after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #c0c0c0 !important;
        }
      }
    }
  }
`;

export const Col = styled(BaseCol)``;

export const GroupButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 2px;
  .ant-btn {
    font-size: 14px;
    padding-left: 8px;
    padding-right: 8px;
    width: fit-content;
  }
`;

export const Button = styled(BaseButton)`
  height: 34px;
  line-height: 32px;
  text-align: center;
  font-size: ${FONT_SIZE.xs};
  border-radius: 5px;
  color: var(--green);
  background: var(--white);
  border: 1px solid var(--green);
  min-width: 80px;
  margin-left: 10px;

  &.ant-btn {
    color: var(--green) !important;
    &:hover {
      border: solid 1px var(--green) !important;
    }
  }

  &.btn-blur-primary {
    background: #e6f2e5;
    border: 1px solid #e6f2e5;
    &:hover {
      border: solid 1px #e6f2e5 !important;
    }
  }

  &.btn-primary {
    background: var(--green);
    color: var(--white) !important;
  }
`;

export const Row = styled(BaseRow)``;

export const TableData = styled.div`
  margin-top: 38px;
  color: var(--text);
  .ant-row {
    margin-bottom: 6px;

    .ant-col {
      text-align: left;
      &:nth-child(4n + 1) {
        font-weight: bolder;
      }
    }

    &:first-of-type {
      margin-bottom: 12px;

      * {
        font-weight: bolder;
      }
    }
  }
`;
