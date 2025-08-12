import PlusIcon from '@/assets/images/driving-diary/plus.svg';
import UploadPdfIcon from '@/assets/images/driving-diary/upload-pdf.svg';
import UploadSignatureIcon from '@/assets/images/driving-diary/upload-signature.svg';
import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseTable } from '@/components/common/base-table';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Form, Upload } from 'antd';
import Image from 'next/image';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 32px 30px;
`;

export const SelectOption = styled(BaseSelect)`
  width: 100%;
  border-radius: 6px;
  height: 40px;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
  margin-top: 16px;
  border-radius: 6px;
  height: 40px;
`;

export const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  height: 32px;
`;

export const NavButton = styled.div`
  border: none;
  cursor: pointer;
  height: 33px;
  width: 33px;
  border: 1px solid var(--border-base-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

export const NavButtonToday = styled(BaseButton)`
  border-radius: 6px;
  height: 33px;
  font-size: ${FONT_SIZE.xs};
  width: 100px;
`;

export const Section = styled.div`
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const RightApproval = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleSection = styled.h4`
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
  color: var(--text-main-color);
`;

export const UploadSignature = styled(UploadSignatureIcon)<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const SectionContent = styled.div`
  width: 100%;
  height: max-content;
  display: flex;
  padding: 12px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: 6px;
  margin-top: 16px;
  position: relative;
  background-color: #f7f6f9;
`;

export const SignatureWrap = styled.div`
  width: 40%;
  height: max-content;
`;
export const HeaderSignature = styled.span`
  display: block;
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 30px;
  border-bottom: 1px solid #d9d9d9;
  text-align: center;
`;

export const Signature = styled.div`
  width: 100%;
  border-radius: 6px;
  margin: 12px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  height: 82px;
  min-width: 108.5px;
  background-color: var(--white);
`;

export const ActionApproval = styled.div<{
  hasUrl: boolean;
  disabled?: boolean;
}>`
  opacity: ${({ hasUrl, disabled }) => (!hasUrl || disabled ? 0.5 : 1)};
  cursor: ${({ hasUrl, disabled }) => (!hasUrl || disabled ? 'not-allowed' : 'pointer')};
  position: absolute;
  top: 54px;
  right: 16px;
  svg {
    background-color: var(--white);
    border-radius: 4px;
  }
`;

export const SignatureText = styled.span`
  color: var(--text-light-color);
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const UploadField = styled.div<{ error: string | null; isNewUploadSignature: boolean }>`
  width: 100%;
  height: 100px;
  border: 2px solid ${({ error }) => (error ? '#F00' : '#d9d9d9')};
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ isNewUploadSignature }) => (isNewUploadSignature ? 'pointer' : 'default')};
  margin-top: 24px;
  margin-bottom: 12px;

  img {
    max-width: 100%;
    max-height: 100%;
  }

  &:hover {
    background-color: ${({ isNewUploadSignature }) =>
      isNewUploadSignature ? '#f0f0f0' : 'transparent'};
  }
`;

export const ButtonSubmit = styled(BaseButton)`
  font-size: ${FONT_SIZE.xs};
  font-weight: 500;
  &:not(:disabled) {
    border: 1px solid var(--primary-color) !important;
  }
  padding: 5px 10px;
  height: 40px;
  flex: 1;
  font-weight: ${FONT_WEIGHT.bold};
`;

export const ButtonCancel = styled(BaseButton)`
  font-size: ${FONT_SIZE.xs};
  font-weight: 500;

  padding: 5px 10px;
  height: 40px;
  flex: 1;
  font-weight: ${FONT_WEIGHT.bold};
  &:not(:disabled) {
    color: var(--primary-color) !important;
    border: 1px solid var(--primary-color) !important;
  }
`;

export const ModalWrap = styled(BaseModal)`
  width: 100%;
  /* position: relative; */
`;

export const ModalTitle = styled.div`
  padding: 0 24px;
  color: #222;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const UploadWrap = styled(Upload)`
  .ant-upload.ant-upload-select {
    cursor: pointer;
    width: 100%;
  }
`;

export const BinWrap = styled.div<{ disabled?: boolean }>`
  position: absolute;
  right: 36px;
  top: 150px;
  z-index: 1001;
  border-radius: 4px;
  border: 1px solid var(--Light-Grey, #d9d9d9);
  display: flex;
  width: 24px;
  height: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  z-index: 1001;

  &:hover {
    opacity: ${({ disabled }) => (disabled ? 0.5 : 0.8)};
  }
`;

export const GroupButton = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 1rem;
`;

export const ErrorText = styled.div`
  color: #f00;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const TableInfo = styled.div`
  display: flex;
  width: 100%;
`;

export const Table = styled(BaseTable)`
  width: 100%;
  border-collapse: collapse;
  table {
    background-color: transparent !important;
    th,
    td {
      background-color: #f7f6f9 !important;
    }
  }

  .ant-table-thead > tr > th {
    border-bottom: 1px solid #d9d9d9;
    background: none;
    font-size: 16px !important;
    font-style: normal !important;
    font-weight: 500 !important;
    line-height: 30px !important;
    color: #222 !important;
  }

  .ant-table-tbody > tr {
    border-bottom: none;
  }

  .ant-table-tbody > tr > td {
    border: none;
    background: transparent;
  }

  .ant-table-tbody > tr > td:first-child {
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 30px;
  }

  /* .ant-table-thead > tr > th:first-child {
    border: none;
  } */

  .ant-table-tbody .ant-table-cell {
    border-bottom: none !important;
  }

  .ant-table-expanded-row td {
    padding: 0 !important;
  }
`;

export const ExpandedInfo = styled.div`
  height: auto;
  margin-top: 58px;
`;

export const ExpandedInfoGroupInput = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: row;
`;

export const InputWrap = styled(BaseInput)<{
  isError?: boolean;
  $placeholder?: boolean;
  $isNumber?: boolean;
}>`
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid ${({ isError }) => (isError ? '#f00' : '#d9d9d9')} !important;

  &.input-file {
    /* display: none; */
    input {
      text-overflow: ellipsis;
      padding-right: 25px;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  &::placeholder {
    color: ${({ $placeholder }) => ($placeholder ? '#222' : '#d9d9d9')};
  }

  &.ant-input-status-error {
    border: 1px solid #f00 !important;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }

  &:disabled {
    color: ${({ $isNumber }) => ($isNumber ? '#222' : 'inherit')} !important;
  }
`;
export const BaseFormItemWrap = styled(BaseFormItem)<{ short?: boolean }>`
  width: ${({ short }) => (short ? '22%' : '34%')};
  margin-bottom: 0px;
  border-radius: 4px !important;
  position: relative;

  .ant-form-item-control-input {
    min-height: 0px !important;
  }

  & .ant-form-item-explain-error {
    font-size: ${FONT_SIZE.xxs};
  }
`;

export const SaveButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  color: #fff !important;
`;

export const UploadPdfIconWrap = styled(UploadPdfIcon)`
  position: absolute;
  top: 6px;
  right: 8px;
`;

export const RowExpanded = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

export const DatePickerWrap = styled(DatePicker)<{ isError?: boolean }>`
  max-height: 32px;
  border: 1px solid ${({ isError }) => (isError ? '#f00' : '#d9d9d9')};
  margin-top: 0;

  .ant-picker-time-panel-column::after {
    height: 100% !important;
  }

  .ant-picker-input input::placeholder {
    color: #bfbfbf;
  }
`;

export const AddRecord = styled.div`
  width: 100%;
  margin-top: 16px;
`;

export const ButtonDatePicker = styled(BaseButton)`
  background: #57ba00;
  color: #fff;
`;

export const AddRecordWrap = styled.div<{ $disabled?: boolean }>`
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  width: max-content;
  display: flex;
  align-items: center;
`;

export const PlusIconWrap = styled(PlusIcon)`
  margin-right: 12px;
`;

export const AddRecordText = styled.span`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: #222;
`;

export const TitleAddNewRecord = styled.div`
  color: #222;
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 30px;
  margin-bottom: 24px;
`;

export const ImageWrap = styled(Image)`
  object-fit: cover;
  overflow: hidden;
`;

export const SignedTitlePopup = styled.div`
  color: #222;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const SelectedDate = styled.span`
  font-weight: 600;
  margin-right: 8px;
`;

export const Info = styled.div`
  width: 100%;
  height: max-content;
  display: flex;
`;

export const HeaderInfo = styled.div<{ width?: string }>`
  width: ${({ width }) => (width ? width : '')};
  border-bottom: 1px solid #d9d9d9;
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 30px;
  white-space: nowrap;
  text-align: center;
  height: 32px;
  margin-bottom: 12px;
`;

export const InfoItemContent = styled.div<{ isCenter?: boolean }>`
  color: #222;
  font-size: 16px;
  font-weight: 500;
  line-height: 30px;
  white-space: nowrap;
  text-align: ${({ isCenter }) => (isCenter ? 'center' : 'left')};
`;

export const ContentInfo = styled.div<{ isHeader?: boolean; $minWidth?: string }>`
  min-width: ${({ $minWidth }) => ($minWidth ? $minWidth : '')};

  width: ${({ isHeader }) => (isHeader ? '25%' : '15%')};
  height: 100px;
`;

export const ExpandedInfoBox = styled.div<{ disabled?: boolean }>`
  display: flex;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  justify-content: right;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  svg {
    background-color: var(--white) !important;
    border-radius: 4px;
  }
`;

export const FormWrap = styled(Form.Item)`
  display: flex;
  width: 100%;
  border: 1px solid red;
`;

export const RowRecord = styled.div``;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: start;
  flex-direction: row;
  height: 100%;
`;

export const ErrorMsg = styled.span`
  color: #f00 !important;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 17px;
`;

export const actionLandfill = styled.div`
  display: flex;
  position: relative;
`;

export const ExpandedInfoIcon = styled.div<{ disabled?: boolean }>`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  position: absolute;
  right: 2px;
  top: 0;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const UrlTable = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
`;

export const DriveMode = styled.div`
  display: flex;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  width: fit-content;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.medium};
`;

export const TextUploadSignature = styled.div`
  color: #d9d9d9;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

export const TextTotal = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  line-height: 20px;
`;
