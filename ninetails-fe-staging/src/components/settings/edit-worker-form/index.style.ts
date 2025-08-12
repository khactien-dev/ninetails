import { BaseButton } from '@/components/common/base-button';
import { DatePicker as CommonDatePicker } from '@/components/common/date-picker/index.styled';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  .ant-input {
    padding: 8px 11px;
  }

  .ant-input,
  .base-upload-input,
  .ant-form-item-control .ant-select-selector,
  .ant-picker,
  .ant-select {
    height: 40px;
  }

  .upload-pending-file-name,
  .upload-file-name,
  .upload-placeholder {
    font-size: ${FONT_SIZE.xs};
    max-width: 300px;
  }
`;

export const BtnSave = styled(BaseButton)`
  display: block;
  line-height: 32px;
  height: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.semibold};
  border-radius: 5px;
  background-color: var(--btn-content);
  border: 1px solid var(--btn-content);
  color: #fff;
  padding: 4px 52px;
`;

export const DatePicker = styled(CommonDatePicker)`
  width: 100%;
  .ant-picker-input input::placeholder {
    font-size: ${FONT_SIZE.md};
    color: #bec0c6;
  }
`;
export const FormItem = styled(BaseForm.Item)`
  .ant-input:disabled,
  .ant-picker-input > input[disabled],
  .ant-select-selector .ant-select-selection-item {
    color: var(--text-main-color);
  }
`;
export const FormCustom = styled(BaseFormItem)`
  width: 100%;
`;
export const FormItemCustom = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const BtnRedirect = styled(BaseButton)`
  position: absolute;
  margin-left: 80px;
  background: #57ba00;
  color: white;
  width: 75px;
  height: 25px;
  border-radius: 6px;
  font-size: 12px;
  &:hover {
    color: white !important;
  }
`;

export const InfoText = styled.p``;
