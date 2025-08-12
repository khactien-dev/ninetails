import { BaseButton } from '@/components/common/base-button';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_WEIGHT, media } from '@/constants';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import styled, { css } from 'styled-components';

export const CustomLeftContent = styled(LeftContent)`
  &.ant-layout-sider {
    @media only screen and ${media.xl} {
      position: absolute;
    }
  }
`;
export const IllegalLeft = styled.div`
  padding: 30px 20px;
  text-align: left;
  color: #555;
  @media only screen and ${media.custom} {
    padding: 30px 39px 30px;
  }
`;

export const TimeSelect = styled(BaseSelect)`
  height: 28px;
  .ant-select-selector {
    border: none !important;
  }

  .ant-select-arrow {
    inset-inline-end: 5px;
  }

  .anticon {
    color: gray;
  }

  .ant-select-dropdown {
    width: 120%;
  }
  .ant-select-arrow {
    top: 68%;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid gray;
    svg {
      display: none;
    }
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  color: #222;
  z-index: 1;
  position: fixed;
  top: 80px;
  right: 3px;
  border-radius: 3px;
  border: 1px solid #a0a0a0;
  background: #fff;
  padding: 3px;
  .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-in-range {
    color: white;
  }

  @media only screen and ${media.sm} {
    gap: 8px;
    padding: 6px 8px;
    top: 100px;
    right: 20px;
  }
`;

export const LastUpdate = styled.div<{ open?: boolean }>`
  align-items: center;
  font-size: 12px;
  font-weight: ${FONT_WEIGHT.regular};
  display: flex;
  @media screen and (min-width: 400px) {
    font-size: 13px;
  }

  span {
    font-weight: ${FONT_WEIGHT.medium};
    margin-right: 8px;
    display: none;
    @media screen and (min-width: 400px) {
      display: block;
    }
  }

  svg {
    margin-right: 4px;
  }
`;

export const Form = styled(BaseForm)<{ open?: boolean }>`
  display: ${(props) => (props.open ? 'block' : 'none')};
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-control-input {
    min-height: auto;
  }
  .ant-select-selector {
    height: 28px !important;
    width: 65px !important;
    display: flex;
    align-items: center;
    justify-content: start;
    border-radius: 5px !important;
    background: #f4f5f6 !important;
    padding: 0 5px !important;
    .ant-select-selection-item {
      line-height: 28px;
      font-size: 12px;
      font-weight: 500;
    }
  }
  .ant-select-arrow {
    svg {
      width: 10px;
    }
  }
`;

export const Reload = styled(BaseButton)<{ $open?: boolean; $active: boolean }>`
  border: 1px solid !important;
  border-color: #d0d0d0 !important;
  border-radius: 5px !important;
  height: 28px;
  width: 28px;
  padding: 0 !important;
  gap: 0;
  display: flex;
  flex-basis: auto;
  align-items: center;
  justify-content: center;
  background: #f4f5f6;
  display: flex;

  &:hover {
    border-color: var(--primary-color) !important;
    svg {
      path {
        fill: var(--primary-color) !important;
      }
    }
  }
  svg {
  }
`;

export const Calendar = styled(BaseDatePicker.RangePicker)`
  opacity: 0;
  height: 28px;
  margin-right: 8px;
  .ant-picker-input {
    input {
      font-size: 13px;
    }
  }
`;

export const Date = styled(BaseDatePicker)<{ $active?: boolean }>`
  box-shadow: none !important;
  padding: 0;
  display: flex;
  flex-basis: auto;
  align-items: center;
  justify-content: center;
  background: #f4f5f6;
  border: 1px solid !important;
  border-radius: 5px !important;
  height: 28px;
  width: 28px;
  cursor: pointer;
  ${({ $active }) =>
    $active
      ? css`
          border-color: var(--primary-color) !important;
          svg {
            path {
              fill: var(--primary-color);
            }
          }
        `
      : css`
          border-color: #d0d0d0 !important;
          svg {
            path {
              fill: #d0d0d0;
            }
          }
        `}
  .ant-picker-suffix {
    margin-inline-start: 0;
  }

  .ant-picker-input {
    justify-content: center;
    input {
      display: none;
    }
  }

  .ant-picker-clear {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    border-radius: 50%;
  }
`;

export const Setting = styled(BaseButton)<{ open?: boolean }>`
  border: none;
  border-radius: 5px !important;
  height: 28px;
  width: 28px;
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f5f6;
  svg {
    transform: ${(props) => (props.open ? 'rotate(-90deg)' : 'rotate(90deg)')};
  }
`;

export const FormFilter = styled(BaseForm)`
  .ant-form-item {
    margin-bottom: 12px;
    .ant-form-item-control-input {
      min-height: auto;
      .ant-select {
        width: 100%;
        height: auto;
        .ant-select-selector {
          height: 28px !important;
          display: flex;
          align-items: center;
          justify-content: start;
          border: 1px solid transparent !important;
          border-radius: 4px !important;
          background: #f2f5f2 !important;
          padding: 0 12px !important;
          .ant-select-selection-item {
            font-size: 12px;
            line-height: 28px;
            font-weight: ${FONT_WEIGHT.medium};
          }
          .ant-select-selection-placeholder {
            font-size: 12px;
            line-height: 28px;
            font-weight: ${FONT_WEIGHT.medium};
          }
          .ant-select-dropdown {
            .ant-select-item-option-content {
              font-size: 12px;
              line-height: 28px;
              font-weight: ${FONT_WEIGHT.medium};
            }
          }
        }
        .ant-select-arrow {
          position: absolute;
          top: 12px;
          right: 20px;
          margin: 0;
          z-index: 1;
          .anticon {
            width: 10px;
            height: 10px;
          }
        }
      }
      .ant-picker {
        margin-bottom: 0;
        padding: 0 12px;
        input {
          font-size: 12px;
          line-height: 28px;
          font-weight: ${FONT_WEIGHT.medium};
        }
      }
    }
  }

  /* .ant-select-disabled {
    opacity: 0.5 !important;
    color: #777 !important;
    background: red !important;
  } */
`;

export const GroupButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 5px;
  padding-top: 6px;
  .ant-tabs {
    flex: 1;
    .ant-tabs-nav {
      &:before {
        border-bottom: none;
      }
      .ant-tabs-nav-wrap {
        width: 100%;
        .ant-tabs-nav-list {
          width: 100%;
          gap: 5px;
          .ant-tabs-tab {
            margin: 0 !important;
            width: 100%;
            height: 30px;
            line-height: 30px;
            &:hover {
              color: var(--green);
            }
            .ant-tabs-tab-btn {
              margin: auto;
              font-size: 14px;
              line-height: 17px;
              font-weight: ${FONT_WEIGHT.medium};
            }
          }
        }
      }
    }
  }
  .ant-btn {
    font-size: 14px;
    padding-left: 8px;
    padding-right: 8px;
    width: 68px;
    height: 30px;
    border: none;
    &:hover {
      color: #fff !important;
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

export const Button = styled(BaseButton)<{ $actived?: boolean }>`
  width: 100% !important;
  height: 28px;
  line-height: 26px;
  border: 1px solid ${({ $actived = false }) => ($actived ? 'var(--primary-color)' : '#e0e0e0')} !important;
  text-align: center;
  color: #999;
  border-radius: 5px;
  padding: 0 15px;
  margin: 0 1px !important;
  &:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color) !important;
  }
`;

export const Search = styled(BaseButton)`
  width: 100% !important;
  background-color: var(--green);
  border-radius: 5px;
  color: #fff;
  height: 28px;
  &:focus,
  &:active {
    color: #fff !important;
  }
`;

export const CalendarLeft = styled(BaseDatePicker.RangePicker)`
  box-shadow: none !important;
  margin-bottom: 12px;
  width: 100%;
  padding: 0 5px;
  display: flex;
  flex-basis: auto;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent !important;
  border-radius: 4px !important;
  background: #f2f5f2 !important;
  margin-right: 8px;
  height: 28px;
  cursor: pointer;

  .ant-picker-suffix {
    margin-inline-start: 0;
  }

  .ant-picker-clear {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    border-radius: 50%;
  }
`;

export const CollectTime = styled.div`
  margin: 0 0 36px;
`;

export const CollectTimeTitle = styled.div`
  font-weight: ${FONT_WEIGHT.semibold};
  color: #222;
  font-size: 17px;
  margin: 32px 0 28px;
`;

export const CollectTimeContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 7px;
  row-gap: 12px;
`;

export const CollectTimeContentItem = styled.div`
  width: calc((100% - 14px) / 3);
  border-radius: 10px;
  border: 1px solid #d6d7de;
  padding: 10px 3px 8px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.1);
`;

export const CollectTimeContentItemTitle = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.regular};
  color: #555;
  line-height: 20px;
`;

export const CollectTimeContentItemValue = styled.div`
  text-align: center;
  font-size: 15px;
  font-weight: ${FONT_WEIGHT.medium};
  color: #222;
  line-height: 21px;
  span {
    font-weight: ${FONT_WEIGHT.bold};
  }
`;

export const Case = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 7px;
  row-gap: 12px;
  margin: 28px 0 0;
`;

export const CaseItem = styled.div`
  width: calc(50% - 4px);
  border-radius: 10px;
  border: 1px solid #d6d7de;
  padding: 10px 3px 8px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const CaseItemStt = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  top: 9px;
  left: 9px;
  font-size: 11px;
  text-align: center;
  background: #fff;
  border: 1px solid #999;
  color: #555;
  line-height: 19px;
`;

export const CaseItemTitle = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.regular};
  color: #555;
  line-height: 20px;
  padding: 0 30px;
`;

export const CaseItemValue = styled.div`
  text-align: center;
  font-size: 15px;
  font-weight: ${FONT_WEIGHT.medium};
  color: #222;
  line-height: 21px;
  span {
    font-weight: ${FONT_WEIGHT.bold};
  }
`;
