import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BASE_COLORS, FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;
  .ant-input {
    padding: 8px 11px;

    &::placeholder {
      color: ${BASE_COLORS.lightgray};
    }
  }

  .ant-select-single {
    display: flex;
    align-items: center;
  }

  .ant-form-item-control {
    .ant-select-selection-item {
      font-size: ${FONT_SIZE.xs};
    }
    .ant-select-item-option-content {
      font-size: ${FONT_SIZE.xs};
    }

    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
      background-color: #0085f7;
    }
  }

  .ant-select-focused {
    .ant-select-selector {
      border-color: #0085f7 !important;
      box-shadow: 0 0 0 2px rgba(0, 133, 247, 0.2) !important;
    }
  }

  .ant-upload {
    width: 100%;
  }

  input {
    &:focus-within {
      border-color: #0085f7;
    }
  }

  .ant-picker-focused.ant-picker {
    box-shadow: 0 0 0 2px rgba(0, 133, 247, 0.2) !important;
  }

  .base-upload-input {
    height: 42px;
    background-color: var(--white);
  }

  .ant-form-item-control-input {
    align-items: center;
  }

  .ant-form-item-control-input-content {
    align-items: center;
  }

  .upload-placeholder,
  .upload-pending-file-name,
  .upload-file-name {
    font-size: ${FONT_SIZE.xs};
    max-width: 300px;
  }

  .upload-file-link {
    color: #0085f7;
  }

  .ant-form-item-has-error {
    .base-upload-input {
      border: 1px solid var(--red);
      transition: 0.2s ease-in-out border-color;
    }
  }

  .spinning-icon {
    color: #0085f7;
  }
  .ant-select-selection-placeholder {
    font-size: ${FONT_SIZE.xs};
  }

  .ant-input:disabled,
  .ant-picker-input > input[disabled],
  .ant-select-selector .ant-select-selection-item {
    color: rgba(56, 59, 64, 1);
  }

  .ant-picker-input input::placeholder,
  .ant-select-selector .ant-select-selection-placeholder {
    color: var(--lightgray);
  }

  .ant-picker-input input {
    font-size: ${FONT_SIZE.xs};
  }

  .ant-input,
  .base-upload-input,
  .ant-select,
  .ant-form-item-control .ant-select-selector {
    height: 40px;
  }
`;

export const BtnSave = styled.div`
  display: block;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-radius: 5px;
  background-color: #0085f7;
  border: 1px solid var(--btn-content);
  color: #fff !important;
  padding: 4px 52px;
  cursor: pointer;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
  height: 40px;
`;

export const Button = styled(BaseButton)`
  width: 100%;
  min-width: 140px;
  font-weight: ${FONT_WEIGHT.medium};
  padding: 5px;
  margin: 0;
  height: 42px;
  text-align: left;

  .ant-btn-icon {
    position: absolute;
    right: 0;
    width: 16px;
  }

  span {
    width: 100%;
  }
`;

export const FormLabel = styled.p`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: 20px;
  margin-bottom: 1.2rem;
  margin-top: 0.6rem;
`;
