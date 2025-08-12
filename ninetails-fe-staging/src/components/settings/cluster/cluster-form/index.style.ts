import { InputPassword } from '@/components/common/inputs/password-input/index.styles';
import { BaseSelect } from '@/components/common/selects/base-select';
import { Input } from 'antd';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  padding-left: 80px;
  padding-right: 80px;
  .ant-input {
    padding: 8px 11px !important;
  }
`;

export const StyledInput = styled(Input)`
  height: 34px;
`;

export const StyledInputPassword = styled(InputPassword)`
  height: 34px;
  padding: 8px;

  #password {
    padding: 0px !important;
  }
`;

export const StyledSelect = styled(BaseSelect)`
  height: 34px;

  .ant-select-selector {
    height: 34px !important;
  }

  .ant-select-selection-item {
    line-height: 34px !important;
  }
`;

export const BtnSave = styled.div`
  display: block;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  background-color: var(--btn-content);
  border: 1px solid var(--btn-content);
  color: #fff !important;
  padding: 4px 52px;
  cursor: pointer;
`;
