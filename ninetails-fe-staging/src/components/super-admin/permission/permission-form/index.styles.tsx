import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background: rgba(244, 244, 244, 1);

  input {
    &:focus-within {
      border-color: #0085f7;
    }
  }
`;

export const BtnSave = styled.div`
  display: block;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  background-color: #0085f7;
  border: 1px solid #0085f7;
  color: #fff !important;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
  height: 33px;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const BtnDelete = styled(BaseButton)`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  width: 80px;
  height: 33px;
  background: #ffe2e2;
  margin-top: 30px;
  border-color: var(--error-color) !important;
  color: var(--error-color) !important;
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const TableContent = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4rem;

  .base-table-setting-container {
    padding: 0px !important;
  }

  .ant-table {
    background-color: rgba(244, 244, 244, 1) !important;
  }

  .ant-table-thead {
    *:first-child {
      text-align: left !important;
    }
    .ant-table-cell {
      text-align: center;
    }
  }
  .ant-table-cell {
    border: none !important;
    border-right: none !important;
    background-color: rgba(244, 244, 244, 1) !important;
    &::before {
      content: unset !important;
    }
  }

  .ant-table-row-level-0 {
    td:nth-child(1) {
      width: 200px !important;
    }
    td:nth-child(2) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(3) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(4) {
      width: 60px !important;

      text-align: center !important;
    }
    td:nth-child(5) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(6) {
      width: 60px !important;
      text-align: center !important;
    }
  }

  .ant-table-container::after {
    content: none !important;
  }
`;

export const InfoText = styled.p``;

export const Checkbox = styled(BaseCheckbox)`
  align-items: center;
  .ant-checkbox-inner {
    width: 20px;
    height: 20px;
    border-radius: 4px !important;
    border: 1px solid #bec0c6;
  }
`;

export const TableFormContent = styled.div`
  padding-top: 10px;
  margin: 0 2rem;
`;

export const FormContent = styled.div``;

export const ContentTop = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Input = styled(BaseInput)`
  width: 302px;
  height: 33px;
`;
