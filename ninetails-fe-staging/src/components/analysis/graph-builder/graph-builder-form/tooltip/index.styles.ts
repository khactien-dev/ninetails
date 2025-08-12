import styled, { css } from 'styled-components';

export const TootipWrapper = styled.div`
  padding: 15px 0 15px 15px;
  background-color: #fff;
  width: 300px;
`;

export const CloseIcon = styled.div`
  position: absolute;
  top: -15px;
  right: 0px;
  cursor: pointer;
`;

export const Header = styled.div`
  position: relative;
  margin-bottom: 15px;
  text-align: center;
`;

export const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
`;

export const Content = styled.div`
  max-height: 300px;
  overflow: auto;
  padding-right: 5px;
`;

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
        width: 14px;
        height: 10px;
        margin-right: 10px;
        border-radius: 50%;
        background-color: ${color};
      }
    `}

  > span:nth-of-type(1) {
    width: 200px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  > span:nth-of-type(2) {
    min-width: 90px;
    text-align: right;
  }
`;
