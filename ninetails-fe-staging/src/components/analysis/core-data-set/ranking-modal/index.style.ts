import pinkTriangle from '@/assets/images/chart/smooth-pink-triangle.png';
import triangle from '@/assets/images/chart/smooth-triangle.png';
import yellowTriangle from '@/assets/images/chart/smooth-yellow-triangle.png';
import { BaseButton } from '@/components/common/base-button';
import { BaseInput } from '@/components/common/inputs/base-input';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

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

export const Indication = styled('div')<{ index: number }>`
  left: ${(props) => `calc(2% * ${props.index} - 1px)`};
  height: ${(props) => (props.index % 5 == 0 ? '15px' : '10px')};
  width: ${(props) => (props.index % 5 == 0 ? '2px' : '1px')};
  background-color: var(--primary-color);
  position: absolute;
  bottom: 4px;
`;

export const Rail = styled('div')`
  position: absolute;
  bottom: 4px;
  height: 2px;
  background-color: var(--primary-color);
  width: 100%;
`;

export const WeightTrack = styled('div')<{ trackWidth: number; trackLeft: number; color: string }>`
  position: absolute;
  height: 10px;
  background-color: ${(props) => props.color};
  bottom: 4px;
  width: ${(props) => `${props.trackWidth}%`};
  left: ${(props) => `${props.trackLeft}%`};
  z-index: 1;
`;

export const LevelTrack = styled('div')<{ trackWidth: number; trackLeft: number; color: string }>`
  position: absolute;
  height: 10px;
  background-color: ${(props) => props.color};
  bottom: 4px;
  width: ${(props) => `${props.trackWidth}%`};
  left: ${(props) => `${props.trackLeft}%`};
  z-index: 1;
`;

export const WrapSliderLevel = styled('div')`
  position: relative;
  margin-top: 2rem;
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
    box-shadow: none;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-color: transparent;
  }

  .ant-slider-handle-1,
  .ant-slider-handle-1 {
    z-index: 2;
  }

  .ant-slider-handle-2,
  .ant-slider-handle-2 {
    z-index: 1;
  }

  .ant-slider-handle-1::after,
  .ant-slider-handle-4::after {
    background-image: url(${pinkTriangle.src});
  }

  .ant-slider-handle-2::after,
  .ant-slider-handle-3::after {
    background-image: url(${yellowTriangle.src});
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
    props.index === 10 ? `calc(10% * ${props.index} - 3%)` : `calc(10% * ${props.index} - 2%)`};
  position: absolute;
  bottom: 1.4rem;
`;

export const WrapLevelForm = styled('div')`
  margin-top: 1.2rem;
  font-size: ${FONT_SIZE.xs};
  display: flex;
  flex-direction: column;
  align-items: end;
`;

export const FlexBox = styled('div')`
  display: flex;
`;

export const WrapLevelRow = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  font-size: ${FONT_SIZE.xs};
`;

export const LevelInputTitle = styled('div')<{ align: 'start' | 'end' | 'space-between' }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.align};
`;

export const WrapLevelInputLabelItem = styled('div')`
  white-space: nowrap;
`;

export const WeightInputTitle = styled('div')<{ width?: number }>`
  display: flex;
  align-items: center;
  width: 150px;
  justify-content: start;

  @media only screen and ${media.lg} {
    width: ${(props) => props.width + 'px' ?? '160px'};
  }
`;

export const WrapInput = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Input = styled(BaseInput)`
  width: 4rem;
  height: 32px;
  float: right !important;
  clear: both !important;
  text-align: right !important;
`;

export const TextBold = styled('span')`
  font-weight: ${FONT_WEIGHT.bold};
`;

export const Text = styled('div')`
  font-size: ${FONT_SIZE.xs};
`;

export const ColorBox = styled('div')<{ color: string }>`
  height: 12px;
  width: 12px;
  border-radius: 2px;
  background-color: ${(props) => props.color};
  margin-right: 0.6rem;
`;

export const VerticalSeperator = styled('span')`
  width: 1px;
  height: 1.6rem;
  background-color: var(--black);
  margin: 0 0.6rem;
`;

export const WrapActionButton = styled('div')`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

export const ActionButton = styled(BaseButton)`
  height: 48px;
  flex: 1;
`;

export const CancelButton = styled(BaseButton)`
  height: 48px;
  flex: 1;
  color: var(--primary-color) !important;
  border: 1px solid var(--primary-color) !important;
`;

export const WrapItemCount = styled('div')`
  display: none;
  gap: 0.4rem;
  align-items: center;

  @media only screen and ${media.lg} {
    display: flex;
  }
`;

export const WrapErrors = styled('div')`
  color: var(--error-color);
`;
