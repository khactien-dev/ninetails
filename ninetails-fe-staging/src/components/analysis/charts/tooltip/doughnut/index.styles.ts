import styled, { css } from 'styled-components';

export const Wrapper = styled.div``;

export const Chart = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Icon = styled.div`
  cursor: pointer;
`;

export const Legends = styled.div`
  width: 50%;
  margin: auto;
`;

export const Legend = styled.div<{ $hidden?: boolean }>`
  align-items: center;
  margin-right: 25px;
  margin-bottom: 10px;
  display: ${(props) => (props?.$hidden ? 'none' : 'flex')};
`;

export const LegendAVG = styled.div`
  margin-bottom: 20px;
`;

export const LegendList = styled.div`
  display: grid;
  grid-template-rows: repeat(3, auto);
  grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: column;
  overflow: auto;

  ::-webkit-scrollbar {
    height: 1px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.5) #f1f1f1;
`;

export const LegendName = styled.span`
  min-width: 80px;
  font-size: 13px;
`;

export const LegendValue = styled.span`
  margin-right: 5px;
  min-width: 50px;
  font-size: 13px;
`;

export const LegendRate = styled.span`
  font-weight: bold;
  font-size: 13px;
`;

export const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  margin-right: 5px;
  ${({ color }) => css`
    background-color: ${color};
    border: 1px solid ${color};
  `}
`;
