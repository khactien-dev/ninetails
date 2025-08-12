import styled from 'styled-components';

export const WrapTab = styled('div')`
  .ant-table-column-sorter-up.active,
  .ant-table-column-sorter-down.active {
    color: #0085f7 !important;
  }

  .ant-table-column-title {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #0085f7 !important;
    border-color: #0085f7 !important;
  }

  .ant-checkbox:not(.ant-checkbox-disabled):hover .ant-checkbox-inner {
    border-color: #0085f7 !important;
  }

  .ant-checkbox-indeterminate .ant-checkbox-inner:after {
    background-color: #0085f7 !important;
  }
`;
