import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const ModalTitle = styled.p`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.xxl};
  text-align: center;
  margin-bottom: 1.2rem;
`;

export const PasswordInput = styled(BaseInput.Password)`
  padding: 0.275rem 0.5rem;
  &:focus-within {
    border-color: #0085f7;
  }
`;

export const WrapModalAction = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
`;

export const ConfirmButton = styled(BaseButton)<{ color?: string }>`
  background-color: ${(props) => (props.color ? props.color : '#0085f7')};
  color: var(--white) !important;
  width: 9rem;
`;

export const CancelButton = styled(BaseButton)<{ color?: string }>`
  border-color: ${(props) => (props.color ? props.color : '#0085f7')} !important;
  color: ${(props) => (props.color ? props.color : '#0085f7')} !important;
  width: 9rem;
`;

export const Modal = styled(BaseModal)`
  border-radius: 20px;
  input::-webkit-input-placeholder {
    color: #bec0c6 !important;
  }
  input::-moz-placeholder {
    color: #bec0c6 !important;
  }
  input:-ms-input-placeholder {
    color: #bec0c6 !important;
  }
  input:-moz-placeholder {
    color: #bec0c6 !important;
  }
`;
