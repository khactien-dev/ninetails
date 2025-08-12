import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-top: 20px;
  margin-bottom: 15px;
`;

export const ActionsChart = styled.div`
  display: flex;
  align-items: center;
`;

export const FilterIconChart = styled.div<{ active: boolean; isPlay: boolean; isDisable: boolean }>`
  margin-left: 10px;
  width: 32px;
  height: 32px;
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
