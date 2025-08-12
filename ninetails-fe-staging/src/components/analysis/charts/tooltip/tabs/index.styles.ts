import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Content = styled.div`
  margin-top: 10px;
`;

export const Tabs = styled.div`
  display: flex;
  justify-content: center;
`;

export const Tab = styled.div<{ active: boolean }>`
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 'bold' : '')};
  transition: 0.4s;

  &:hover {
    font-weight: bold;
  }

  &:not(:last-child) {
    margin-right: 20px;
  }
`;
