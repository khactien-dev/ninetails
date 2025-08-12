import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_WEIGHT, media } from '@/constants';
import { STAFF_ROLE, STATUS, STATUS_VEHICLE_EN } from '@/constants/settings';
import styled, { css } from 'styled-components';

interface ButtonProps {
  $isActive: boolean;
  $isSuperAdmin: boolean;
  $isPrimary?: boolean;
  $isFilter?: boolean;
}

interface StatusProps {
  status: number | string;
}

interface StatusContractProps {
  status: number | string;
}

interface IotButtonStatusProps {
  status: number | string;
}

interface ContractProps {
  contract: string;
}

interface RiderProps {
  rider: string;
}

interface OutWrapProps {
  exception: string;
}

export const SettingWrapper = styled.div`
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  flex-direction: column;
  @media only screen and ${media.custom} {
    display: flex;
    flex-direction: row;
  }
`;

export const AdmContentWrap = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
  padding: 8px;

  /* @media only screen and ${media.lg} {
    padding: 30px 16px 30px 30px;
  } */
`;

export const Box = styled.div`
  display: block;
`;

export const BoxTitleRow = styled.div`
  display: block;
  width: 1005;
`;

export const BoxTitle = styled.div`
  display: block;
  float: left;
  height: ${(props) => (props.children ? '34px' : '0')};
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
`;

export const ActionsTable = styled.div`
  display: flex;
  width: auto;
  justify-content: end;
`;

export const FloatRight = styled.div`
  float: right;
  position: relative;
  margin-bottom: 16px;

  /* &::after {
    display: none;
  } */
`;

export const ButtonAdm = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  float: left;
  border-radius: 4px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  border: 2px solid
    ${(props) =>
      !props.$isActive
        ? 'transparent'
        : !props.$isSuperAdmin
        ? !props.$isPrimary
          ? !props.$isFilter
            ? 'var(--primary1-color)'
            : 'var(--btn-content)'
          : 'var(--btn-content)'
        : '#0085f7'};
  background-color: ${(props) =>
    !props.$isActive
      ? '#E5E5E5'
      : !props.$isSuperAdmin
      ? !props.$isPrimary
        ? 'var(--primary1-color)'
        : 'var(--btn-content)'
      : '#0085f7'};
  padding: 0 14px;
  margin: 4px 4px 0;
  cursor: ${(props) => (!props.$isActive ? 'not-allowed' : 'pointer')};

  @media only screen and ${media.lg} {
    margin-top: 0;
  }

  &:not(:disabled) {
    svg path {
      fill: ${(props) => (props.$isPrimary ? 'var(--white)' : '#fff !important')};
    }
  }

  svg path {
    fill: ${(props) => (props.$isPrimary ? 'var(--white)' : '#767676 !important')};
  }

  span {
    font-size: 14px;
    line-height: 32px;
    font-weight: 500;
    color: ${(props) =>
      !props.$isActive
        ? '#E5E5E5'
        : !props.$isSuperAdmin
        ? !props.$isPrimary
          ? 'var(--primary1-color)'
          : 'var(--btn-content)'
        : '#0085f7'};
    margin-left: 6px;
  }

  ${(props) =>
    props.$isSuperAdmin &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 11px;
        height: 11px;
      }
    `}
`;

export const Tabs = styled(BaseTabs)`
  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tab {
    height: 34px;
    min-width: 120px;
    line-height: 26px;
    text-align: center;
    justify-content: center;
    color: var(--text);
    border-radius: 8px 8px 0 0;
    padding: 0 15px;
    margin: 0 1px !important;
    font-weight: ${FONT_WEIGHT.regular};

    &.ant-tabs-tab-active {
      border: 1px solid #e0e0e0;
      border-bottom: none;
      background-color: transparent;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: var(--white);
        bottom: 0;
        left: 0;
      }

      * {
        color: var(--text) !important;
      }
    }
  }

  .ant-tabs-ink-bar {
    display: none;
  }
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  overflow-x: auto;
  .ant-table-cell {
    &::before {
      content: unset !important;
    }
  }
  .ant-modal-footer {
    display: none;
  }
  .ant-table-tbody > tr > td {
    padding: 0 0 0 15px !important;
  }
  .ant-table-row-level-0 {
    td:nth-child(1) {
      width: 230px;
    }
    td:nth-child(2) {
      width: 200px;
    }
    td:nth-child(3) {
      text-align: right;
    }
  }
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
    /*
    &::after {
      display: none;
    } */
  }

  .ant-table-column-has-sorters {
    &::before {
      display: none;
    }
  }

  .ant-table-column-title {
    max-width: fit-content;
  }

  /* .ant-btn {
    color: #555;
  } */

  .ant-table-thead th:hover::after {
    content: none !important;
  }

  .ant-table-column-has-actions .ant-tooltip {
    display: none !important;
  }

  .ant-table-expanded-row-level-1 {
    .ant-table-cell {
      background: #fff;
      padding: 0 !important;
    }
  }
`;

export const StatusWrap = styled.div<StatusProps>`
  text-align: center;
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === STATUS.LEAVING
      ? '#FEE2FA'
      : props.status === STATUS.RESIGNED
      ? 'var(--btn-bg-inactive)'
      : props.status === STATUS_VEHICLE_EN.RETIRED
      ? 'var(--btn-bg-inactive)'
      : 'var(--btn-bg-active)'};
  color: ${(props) =>
    props.status === STATUS.LEAVING
      ? '#fe3194'
      : props.status === STATUS.RESIGNED
      ? 'var(--btn-inactive)'
      : props.status === STATUS_VEHICLE_EN.RETIRED
      ? '#555555'
      : 'var(--btn-active)'};
`;

export const ContractWrap = styled.div<ContractProps>`
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) => (props.contract === '정' ? '#ee5f5f' : '#fff666')};
  color: ${(props) => (props.contract === '정' ? '#fff' : '#555')};
`;

export const RiderWrap = styled.div<RiderProps>`
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) => (props.rider === STAFF_ROLE.DRIVER ? '#444' : '#EDEDED')};
  color: ${(props) => (props.rider === STAFF_ROLE.DRIVER ? '#fff' : '#555')};
`;

export const OutWrap = styled.div<OutWrapProps>`
  height: 22px;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) => (props.exception === '정' ? '#fff' : '#5668f1')};
  color: ${(props) => (props.exception === '정' ? '#5668f1' : '#fff')};
  border: 1px solid ${(props) => (props.exception === '정' ? '#5668f1' : 'transparent')};
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

export const BtnSave = styled.div`
  display: block;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  background-color: var(--btn-content);
  border: 1px solid var(--btn-content);
  padding: 0px 14px;
  height: max-content;
  margin-left: 6px;
  cursor: pointer;
`;

export const IotStatusWrap = styled.div<IotButtonStatusProps>`
  width: 24px;
  height: 24px;
  border-radius: 100%;
  line-height: 24px;
  text-align: center;
  font-weight: 500;
  background-color: ${(props) =>
    props.status === STATUS.LEAVING ? '#d0d0d0' : 'var(--btn-active)'};
`;

export const Span = styled.span<StatusContractProps>`
  height: 22px;
  display: block;
  line-height: 22px;
  min-width: 30px;
  max-width: 66px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background-color: ${(props) => (props.status === STATUS.LEAVING ? '#444' : '#EDEDED')};
  color: ${(props) => (props.status === STATUS.LEAVING ? '#fff' : '#555555')};
`;
export const SearchAndFilterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  height: ${(props) => (props.children ? 'auto' : '0')};
`;
export const FilterTableWrapper = styled.div`
  display: flex;
  align-items: center;
`;
