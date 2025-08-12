import IconBtnArrow from '@/assets/images/svg/icon-btn-arrown.svg';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const Title = styled.div<{ size: 'md' | 'xl' }>`
  color: rgba(34, 34, 34, 1);
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${(props) => FONT_SIZE[props.size]};
  cursor: pointer;
`;

export const WrapTitle = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
`;

export const ArrowIcon = styled(IconBtnArrow)<{ isActive: boolean }>`
  background-color: var(--white);
  rotate: ${(props) => (props.isActive ? '0deg' : '180deg')};
  cursor: pointer;
`;
