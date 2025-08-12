import styled from 'styled-components';

export const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  svg {
    cursor: pointer;
  }
`;

export const LabelDate = styled.div`
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 34px;
`;

export const ButtonPagination = styled.div<{ $isDisabled?: boolean; $type: 'prev' | 'next' }>`
  border-radius: 8px;
  border: ${(props) => (props.$isDisabled ? '1px solid #959291' : '1px solid #57BA00')};
  background: #fff;
  display: flex;
  height: 30px;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.$isDisabled ? '#959291' : '#57BA00')};
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  cursor: ${(props) => (!props.$isDisabled ? 'pointer' : 'not-allowed')};
  width: 86px;
  padding: ${(props) => (props.$type === 'prev' ? '0 1rem 0 0' : '0 0 0 1rem')};

  svg > path {
    fill: ${(props) => (props.$isDisabled ? '' : '#57BA00')};
  }
`;

export const Flex = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 0.4rem;
`;
