import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { InputPassword } from '@/components/common/inputs/password-input/index.styles';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
  @media only screen and ${media.xxl} {
    padding-left: 80px;
    padding-right: 80px;
  }
  height: auto;
  overflow: visible;
`;

export const FormItem = styled(BaseFormItem)``;

export const StyledInputPassword = styled(InputPassword)``;

export const StyledSelect = styled(BaseSelect)``;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
  .ant-picker-input input::placeholder {
    font-size: ${FONT_SIZE.md};
    color: #bec0c6;
  }
`;

export const ActionBtn = styled(BaseButton)`
  margin-top: 15px;
  color: white !important;
  font-weight: 600;
  min-width: 120px;
  margin-right: 15px;
  margin-left: 15px;
  font-weight: ${FONT_WEIGHT.semibold};
  height: 40px;
  &.ant-btn-background-ghost {
    color: var(--primary-color) !important;
  }
`;
