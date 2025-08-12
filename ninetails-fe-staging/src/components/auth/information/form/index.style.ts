import { BaseButton } from '@/components/common/base-button';
import { BaseImage } from '@/components/common/base-image';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BASE_COLORS } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  .ant-input {
    padding: 8px 11px !important;
    height: 50px;
  }

  .ant-form-item-label .label {
    width: 100%;
    position: relative;
    display: flex;
  }
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
  padding: 4px 52px;
`;

export const BtnSavePopup = styled(BaseButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  &.ant-btn span {
    color: ${BASE_COLORS.white} !important;
  }
`;

export const BtnCancelPopup = styled(BaseButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-color: ${BASE_COLORS.green};
  width: 100%;

  &.ant-btn span {
    color: ${BASE_COLORS.green} !important;
  }
`;

export const Popup = styled(BaseButton)`
  border-radius: 4px;
  background: #7f7f7f;
  padding: 0 15px;
  height: auto;
  position: absolute;
  right: 8px;
  top: 0;
  z-index: 1;

  span {
    color: ${BASE_COLORS.white} !important;
    font-size: 10px !important;
  }
`;

export const Note = styled.div`
  text-align: left;

  margin-bottom: 2rem;
`;
export const Modal = styled(BaseModal)`
  text-align: center;

  .ant-modal-title {
    color: #383b40 !important;
    font-size: 24px !important;
    font-weight: 700;
  }

  .ant-modal-body .ant-form-item label {
    color: #383b40;
    font-size: 14px;
    font-weight: 400;
  }

  .ant-input-affix-wrapper {
    height: 50px;
    padding: 0 12px 0 0;

    input {
      background-color: transparent;
    }
  }

  .ant-form-item-explain-error {
    color: #ff5252 !important;
  }
`;

export const FormItem = styled(BaseFormItem)``;
export const Showpass = styled(BaseImage)`
  cursor: pointer;
`;
