import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const TableWrapper = styled.div`
  .ant-table th.ant-table-selection-column {
    width: 5%;
  }

  .ant-table .ant-table-selection-col {
    width: 5%;
  }

  .ant-pagination-jump-next,
  .ant-pagination-jump-prev {
    min-height: auto !important;
    height: auto !important;
    min-width: auto !important;
  }
`;

export const Modal = styled(BaseModal)`
  .ant-modal-footer {
    padding: 0;
  }
`;

export const ModalFormItem = styled(BaseForm.Item)`
  .ant-input,
  .base-upload-input,
  .ant-select-single,
  .ant-select,
  .ant-form-item-control .ant-select-selector,
  .ant-picker {
    height: 50px !important;
  }
`;

export const WrapperButton = styled('div')`
  margin-top: 3rem;
`;

export const SubmitButton = styled(BaseButton)`
  width: 285px;
  border-radius: 8px;
`;

export const TableCellEllipsis = styled('div')`
  max-width: 300px;
`;

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

export const FlexCenter = styled.div`
  display: flex;
  justify-content: center;
`;
