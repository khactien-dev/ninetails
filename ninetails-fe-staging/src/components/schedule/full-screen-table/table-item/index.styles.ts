import { BaseTable } from '@/components/common/base-table';
import { FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const WrapSectionTable = styled.div``;

export const WrapCellValue = styled.div``;

export const CellValueFirstRowTitle = styled.div<{ $isActive: boolean }>`
  height: 40px;
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  color: rgba(85, 85, 85, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
  background-color: ${(props) => (props?.$isActive ? 'var(--lightgreen)' : 'var(--white)')};
  cursor: pointer;
  transition: all 0.3s ease-in;
  border-radius: 6px;
`;

export const CellValueFirstRow = styled.div<{ $selectable: boolean; $isActive: boolean }>`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  height: 40px;
  cursor: ${(props) => (props.$selectable ? 'pointer' : 'not-allowed')};
  background-color: ${(props) => (props.$isActive ? 'var(--lightgreen)' : 'var(--white)')};
  transition: all 0.2s ease-in;
  border-radius: 6px;
  padding: 0 0.2rem;
`;

export const CellValueSecondRow = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  height: 40px;
  background-color: rgba(240, 240, 240, 1);
  padding: 0 0.2rem;
`;

export const Table = styled(BaseTable)`
  tr:first-child {
    th {
      border-radius: 6px 6px 0 0 !important;
      background-color: #f7f6f9 !important;
      border-bottom-color: #d9d9d9 !important;
    }
  }

  tr {
    th {
      border-right-color: #d9d9d9 !important;
    }
  }

  .ant-table-expanded-row-fixed::after {
    border-inline-end: none !important;
    inset-inline-end: 0 !important;
  }

  .ant-table-container {
    border-top-color: #d9d9d9 !important;
    border-inline-start-color: #d9d9d9 !important;
    border-radius: 6px;
  }

  td.ant-table-cell {
    padding: 0 !important;
  }

  th.ant-table-cell {
    padding: 10px 0 !important;
  }

  th {
    padding: 1rem 0 !important;
  }

  td {
    border-inline-end-color: #d9d9d9 !important;
  }

  tbody {
    tr:not(:first-child) {
      .ant-table-cell {
        padding: 0 !important;
      }
    }
  }

  tbody {
    tr:last-child {
      td:first-child {
        border-radius: 0 0 0 6px !important;
      }

      td:last-child {
        border-radius: 0 0 6px 0 !important;
      }
    }
  }

  .ant-table-container::after {
    box-shadow: none !important;
  }

  thead {
    tr:first-child {
      th {
        padding: 0 !important;
        height: 32px !important;
      }
    }
    tr:last-child {
      th {
        padding: 0 !important;
        height: 32px !important;
      }
    }
  }
`;

export const FakeTitle = styled.div`
  color: rgba(85, 85, 85, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
  padding: 0.125rem 0;
`;

export const TableTitle = styled.div``;

export const WrapTableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
`;

export const CrewInfo = styled.div`
  gap: 0.3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;

  @media only screen and ${media.lg} {
    width: 150px;
  }

  @media only screen and ${media.xxl} {
    width: calc(100vw / 16);
  }
`;

export const CrewName = styled.p`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
