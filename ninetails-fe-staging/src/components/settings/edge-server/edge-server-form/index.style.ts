import { BaseButton } from '@/components/common/base-button';
import { InputPassword } from '@/components/common/inputs/password-input/index.styles';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Input } from 'antd';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  .ant-input {
    padding: 8px 11px !important;
  }
  label::before {
    position: absolute;
    right: -0.25rem;
  }
  .ant-input:disabled {
    color: var(--text-main-color);
  }

  .ant-select-single {
    height: 40px;
  }

  .ant-select-selection-item {
    color: var(--text-main-color);
  }
`;

export const StyledInput = styled(Input)`
  height: 40px;
`;

export const StyledInputPassword = styled(InputPassword)`
  height: 40px;
  padding: 8px;
  background-color: var(--disabled-bg-color);
  border-color: #bec0c6 !important;
  input {
    caret-color: transparent;
    cursor: not-allowed;
    background-color: var(--disabled-bg-color);
  }

  #password {
    padding: 0px !important;
  }
`;

export const StyledMacAddress = styled(InputPassword)`
  height: 40px;
  padding: 8px;
`;

export const StyledSelect = styled(BaseSelect)`
  height: 40px;

  .ant-select-selector {
    height: 40px !important;
  }

  .ant-select-selection-item {
    line-height: 40px !important;
  }
`;

export const BtnSave = styled(BaseButton)`
  color: #fff;
  font-size: ${FONT_SIZE.xs} !important;
  font-weight: ${FONT_WEIGHT.bold} !important;
  width: 120px;
  height: 33px;
`;
