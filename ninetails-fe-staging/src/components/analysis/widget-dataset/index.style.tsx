import { BaseButton } from '@/components/common/base-button';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

import { BaseTable } from '../../common/base-table';
import { ReloadIcon } from './reload-icon/reload-icon';

export const WidgetDataSetContainer = styled('div')`
  width: 100%;
`;

export const TextButton = styled('div')`
  text-align: center;
  color: #57ba00 !important;
`;
export const Reload = styled('div')`
  display: flex;
  width: auto;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid var(--border-base-color) !important;
  border-radius: 4px 4px 4px 4px;
  color: #57ba00 !important;
  font-weight: ${FONT_WEIGHT.regular};
  margin-left: 20px;
  margin-right: 10px;
  padding: 0 0.4rem;
`;

export const ReloadIconStyled = styled(ReloadIcon)``;

export const BoldRating = styled('div')`
  font-weight: ${FONT_WEIGHT.bold};
  width: auto;
  padding-top: 5px;
  padding-left: 10px;
  color: #57ba00 !important;
`;

export const TableContainer = styled.div`
  background-color: var(--white);
  width: 100%;
`;
export const CoreDataSetContainer = styled('div')`
  width: 100%;
`;

export const Table = styled(BaseTable)`
  width: 100%;

  td,
  span,
  tr,
  th {
    font-size: 16px !important;
  }

  th {
    font-weight: ${FONT_WEIGHT.medium} !important;
  }

  table {
    border-spacing: 0 1rem;
    width: 100%;
  }

  .ant-table-cell {
    text-align: center !important;
    border: none !important;
    &::before {
      content: unset !important;
    }
  }
  .ant-table-row-level-0 {
    td {
      border: 1px solid var(--border-base-color) !important;
      text-align: center;
    }

    td:first-child {
      border: none !important;
      padding: 0 !important;
      text-align: left !important;
      width: 35px;
    }

    td:nth-child(2) {
      border-radius: 8px 0 0 8px;
    }
    td:nth-child(3) {
      width: 200px;
    }

    td:last-child {
      border-radius: 0 8px 8px 0;
    }
    td:nth-child(n + 4) {
      background-color: #eef8e6 !important;
    }
  }
  .ant-table-cell-row-hover {
    background-color: white !important;
  }

  .ant-table-row-level-0:nth-child(n + 2) {
    td:nth-child(n + 4) {
      background: #fff4f9 !important;
    }
    td:nth-child(3) * {
      color: #ff2f91 !important;
    }
  }

  .ant-table-pagination-right {
    display: none;
  }
`;

export const BoxIconDelete = styled('div')`
  border: none !important;
  cursor: pointer;
`;

export const ColInfo = styled('div')`
  font-weight: ${FONT_WEIGHT.medium};
`;

export const InfoText = styled('div')`
  font-weight: ${FONT_WEIGHT.regular};
`;

export const InfoReload = styled('div')`
  display: flex;
  width: auto;
  /* justify-content: center; */
`;
export const SettingContainer = styled('div')``;
export const WrapDispatchAreaCell = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  align-items: center;
`;

export const Unit = styled('div')`
  color: rgba(217, 217, 217, 1) !important;
  width: 24px;
  text-align: right;
`;

export const WrapDispatchAreaCellOtherLayer = styled('div')`
  display: flex;
  justify-content: end;
  padding: 0 1rem;
`;
export const DispatchAreaCell = styled('span')<{ isBold: boolean }>`
  font-weight: ${(props) => (props.isBold ? FONT_WEIGHT.bold : FONT_WEIGHT.medium)};
  text-align: right;
`;
export const WrapTableHeader = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;
export const WrapTitle = styled('div')`
  align-items: center;
`;
export const SettingButton = styled.div<{ $disabled?: boolean }>`
  border: none;
  gap: 1rem;
  color: rgba(34, 34, 34, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;
export const SettingDivider = styled(BaseDivider)`
  margin: 0.6rem 0;
`;
export const ModalWrap = styled(BaseModal)`
  width: 100%;
`;
export const Container = styled.div``;

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
`;

export const GroupButton = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 0 8px;
  width: 100%;
  margin: auto;
`;

export const DownloadFileBtn = styled(BaseButton)`
  width: 150px;
  padding: 14px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: var(--Primary, #57ba00);
  color: #fff;
`;

export const CancelBtn = styled(BaseButton)`
  display: flex;
  width: 150px;
  padding: 14px 10px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--Light-Grey, #d9d9d9);
`;
export const SelectOption = styled(BaseSelect)`
  width: 100%;
  border-radius: 6px;
  height: 32px;
  width: 150px;
`;
export const WrapCoreDataSet = styled.div`
  transform-origin: top left;

  .wrap-tree-table {
    width: 1320px;
    .ant-table-wrapper {
      padding-left: 0 !important;
    }
    .questionare-icon {
      display: none;
    }
  }
`;
