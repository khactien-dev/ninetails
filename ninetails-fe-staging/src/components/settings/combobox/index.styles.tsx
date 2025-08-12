import ConfirmIcon from '@/assets/images/svg/icon-confirm.svg';
import MoreVertical from '@/assets/images/svg/icon-more-certical.svg';
import { BaseSelect, Option } from '@/components/common/selects/base-select';
import { FONT_SIZE } from '@/constants';
import { Input } from 'antd';
import styled from 'styled-components';

export const LabelOption = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 30px);
  display: block;
  flex: 1;
  max-width: 90%;
  font-size: ${FONT_SIZE.xs};
`;

export const NewField = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  align-items: center;
  position: relative;
`;

export const DropdownMenu = styled.div`
  position: relative;
  .ant-select-item {
    height: max-content !important;
    border: none !important;
  }
  .ant-select-selection-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* max-width: 200px; */
  }
`;

export const IconDropdownWrap = styled.div`
  padding: 4px;
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
  :hover {
    opacity: 0.8;
  }
`;

export const AddNewWrapper = styled.div`
  display: flex;
  gap: 1rem;
  padding-top: 0.25rem;
  align-items: center;
  border-top: 1px solid #d9d9d9;
  margin-top: 0.25rem;
`;

export const OptionsWrapper = styled.div`
  .ant-select-item-option-selected {
    background-color: transparent !important;
    color: #000 !important;
    border: solid 1px var(--primary-color);
    border-radius: 10px;

    /* svg path {
      stroke: var(--text);
    } */
  }

  .ant-input {
    border: none;
  }
`;

export const AddButton = styled.button<{ disabled: boolean }>`
  display: flex;
  border: none;
  gap: 0.25rem;
  height: 1.875rem;
  align-items: center;
  cursor: pointer;
  background: transparent;
  min-width: 3rem;
  color: var(--text);
  ${(props) => props.disabled && 'cursor: not-allowed'};
`;

export const SelectOption = styled.div`
  height: auto;
`;

export const ActionIcon = styled(MoreVertical)`
  position: absolute;
  right: 0.75rem;
  top: 0;
  bottom: 0;
  z-index: 9;
  margin: auto;
`;

export const InputConfirmIcon = styled(ConfirmIcon)<{ hasError: boolean }>`
  position: absolute;
  right: 0.75rem;
  top: 0;
  bottom: 0;
  margin: auto;
  svg path {
    stroke: var(--green) !important;
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: ${FONT_SIZE.xs};
`;

export const InputWrapper = styled.div`
  .ant-input {
    padding-right: 40px !important;
    font-size: ${FONT_SIZE.xs};
  }
`;

export const CustomInput = styled(Input)<{ hasError: boolean }>`
  padding: 0 0.5rem;
  height: 1.8rem;

  border: 1px solid ${({ hasError }) => `${hasError ? 'red' : '#d9d9d9'} !important`};
  &:focus {
    border-color: ${({ hasError }) => `${hasError ? 'red' : 'var(--primary-color)'} !important`};
  }
  &::placeholder {
    color: var(--lightgray);
  }
`;

export const CustomerSelect = styled(BaseSelect)`
  .ant-select-item:has(input) {
    padding: 0 !important;
    background-color: transparent !important;
  }

  .ant-select-selection-placeholder,
  .ant-select-selection-item {
    font-size: ${FONT_SIZE.xs};
  }

  .ant-select-item {
    height: 40px;
    border-radius: 4px;
    padding-block: 7px 5px;
  }

  input {
    height: 40px;
  }

  .ant-select-arrow {
    top: 55%;
  }
`;

export const CustomOption = styled(Option)``;
