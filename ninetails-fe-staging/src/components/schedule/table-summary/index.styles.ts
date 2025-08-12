import { BaseTable } from '@/components/common/base-table';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapTableSummary = styled.div`
  margin-top: 2rem;
`;

export const WrapCell = styled.div`
  padding: 0 1rem;
`;

export const WrapCellField = styled.div`
  display: flex;
  justify-content: end;
  padding: 0.2rem 0rem;
  gap: 0.4rem;
  align-items: center;
`;

export const WrapFilledLabel = styled.div`
  padding: 0.2rem 0.6rem;
  background-color: rgba(127, 127, 127, 1);
  border-radius: 6px;
  color: var(--white) !important;
  width: 58px;
`;

export const WrapOutlineLabel = styled.div`
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  width: 58px;
  border: 1px solid rgba(190, 192, 198, 1);
  background-color: var(--white);
  color: rgba(85, 85, 85, 1) !important;
`;

export const WrapFieldValue = styled.div`
  width: 72px;
  text-align: end;
  color: rgba(149, 146, 145, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const WrapCellText = styled.div`
  text-align: center;
  padding: 0.3rem 0;
  font-weight: ${FONT_WEIGHT.semibold};
  color: rgba(85, 85, 85, 1) !important;
`;

export const WrapTotalText = styled.div`
  text-align: end;
  padding: 0.3rem 0;
  font-weight: ${FONT_WEIGHT.semibold};
  color: rgba(85, 85, 85, 1) !important;
`;

export const Table = styled(BaseTable)`
  tbody tr {
    background-color: #f7f6f9 !important;
    &:hover {
      background-color: #f7f6f9 !important;
    }
  }

  .ant-table-cell-row-hover {
    background-color: #f7f6f9 !important;
  }
`;

export const WrapTrend = styled.div``;

export const Growth = styled.span`
  background-color: rgba(230, 242, 229, 1);
  color: var(--green) !important;
  font-weight: ${FONT_WEIGHT.semibold};
  padding: 0.4rem 1rem;
  border-radius: 0.2rem;
`;

export const GrowthRate = styled.div`
  margin-top: 0.6rem;
  color: rgba(149, 146, 145, 1) !important;
  font-weight: ${FONT_WEIGHT.semibold};
`;
