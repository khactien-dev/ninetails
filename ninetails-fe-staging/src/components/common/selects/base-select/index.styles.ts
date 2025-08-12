import { BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Dimension } from '@/interfaces';
import { normalizeProp } from '@/utils';
import { Select as AntSelect } from 'antd';
import styled from 'styled-components';

export interface InternalSelectProps {
  $width?: Dimension;
  $shadow?: boolean;
}

export const Select = styled(AntSelect)<InternalSelectProps>`
  width: ${(props) => props.$width && normalizeProp(props.$width)};

  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    font-weight: ${FONT_WEIGHT.medium};
    color: white;
    svg {
      color: white;
    }
  }

  box-shadow: ${(props) => props.$shadow && 'var(--box-shadow)'};

  &.ant-select-borderless {
    background: var(--secondary-background-color) !important;
    border-radius: ${BORDER_RADIUS};
  }

  .ant-select-selection-placeholder {
    color: #bec0c6;
  }

  .ant-select-selection-placeholder,
  .ant-select-selection-item,
  .ant-select-item-option-content {
    font-size: ${FONT_SIZE.xs};
  }

  .ant-select-item {
    min-height: unset;
    padding-block: 5px;
  }

  &.ant-select-multiple {
    &.ant-select-disabled .ant-select-selection-item {
      color: #bfbfbf;
      border: 1px solid var(--border-base-color);
    }

    .ant-select-selection-item {
      border: 1px solid #f0f0f0;
      margin-inline-end: 11px;
    }

    .ant-select-selector {
      padding-inline-start: 11px;
    }
  }
`;
