import GearIcon from '@/assets/images/chart/gear.svg';
import IconBtnArrow from '@/assets/images/svg/icon-btn-arrown.svg';
import { FONT_SIZE } from '@/constants';
import styled, { css } from 'styled-components';

interface ICollapse {
  collapsed: boolean;
}
export const Wrapper = styled.div<ICollapse>`
  display: ${(props) => (props.collapsed ? 'block' : 'none')};
`;

export const Title = styled.div<ICollapse>`
  display: flex;
  align-items: center;
  justify-content: start;
  font-size: 17px;
  color: #222;
  gap: 0.6rem;

  span {
    font-weight: 700;
  }
`;

export const Div = styled.div``;

export const ArrowButton = styled(IconBtnArrow)<ICollapse>`
  cursor: pointer;
  ${(props) =>
    !props.collapsed &&
    css`
      transform: rotate(180deg);
    `}
`;

export const TitleContent = styled('span')<{ type: 'sumary' | 'detail' }>`
  font-size: ${(props) => (props.type === 'detail' ? FONT_SIZE.xl : '17px')};
  color: ${(props) => (props.type === 'detail' ? 'var(--primary-color)' : '#222')};
  font-weight: ${(props) => (props.type === 'detail' ? '700' : '700')};
`;

export const CollapseContainer = styled('div')<{ type: 'sumary' | 'detail' }>`
  margin-bottom: 2rem;
  margin-bottom: ${(props) => (props.type === 'detail' ? '4rem' : '0')};
`;

export const GearButton = styled(GearIcon)`
  cursor: pointer;
`;

export const Icon = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;
