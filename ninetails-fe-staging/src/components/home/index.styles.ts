import { BaseInput as CommonInput } from '@/components/common/inputs/base-input';
import styled from 'styled-components';

import { BaseForm } from '../common/forms/base-form';

export const Wrapper = styled.div``;

export const FormItem = styled(BaseForm.Item)`
  & .ant-form-item-control-input {
    min-height: auto !important;
  }
`;

export const Input = styled(CommonInput)`
  display: block;
  width: 100%;
  height: 34px;
  border-radius: 5px;
  border: 1px solid #d0d0d0;
  background: #fff;
  color: #222;
  font-size: 14px;
  font-weight: 400;
  line-height: 32px;
  padding: 0 13px;
  text-align: left;
  &:focus {
    outline: none !important;
    border: 1px solid var(--primary-color) !important;
  }
  &:hover {
    outline: none !important;
    border: 1px solid var(--primary-color) !important;
  }
`;
