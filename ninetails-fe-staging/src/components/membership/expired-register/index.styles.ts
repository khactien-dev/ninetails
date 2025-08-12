import { BaseButton } from '@/components/common/base-button';
import { BaseCard } from '@/components/common/base-card';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 80px;
  display: block;
  text-align: center;
  padding: 0 20px;
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

export const Title = styled.p`
  font-weight: ${FONT_WEIGHT.semibold};
  font-size: 24px;
  line-height: 36px;
  text-align: center;
  margin-bottom: 30px;
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 1.2rem;
  color: rgba(56, 59, 64, 1);
`;

export const Description = styled.p`
  text-align: center;
  font-size: 1rem;
  color: rgba(56, 59, 64, 1);
`;

export const ActionButton = styled(BaseButton)`
  margin-top: 2.5rem;
  height: 3rem;
  font-size: ${FONT_SIZE.md};
  font-weight: ${FONT_WEIGHT.bold};
  width: 100%;
`;

export const WrapDescription = styled.div`
  margin-top: 1rem;
  padding: 0px 1rem;
`;

export const WrapWarningIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const pseudoHeight = styled.div`
  height: 9rem;
`;
