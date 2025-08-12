import { BaseButton } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 34px 42px 50px;
`;

export const TablesWrapper = styled(BaseRow)`
  overflow-y: hidden !important;
  height: 100%;

  flex-direction: column;
  @media only screen and ${media.xl} {
    flex-direction: row;
  }
`;

export const WrapHeader = styled.div`
  border-radius: 20px;
  background: var(--white);
  border: 1px solid var(--lightgray);
  box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1);
  padding: 24px 28px 30px;
`;

export const Tabs = styled(BaseTabs)`
  margin-top: 2rem;

  .ant-tabs-nav::before {
    border-bottom: solid 1px rgba(0, 0, 0, 0.4);
  }

  .ant-tabs-ink-bar {
    background: var(--white);
    height: 0px;
  }

  .ant-tabs-tab {
    color: rgba(0, 0, 0, 0.4);
    font-size: ${FONT_SIZE.xs};
    height: 34px;
    line-height: 34px;
    padding: 0 20px;
    min-width: 120px;
    text-align: center;
    border-radius: 8px 8px 0 0;
    justify-content: center;

    &.ant-tabs-tab-active {
      border-radius: 8px 8px 0 0;
      border: 1px solid #c0c0c0;
      border-bottom: none;
      background-color: transparent;

      * {
        color: var(--green) !important;
      }
    }
  }
`;
export const WrapContent = styled.div``;

export const Heading = styled.div`
  font-size: 20px;
  font-weight: ${FONT_WEIGHT.bold};
  span {
    color: #777;
    font-weight: ${FONT_WEIGHT.regular};
    font-size: 15px;
    padding-left: 5px;
  }
`;

export const RightArea = styled.div`
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
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

export const Form = styled(BaseForm)`
  .ant-select {
    width: 100%;
  }

  .ant-select-disabled {
    opacity: 0.5 !important;
    color: #777 !important;
  }
  .ant-select-selector,
  .ant-picker {
    height: 28px !important;
    display: flex;
    align-items: center;
    justify-content: start;
    border: 1px solid transparent !important;
    border-radius: 5px !important;
    background: #f2f5f2 !important;
    margin-bottom: 15px;

    input {
      height: 100% !important;
    }
  }

  .ant-select-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    .anticon {
      width: 10px;
    }
  }
`;

export const TabsFilter = styled(BaseTabs)`
  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tab {
    height: 28px;
    line-height: 26px;
    border: 1px solid #e0e0e0;
    text-align: center;
    color: #999;
    border-radius: 5px;
    padding: 0 15px;
    margin: 0 1px !important;

    &.ant-tabs-tab-active {
      border: 1px solid var(--green) !important;
      border-bottom: none;
      background-color: transparent;

      * {
        color: var(--green) !important;
      }
    }
  }

  .ant-tabs-ink-bar {
    display: none;
  }
`;

export const Search = styled(BaseButton)`
  background-color: var(--green);
  border-radius: 5px;
  color: #fff;
  height: 28px;
`;
