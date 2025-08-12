import { SORT_TYPE } from '@/constants';

import * as S from './index.styles';

export type SortValueType = {
  key: string;
  order: SORT_TYPE.ASC | SORT_TYPE.DESC | null;
};

export interface BaseSortTableProps {
  data: { title: string; key: string }[];
  value: SortValueType;
  onSort?: (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => void;
}

const BaseSortTable = ({ data, value: { key: activeKey, order }, onSort }: BaseSortTableProps) => {
  const handleSort = (key: string) => {
    if (!onSort) return;
    if (activeKey === key) {
      let newOrder: SORT_TYPE.ASC | SORT_TYPE.DESC | null = SORT_TYPE.ASC;
      if (order === SORT_TYPE.ASC) newOrder = SORT_TYPE.DESC;
      else if (order === SORT_TYPE.DESC) {
        newOrder = null;
        key = '';
      }
      onSort(key, newOrder);
    } else {
      onSort(key, SORT_TYPE.ASC);
    }
  };

  return (
    <S.Wrapper>
      <S.Global />
      {data.map((item) => (
        <S.Item key={item.key} onClick={() => handleSort(item.key)}>
          <S.Title>{item.title}</S.Title>
          <S.SortContainer>
            <S.SortUpIcon active={activeKey === item.key && order === SORT_TYPE.ASC} />
            <S.SortDownIcon active={activeKey === item.key && order === SORT_TYPE.DESC} />
          </S.SortContainer>
        </S.Item>
      ))}
    </S.Wrapper>
  );
};

export default BaseSortTable;
