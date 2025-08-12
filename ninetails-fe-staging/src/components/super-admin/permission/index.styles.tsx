import EditIcon from '@/assets/images/svg/icon-edit-3.svg';
import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_WEIGHT, media } from '@/constants';
import { css, styled } from 'styled-components';

interface ButtonProps {
  $isActive: boolean;
  $isSuperAdmin: boolean;
  $isPrimary?: boolean;
  $isFilter?: boolean;
}

export const BoxTitle = styled.div`
  display: flex;
  justify-content: space-between;
  height: 34px;
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 1.5rem;
`;

export const EditBtn = styled(EditIcon)`
  cursor: pointer;
`;

export const PermissionForm = styled.div`
  padding: 16px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 10px;
  @media only screen and ${media.xxl} {
    padding-left: 80px;
    padding-right: 80px;
  }
  height: 300px;
  overflow: visible;
`;

export const EditBtnWrap = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
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
`;

export const ButtonAdm = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  float: left;
  border-radius: 4px;
  height: 33px;
  line-height: 34px;
  text-align: center;
  border: none;
  background-color: #0085f7;
  padding: 0 14px;
  margin: 4px 4px 0;
  cursor: ${(props) => (!props.$isActive ? 'not-allowed' : 'pointer')};

  @media only screen and ${media.lg} {
    margin-top: 0;
  }

  &:not(:disabled) {
    svg path {
      fill: ${(props) => (props.$isPrimary ? 'var(--white)' : '#0085f7 !important')};
    }
  }

  svg path {
    fill: ${(props) => (props.$isPrimary ? 'var(--white)' : '#e4f2fe !important')};
  }

  span {
    font-size: 14px;
    line-height: 32px;
    color: #e4f2fe;
    font-weight: ${FONT_WEIGHT.semibold};
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

export const BoxIconDropdown = styled.div`
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  /* right: 0 !important; */
`;

export const FormItem = styled(BaseFormItem)``;

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const InfoText = styled.p``;

export const WrapBackIcon = styled.p`
  margin-right: 1rem;
  cursor: pointer;
`;

export const Checkbox = styled(BaseCheckbox)`
  align-items: center;
  .ant-checkbox-inner {
    width: 20px;
    height: 20px;
    border-radius: 4px !important;
    border: 1px solid #d3d5d9;
    background: #fff;
  }

  .ant-checkbox-disabled .ant-checkbox-inner {
    background: #d4d4d4;
  }
`;

export const TitleTableContent = styled.div`
  display: flex;
  gap: 10px;
  text-align: center;
`;

export const TableContentModal = styled.div`
  .ant-table-thead {
    *:first-child {
      text-align: left !important;
    }
    .ant-table-cell {
      text-align: center;
    }
  }
  .ant-table-tbody > tr > td {
    padding: 0 !important;
  }
  .ant-table-cell {
    border: none !important;
    border-right: none !important;
    &::before {
      content: unset !important;
    }
  }

  .ant-table-row-level-0 {
    td:nth-child(1) {
      width: 150px !important;
    }
    td:nth-child(2) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(3) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(4) {
      width: 60px !important;

      text-align: center !important;
    }
    td:nth-child(5) {
      width: 60px !important;
      text-align: center !important;
    }
    td:nth-child(6) {
      width: 60px !important;
      text-align: center !important;
    }
  }

  .ant-table-container::after {
    content: none !important;
  }
`;

export const BtnSave = styled(BaseButton)`
  width: 100%;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.semibold};
  border-radius: 8px;
  background-color: #0085f7;
  border: 1px solid #0085f7;
  color: #fff !important;
  padding: 4px 52px;
  cursor: pointer;
  margin-top: 30px;
`;

export const InputName = styled.div`
  width: 100%;
  margin-top: 20px;
  .ant-form-item-label {
    text-align: left;
  }
  input {
    height: 50px;
    &::placeholder {
      color: #aaa;
    }
  }
  input {
    &:focus-within {
      border-color: #0085f7;
    }
  }
`;

export const TableSecond = styled.div``;

export const Input = styled(BaseInput)``;
