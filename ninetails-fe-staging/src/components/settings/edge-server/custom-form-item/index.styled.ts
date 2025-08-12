import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const FormItem = styled(BaseForm.Item)``;

export const WrapFormItem = styled('div')`
  position: relative;
`;

export const CheckBox = styled(BaseCheckbox)`
  span {
    color: var(--text-dark-light-color);
    font-size: ${FONT_SIZE.xs};
  }

  flex-direction: row-reverse;

  .ant-checkbox-inner {
    border-color: rgba(190, 192, 198, 1);
    height: 1rem !important;
    width: 1rem !important;
  }

  .ant-checkbox {
    height: auto !important;
    width: auto !important;
  }

  .ant-checkbox-checked {
    background-color: var(--white) !important;

    .ant-checkbox-inner {
      background-color: var(--white) !important;
      border-color: rgba(190, 192, 198, 1) !important;
    }

    .ant-checkbox-inner::after {
      background-color: rgba(127, 127, 127, 1);
      border-radius: 0.1rem;

      top: 50%;
      inset-inline-start: 50%;
      width: 9px;
      height: 9px;
      border: 0;
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
      content: '';
    }
  }
`;

export const WrapLabel = styled('div')`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`;

export const Button = styled(BaseButton)`
  padding: 0 0.3rem !important;
  height: auto !important;
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.regular};
  color: var(--white) !important;
  background-color: rgba(127, 127, 127, 1) !important;
`;

export const CheckBoxFormItem = styled(BaseForm.Item)`
  .ant-form-item-control-input {
    min-height: auto;
  }

  .ant-form-item-control-input-content {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
`;
