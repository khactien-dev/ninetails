import { CaretUpOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';

export const Wrapper = styled.div`
  height: 52px;
  display: flex;
  flex-direction: column;
  justify-content: end;
`;

export const SortIcon = styled(CaretUpOutlined)<{ active?: boolean }>`
  font-size: 14px;
  color: ${(props) => (props.active ? '#0E7E01' : '#b5b5b5')};
  cursor: pointer;
  transition: 0.3s;
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;

  &:not(:last-child) {
    margin-bottom: 6px;
  }

  &:hover {
    ${SortIcon} {
      color: #6d6d6d;
    }
  }
`;

export const SortContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.span`
  font-size: 14px;
  color: #555;
  font-weight: 600;
  margin-right: 10px;
`;

export const SortUpIcon = styled(SortIcon)`
  margin-bottom: -5px;
`;

export const SortDownIcon = styled(SortIcon)`
  transform: rotate(180deg);
`;

export const Global = createGlobalStyle`
  .ant-table-cell {
    &:before {
      content: unset !important;
    }
  }
`;
