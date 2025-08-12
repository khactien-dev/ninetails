import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const Modal = styled(BaseModal)`
  border-radius: 20px;
`;

export const ModalTitle = styled.p`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE.xxl};
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const ModalDescription = styled.p`
  color: #383b40;
  font-weight: ${FONT_WEIGHT.regular};
  font-size: ${FONT_SIZE.md};
  text-align: center;
  margin-bottom: 2rem;
`;

export const ConfirmButton = styled(BaseButton)`
  background-color: var(--primary-color) !important;
  color: var(--white) !important;
  width: 9rem;
`;
