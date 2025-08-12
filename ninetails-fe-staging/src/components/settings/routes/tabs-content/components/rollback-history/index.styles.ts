import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import styled from 'styled-components';

export const Modal = styled(BaseModal)`
  .ant-modal-body {
    height: 500px;
    overflow-y: scroll;
    > div > div {
      > div {
        border: none;
        box-shadow: none;
      }
    }
  }
  .ant-modal-footer {
    padding-bottom: 24px;
  }
`;

export const Confirm = styled(BaseButton)`
  margin: 5px auto;
  min-width: 150px;
  height: 36px;

  svg {
    width: 12px;
    margin-left: 5px;
  }
`;

export const BoxIconDropdown = styled.div`
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

export const ColInfo = styled.div`
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BoxTitle = styled.div`
  display: block;
  float: left;
  height: 34px;
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  background-color: transparent !important;
  overflow-x: auto;

  .ant-checkbox-wrapper .ant-checkbox {
    width: 20px;
    height: 20px;
    border-radius: 2px;
  }

  .ant-checkbox .ant-checkbox-inner {
    width: 20px;
    height: 20px;
  }

  .ant-table-tbody > tr {
    color: #555;
    font-size: 14px;
  }

  .ant-table-tbody > tr > td {
    background: none !important;
  }

  .ant-table-thead > tr > th {
    background: none !important;
    color: #555;
  }

  .ant-table-thead > tr > td {
    background: none !important;
  }

  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: none !important;
  }

  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: none !important;
  }

  .ant-table {
    background: none !important;
  }

  .ant-table-column-sorters {
    display: flex;
    align-items: center;
    justify-content: start;

    &::after {
      display: none;
    }
  }

  .ant-table-column-has-sorters {
    &::before {
      display: none;
    }
  }

  .ant-table-column-title {
    max-width: fit-content;
  }

  .ant-table-thead th:hover::after {
    content: none !important;
  }

  .ant-table-column-has-actions .ant-tooltip {
    display: none !important;
  }

  .ant-table-expanded-row-level-1 {
    .ant-table-cell {
      padding: 0 !important;

      div {
        //width: 100%;
      }
    }
  }

  .ant-table-expanded-row-fixed {
    width: 100% !important;
  }
`;
