import IconBtnArrow from '@/assets/images/svg/icon-chevron-up.svg';
import { BaseTable } from '@/components/common/base-table';
import { FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapData = styled.div`
  margin-top: 2rem;
  color: rgba(34, 34, 34, 1);
`;

export const ArrowIcon = styled(IconBtnArrow)<{ isActive: boolean }>`
  rotate: ${(props) => (props.isActive ? '0deg' : '180deg')};
`;

export const WrapHeader = styled.div`
  margin-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
`;

export const WrapContent = styled.div``;

export const WrapContentSection = styled.div`
  margin-bottom: 1rem;
`;

export const WrapContentItemHeader = styled.div`
  display: flex;
  color: rgba(34, 34, 34, 1);
  justify-content: space-between;
  background-color: #eef8e6;
  padding: 0.2rem 1rem;
  border: 1px solid var(--border-base-color);
  border-radius: 6px;
  cursor: pointer;
`;

export const ContentItemHeaderTitle = styled.div`
  display: flex;
`;

export const SubTitle = styled.span``;

export const TotalValue = styled.span`
  color: var(--green);
  font-weight: ${FONT_WEIGHT.bold};
`;

export const WholeTable = styled(BaseTable)`
  .ant-table-row-expand-icon {
    height: 18px !important;
    width: 18px !important;
    border-color: var(--border-base-color) !important;
    &::before {
      inset-inline-end: 3px;
      inset-inline-start: 3px;
      height: 1px;
      top: 8.2px;
      background-color: rgba(149, 146, 145, 1) !important;
    }
    &::after {
      top: 3px;
      bottom: 3px;
      inset-inline-start: 8.2px;
      width: 1px;
      background-color: rgba(149, 146, 145, 1) !important;
    }
  }
  .ant-table-row-expand-icon-expanded {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    &::before,
    &::after {
      background-color: var(--white) !important;
    }
  }
`;

export const WrapIndicator = styled.div`
  padding-right: 1.4rem;
  width: 100%;
  display: flex;
  justify-content: end;
`;

export const WrapIndicatorValue = styled.div`
  padding-right: 1.4rem;
  text-align: right;
`;

export const IndicatiorBtn = styled.div`
  padding: 8px 4px;
  width: 100%;
  background-color: var(--green);
  color: var(--white);
  border-radius: 6px;
  display: flex;
  justify-content: center;
`;

export const boldText = styled.span`
  font-weight: ${FONT_WEIGHT.bold};
`;

export const Bracket = styled.span`
  font-weight: ${FONT_WEIGHT.bold};
`;

export const PrimaryTitle = styled.span`
  color: var(--primary-color);
`;

export const TextGray = styled.span`
  color: rgba(149, 146, 145, 1) !important;
`;

export const WrapWaitingTableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

export const WaitingTableHeader = styled.span`
  color: var(--text);
  font-weight: ${FONT_WEIGHT.medium};
`;

export const WaitingTableSubHeader = styled.span`
  font-size: 0.65rem;
`;

export const WaitingTable = styled(BaseTable)`
  margin-top: 0.5rem;

  th {
    border-right: none !important;
    border-left: none !important;
  }
  .ant-table-container {
    border-top: none !important;
  }

  .ant-table-cell {
    padding: 0 !important;
    height: 33px;
  }

  td {
    border-inline-end: 1px solid #d9d9d9 !important;
  }
  thead {
    td {
      border-inline-end: none !important;
      &::before {
        background-color: transparent !important;
        display: none;
      }
    }
  }
  tr {
    td:last-child {
      border-inline-end: none !important;
    }
  }
`;

export const WaitingCell = styled.div<{ $isActive: boolean; $isEditAble: boolean }>`
  font-size: 13px !important;
  font-weight: ${FONT_WEIGHT.medium};
  padding: 0 0.1rem;
  position: relative;
  background-color: ${(props) => (props.$isActive ? 'var(--lightgreen)' : 'var(--white)')};
  height: 33px;
  padding: 6px 2px;
  transition: 0.2s ease-in;
  cursor: ${(props) => (props?.$isEditAble ? 'pointer' : 'not-allowed')};
  display: flex;
`;

export const WaitingSummaryCell = styled.div<{ color: string }>`
  display: flex;
  justify-content: center;
  color: ${(props) => props.color} !important;
  font-weight: ${FONT_WEIGHT.bold};
`;

export const WrapCellStatus = styled.div`
  display: flex;
  padding-top: 0.2rem;
  padding-right: 0.1rem;
`;

export const WrapEnvelopIcon = styled.div`
  cursor: pointer;
`;

export const StatusIconStyled = styled.div<{ $bg: string; $size: 'sm' | 'md' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props) => (props?.$size === 'md' ? '16px !important' : '12px !important')};
  width: ${(props) => (props?.$size === 'md' ? '16px !important' : '12px !important')};
  font-size: ${(props) => (props?.$size === 'md' ? '11px !important' : '8px !important')};
  font-weight: ${FONT_WEIGHT.bold};
  background-color: ${(props) => props.$bg};
  color: var(--white) !important;
  border-radius: 4px;
  cursor: pointer;
`;

export const WrapNameElipsis = styled.div<{ $color: string; $isActive: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* width: 40px; */
  color: ${(props) => (props?.$isActive ? 'rgba(85, 85, 85, 1)' : props.$color)} !important;
  font-weight: ${FONT_WEIGHT.medium};
  font-size: 12px !important;
  text-align: left;
`;

export const WrapName = styled.div<{ $color: string; $isActive: boolean }>`
  color: ${(props) => (props?.$isActive ? 'rgba(85, 85, 85, 1)' : props.$color)} !important;
  font-weight: ${FONT_WEIGHT.medium};
  font-size: 11.5px !important;
  text-align: right;
`;
