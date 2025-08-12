import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { Form, FormItemProps } from 'antd';
import React from 'react';
import styled, { css } from 'styled-components';

interface InternalFormItemProps {
  $isSuccess?: boolean;
  $successText?: string;
}

export type BaseFormItemProps = FormItemProps;

export const BaseFormItem = styled(Form.Item as React.FC<FormItemProps>)<InternalFormItemProps>`
  .ant-input,
  .upload-file-name {
    font-size: ${FONT_SIZE.xs};
  }

  .ant-input:disabled,
  .ant-picker-input > input[disabled] {
    color: var(--text-main-color);
    background-color: var(--disabled-bg-color);
    cursor: not-allowed;
  }

  .ant-form-item-label > label {
    color: var(--text-dark-light-color);
    font-weight: ${FONT_WEIGHT.bold};
    font-size: ${FONT_SIZE.xs};
    &:before {
      position: absolute;
      right: -0.125rem;
    }
    .ant-form-item-optional {
      color: var(--subtext-color);
    }

    &:before {
      position: absolute;
      right: -0.25rem;
    }
  }

  .ant-input-group-addon:first-of-type {
    font-weight: 600;
    width: 5rem;

    color: var(--primary-color);

    .anticon,
    svg {
      font-size: 1.25rem;
    }

    @media only screen and ${media.md} {
      width: 5.5rem;
      font-size: 1.125rem;
    }

    @media only screen and ${media.xl} {
      font-size: 1.5rem;
    }
  }

  .ant-input-suffix .ant-btn {
    padding: 0;
    width: unset;
    height: unset;
    line-height: 1;
  }

  .ant-form-item-explain-error {
    display: flex;
    margin: 0.5rem 0;
    line-height: 1;

    &:not(:first-of-type) {
      display: none;
    }
  }

  ${(props) =>
    props.$isSuccess &&
    css`
      .ant-input {
        &,
        &:hover {
          border-color: var(--success-color);
        }
      }

      .ant-form-item-control-input {
        display: block;

        &::after {
          content: '✓ ${props.$successText}';
          color: var(--success-color);
        }
      }
    `}

  &.ant-form-item-has-feedback .ant-form-item-children-icon {
    display: none;
  }

  .ant-picker-suffix {
    font-size: 1rem;
  }

  .ant-select-arrow {
    font-size: 1rem;
    width: unset;
    height: unset;
    top: 55%;
  }

  &.ant-form-item-has-error {
    .ant-input,
    .ant-input-affix-wrapper,
    .ant-input:hover,
    .ant-input-affix-wrapper:hover {
      border-color: var(--error-color);
    }
  }

  &.ant-form-item-has-success.ant-form-item-has-feedback {
    .ant-input,
    .ant-input-affix-wrapper,
    .ant-input:hover,
    .ant-input-affix-wrapper:hover {
      border-color: var(--success-color);
    }
  }

  & .ant-form-item-row {
    flex-wrap: inherit;
  }
`;
