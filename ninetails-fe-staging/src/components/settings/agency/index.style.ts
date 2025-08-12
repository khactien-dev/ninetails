import { BaseButton } from '@/components/common/base-button';
import { BaseForm as AntdBaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, media } from '@/constants';
import styled from 'styled-components';

export const SettingWrapper = styled.div`
  width: 100%;
  height: auto;
  display: block;
  flex-direction: row;
  position: relative;
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
    padding: 30px 24px;
  }
`;

export const Box = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: var(--box-shadow);
  padding: 24px 30px;
  margin-bottom: 36px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: left;
  width: 100%;
  height: 34px;
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 1.5rem;
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

export const Table = styled.div`
  display: block;
  width: 100%;
  margin: 24px 0 0;
  background-color: none !important;
  overflow-x: auto;
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

export const EditBtn = styled(BaseButton)`
  margin-left: 20px;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--Primary, #57ba00);
  background: #fff;
  color: #57ba00;
  height: 33px;

  svg path {
    fill: #57ba00;
  }
`;

export const BaseForm = styled(AntdBaseForm)`
  font-size: ${FONT_SIZE.xs};

  .ant-input,
  .ant-picker {
    padding: 8px 11px;
  }

  .ant-select-single {
    display: flex;
    align-items: center;
  }

  .ant-select-focused {
    .ant-select-selector {
      box-shadow: 0 0 0 2px rgba(0, 133, 247, 0.2) !important;
    }
  }

  .ant-upload {
    width: 100%;
  }

  .base-upload-input {
    height: 42px;
    border-color: var(--border-base-color);
    background-color: var(--white);
  }

  .base-upload-input.disabled-upload {
    background-color: var(--disabled-bg-color);
    border-radius: 0.4rem;
  }

  .ant-form-item-control-input {
    align-items: center;
  }

  .ant-form-item-control-input-content {
    align-items: center;
  }

  .upload-pending-file-name {
    font-size: ${FONT_SIZE.md};
  }

  .upload-file-name {
    font-size: ${FONT_SIZE.md};
  }

  .upload-placeholder {
    font-size: ${FONT_SIZE.md};
  }

  .ant-form-item-has-error {
    .base-upload-input {
      border: 1px solid var(--red);
      transition: 0.2s ease-in-out border-color;
    }
  }

  .ant-select-selection-placeholder {
    font-size: 16px;
  }

  .ant-input:disabled,
  .ant-picker-input > input[disabled],
  .ant-select-selector .ant-select-selection-item {
    color: var(--text-main-color);
  }

  .ant-input,
  .base-upload-input,
  .ant-form-item-control .ant-select-selector,
  .ant-select,
  .ant-picker {
    height: 40px;
  }

  .upload-pending-file-name,
  .upload-file-name,
  .upload-placeholder {
    font-size: ${FONT_SIZE.xs};
    max-width: 300px;
  }
`;
