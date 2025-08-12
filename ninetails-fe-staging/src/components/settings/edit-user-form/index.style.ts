import { BaseButton } from '@/components/common/base-button';
import { BASE_COLORS, FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const EditTableFormWrap = styled.div`
  background-color: #f7f6f9;
  padding: 16px;

  .ant-input,
  .base-upload-input,
  .ant-select-single,
  .ant-select,
  .ant-form-item-control .ant-select-selector {
    height: 40px;
  }

  .ant-select-selection-item {
    font-size: ${FONT_SIZE.xs};
  }
  .ant-select-item-option-content {
    font-size: ${FONT_SIZE.xs};
  }
`;

export const BtnSave = styled(BaseButton)`
  display: block;
  height: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.semibold};
  border-radius: 4px;
  background-color: var(--btn-content);
  border: 1px solid var(--btn-content);
  color: ${BASE_COLORS.white} !important;
  display: flex;
  align-items: center;
  width: 120px;
`;
