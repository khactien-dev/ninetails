import { BaseButton } from '@/components/common/base-button';
import { BaseRow } from '@/components/common/base-row';
import { BaseTooltip } from '@/components/common/base-tooltip';
import styled, { createGlobalStyle, css } from 'styled-components';

export const Wrapper = styled.div`
  font-size: 14px;
  .ant-form {
    padding: 30px 40px;
    background: #f7f6f9;

    .ant-form-item-label > label:after {
      content: '';
    }
  }
`;

export const List = styled.div`
  position: relative;
  width: 100%;
`;

export const Space = styled(BaseRow)`
  position: relative;
  > .ant-col {
    padding-right: 2px !important;
    &:nth-of-type(4) {
      @media screen and (min-width: 992px) {
        padding: 0 6px 0 2px !important;
      }
    }
  }
`;

export const LabelCustom = styled.div`
  height: 50px;
  line-height: 50px;
  padding-left: 6px;
`;

export const Add = styled(BaseButton)`
  display: flex;
  align-items: center;
  background-color: transparent !important;
  border: none;
  padding: 0;
  left: -40px;
  font-weight: 500;

  svg {
    margin-right: 5px;
  }
`;

export const DeleteBtn = styled(BaseButton)`
  margin-bottom: 16px;
  background-color: transparent;
  border: none;
  padding: 0;
  position: absolute;
  left: -30px;

  &:focus {
    outline: none;
  }
`;

export const SubmitWrapper = styled.div`
  border-top: 1px solid #d9d9d9;
  margin-top: 65px;
`;

export const BtnSubmit = styled(BaseButton)`
  min-width: 150px;
  margin: 16px auto 0;
  height: 33px;
  padding: 5px;

  svg {
    margin-bottom: 2px;
  }
`;

export const ChartWrapper = styled.div`
  position: relative;
`;

export const BuilderChartWrapper = styled.div`
  display: flex;
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

export const Chart = styled.div`
  width: calc(100% - 300px);
  position: relative;

  .canvasjs-chart-canvas {
    width: 100%;
  }
`;

export const Legends = styled.div`
  width: 270px;
  margin-left: 30px;
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

export const GlobalStyles = createGlobalStyle`
.tooltip-chart-builder {
  box-shadow: 0 3px 10px #ccc;

  .ant-tooltip-inner {
    color: #333 !important;
    min-width: 320px;
  }
}`;
