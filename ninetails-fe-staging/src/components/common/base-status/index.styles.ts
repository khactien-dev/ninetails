import { BaseTag } from '@/components/common/base-tag';
import { media } from '@/constants';
import styled from 'styled-components';

export const StatusTag = styled(BaseTag)`
  padding: 0.375rem 0;
  min-width: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;

  @media only screen and ${media.md} {
    min-width: 6.5rem;
  }
`;
