import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
`;

export const FormItem = styled(BaseFormItem)``;

export const ButtonOpLogin = styled(BaseButton)`
  background: #0085f7;
  font-size: 13px;
  border-radius: 0px;
  height: auto;
  font-weight: ${FONT_WEIGHT.medium};
  * {
    color: var(--white);
  }
  height: 33px;
`;

export const BtnRole = styled(BaseButton)`
  background: #e9934d;
  border-color: #e9934d !important;
  font-size: 13px;
  border-radius: 0px;
  height: auto;
  font-weight: ${FONT_WEIGHT.medium};
  * {
    color: var(--white);
  }
  height: 33px;
`;

export const BtnContent = styled.div`
  display: flex;
  gap: 10px;
`;

export const WrapPaginationTable = styled.div`
  a {
    &:hover {
      color: #0085f7 !important;
    }
  }

  .ant-pagination-item-active {
    background-color: #0085f7 !important;
    a {
      &:hover {
        color: var(--white) !important;
      }
    }
  }

  .ant-pagination-jump-next,
  .ant-pagination-jump-prev {
    min-height: auto !important;
    height: auto !important;
    min-width: auto !important;
  }

  .ant-pagination-item-link-icon {
    color: #0085f7 !important;
  }
`;
