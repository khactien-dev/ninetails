import { BaseButton } from '@/components/common/base-button';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import { BaseTable } from '@/components/common/base-table';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { media } from '@/constants';
import styled from 'styled-components';

interface ButtonProps {
  $isActive: boolean;
  $isSuperAdmin?: boolean;
  $isPrimary?: boolean;
  $isFilter?: boolean;
  $isOutline?: boolean;
}

export const Wrapper = styled.div``;

export const Table = styled(BaseTable)`
  .ant-pagination {
    align-items: center;

    .ant-pagination-total-text {
    }

    .ant-pagination-options {
      .ant-select-arrow {
        top: 17px;
      }
    }

    .ant-select,
    .ant-pagination-total-text {
      height: auto;
      line-height: inherit;
    }
  }

  .ant-table-thead {
    background-color: #f7f6f9;

    .ant-table-cell {
      padding: 11px;
      font-weight: 500;
      border-right: solid 1px rgba(157, 157, 157, 0.7);

      &:first-of-type {
        border-left: solid 1px rgba(157, 157, 157, 0.7);
      }
    }
  }

  .ant-table-row.ant-table-row-selected > .ant-table-cell {
    background-color: white !important;
  }

  .ant-table-row {
    .ant-table-cell-row-hover {
      background-color: white !important;
    }
    .ant-table-cell {
      text-align: center;
      padding: 0px;
      border-right: solid 1px rgba(157, 157, 157, 0.7);

      &:first-of-type {
        border-left: solid 1px rgba(157, 157, 157, 0.7);
      }
    }
  }
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

export const FloatLeft = styled.div`
  float: left;
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
      fill: ${(props) => (props.$isPrimary ? 'var(--white)' : '#57BA00 !important')};
    }
  }

  svg {
    width: 12px;
    margin-left: 5px;
    path {
      fill: #767676;
    }
  }

  span {
    flex: 1;
    font-size: 14px;
    line-height: 32px;
    font-weight: 500;
    color: ${(props) =>
      props.$isActive
        ? props.$isPrimary
          ? 'var(--white) !important'
          : 'var(--primary-color) !important'
        : '#767676 !important'};
    margin-left: 6px;
  }
`;

export const BtnSubmit = styled(BaseButton)`
  display: flex;
  align-items: center;
  padding: 2px 20px;
  height: 32px;

  @media only screen and ${media.sm} {
    width: 150px;
  }

  svg {
    width: 12px;
  }
`;
export const Select = styled(BaseSelect)``;

export const Add = styled(BaseButton)`
  display: flex;
  align-items: center;
  background-color: transparent !important;
  border: none;
  padding: 0;
  font-weight: 500;
  position: absolute;
  left: 0;

  svg {
    margin-right: 5px;
  }
`;

export const WrapCondition = styled('div')`
  padding-left: 3rem;
`;

export const Content = styled('div')`
  margin-bottom: 1rem;
  background-color: #f7f6f9;
  border-radius: 8px;
  padding: 2rem;
  position: relative;
`;

export const WrapRunButton = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Divider = styled(BaseDivider)`
  margin: 1rem 0 2rem 0;
`;

export const List = styled.div`
  position: relative;
  width: 100%;

  /* & > .ant-row {
    padding-left: 30px;
  } */

  .ant-input,
  .ant-select {
    height: 33px;

    .ant-select-selector {
      padding: 0 2px 0 10px;
    }

    &:disabled {
      color: #555;
    }
  }
`;

export const Space = styled(BaseRow)`
  position: relative;

  > .ant-col {
    padding: 0 20px !important;

    /* &:nth-of-type(n + 2) {
      padding-left: 2px !important;
    }

    &:nth-of-type(4) {
      padding: 0 6px 0 2px !important;
    } */
  }
`;

export const LabelCustom = styled.div`
  height: 50px;
  line-height: 50px;
  padding-left: 6px;
`;

export const DeleteBtn = styled(BaseButton)`
  margin-top: 5px;
  background-color: transparent;
  border: none;
  padding: 0;
  position: absolute;
  left: -3.5rem;
  top: 50%;
  transform: translateY(calc(-50% - 1rem));

  &:focus {
    outline: none;
  }
`;

export const Label = styled.div``;

export const Text = styled.div`
  font-size: 14px;
  font-weight: bolder;
`;

export const TextSmall = styled.div`
  color: var(--lightgray);
  font-size: 14px;
`;
export const Confirm = styled(BaseButton)`
  margin: 5px auto;
  min-width: 120px;
`;

export const RollBackPartly = styled.div`
  .ant-checkbox-wrapper {
    align-items: start;
    border-bottom: solid 1px #aaaaaa;
    border-top: solid 1px #aaaaaa;
    padding-top: 15px;
    padding-bottom: 15px;
    width: 100%;

    span:nth-of-type(2) {
      flex: 1;
      margin-left: 15px;
    }

    &:last-of-type {
      border-top: none;
    }

    .ant-row {
      background-color: rgba(170, 170, 170, 0.37);
      border-bottom: solid 1px #aaaaaa;
      padding: 10px 0;
      width: 100%;
      margin-left: 0px !important;
    }
  }
`;

export const GroupBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;

  .ant-btn {
    width: 150px;
    height: 48px;
  }
`;
export const BtnCancel = styled(BaseButton)`
  display: flex;
  align-items: center;
  padding: 2px 20px;
  height: 33px;
  color: var(--primary-color);
  border-color: var(--primary-color);
`;

export const BtnUpload = styled(BaseButton)``;
export const Line = styled.p`
  margin-bottom: 6px;

  span {
    display: inline-block;
    padding: 0px 4px;
  }
`;

export const Import = styled.div`
  .ant-form {
    label {
      width: 100%;

      &::before {
        right: -5px;
      }
    }

    .ant-radio-group {
      .ant-radio-button-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 33px;

        span {
          line-height: 33px;
        }
      }

      .ant-radio-button-wrapper-checked {
        background-color: var(--green);
        color: var(--white);
      }

      label {
        width: auto;
      }
    }

    .ant-input,
    .ant-select {
      height: 33px;

      span.ant-select-selection-item {
        height: 100%;
        line-height: 33px;
      }
    }

    .ant-upload {
      .ant-btn {
        height: 33px;
        padding: 0 10px;
      }
    }

    .ant-form-item {
      margin-bottom: 0;
    }
  }
`;

export const FormItem = styled(BaseFormItem)`
  .ant-select-arrow {
    top: 55%;
  }

  .ant-input {
    height: 50px;
  }
`;

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const Button = styled(BaseButton)`
  border: none;
  padding: 0;
  height: auto;
  background: transparent;
`;

export const InputFile = styled.div<{ isError: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  padding: 8px 0px;
  border-radius: 4px;
  border: 1px solid ${(props) => (!props.isError ? '#bec0c6' : 'red')};
  cursor: pointer;
`;

export const WrapperFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FileName = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 350px;
  height: 20px;
`;

export const TextUpload = styled.div`
  opacity: 0.5;
`;

export const TextError = styled.div`
  color: red;
`;

export const ModalWrap = styled(BaseModal)`
  width: 100%;
  /* position: relative; */
`;

export const ModalExportContent = styled.div`
  width: 100%;
`;

export const InputWrap = styled(BaseInput)`
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid '#d9d9d9' !important;
  height: 50px;

  &::placeholder {
    color: #d9d9d9;
  }
`;

export const SelectOption = styled(BaseSelect)`
  width: 100%;
  border-radius: 6px;
  height: 32px;
  width: 150px;
`;

export const GroupButton = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 0 8px;
  width: 100%;
  margin: auto;
`;

export const DownloadFileBtn = styled(BaseButton)`
  width: 150px;
  padding: 14px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background: var(--Primary, #57ba00);
  color: #fff !important;
`;

export const CancelBtn = styled(BaseButton)`
  display: flex;
  width: 150px;
  padding: 14px 10px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
`;
