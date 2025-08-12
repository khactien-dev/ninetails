import { BaseButton } from '@/components/common/base-button';
import { BaseInput } from '@/components/common/inputs/base-input';
import styled, { css } from 'styled-components';

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const WrapperColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 30px;
`;

export const CellTable = styled(BaseInput)<{ active: string; error: string; selected: boolean }>`
  height: 35px;
  border: none;
  border-radius: unset;
  ${(props) =>
    props.active === 'true' &&
    css`
      border: 1px solid #57ba00;
    `};

  ${(props) =>
    props.error === 'true' &&
    css`
      border: 1px solid red;
    `};

  ${(props) =>
    props.selected &&
    css`
      background-color: rgba(255, 51, 0, 0.3);
    `};
`;
