import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Table as AntdTable } from 'antd';
import styled from 'styled-components';

export const Table = styled(AntdTable)`
  & .ant-table-thead .ant-table-cell {
    color: var(--text-main-color);
    padding: 6px 0;
    font-size: ${FONT_SIZE.xs};
    font-weight: ${FONT_WEIGHT.semibold};
    line-height: 1.25rem;
    background-color: transparent;
    border-bottom: 1px solid #d9d9d9;

    & .anticon {
      color: var(--primary-color);
    }
  }

  & .ant-table-tbody .ant-table-cell {
    color: var(--text);
    font-size: ${FONT_SIZE.xs};
    font-weight: ${FONT_WEIGHT.regular};
    line-height: 1.25rem;
    padding: 10px 0;
    border-bottom: 1px solid #d9d9d9;

    *:not(.ant-form-item-explain-error) {
      color: var(--text);
      font-size: ${FONT_SIZE.xs};
      line-height: 1.25rem;
    }
  }

  & tbody .ant-table-row-expand-icon {
    min-height: 1.25rem;
    min-width: 1.25rem;
    border-radius: 0.1875rem;
    margin-top: 0;
  }

  /* Override default antd selector */
  &
    .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not(
      [colspan]
    )::before {
    background-color: var(--primary-color);
    display: none;
  }

  & .ant-pagination-prev,
  .ant-pagination-next,
  .ant-pagination-jump-prev,
  .ant-pagination-jump-next,
  .ant-select-selector,
  .ant-select-selection-search-input,
  .ant-select-selection-item,
  .ant-pagination-item {
    min-width: 1.875rem;
    height: 1.875rem !important;
    line-height: 1.875rem !important;
    border-radius: 5px;
    font-size: ${FONT_SIZE.xs};
  }

  & .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination-next .ant-pagination-item-link {
    border-radius: 5px;
    border: none;
  }

  & .ant-checkbox-inner {
    border-radius: 0.1875rem;
    height: 1.25rem;
    width: 1.25rem;
    border: 1px solid var(--primary-color);
  }

  & .editable-row .ant-form-item-explain {
    position: absolute;
    top: 100%;
    font-size: 0.75rem;
  }

  .ant-table-column-sort {
    background-color: transparent;
  }

  .ant-pagination-item-container .ant-pagination-item-ellipsis {
    color: var(--disabled-color);
  }

  .ant-pagination-disabled {
    .ant-pagination-item-link,
    .ant-pagination-item a {
      color: var(--disabled-color);
    }
  }

  .ant-pagination.ant-pagination-disabled {
    .ant-pagination-item-link,
    .ant-pagination-item a {
      color: var(--disabled-color);
    }
  }

  .ant-pagination .ant-pagination-item-active {
    background-color: var(--green);
    a {
      color: var(--white);
    }
  }
` as typeof AntdTable;
