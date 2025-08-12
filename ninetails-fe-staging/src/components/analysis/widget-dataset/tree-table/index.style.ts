import { BaseTable } from '@/components/common/base-table';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

import { ReloadIcon } from '../reload-icon/reload-icon';

export const TableContainer = styled('div')`
  /* padding-left: 2rem; */
  padding-right: 3.4rem;
  background-color: var(--white);
  position: relative;
  min-width: 1000px;
`;
export const TextButton = styled('div')`
  text-align: center;
  color: #57ba00 !important;
`;
export const Table = styled(BaseTable)`
  width: 100%;
  td,
  th {
    border: none !important;
  }

  td,
  span,
  tr,
  th {
    text-align: center !important;
    font-size: 16px !important;
  }

  th {
    font-weight: ${FONT_WEIGHT.medium} !important;
  }

  .ant-table-cell {
    /* position: relative; */
    border: none !important;
    &::before {
      content: unset !important;
    }
    th {
      text-align: center !important;
    }
  }

  table {
    border-spacing: 0 1rem;
  }

  .ant-table-row-level-0 {
    td:nth-child(n + 4) {
      background: #fff4f9 !important;
    }
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
      /* margin-left: 5px; */
    }
    td:nth-child(3) {
      width: 150px;
    }

    td:last-child {
      border-radius: 0 8px 8px 0;
    }
  }
  .ant-table-cell-row-hover {
    background-color: white !important;
  }

  .ant-table-row-level-0 td:first-child {
  }

  .ant-table-cell {
    padding: 4px 8px !important;
    height: 46px !important;
  }
`;

export const NextButton = styled('div')`
  cursor: pointer;
  z-index: 1;
  rotate: -90deg;
  border: 1px solid var(--border-base-color);
  padding: 4px 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
`;
export const TableContent = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PreviousButton = styled('div')`
  cursor: pointer;
  z-index: 1;
  rotate: 90deg;
  border: 1px solid var(--border-base-color);
  padding: 4px 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
`;

export const Pagination = styled('div')`
  position: absolute;
  right: 0;
  display: flex;
  top: 65%;
  z-index: 2;
`;

export const DispatchAreaCell = styled('span')`
  font-weight: ${FONT_WEIGHT.bold};
  text-align: right;
`;

export const WrapDispatchAreaCell = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  align-items: center;
`;

export const BoldRating = styled('span')`
  font-weight: ${FONT_WEIGHT.bold};
  color: rgba(255, 47, 145, 1) !important;
  font-size: 16px !important;
  margin-top: 5px;
  margin-left: 5px;
`;

export const WrapDiagnosis = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WrapTableHeader = styled('div')`
  align-items: center;
  gap: 0.6rem;
`;
export const Reload = styled('div')`
  display: flex;
  width: auto;
  gap: 7px;
  border: 1px solid var(--border-base-color) !important;
  border-radius: 4px;
  color: #57ba00 !important;
  font-weight: ${FONT_WEIGHT.regular};
  align-items: center;
  padding: 0rem 0.4rem;
  cursor: pointer;
`;
export const InfoReload = styled('div')`
  display: flex;
  width: auto;
  justify-content: center;
`;
export const ReloadIconStyled = styled(ReloadIcon)`
  width: 16px;
  height: 16px;
  padding-top: 2px;
`;
export const ColInfo = styled('div')`
  font-weight: ${FONT_WEIGHT.medium};
`;

export const InfoText = styled('div')`
  font-weight: ${FONT_WEIGHT.regular};
`;

export const BoxIconDelete = styled('div')`
  border: none !important;
  cursor: pointer;
`;
