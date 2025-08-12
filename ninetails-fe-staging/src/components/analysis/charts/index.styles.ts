import { BaseDivider } from '@/components/common/base-divider';
import { BaseTooltip } from '@/components/common/base-tooltip';
import styled, { createGlobalStyle, css } from 'styled-components';

export const Wrapper = styled.div`
  padding: 30px 0;
  position: relative;
  background-color: #fff;
`;

export const Loading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ChartWrapper = styled.div`
  display: flex;
`;

export const Chart = styled.div`
  width: calc(100% - 300px);
  position: relative;

  .canvasjs-chart-canvas {
    width: 100%;
  }
`;

export const Tooltip = styled(BaseTooltip)<{ top: string; left: string }>`
  position: absolute;
  height: 20px;
  width: 20px;
  ${({ top, left }) => css`
    top: ${top};
    left: ${left};
  `}
`;

export const Legends = styled.div`
  width: 270px;
  margin-left: 30px;
`;

export const Title = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 24px;
`;

export const TabWrapper = styled.div`
  margin-top: 32px;
`;

export const Tabs = styled.ul`
  display: flex;
  list-style: none;
  justify-content: space-between;
`;

export const Tab = styled.li<{ active: boolean }>`
  text-align: center;
  flex: 1;
  font-weight: ${({ active }) => active && 'bold'};
  color: ${({ active }) => `#${active ? '333' : 'ccc'}`};
  cursor: pointer;
  transition: 0.4s;

  &:hover {
    color: #333;
    font-weight: bold;
  }
`;

export const TabContent = styled.div``;

export const TooltipWrapper = styled.div`
  padding: 20px;
`;

export const TootipLegends = styled.ul`
  list-style: none;
`;

export const TootipLegend = styled.li<{ color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  &:before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
    border-radius: 50%;
    ${({ color }) => css`
      background-color: ${color};
    `}
  }

  > span:nth-of-type(1) {
    min-width: 100px;
  }
`;

export const GlobalStyles = createGlobalStyle`
.tooltip-chart {
  box-shadow: 0 3px 10px #ccc;

  .ant-tooltip-inner {
    color: #333 !important;
    min-width: 220px;
  }

  &.tooltip-chart-doughnut {
    .ant-tooltip-inner {
      width: 370px
    }
  }
}

.legends-checkbox {

  .ant-checkbox-inner {
    border: 1px solid #726f6f !important;
  }

  &:hover {
    .ant-checkbox-inner {
      background-color: #fff !important;
    }
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: white;
  }

  .ant-checkbox-checked .ant-checkbox-inner::after {
    top: 50%;
    inset-inline-start: 50%;
    width: 12px;
    height: 12px;
    background-color: #726f6f;
    border: 0;
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    content: "";
  }


}

.fullscreen-enabled{
  background-color: #fff;
  padding:  20px;
}
`;

export const SettingButton = styled.div<{ $disabled?: boolean }>`
  border: none;
  gap: 1rem;

  color: rgba(34, 34, 34, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

export const SettingDivider = styled(BaseDivider)`
  margin: 0.6rem 0;
`;
