import { BaseButton } from '@/components/common/base-button';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapAntdCustom = styled.div`
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

export const WrapContent = styled.div`
  height: 150px;
  overflow-y: auto;
  border: 1px solid var(--lightgray);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.75rem;

  * {
    font-weight: 500;
  }
`;

export const WrapTitle = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled.p`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  width: 140px;
`;

export const ReadButton = styled(BaseButton)`
  height: 24px;
  font-size: ${FONT_SIZE.xxs};
  font-weight: ${FONT_WEIGHT.regular};
`;

export const ContentGap = styled.div`
  height: 2.5rem;
`;

export const WrapContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const WrapCheckBox = styled.div``;

export const WrapButton = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
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

export const WrapAcceptBoth = styled.div`
  margin-top: 1rem;
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
