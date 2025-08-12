import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

import { BaseForm } from '../agency/index.style';

export const ColInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 8rem;
`;

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
  height: 50px;
  border-radius: 8px;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
`;

export const FormItem = styled(BaseFormItem)`
  .ant-select-arrow {
    top: 55%;
  }
`;
export const Input = styled.div`
  display: 'flex';
  flex-direction: 'column';
  gap: '8px';
`;

export const InfoText = styled.p``;

export const StatusWrap = styled.div<{ $isActive: boolean }>`
  text-align: center;
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  font-size: 14px;
  border-radius: 4px;
  font-weight: ${FONT_WEIGHT.bold};
  background-color: ${(props) =>
    props.$isActive ? 'var(--primary1-color)' : 'var(--light-gray-color)'};
  color: ${(props) => (props.$isActive ? 'var(--primary-color)' : 'var(--text-dark-color)')};
`;

export const Form = styled(BaseForm)`
  .ant-input,
  .base-upload-input,
  .ant-select-single,
  .ant-select,
  .ant-picker,
  .ant-form-item-control .ant-select-selector {
    height: 50px;
  }
`;
