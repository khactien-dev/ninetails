import { BaseButton } from '@/components/common/base-button';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import styled from 'styled-components';

export const InputWrap = styled(BaseInput)`
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid '#d9d9d9' !important;
  height: 50px;

  &::placeholder {
    color: #d9d9d9;
  }
`;

export const FormItem = styled(BaseFormItem)``;

export const ModalExportContent = styled.div`
  width: 100%;
  margin-top: 25px;
`;

export const GroupButton = styled.div`
  display: flex;
  margin-top: 2rem;
  padding: 0 8px;
  justify-content: center;
  gap: 1rem;
`;

export const Button = styled(BaseButton)`
  width: 150px;
`;

export const CancelButton = styled(BaseButton)`
  border-color: var(--primary-color) !important;
  width: 150px;
  color: var(--primary-color) !important;
`;
