import { BaseTable } from '@/components/common/base-table';
import { FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const WrapSectionTable = styled.div``;

export const WrapCellFakeTitle = styled.div``;

export const WrapCellValue = styled.div``;

export const CellValueFirstRowTitle = styled.div<{ $isActive: boolean; $selectable: boolean }>`
  height: 40px;
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  color: rgba(85, 85, 85, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
  background-color: ${(props) => (props?.$isActive ? 'var(--lightgreen)' : 'var(--white)')};
  transition: all 0.3s ease-in;
  cursor: ${(props) => (props.$selectable ? 'pointer' : 'not-allowed')};
`;

export const CellValueSecondRowTitle = styled.div`
  height: 40px;
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  align-items: center;
  background-color: rgba(240, 240, 240, 1);
`;

export const WrapRouteName = styled.p`
  max-width: 160px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 0.4rem;
`;

export const CellValueFirstRow = styled.div<{ $selectable: boolean; $isActive: boolean }>`
  height: 40px;
  cursor: ${(props) => (props.$selectable ? 'pointer' : 'not-allowed')};
  background-color: ${(props) => (props.$isActive ? 'var(--lightgreen)' : 'var(--white)')};
  transition: all 0.2s ease-in;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.3rem;
`;

export const CellValueSecondRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  background-color: rgba(240, 240, 240, 1);
  padding: 0 0.3rem;
`;

export const Table = styled(BaseTable)`
  tr {
    th {
      background-color: #f7f6f9 !important;
      border-right-color: #d9d9d9 !important;
    }
    th:last-child {
      border-radius: 0 6px 0 0 !important;
    }

    th:first-child {
      border-radius: 6px 0 0 0 !important;
    }
  }

  .ant-table-container {
    border-top-color: #d9d9d9 !important;
    border-inline-start-color: #d9d9d9 !important;
    border-radius: 6px;
  }

  .ant-table-cell {
    padding: 6px 0 !important;
  }

  td {
    border-inline-end-color: #d9d9d9 !important;
  }

  tbody {
    tr:not(:first-child) {
      .ant-table-cell {
        height: 80px;
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
`;

export const FakeTitle = styled.div`
  color: rgba(85, 85, 85, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
  padding: 0.125rem 0;
`;

export const CrewName = styled.p`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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
    width: calc(100vw / 15);
  }
`;
