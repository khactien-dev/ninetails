import { BaseCol } from '@/components/common/base-col';
import { BasePopover } from '@/components/common/base-popover';
import { BaseRow } from '@/components/common/base-row';
import { BaseTable } from '@/components/common/base-table';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const TableContainer = styled('div')`
  padding-right: 3.4rem;
  background-color: var(--white);
  position: relative;
`;

export const WrapTable = styled('div')`
  overflow-x: auto;
  width: calc(100vw - 180px);

  @media only screen and ${media.sm} {
    width: calc(100vw - 210px);
  }

  @media only screen and ${media.custom} {
    width: calc(100vw - 596px);
  }
`;

export const Table = styled(BaseTable)`
  padding-left: 2rem;
  min-width: 1200px;

  button.ant-table-row-expand-icon {
    position: absolute;
    left: -2rem;
  }

  td,
  th {
    border: none !important;
  }

  th {
    font-weight: ${FONT_WEIGHT.medium} !important;
  }

  td,
  tr,
  th {
    font-size: 16px !important;
  }

  .ant-table-cell {
    position: relative;
  }
  .ant-table-row-indent {
    padding: 0 !important;
  }

  table {
    border-spacing: 0 1rem;
    overflow-x: auto;
  }

  .ant-table-row-level-0 {
    button.ant-table-row-expand-icon {
      position: absolute;
      left: calc(-2rem + 1.5px);
    }

    td {
      border: 1px solid var(--border-base-color) !important;
      padding-top: 10px !important;
      padding-bottom: 10px !important;
    }

    td:first-child {
      border-radius: 8px 0 0 8px;
    }

    td:last-child {
      border-radius: 0 8px 8px 0;
    }

    .ant-table-row-expand-icon {
      height: 18px !important;
      width: 18px !important;
      border-color: var(--border-base-color);
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
  }

  tr:not(.ant-table-row-level-0) {
    button.ant-table-row-expand-icon {
      top: 0.1rem;
    }
    .ant-table-row-expand-icon {
      height: 24px !important;
      width: 24px !important;
      border-color: var(--border-base-color);
      &::before {
        position: absolute;
        width: calc(calc(26px / 7 * 5) * 0.6) !important;
        height: calc(calc(20px / 7 * 5) * 0.15) !important;
        background-color: rgba(149, 146, 145, 1);
        border-radius: 6px;
        transition: none !important;
        content: '';
        transform: rotate(-45deg) translateX(5px) translateY(3px);
      }

      &::after {
        position: absolute;
        width: calc(calc(26px / 7 * 5) * 0.6) !important;
        height: calc(calc(20px / 7 * 5) * 0.15) !important;
        background-color: rgba(149, 146, 145, 1);
        border-radius: 6px;
        transition: none !important;
        content: '';
        transform: rotate(45deg) translateX(-2px) translateY(12px);
      }
    }
    .ant-table-row-expand-icon-expanded {
      &::before {
        transform: rotate(45deg) translateX(3px) translateY(-5px) !important;
      }
      &::after {
        transform: rotate(-45deg) translateX(-12px) translateY(-2px) !important;
      }
    }
    td,
    th {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
    }
  }
`;

export const NextButton = styled('div')<{ $disabled: boolean }>`
  cursor: pointer;
  z-index: 1;
  rotate: -90deg;
  border: 1px solid var(--border-base-color);
  padding: 4px 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
`;

export const PreviousButton = styled('div')<{ $disabled: boolean }>`
  cursor: pointer;
  z-index: 1;
  rotate: 90deg;
  border: 1px solid var(--border-base-color);
  padding: 4px 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
`;

export const Pagination = styled('div')`
  position: absolute;
  right: 0;
  top: 50%;
  display: flex;
`;

export const DispatchAreaCell = styled('div')<{ isBold: boolean; layer?: number }>`
  font-weight: ${(props) => (props.isBold ? FONT_WEIGHT.bold : FONT_WEIGHT.medium)};
  text-align: right;
  font-size: ${(props) =>
    props.layer && props.layer >= 3 ? FONT_SIZE.xxs : FONT_SIZE.xs} !important;

  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WrapDispatchAreaCell = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 132px;
  gap: 0.2rem;
  cursor: pointer;
`;

export const Unit = styled('div')`
  color: rgba(217, 217, 217, 1) !important;
  width: 24px;
  text-align: right;
`;

export const WrapDispatchAreaCellOtherLayer = styled('div')`
  display: flex;
  justify-content: end;
`;

export const BoldRating = styled('span')`
  font-weight: ${FONT_WEIGHT.bold};
  color: rgba(255, 47, 145, 1) !important;
  font-size: 16px !important;
`;

export const WrapDiagnosis = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const WrapTableHeader = styled('div')<{ minWith: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  min-width: ${(props) => `${props.minWith}px`};
`;

export const WrapRatingTooltip = styled('div')`
  max-width: 360px;
  color: white;
`;

export const RatingTooltipTitle = styled('div')``;

export const CustomTooltip = styled(BasePopover)``;

export const WrapRatingItems = styled('div')`
  background-color: var(--white);
  color: var(--black);
  height: 100%;
`;

export const Col = styled(BaseCol)`
  text-align: center;
`;

export const Row = styled(BaseRow)`
  margin-top: 1rem;
`;

export const WrapRatingNote = styled('div')`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.6rem;
`;

export const RatingNote = styled('div')``;

export const WrapCellValue = styled('div')`
  display: flex;
  justify-content: center;
`;

export const CellValue = styled('div')`
  word-wrap: break-word;
  max-width: 80px;
  text-align: center;
`;

export const WrapQuatarBox = styled.div`
  cursor: pointer;
`;

export const WrapQuestionareIcon = styled.div``;

export const BoldText = styled.span`
  font-weight: ${FONT_WEIGHT.semibold};
`;
