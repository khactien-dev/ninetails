import triangle from '@/assets/images/chart/smooth-triangle.png';
import { BaseDivider } from '@/components/common/base-divider';
import styled from 'styled-components';

export const CoreDataSetContainer = styled('div')`
  width: 100%;
`;

export const WrapSlider = styled('div')`
  position: relative;
  margin-top: 2rem;
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
  left: ${(props) => `calc(2% * ${props.index} - 0.5px)`};
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

export const Track = styled('div')<{ trackWidth: number; trackLeft: number; index: number }>`
  position: absolute;
  height: 10px;
  background-color: ${(props) =>
    props.index === 0
      ? 'rgba(244, 88, 0, 0.5)'
      : props.index === 1
      ? 'rgba(22, 133, 2, 0.5)'
      : props.index === 2
      ? 'rgba(20, 159, 236, 0.5)'
      : props.index === 3
      ? 'rgba(251, 177, 11, 0.5)'
      : props.index === 4
      ? 'rgba(232, 27, 236, 0.5)'
      : 'rgba(250, 12, 117, 0.5)'};
  bottom: 4px;
  width: ${(props) => `${props.trackWidth}%`};
  left: ${(props) => `${props.trackLeft}%`};
  z-index: 1;
`;

export const SettingButton = styled('div')<{ $disabled: boolean }>`
  border: none;
  gap: 1rem;
  color: rgba(34, 34, 34, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
`;

export const SettingDivider = styled(BaseDivider)`
  margin: 0.6rem 0;
`;

export const Div = styled.div``;

export const WrapCoreDataSet = styled.div`
  transform-origin: top left;

  .wrap-tree-table {
    width: 1320px;
    .ant-table-wrapper {
      padding-left: 0 !important;
    }
    .questionare-icon {
      display: none;
    }
  }
`;
