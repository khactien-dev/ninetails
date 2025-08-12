import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { STAFF_ROLE, STATUS, STATUS_VEHICLE_EN } from '@/constants/settings';
import { Input } from 'antd';
import styled, { css } from 'styled-components';

interface ButtonProps {
  $isActive: boolean;
  $isSuperAdmin: boolean;
  $isPrimary?: boolean;
  $isFilter?: boolean;
  $isOutline?: boolean;
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
  background-color: #f6f6f9;

  @media only screen and ${media.lg} {
    padding: 30px 16px 30px 30px;
  }
`;

export const Box = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 24px 28px 30px;
`;

export const BoxTitleRow = styled.div`
  display: block;
  width: 1005;

  &::after {
    content: '';
    display: block;
    clear: both;
  }
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

export const ActionsTable = styled.div`
  display: flex;
  width: auto;
  justify-content: end;
`;

export const FloatRight = styled.div`
  float: right;
  position: relative;
  margin-bottom: 16px;

  &::after {
    content: '';
    display: block;
    clear: both;
  }
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
  border: 1px solid
    ${(props) => {
      if (!props.$isActive) return 'transparent';
      if (props.$isOutline) return '#57BA00';
      if (props.$isSuperAdmin) return '#0085f7';
      if (props.$isPrimary || props.$isFilter) return 'var(--btn-content)';
      return 'var(--primary1-color)';
    }};
  background-color: ${(props) => {
    if (!props.$isActive) return '#E5E5E5';
    if (props.$isOutline) return 'transparent';
    if (props.$isSuperAdmin) return '#0085f7';
    if (props.$isPrimary || props.$isFilter) return 'var(--btn-content)';
    return 'var(--primary1-color)';
  }};
  padding: 0 14px;
  margin: 4px 4px 0;
  cursor: ${(props) => (!props.$isActive ? 'not-allowed' : 'pointer')};

  @media only screen and ${media.lg} {
    margin-top: 0;
  }

  &:not(:disabled) {
    svg path {
      fill: ${(props) =>
        props.$isPrimary
          ? 'var(--white)'
          : !props.$isFilter
          ? 'var(--primary-color) !important'
          : '#fff !important'};
    }
  }

  svg path {
    fill: ${(props) =>
      props.$isPrimary
        ? 'var(--white)'
        : !props.$isFilter
        ? '#767676 !important'
        : '#fff !important'};
  }

  span {
    font-size: 14px;
    line-height: 17px;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
    color: ${(props) =>
      props.$isActive
        ? props.$isPrimary
          ? 'var(--white)'
          : !props.$isFilter
          ? 'var(--primary-color) !important'
          : '#fff'
        : '#767676 !important'};
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
  margin: 24px 0 0;
  background-color: none !important;
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
    color: var(--text-main-color);
    font-weight: ${FONT_WEIGHT.semibold};
    font-size: ${FONT_SIZE.xs};
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
  border-radius: 4px;
  font-weight: ${FONT_WEIGHT.bold};
  background-color: ${(props) =>
    props.status === STATUS.LEAVING
      ? '#FEE2FA'
      : props.status === STATUS.RESIGNED
      ? 'var(--btn-bg-inactive)'
      : props.status === STATUS_VEHICLE_EN.RETIRED
      ? 'var(--btn-bg-inactive)'
      : 'var(--primary1-color)'};
  color: ${(props) =>
    props.status === STATUS.LEAVING
      ? '#fe3194'
      : props.status === STATUS.RESIGNED
      ? 'var(--btn-inactive)'
      : props.status === STATUS_VEHICLE_EN.RETIRED
      ? '#555555'
      : 'var(--primary-color)'};
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
  color: #fff !important;
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
  margin-top: 5px;
`;
export const SearchInputWrapper = styled.div``;
export const SearchInput = styled(Input)`
  width: 200px;
  height: 34px;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.semibold};
  border-radius: 4px;
  padding-left: 5px;
  border: 1px solid #57ba00;
  outline: none;
  width: 100%;
  max-width: 200px;
  padding: 0 0.6rem;
  box-sizing: border-box;
  .ant-input {
    background: none;
    height: 30px !important;
    width: 100%;
    padding-left: 0.2rem !important;
    &::placeholder {
      color: #a3a5a7;
    }
  }
`;
export const FilterTableWrapper = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
`;
