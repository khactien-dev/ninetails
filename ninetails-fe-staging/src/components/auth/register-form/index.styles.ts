import { FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const More = styled.div`
  margin-top: 36px;
  background-color: #f4f5f6;
  border-radius: 5px;
  padding: 16px 10px 15px 28px;
  border: 1px solid #e0e0e0;

  ul {
    padding-left: 15px;

    li {
      font-size: 0.875rem;
      font-weight: ${FONT_WEIGHT.regular};
      line-height: 26px;
      list-style: square;
      color: #383b40;

      &::marker {
        color: var(--green);
      }
    }
  }
`;

export const WrapActionButton = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const WrapTitleHeader = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  line-height: 1.2rem;

  @media only screen and ${media.md} {
    font-weight: ${FONT_WEIGHT.semibold};
    font-size: 28px;
    line-height: 36px;
  }
`;
