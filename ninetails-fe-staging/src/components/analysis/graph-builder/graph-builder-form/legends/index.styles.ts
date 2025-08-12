import styled, { css } from 'styled-components';

export const Legends = styled.div`
  border: 1px solid #ccc;
  padding: 16px 16px 16px 40px;
  background-color: #fff;
`;

export const Legend = styled.div`
  position: relative;
  margin-bottom: 5px;

  label {
    font-size: 14px;
    align-items: center;
  }
`;

export const CollapseIcon = styled.div<{ isCollapse: boolean }>`
  display: flex;
  align-items: center;
  position: absolute;
  left: -25px;
  top: 10px;
  transform: ${({ isCollapse }) =>
    `translateY(-50%) scale(0.8) rotate(${isCollapse ? 0 : '180deg'});`};
  font-size: 20px;
  cursor: pointer;
`;

export const LabelCheckbox = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled.div`
  margin-left: 5px;
  width: calc(100% - 25px);
`;

export const LegendChildrent = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? '' : 'none')};
`;

export const LegendColumn = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  margin-right: 9px;
  ${({ color }) => css`
    background-color: ${color};
  `}
`;

export const LegendLine = styled.div<{ color: string }>`
  width: 25px;
  height: 1px;
  ${({ color }) => css`
    background-color: ${color};
    border: 2px solid ${color};
  `}
`;

export const LegendWrapper = styled.div`
  position: relative;
`;

export const LegendSPLine = styled.div`
  display: flex;
  width: 25px;
  justify-content: space-between;
`;

export const SplineItem = styled.div<{ color: string }>`
  width: 7px;
  ${({ color }) => css`
    border: 2px solid ${color};
  `}
`;

export const MakerCommon = styled.div<{ color: string; isDashed: boolean }>`
  width: 12px;
  height: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: ${({ color, isDashed }) => (isDashed ? '#fff' : color)};
  border: 2px solid ${({ color }) => color};

  ${({ isDashed }) =>
    isDashed &&
    css`
      &::before {
        content: '';
        display: block;
        width: 12px;
        height: 12px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: transparent;
        border: 2px solid #fff;
      }
    `}
`;

export const MakerCircle = styled(MakerCommon)`
  border-radius: 50%;
`;

export const MakerSquare = styled(MakerCommon)``;

export const MakerTriangleWrapper = styled.div`
  position: relative;
`;

export const MakerTriangle = styled.div<{ color: string; isDashed: boolean }>`
  width: 0;
  height: 0;
  border-left: 6px solid transparent; /* Tạo tam giác bên ngoài */
  border-right: 6px solid transparent;
  border-bottom: 12px solid ${({ color }) => color}; /* Viền đỏ bao quanh */
  position: absolute;
  top: 1px;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;

  &:before {
    content: '';
    width: 0;
    height: 0;
    display: block;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 8px solid ${({ color, isDashed }) => (isDashed ? '#fff' : color)};
    position: absolute;
    top: 2px;
    left: -4px;
    z-index: 1;
  }
`;

export const MakerOverlay = styled(MakerCommon)`
  border: 2px solid #fff;
  background-color: #fff;
`;

export const AvgLegend = styled.div`
  margin-bottom: 10px;
`;

export const OtherLegend = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;
