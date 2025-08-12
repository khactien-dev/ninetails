import styled from 'styled-components';

import { BaseButton } from '../base-button';

export const ModalContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-direction: column;
`;

export const AlertText = styled.div`
  text-align: center;
  color: var(--text-primary-color);
  font-size: 20px;
  font-weight: 700;
`;

export const BtnContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 1.25rem;
`;

export const SubmitButton = styled(BaseButton)<{ $isSuperAdmin: boolean }>`
  width: 100%;
  background: ${(props) => (props.$isSuperAdmin ? '#0085f7' : 'var(--primary-color)')};
  border-color: ${(props) => (props.$isSuperAdmin ? '#0085f7' : 'var(--primary-color)')} !important;
  color: var(--white) !important;
  border-radius: 8px;
`;

export const CancelButton = styled(BaseButton)<{ $isSuperAdmin: boolean }>`
  width: 100%;
  border-color: ${(props) => (props.$isSuperAdmin ? '#0085f7' : 'var(--primary-color)')} !important;
  color: ${(props) => (props.$isSuperAdmin ? '#0085f7' : 'var(--primary-color)')} !important;
  border-radius: 8px;
`;
