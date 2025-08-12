import { BaseButton } from '@/components/common/base-button';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Description = styled.div`
  margin-bottom: 1.875rem;
  color: var(--text-main-color);
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.regular};

  @media only screen and ${media.xs} {
    font-size: ${FONT_SIZE.xxs};
  }

  @media only screen and ${media.md} {
    font-size: ${FONT_SIZE.xs};
  }
`;

export const SubmitButton = styled(BaseButton)`
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.semibold};
  width: 100%;
  margin-top: 1.125rem;
  margin-bottom: 1rem;
  background-color: #57ba00 !important;

  &:disabled {
    background-color: #e6f2e5 !important;
    border-color: #e6f2e5;
    color: #90c48a;
  }
`;
export const SendOTPButton = styled(BaseButton)`
  padding: 8.5px 12px !important;
  border-radius: 1rem !important;
  background-color: #57ba00;
  color: #fff;
  border: none;
  font-size: 12px !important;

  &:disabled {
    background-color: #e6f2e5;
    color: #90c48a;
  }
`;
export const ResendWrapper = styled.div`
  font-weight: ${FONT_WEIGHT.semibold};
  display: flex;
  gap: 0.3rem;
  @media only screen and ${media.xs} {
    font-size: ${FONT_SIZE.xs};
  }
`;
export const ResendAction = styled.span<{ $isActive?: boolean }>`
  color: ${(props) => (props.$isActive ? '#57BA00' : '#BEC0C6')};
  pointer-events: ${(props) => (props.$isActive ? 'auto' : 'none')};
  cursor: pointer;
`;
export const InfoText = styled.div`
  padding-top: 10px;
  text-align: center;
  font-weight: ${FONT_WEIGHT.bold};
  font-size: 14px;
  cursor: pointer;
`;
