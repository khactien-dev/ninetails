import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

interface FooterProps {
  $isShow: boolean;
}

export const Footer = styled.div<FooterProps>`
  font-weight: ${FONT_WEIGHT.regular};
  border-radius: 20px;
  font-size: ${FONT_SIZE.md};
  background: #fff;
  box-shadow: var(--box-shadow);
  padding: 28px 28px;
  margin: 30px 0;
  display: ${({ $isShow }) => ($isShow ? 'block' : 'none')};
`;
