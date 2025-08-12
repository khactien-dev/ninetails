import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  margin-bottom: 15px;
`;

export const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

export const Tab = styled.div<{ active: boolean; isgraph: boolean }>`
  margin-right: 50px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  padding: 0 11px;
  border-radius: 6px;
  line-height: 34px;
  font-weight: bold;

  ${({ active, isgraph }) => css`
    color: ${isgraph ? '#fff' : active ? '#57BA00' : '#D9D9D9'};
    background-color: ${isgraph ? (active ? '#57BA00' : '#D9D9D9') : '#fff'};
  `}
`;

export const GraphBuilder = styled.div`
  margin: 20px 0;
`;

export const ActionsChart = styled.div`
  display: flex;
  align-items: center;
`;

export const Collapse = styled.div<{ disable?: boolean }>`
  margin-right: 16px;
  display: flex;
  align-items: center;

  ${({ disable }) => css`
    cursor: ${disable ? 'not-allowed' : 'pointer'};
    opacity: ${disable ? '0.4' : '1'};
  `}
`;

export const FilterIconChart = styled.div<{ active: boolean; isPlay: boolean; isDisable: boolean }>`
  margin-left: 10px;
  width: 33px;
  height: 33px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ active, isPlay, isDisable }) => {
    const borderColor = isPlay ? 'green' : active ? '#57BA00' : '#959291';
    const backgroundColor = isPlay ? 'green' : '';
    const color = isPlay ? '#fff' : '';
    const cursor = isDisable ? 'not-allowed' : 'pointer';
    const opacity = isDisable ? '0.3' : '1';

    return `
      border: 1px solid ${borderColor};
      background-color: ${backgroundColor};
      color: ${color};
      cursor: ${cursor};
      opacity: ${opacity};

       svg {
        path {
          fill: ${isPlay ? '#fff' : borderColor};
        }
      }
    `;
  }}
`;
