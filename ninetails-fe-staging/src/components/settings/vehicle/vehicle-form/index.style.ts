import { BaseButton } from '@/components/common/base-button';
import { DatePicker as CommonDatePicker } from '@/components/common/date-picker/index.styled';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;

  .ant-input,
  .base-upload-input,
  .ant-select-single,
  .ant-select,
  .ant-form-item-control .ant-select-selector,
  .ant-picker {
    height: 40px;
  }

  .ant-input:disabled,
  .ant-picker-input > input[disabled],
  .ant-select-selector .ant-select-selection-item {
    color: var(--text-main-color);
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

export const FormItem = styled(BaseFormItem)``;
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
  border-radius: 4px !important;
  border-radius: 4px;
  font-size: 12px;
  border-radius: 8px !important;
`;
export const FormCustom = styled(BaseFormItem)`
  width: 100%;
`;

export const InfoText = styled.p``;
