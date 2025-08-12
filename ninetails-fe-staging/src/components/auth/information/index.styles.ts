import { BaseButton } from '@/components/common/base-button';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseForm } from '@/components/common/forms/base-form';
import { BASE_COLORS, FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 20px 30px;
  @media only screen and ${media.xl} {
    padding: 72px 30px;
  }
`;

export const TablesWrapper = styled(BaseRow)`
  /* overflow-y: hidden !important;
  //height: 100%;

  flex-direction: column;
  @media only screen and ${media.xl} {
    flex-direction: row;
  } */
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

export const Text = styled.div`
  color: #404040;
  text-align: center;
  span {
    color: ${BASE_COLORS.green};
    font-weight: ${FONT_WEIGHT.bold};
  }
`;

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
  padding: 1rem;
  overflow-y: auto;
  @media only screen and ${media.xl} {
    padding: 3rem;
  }
`;

export const Col = styled(BaseCol)``;

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
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  margin: 24px 0 0;
  background-color: none !important;
  overflow-x: auto;

  .ant-checkbox-wrapper .ant-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 2px;
  }
  .ant-checkbox .ant-checkbox-inner {
    width: 20px;
    height: 20px;
  }

  .ant-table-tbody > tr {
    color: #555;
    font-size: 14px;
  }
  .ant-table-tbody > tr > td {
    background: none !important;
  }

  .ant-table-thead > tr > th {
    background: none !important;
    color: #555;
    padding: 16px 16px !important;
  }
  .ant-table-thead > tr > td {
    background: none !important;
  }

  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: none !important;
  }

  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: none !important;
  }

  .ant-table-tbody > tr > td {
    padding: 16px 16px !important;
  }

  .ant-select-selector {
    height: 50px !important;
  }

  .ant-table {
    background: none !important;
  }

  .ant-table-column-sorters {
    display: flex;
    align-items: center;
    justify-content: start;

    &::after {
      display: none;
    }
  }

  .ant-table-column-has-sorters {
    &::before {
      display: none;
    }
  }

  .ant-table-column-title {
    max-width: fit-content;
  }

  .ant-btn {
    color: #555;
  }
  .ant-table-thead th:hover::after {
    content: none !important;
  }
  .ant-table-column-has-actions .ant-tooltip {
    display: none !important;
  }

  .ant-table-expanded-row-level-1 {
    .ant-table-cell {
      padding: 0 !important;
    }
  }
`;
