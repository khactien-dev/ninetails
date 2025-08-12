import { BaseButton } from '@/components/common/base-button';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapWeightForm = styled.div``;

export const WrapTitle = styled.div`
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Title = styled.div`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.xxl};
`;

export const Form = styled(BaseForm)`
  .ant-input,
  .base-upload-input,
  .ant-select-single,
  .ant-select,
  .ant-form-item-control .ant-select-selector,
  .ant-picker {
    height: 50px !important;
  }
`;

export const EditButton = styled(BaseButton)`
  display: flex;
  align-self: center;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--Primary, #57ba00);
  background: #fff;
  width: 148px;
  margin: 8px auto 0;
  color: var(--Primary, #57ba00);
  font-weight: 600;
`;

export const WrapActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.2rem;
`;

export const Button = styled(BaseButton)`
  height: 48px;
  width: 150px;
`;

export const CancelButton = styled(BaseButton)`
  height: 48px;
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
  width: 150px;
`;
