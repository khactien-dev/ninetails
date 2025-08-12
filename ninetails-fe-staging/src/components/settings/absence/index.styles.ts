import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRadio } from '@/components/common/base-radio';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { Calendar, Tag } from 'antd';
import styled, { keyframes } from 'styled-components';

interface ButtonProps {
  $isActive?: boolean;
  $isSuperAdmin: boolean;
  $isPrimary?: boolean;
}

export const SettingWrapper = styled.div`
  width: 100%;
  height: auto;
  display: block;
  flex-direction: row;
  position: relative;
  @media only screen and ${media.custom} {
    display: flex;
    flex-direction: row;
  }
`;

export const AdmContentWrap = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
  padding: 8px;
  background-color: #f6f6f9;

  @media only screen and ${media.lg} {
    padding: 30px 24px;
  }
`;

export const HeaderWrap = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TitlePage = styled.div`
  color: #222;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 34px;
`;

export const CalendarModeWrap = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  flex-direction: column;
  gap: 50px;
  justify-content: center;
  align-items: center;
  @media only screen and ${media.lg} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const SwitchMode = styled.div`
  display: flex;
  padding: 10px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 40px;
  border-radius: 8px;
  border: 1px solid var(--Primary, #57ba00);
  background: #fff;
  max-height: 72px;
  cursor: pointer;

  &:hover {
    background: var(--btn-bgr);
  }
`;
export const TabWrap = styled.div``;

export const Select = styled(BaseSelect)`
  width: 100%;
  margin-top: 8px;
  height: 33px;

  .ant-select-selector {
    border-radius: 4px !important;
  }

  .ant-select-selector .ant-select-selection-item {
    line-height: 18px;
  }

  .ant-select-item-option-selected {
    background: var(--primary-color) !important;
  }
`;

export const Radio = styled(BaseRadio.Button)`
  text-align: center;
  font-weight: 600;
  /* padding: 3px 16px !important; */
  min-width: 90px;
  /* height: 32px; */
  line-height: normal;
  border: 1px solid var(--Grey, #959291);

  &.ant-radio-button-wrapper.ant-radio-button-wrapper-checked {
    background: #57ba00;
    color: #ffffff;
    border: 1px solid var(--Grey, #57ba00);
  }
`;

export const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-radius: 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: var(--box-shadow);
  padding: 24px 30px 32px;
  margin-bottom: 36px;
  //height: 90%;
`;

export const ItemsSelect = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;
export const FlexWrap = styled.div<{ $gap?: string }>`
  display: flex;
  gap: ${(props) => props.$gap};
  height: fit-content;
  align-items: center;
`;

export const ButtonAdm = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  gap: 12px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  font-weight: 700;
  width: 80px;
  border: 2px solid
    ${(props) =>
      !props.$isActive
        ? 'transparent'
        : !props.$isPrimary
        ? 'var(--primary1-color)'
        : 'var(--btn-content)'};
  background-color: ${(props) =>
    !props.$isActive
      ? '#E5E5E5'
      : !props.$isPrimary
      ? 'var(--primary1-color)'
      : 'var(--btn-content)'};
  cursor: ${(props) => (!props.$isActive ? 'not-allowed' : 'pointer')};

  &:not(:disabled) {
    svg path {
      fill: ${(props) =>
        props.$isPrimary ? 'var(--white)' : props.$isActive ? 'var(--btn-content)' : '#767676'};
    }
  }

  &:disabled {
    cursor: not-allowed;
    color: #767676;
    svg path {
      fill: #767676;
    }
  }

  svg path {
    fill: ${(props) =>
      props.$isPrimary ? 'var(--white)' : props.$isActive ? 'var(--btn-content)' : '#767676'};
  }

  color: ${(props) =>
    props.$isPrimary ? 'var(--white)' : props.$isActive ? 'var(--btn-content)' : '#767676'};
`;

export const Tooltip = styled(BaseTooltip)`
  cursor: pointer;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const CalendarFullCell = styled(Calendar)`
  animation: ${fadeIn} 0.5s ease-in-out;

  .ant-picker-calendar.ant-picker-calendar-full .ant-picker-panel .ant-picker-body th {
    text-align: center;
  }

  .ant-picker-cell {
    max-height: 72px;
    width: 200px;
  }

  .ant-picker-calendar-date-today {
    background: #ffffff !important;

    .ant-picker-calendar-date-value {
      color: #222222 !important;
    }
  }

  .ant-picker-cell-selected {
    .ant-picker-calendar-date {
      background: #ffffff !important;
    }
  }

  .ant-picker-content > tbody > tr {
    td {
      height: 72px;

      .ant-picker-calendar-date {
        height: 72px;

        .ant-picker-calendar-date-content {
          height: 45px;
        }
      }
    }
  }

  .ant-picker-content > thead > tr {
    height: 36px;
  }

  .ant-picker-content > thead > tr > th {
    text-align: center;
    color: #555;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    border: 1px solid #d9d9d9;
  }

  .ant-picker-content > tbody > tr > td {
    border: 1px solid #d9d9d9;

    .ant-picker-calendar-date {
      border: none;
      margin: 0;
    }

    &.ant-picker-cell-selected {
      background: #ffffff !important;
    }

    .ant-picker-calendar-date-value {
      .ant-picker-calendar .ant-picker-cell-in-view {
        color: #555;
      }

      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
    }
  }

  .ant-picker-cell-selected {
    .ant-picker-cell-inner ant-picker-calendar-date {
      background: #ffffff !important;
    }
  }
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  background-color: transparent !important;
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

  .ant-table-thead th:hover::after {
    content: none !important;
  }

  .ant-table-column-has-actions .ant-tooltip {
    display: none !important;
  }

  .ant-table-expanded-row-level-1 {
    .ant-table-cell {
      padding: 0 !important;

      div {
        //width: 100%;
      }
    }
  }

  .ant-table-expanded-row-fixed {
    width: 100% !important;
  }
`;

export const Modal = styled(BaseModal)`
  .ant-modal-header {
    border: none;

    .ant-modal-title {
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }
  }
`;

export const TableContent = styled.div`
  display: flex;
  align-items: center;
  color: #383b40;
  line-height: 18px;
  gap: 12px;
  width: 100%;
  text-wrap: nowrap;
`;

export const RepairTag = styled.div`
  background: #f0f8ff;
  color: #0085f7;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  border-radius: 4px;
  width: fit-content;
  padding: 2px 8px;
  display: inline;
  margin-right: 8px;
`;

export const ColContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

export const TagLongTerm = styled.div`
  color: #f08d14;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  border-radius: 4px;
  background: #fffae7;
  width: 50px;
  height: 22px;
  text-align: center;
`;

export const BoxIconDropdown = styled.div`
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

export const AbsenceTag = styled.div<{ $isLongTerm: boolean; $padding?: string }>`
  display: flex;
  padding: ${(props) => (props.$padding ? props.$padding : '0px 4px')};
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--white);
  font-weight: 700;
  margin-top: 15px;
  background: ${(props) => (props.$isLongTerm ? '#ff2e92' : '#FCACEE')};
`;

export const CalendarTag = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

export const DatePickerWrap = styled(BaseDatePicker)`
  width: 100%;
`;

export const CheckableTag = styled(Tag.CheckableTag)<{ $isError: boolean }>`
  border: 1px solid ${(props) => (!props.$isError ? '#959291' : '#ff5252')};
  font-size: 12px;
  color: var(--text-dark-light-color);
  border-radius: 4px;
  padding: 1px 4px;
  font-weight: bold;
  align-items: center;
  display: flex;
  margin-inline-end: 0;
  height: 22px;
  background-color: var(--white);
  border: 1px solid var(--border-base-color);

  &.ant-tag-checkable-checked {
    color: var(--white);
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }
`;

export const DayList = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
  padding: 4px 16px;
  border: 1px solid var(--border-base-color);
  border-radius: 4px;
  margin-top: -10px;
  background-color: var(--white);
`;

export const SelectMultiple = styled(BaseSelect)`
  width: 100%;

  &.ant-select-selection-overflow {
    width: fit-content !important;
  }

  .ant-table-cell div {
    width: fit-content;
  }

  .ant-form-item-control-input-content {
    width: fit-content !important;
  }
`;

export const FormItem = styled(BaseFormItem)`
  &.ant-form-item {
    margin-bottom: 0;
  }

  .ant-select-arrow {
    top: 55%;
  }

  .ant-table-cell div {
    width: fit-content;
  }
`;

export const WrapRadioButton = styled(BaseRadio.Group)`
  .ant-radio-button-wrapper {
    height: 33px !important;
    line-height: 33px !important;
    padding: 0 2rem;
    font-weight: ${FONT_WEIGHT.semibold};
    color: var(--text-dark-light-color);
    font-size: ${FONT_SIZE.xs};

    &:first-child {
      border-start-start-radius: 4px;
      border-end-start-radius: 4px;
    }

    &:last-child {
      border-start-end-radius: 4px;
      border-end-end-radius: 4px;
    }
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .ant-radio-button {
    height: 33px !important;
  }
`;
