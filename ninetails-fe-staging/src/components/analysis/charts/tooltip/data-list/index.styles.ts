import styled, { css } from 'styled-components';

export const Wrapper = styled.div``;

export const Legend = styled.li<{ color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  ${({ color }) =>
    color &&
    css`
      &:before {
        content: '';
        display: block;
        width: 10px;
        height: 10px;
        margin-right: 5px;
        border-radius: 50%;
        background-color: ${color};
      }
    `}

  > span:nth-of-type(1) {
    width: 110px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
`;
