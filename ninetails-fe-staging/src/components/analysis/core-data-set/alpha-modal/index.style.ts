import triangle from '@/assets/images/chart/smooth-triangle.png';
import { BaseButton } from '@/components/common/base-button';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE } from '@/constants';
import styled from 'styled-components';

export const WrapFilter = styled('div')`
  display: flex;
  align-items: center;
  margin-top: 2rem;
`;

export const FilterTitle = styled('div')`
  width: 5rem;
`;

export const TitleText = styled('div')``;

export const Mark = styled('div')<{ index: number }>`
  left: ${(props) =>
    props.index === 10 ? `calc(20% * ${props.index} - 3%)` : `calc(20% * ${props.index} - 2%)`};
  position: absolute;
  bottom: 1.4rem;
`;

export const WrapSliderWeight = styled('div')`
  position: relative;
  margin-top: 1rem;
  flex: 1;
  .ant-slider-horizontal {
    padding-block: 4px;
  }

  .ant-slider {
    margin: 0;
  }

  .ant-slider:hover .ant-slider-handle::after {
    box-shadow: none;
  }

  .ant-slider-handle:focus::after,
  .ant-slider-handle:hover::after,
  .ant-slider-handle::after {
    background-image: url(${triangle.src});
    box-shadow: none;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-color: transparent;
  }

  .ant-slider-handle {
    z-index: 1;
    width: 16px;
    height: 16px;
  }

  .ant-slider-track {
    background-color: transparent !important;
  }
`;

export const Rail = styled('div')`
  position: absolute;
  bottom: 4px;
  height: 2px;
  background-color: var(--primary-color);
  width: 100%;
`;

export const WrapActionButton = styled('div')`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

export const CancelButton = styled(BaseButton)`
  height: 48px;
  flex: 1;
  color: var(--primary-color) !important;
  border: 1px solid var(--primary-color) !important;
`;

export const ActionButton = styled(BaseButton)`
  height: 48px;
  flex: 1;
`;

export const Indication = styled('div')<{ index: number }>`
  left: ${(props) => `calc(4% * ${props.index} - 1px)`};
  height: ${(props) => (props.index % 5 == 0 ? '15px' : '10px')};
  width: ${(props) => (props.index % 5 == 0 ? '2px' : '1px')};
  background-color: var(--primary-color);
  position: absolute;
  bottom: 4px;
`;

export const WrapInput = styled('div')`
  display: flex;
  margin-top: 1rem;
  align-items: center;
`;

export const InputTitle = styled('div')`
  width: 80px;
`;

export const Input = styled(BaseInput)`
  width: 80px;
  height: 32px;
`;

export const Text = styled('div')`
  margin-left: 0.6rem;
  font-size: ${FONT_SIZE.xs};
`;
