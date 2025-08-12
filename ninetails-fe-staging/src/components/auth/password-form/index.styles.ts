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

  &:disabled {
    background-color: #e6f2e5;
    border-color: #e6f2e5;
    color: #90c48a;
  }
`;

export const Title = styled.div`
  font-size: 19px;
  font-weight: 700;
  line-height: 29px;
  text-align: left;
  margin-bottom: 2rem;
`;

export const RuleList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: none;
  font-size: ${FONT_SIZE.xs};
  margin-top: 2rem;
`;

export const RuleListItem = styled.li``;

export const SuccessWrapper = styled.div`
  text-align: center;
`;

export const SuccessWrapperTitle = styled.div`
  text-align: center;
  font-size: ${FONT_SIZE.xl};
  font-weight: ${FONT_WEIGHT.bold};
  margin-bottom: 2rem;
`;

export const SuccessWrapperDescription = styled.div`
  margin-bottom: 4rem;
`;
