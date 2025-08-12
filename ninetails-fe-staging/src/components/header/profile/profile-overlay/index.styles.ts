import { BaseDivider } from '@/components/common/base-divider';
import { BaseTypography } from '@/components/common/base-typography';
import { media } from '@/constants';
import styled from 'styled-components';

export const Text = styled(BaseTypography.Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 0.875rem;
  font-weight: 600;

  & > .link {
    display: block;
    cursor: pointer;
  }

  @media only screen and ${media.md} {
    font-size: 1rem;
  }
`;

export const ItemsDivider = styled(BaseDivider)`
  margin: 0;
`;
