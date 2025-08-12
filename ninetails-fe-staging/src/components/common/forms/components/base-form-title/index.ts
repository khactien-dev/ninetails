import { BaseTypography } from '@/components/common/base-typography';
import { media } from '@/constants';
import styled from 'styled-components';

export const BaseFormTitle = styled(BaseTypography.Text)`
  font-weight: 700;
  font-size: 1rem;
  display: block;

  @media only screen and ${media.md} {
    font-size: 1.125rem;
  }
`;
