import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Input as AntInput } from 'antd';
import styled from 'styled-components';

export const Input = styled(AntInput)`
  .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input):not(
      .ant-pagination-size-changer
    ):hover
    .ant-select-selector {
    border-color: transparent;
  }

  .ant-input-group-addon:first-child,
  .ant-input-group-addon:last-child {
    min-width: 5.5rem;
    color: var(--primary-color);
    font-weight: ${FONT_WEIGHT.semibold};
    font-size: ${FONT_SIZE.lg};
  }

  .ant-input-group-addon .ant-select {
    .ant-select-selection-item {
      min-width: 5.5rem;
      color: var(--primary-color);
      font-weight: ${FONT_WEIGHT.semibold};
      font-size: ${FONT_SIZE.lg};
    }
  }

  .ant-select-arrow {
    color: var(--disabled-color);
  }

  .ant-input-disabled {
    cursor: not-allowed !important;
  }
`;
