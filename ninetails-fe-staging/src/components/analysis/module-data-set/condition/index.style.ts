import { BaseButton } from '@/components/common/base-button';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE, media } from '@/constants';
import styled from 'styled-components';

export const WrapCondition = styled('div')`
  padding: 0 2rem;
`;

export const ConditionForm = styled(BaseForm)`
  input {
    height: 40px;
  }
  .ant-form-item-control-input {
    min-height: auto;
  }
  position: relative;
`;

export const Select = styled(BaseSelect)`
  height: 40px;
`;

export const Divider = styled(BaseDivider)`
  margin: 1rem 0 2rem 0;
`;

export const AddButton = styled('div')`
  height: auto;
  border: 1px solid var(--border-base-color);
  height: 33px;
  width: 33px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--white);
`;

export const WrapAddButton = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: absolute;
  left: 0;
  bottom: 0;
  cursor: pointer;
  font-size: ${FONT_SIZE.xs};
  z-index: 1;
`;

export const WrapRunButton = styled('div')`
  display: flex;
  justify-content: center;
  position: relative;

  justify-content: end;
  @media only screen and ${media.sm} {
    justify-content: center;
  }
`;

export const Content = styled('div')`
  margin-top: 1rem;
  background-color: #f7f6f9;
  padding: 2rem;
  position: relative;
`;

export const TrashButton = styled.div`
  padding: 0;
  width: 26px;
  height: 26px;
  position: absolute;
  left: -4rem;
  top: 50%;
  transform: translateY(calc(-50% - 1rem));
  cursor: pointer;
`;

export const RunButton = styled(BaseButton)`
  height: 33px;
  display: flex;
  align-items: center;
  gap: 1rem;

  width: 100px;
  @media only screen and ${media.sm} {
    width: 150px;
  }
`;

export const WrapTriangle = styled('div')``;

export const Addingtext = styled.div`
  display: none;
  @media only screen and ${media.sm} {
    display: block;
  }
`;
export const WrapRunButtonContent = styled('div')`
  min-height: 30px;
`;
