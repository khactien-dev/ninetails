import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE } from '@/constants';
import Link from 'next/link';
import styled from 'styled-components';

export const WrapperButton = styled.div`
  display: flex;
  justify-content: center;
`;

export const SubmitButton = styled(BaseButton)`
  width: 140px;
  margin-top: 2rem;
  background: #0085f7;
  border-color: #0085f7;
  color: var(--white) !important;
`;

export const ApprovedText = styled.div`
  color: #2fca8f;
  padding: 4px 8px;
  background-color: #e5f9f2;
  font-weight: 500;
`;

export const ButtonRenew = styled(BaseButton)`
  background: #0085f7;
  border-color: #0085f7 !important;
  font-size: 13px;
  padding: 8px;
  border-radius: 0px;
  height: auto;
  width: 80px;
  height: 33px;
  * {
    color: var(--white);
  }
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
export const FileLink = styled(Link)`
  color: #0085f7 !important;
`;

export const Modal = styled(BaseModal)`
  .ant-modal-content {
    .ant-modal-header {
      .ant-modal-title {
        color: #383b40;
        text-align: center;
        font-size: 24px;
        font-weight: 700;
      }
    }
  }
`;

export const ModalFormItem = styled(BaseFormItem)``;

export const ModalInput = styled(BaseInput)`
  &:disabled {
    color: #383b40 !important;
    font-size: 14px;
    font-weight: 400;
  }
`;

export const WrapNote = styled.div`
  color: #555555;
  ul {
    margin-top: 0.4rem;
  }
  li {
    font-size: ${FONT_SIZE.xs};
  }
`;
