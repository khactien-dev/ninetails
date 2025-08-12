import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseCol } from '@/components/common/base-col';
import { BaseRadio } from '@/components/common/base-radio';
import { BaseRow } from '@/components/common/base-row';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseTooltipParagraph } from '@/components/common/base-tooltip-paragaph';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const LeftMenu = styled(BaseForm)`
  color: var(--text);
`;
export const Wrapper = styled.div`
  padding: 0 30px 32px;
`;

export const Select = styled(BaseSelect)`
  width: 100%;
  height: 28px;
  margin-top: 39px;

  &.ant-select {
    .ant-select-selector {
      background-color: #eef8e6;
      border: none;

      .ant-select-selection-item {
        max-height: 100%;
        line-height: 100%;
        font-size: 12px;
        font-weight: ${FONT_WEIGHT.medium};
        color: var(--text-main-color) !important;
      }
    }
  }
`;

export const RankDate = styled(BaseDatePicker.RangePicker)`
  width: 100%;
  height: 28px;
  margin-top: 17px;
  background-color: #eef8e6;
  border: none;

  .ant-picker-input {
    input {
      color: var(--text-main-color);
      font-size: 12px;
      font-weight: ${FONT_WEIGHT.medium};
    }
  }
`;

export const Radio = styled(BaseRadio.Group)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .ant-radio-button-wrapper {
    border-radius: 4px !important;
    border: 1px solid #e5e5e5;
    background: var(--white);
    font-size: 14px;
    color: #767676;
    font-weight: 600;
    height: 30px;
    padding: 3px;
    width: 100%;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      display: none;
    }

    span:nth-child(2) {
      height: 100%;
      line-height: 21px;
    }
  }

  .ant-radio-button-wrapper-checked {
    border-color: var(--green) !important;
    color: var(--green) !important;
  }
`;
export const RadioButton = styled(BaseRadio.Button)``;

export const SearchBtn = styled(BaseButton)`
  height: 30px;
`;
export const Filter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0;
`;

export const Checkbox = styled(BaseCheckbox)`
  display: flex;
  align-items: center;
`;

export const Tooltip = styled(BaseTooltipParagraph)``;

export const Row = styled(BaseRow)``;
export const Col = styled(BaseCol)`
  color: var(--text);
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;

  svg {
    margin-right: 10px;
  }
`;
export const Div = styled.div`
  margin-top: 53px;
`;

export const Inline = styled.div`
  display: flex;
  align-items: center;
`;

export const InlineBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

export const DataColumn = styled.div`
  margin-top: 15px;

  .ant-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--primary1-color);
    border: solid 1px var(--white);
    color: var(--primary-color);
    padding: 8px;
  }
`;

export const Data = styled.div`
  margin-top: 15px;

  .ant-row {
    margin-bottom: 12px;

    &:hover {
      .ant-col {
        /* font-weight: 700; */

        svg {
          path {
            fill: var(--green);
          }
        }
      }
    }
  }

  .ant-col {
    text-align: right;
  }
`;

export const Head = styled.div`
  text-align: center;
  background-color: var(--green);
  color: var(--white);
  font-size: 14px;
  border-radius: 4px;
  padding: 8px 0;
`;

export const Head2 = styled.div`
  text-align: right;
  color: var(--green);
  font-size: 14px;
  border-radius: 4px;
  padding: 8px 0;
`;

export const Text = styled.div<{ $hoverable?: boolean }>`
  font-size: 14px;

  cursor: ${(props) => (props.$hoverable ? 'pointer' : 'alias')};

  &:hover {
    font-weight: ${(props) => (props.$hoverable ? FONT_WEIGHT.bold : FONT_WEIGHT.regular)};
  }
  span {
    font-weight: 700;
  }
`;

export const LargeText = styled.div`
  span {
    font-weight: ${FONT_WEIGHT.bold};
    font-size: ${FONT_SIZE.xl};
  }
`;

export const Tabs = styled(BaseTabs)`
  margin-top: 15px;

  .ant-tabs-nav-list {
    &::before {
      border-bottom: solid 1px #d0d0d0;
    }

    .ant-tabs-tab {
      min-width: 100px;
      justify-content: center;
      height: 34px;
      font-size: ${FONT_SIZE.xs};
      .ant-tabs-tab-btn {
        color: var(--text-main-color);
      }

      &.ant-tabs-tab-active {
        border-radius: 8px 8px 0px 0px;
        border-top: 1px solid #d0d0d0;
        border-right: 1px solid #d0d0d0;
        border-left: 1px solid #d0d0d0;
        .ant-tabs-tab-btn {
          color: var(--primary-color) !important;
          font-weight: ${FONT_WEIGHT.bold};
        }
      }
    }

    .ant-tabs-ink-bar {
      border-bottom: none;
      background: #fff;
    }
  }
`;
export const ListGrid = styled.div``;
export const ListDataGrid = styled.div`
  clear: both;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 6px;
  row-gap: 12px;
  margin-top: 16px;
`;
export const ListDataItem = styled.div`
  border-radius: 12px;
  border: 1px solid #c9c9c9;
  background: var(--white);
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.1);
  padding: 8px 13px;
  display: flex;
  justify-content: center;

  span {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--white);
    margin-right: 7px;
  }
`;
export const ListGridItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  float: left;

  &:last-of-type {
    margin-right: 0;
  }

  span {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    display: inline-block;
    margin-right: 4px;
  }
`;
