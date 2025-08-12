import { COLLECT_VIEW } from '@/constants';
import { IIllegalData } from '@/interfaces';
import React from 'react';

import * as S from './../index.style';

interface Props {
  data: IIllegalData;
  view: string;
}

interface CollectionItem {
  id: number;
  label: string;
  color: string;
  value: number;
  view: string;
}

const CollectTab: React.FC<Props> = ({ data, view }) => {
  const initCollections: CollectionItem[] = [
    {
      id: 0,
      label: '1주내',
      color: '#82c156',
      value: data?.count?.produce?.within_1_week,
      view: 'produce',
    },
    {
      id: 1,
      label: '2주내',
      color: '#ffe63a',
      value: data?.count?.produce?.within_2_week,
      view: 'produce',
    },
    {
      id: 2,
      label: '2주이상',
      color: '#ea5d5f',
      value: data?.count?.produce?.more_than_2_week,
      view: 'produce',
    },
    {
      id: 3,
      label: '1주내',
      color: '#82c156',
      value: data?.count?.collection?.within_1_week,
      view: 'collection',
    },
    {
      id: 4,
      label: '2주내',
      color: '#ffe63a',
      value: data?.count?.collection?.within_2_week,
      view: 'collection',
    },
    {
      id: 5,
      label: '2주이상',
      color: '#ea5d5f',
      value: data?.count?.collection?.more_than_2_week,
      view: 'collection',
    },
  ];

  const collections =
    view === COLLECT_VIEW.ALL
      ? initCollections
      : initCollections?.filter((item) => item.view == view);

  const renderIcon = (color: string) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <g id="group_22163" data-name="group 22163" transform="translate(-1214 -449)">
        <g
          id="ellipse_214"
          data-name="ellipse 214"
          transform="translate(1214 449)"
          fill="#fff"
          stroke={color}
          strokeWidth="5"
        >
          <circle cx="20" cy="20" r="20" stroke="none" />
          <circle cx="20" cy="20" r="17.5" fill="none" />
        </g>
        <g id="group_22162" data-name="group 22162" transform="translate(0 -1)">
          <rect
            id="rectangle_8995"
            data-name="rectangle 8995"
            width="4"
            height="12"
            transform="translate(1232 461)"
            fill={color}
          />
          <rect
            id="rectangle_8996"
            data-name="rectangle 8996"
            width="4"
            height="4"
            transform="translate(1232 475)"
            fill={color}
          />
        </g>
      </g>
    </svg>
  );

  return (
    <S.Content>
      {collections?.map((item) => (
        <S.Item key={item.id}>
          <S.Svg $check={item.view == COLLECT_VIEW.COLLECTED}>{renderIcon(item.color)}</S.Svg>
          <S.Info>
            <S.Title>{item.label}</S.Title>
            <S.Value>{item.value || 0}</S.Value>
          </S.Info>
        </S.Item>
      ))}
    </S.Content>
  );
};

export default CollectTab;
