import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;

  .ant-input {
    padding: 8px 11px;
  }

  .ant-select-selection-item {
    color: var(--text-main-color);
  }
`;

export const BtnSave = styled(BaseButton)`
  line-height: 32px;
  height: 42px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  padding: 4px 52px;
`;

export const Input = styled(BaseInput)`
  width: 100%;
  height: 40px;
`;

export const Select = styled(BaseSelect)`
  width: 100%;
  height: 40px;
  width: 100%;

  .ant-select-item-option-selected {
    background: var(--primary-color) !important;
  }
`;

export const FormItems = styled(BaseFormItem)`
  .ant-form-item-label {
    padding-bottom: 2px;
    line-height: normal;
  }
`;

export const DatePickerWrap = styled(BaseDatePicker)`
  width: 100%;
  height: 40px;
`;

export const SelectMultiple = styled(BaseSelect)`
  width: 100%;
  height: 40px;
  font-size: 12px;
  background-color: var(--white) !important;

  .ant-select-selector {
    padding: 0;
  }

  .ant-select-selection-item {
    max-height: 22px;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .ant-select-selection-item {
    margin: 0px;
  }
`;

export const DayFormItem = styled(FormItems)`
  margin-bottom: 0.2rem;
`;

export const MultipleSelectFormItem = styled(FormItems)`
  height: 40px !important;
`;
