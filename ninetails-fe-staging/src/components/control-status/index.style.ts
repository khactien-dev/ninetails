import { BaseButton } from '@/components/common/base-button';
import { BaseCollapse } from '@/components/common/base-collapse/base-collapse';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_WEIGHT, media } from '@/constants';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import styled, { css } from 'styled-components';

import { BaseModal } from '../common/base-modal/BaseModal';
import { BaseDatePicker } from '../common/date-picker';

export const Live = styled(BaseButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-transform: uppercase;
  font-size: 14px !important;
  font-weight: 700;
  border-radius: 6px;
  color: #ff2929;
  border: 2px solid #ff2929;
  &.ant-btn.ant-btn-sm {
    height: 28px;
    line-height: 24px;
  }
`;

export const DateTitle = styled.div`
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
  margin-top: 12px;
`;

export const MapExport = styled.div`
  width: 100%;
  height: 662px;
`;

export const ExportModal = styled(BaseModal)`
  margin-top: 5px;
  margin-bottom: 5px;
  .ant-modal-footer {
    padding: 1.5rem;
  }
`;

export const Space = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

export const ExportScoreLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const CustomLeftContent = styled(LeftContent)`
  &.ant-layout-sider {
    @media only screen and ${media.xl} {
      position: absolute;
    }
  }
`;
export const ControlStatusLeft = styled.div`
  padding: 10px;
  text-align: left;
  @media only screen and ${media.lg} {
    padding: 30px 20px;
  }
  @media only screen and ${media.custom} {
    padding: 30px 39px 30px;
  }
`;

export const Condition = styled.div``;

export const WrapTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .ant-tooltip-inner {
    background-color: var(--primary-color);
    font-size: 14px;
    min-height: auto;
    padding: 0.65rem;
  }

  .ant-tooltip-arrow {
    &::before {
      background-color: var(--primary-color);
    }
  }
`;

export const Title = styled.div<{ open?: boolean }>`
  color: var(--text);
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
  display: inline-block;
  padding-right: 34px;
  cursor: pointer;
  position: relative;
  margin-right: auto;

  &:after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    width: 20px;
    height: 20px;
    z-index: 1;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    transform: translateY(-50%);
  }
  &:before {
    content: '';
    position: absolute;
    right: 7px;
    padding: 3.5px;
    z-index: 1;
    border-top: 1.5px solid #959291;
    border-right: 1.5px solid #959291;
    transform: ${(props) => (props.open ? 'rotate(-45deg)' : 'rotate(135deg)')};
    top: ${(props) => (props.open ? '13px' : '9px')};
  }
`;

export const Content = styled.div<{ open?: boolean }>`
  display: ${(props) => (props.open ? 'block' : 'none')};
  .ant-collapse {
    background-color: transparent;
    border: none;
    border-radius: 0px;
    margin: 12px 0 20px;
    .ant-collapse-item {
      border-bottom: none;
      .ant-collapse-header {
        padding: 8px;
        .ant-collapse-expand-icon {
          margin: 0;
          padding: 0;
          width: 9px;
          position: relative;

          svg {
            display: none;
          }
        }
        .ant-collapse-header-text {
          padding-right: 2px;
        }
      }
      .ant-collapse-content {
        border: none;
        background: #f2f5f2;
        border-radius: 8px;

        .ant-collapse-content-box {
          padding: 0;
        }
      }
      .collapse-icon {
        &:before {
          content: '';
          position: absolute;
          right: 0;
          padding: 3.5px;
          z-index: 1;
          border-top: 1.75px solid #7a7c7f;
          border-right: 1.75px solid #7a7c7f;
          top: 15px;
          transform: rotate(135deg);
        }
      }
    }
    .ant-collapse-item.ant-collapse-item-active {
      .collapse-icon {
        &:before {
          transform: rotate(-45deg);
          top: 19px;
        }
      }
    }
  }
`;

export const Collapse = styled(BaseCollapse)``;

export const CarStatus = styled.div`
  line-height: 28px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 8px;
  }
  span {
    font-size: 14px;
    font-weight: 700;
  }
`;

export const CarStatusTitle = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  span {
    margin-left: 8px;
  }

  .ant-tooltip-inner {
    background-color: var(--primary-color);
    font-size: 14px;
    min-height: auto;
    padding: 0.65rem;
  }

  .ant-tooltip-arrow {
    &::before {
      background-color: var(--primary-color);
    }
  }
`;

export const Operation = styled.div`
  color: var(--text);
`;

export const OperationTable = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
`;

export const OperationLeft = styled.div`
  flex: 0 0 62%;
  > div:nth-child(1) {
    > div:nth-child(2) {
      > div {
        padding-right: 8px;
      }
    }
  }
  > div:nth-child(2) {
    > div:nth-child(2) {
      > div {
        font-weight: 700;
      }
    }
  }
`;

export const OperationTableColums = styled.div`
  width: 50%;
  float: left;
  text-align: right;
  font-size: 12px;
  font-weight: 400;
`;

export const OperationTableColumsTitle = styled.div`
  font-weight: 700;
  height: 31px;
  line-height: 31px;
`;

export const OperationTableColumsButton = styled(BaseButton)<{ open?: boolean }>`
  height: 31px;
  padding: 0 8px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
  width: 100%;
  background: ${(props) => (props.open ? '#c9c9c9' : 'var(--green)')};
  span {
    color: #fff !important;
  }
`;

export const OperationTableColumsContent = styled.div``;

export const OperationTableColumsItem = styled.div`
  margin: 8px 0;
`;

export const OperationRight = styled.div`
  flex: 0 0 38%;
`;

export const OperationAverage = styled.div<{ open?: boolean }>`
  text-align: right;
  font-size: 12px;
  font-weight: 400;
  height: 100%;
  flex-direction: column;
  padding-left: 12px;
  display: ${(props) => (props.open ? 'flex' : 'none')};
`;

export const OperationAverageTitle = styled.div`
  height: 31px;
  line-height: 31px;
  span {
    margin-left: 8px;
  }
`;

export const OperationAverageContent = styled.div`
  height: 100%;
  position: relative;
  border-radius: 12px;
  background: rgba(255, 46, 145, 0.05);
`;

export const OperationAverageContentValue = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: #ff2e91 !important;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: center;
`;

export const OperationAverageData = styled.div<{ open?: boolean }>`
  display: ${(props) => (props.open ? 'none' : 'block')};
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

export const Select = styled(BaseSelect)<{ $isExport?: boolean }>`
  width: 100%;
  .ant-select-selector {
    height: 28px !important;
    padding: 0 14px !important;
    margin-top: 15px;
    margin-bottom: 12px;
    background-color: #f9f9f9 !important;
    border: none !important;
    line-height: 28px;
    box-shadow: none;
    outline: none;
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    .ant-select-selection-item {
      line-height: 28px;
    }
  }
  .ant-select-arrow {
    margin-top: -2px;
  }

  /* .ant-select-item-option-content {
    color: white;
  } */
`;

export const Eco = styled.div`
  width: 100%;
  margin-top: 2rem;
`;

export const EcoTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Tooltip = styled(BaseTooltip)`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  text-align: center;
  line-height: 18px;
  background: #777;
  color: #fff !important;
  font-weight: 400 !important;
  font-size: 11px !important;
  display: inline-block;
  cursor: pointer;
`;

export const EcoTitleValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: 34px;
  color: var(--text);
`;

export const StatusDetail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 14px 0 0;
`;

export const StatusDetailItem = styled.div`
  display: block;
  width: calc((100% - 20px) / 3);
  background: #fff;
  border-radius: 12px;
  color: var(--text);
  border: 1px solid #c9c9c9;
  padding: 8px;
  box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.12);
  position: relative;
  &:nth-last-child(-n + 2) {
    background-color: #999;
    color: white;
  }
  &:last-child {
    background-color: #333;
  }
`;

export const StatusDetailItemTitle = styled.div`
  display: block;
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  margin-bottom: 8px;
`;

export const StatusDetailItemValue = styled.div`
  text-align: center;
  span {
    font-weight: 700;
  }
`;

export const FlexCenter = styled.div<{ $isExport?: boolean }>`
  display: flex;
  gap: 5px;
  align-items: center;
  color: #222;
  z-index: 1;
  position: absolute;
  top: 5px;
  right: 3px;
  border-radius: 3px;
  border: 1px solid #a0a0a0;
  background: #fff;
  padding: 3px;
  .ant-picker-dropdown .ant-picker-cell-in-view.ant-picker-cell-in-range {
    color: white;
  }

  @media only screen and ${media.custom} {
    gap: 8px;
    padding: 6px 8px;
    top: ${(props) => (props.$isExport ? '12px' : '30px')};
    right: ${(props) => (props.$isExport ? '10px' : '20px')};
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
  display: ${(props) => (props.$open ? 'flex' : 'none')};
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
          border-color: #d0d0d0; !important;
          svg {
            path {
              fill: #d0d0d0;
            }
          }
        `}
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

export const InfoBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  margin-bottom: 2rem;
  color: var(--text);

  .flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h3 {
    display: flex;
    gap: 5px;
    align-items: center;
  }
`;

export const Sumary = styled.div`
  p {
    color: var(--text);
    span {
      display: inline-block;
      min-width: 100px;

      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      text-align: right;
    }
    strong {
      display: inline-block;
      min-width: 60px;
      margin-left: 4px;
      font-size: 14px;
      font-weight: 700;
      line-height: 22px;
    }
  }
`;
