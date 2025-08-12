import { BaseButton } from '@/components/common/base-button';
import { BaseCard } from '@/components/common/base-card';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 80px;
  display: block;
  text-align: center;
  padding: 0 20px;

  .ant-checkbox-checked:not(.ant-checkbox-disabled) .ant-checkbox-inner {
    border-color: var(--lightgray) !important;
  }

  .ant-checkbox-checked {
    .ant-checkbox-inner {
      background-color: var(--white) !important;

      &::after {
        background: var(--white);
        border: 2px solid rgb(52, 85, 255);
        border-top: none;
        border-left: none;
      }
    }
  }
`;

export const Card = styled(BaseCard)`
  display: block;
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--lightgray);
  background: var(--white);
  box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
  max-width: 560px !important;
  margin: 24px auto 0;

  @media only screen and ${media.md} {
    padding: 36px;
  }
`;

export const GroupBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  width: 100%;
  gap: 1.5rem;
`;

export const ActionButton = styled(BaseButton)<{ actionType: 'complete' | 'back' }>`
  height: 40px;
  width: 140px;
  font-size: ${FONT_SIZE.md};
  background: ${(props) => (props.actionType === 'complete' ? '' : '#444')};
  color: ${(props) => (props.actionType === 'complete' ? '' : 'var(--white)')};
  font-weight: ${FONT_WEIGHT.medium};

  &:hover {
    color: ${(props) => (props.actionType === 'complete' ? '' : 'var(--white)')} !important;
  }
`;

export const Row = styled(BaseRow)``;

export const Col = styled(BaseCol)``;

export const Title = styled.div`
  font-weight: ${FONT_WEIGHT.semibold};
  font-size: 28px;
  line-height: 36px;
  text-align: center;
  margin-bottom: 30px;
`;

export const CustomFormItem = styled(BaseForm.Item)`
  margin-bottom: 0.5rem;
`;

export const Checkbox = styled(BaseCheckbox)`
  line-height: 22px;
  font-size: 13px !important;
  font-weight: ${FONT_WEIGHT.regular};
  .ant-checkbox-inner {
    border-radius: 5px;
    border: 1px solid var(--lightgray);
  }
  span {
    color: ${(props) => (props.checked ? 'var(--black)' : '#555')} !important;
  }
`;

export const Note = styled(BaseButton)`
  font-size: 15px;
  font-weight: ${FONT_WEIGHT.semibold};
  line-height: 24px;
  text-align: left;
  color: var(--text);
  margin: 0;
  padding: 0;
  border: 0;
  height: 40px;
`;

export const Flex = styled.div`
  border-top: 1px dotted #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  &:first-of-type {
    border-top: none;
  }

  .ant-form-item {
    margin: 0;
  }
`;
