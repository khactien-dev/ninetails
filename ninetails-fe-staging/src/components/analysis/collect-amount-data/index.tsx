import * as S1 from '@/components/analysis/left-menu/index.styles';
import { IAnalysis } from '@/interfaces';
import React, { useMemo } from 'react';

import { useAnalysisContext } from '../context';

interface ITabs {
  tab: string;
}

export const AmountData = (props: ITabs) => {
  const { tab } = props;

  const { collectionStatistics } = useAnalysisContext();
  const data = collectionStatistics;

  const listData: IAnalysis | undefined = useMemo(() => {
    if (tab === 'average') {
      return data?.average || undefined;
    } else {
      return data?.total || undefined;
    }
  }, [tab, data]);

  const typeClassification = [
    {
      key: ['5L_gen', '10L_gen', '20L_gen', '30L_gen', '50L_gen', '75L_gen'],
      label: '일반',
      color: '#EA5D60',
      labelShort: '일',
    },
    {
      key: ['10L_reu', '20L_reu'],
      label: '재사용',
      color: '#83C257',
      labelShort: '재',
    },
    {
      key: ['50L_pub', '75L_pub'],
      label: '공공',
      color: '#61C6ED',
      labelShort: '공',
    },
    {
      key: ['ext'],
      label: '초과',
      color: '#444444',
      labelShort: '초',
    },
    {
      key: ['etc'],
      label: '기타',
      labelShort: '기',
      color: '#999999',
    },
  ];
  const dataClassification = [
    {
      key: 1,
      type: '5L_gen',
      quality: listData?.['5L_gen'] ?? 0,
      mass: '5L',
    },
    {
      key: 2,
      type: '10L_gen',
      quality: listData?.['10L_gen'],
      mass: '10L',
    },
    {
      key: 3,
      type: '10L_reu',
      quality: listData?.['10L_reu'],
      mass: '10L',
    },
    {
      key: 4,
      type: '20L_gen',
      quality: listData?.['20L_gen'],
      mass: '20L',
    },
    {
      key: 5,
      type: '20L_reu',
      quality: listData?.['20L_reu'],
      mass: '20L',
    },
    {
      key: 6,
      type: '30L_gen',
      quality: listData?.['30L_gen'],
      mass: '30L',
    },
    {
      key: 7,
      type: '50L_gen',
      quality: listData?.['50L_gen'],
      mass: '50L',
    },
    {
      key: 8,
      type: '50L_pub',
      quality: listData?.['50L_pub'],
      mass: '50L',
    },
    {
      key: 9,
      type: '75L_gen',
      quality: listData?.['75L_gen'],
      mass: '75L',
    },
    {
      key: 10,
      type: '75L_pub',
      quality: listData?.['75L_pub'],
      mass: '75L',
    },
    {
      key: 11,
      type: 'ext',
      quality: listData?.['ext'],
      mass: '초과',
    },
    {
      key: 12,
      type: 'etc',
      quality: listData?.['etc'],
      mass: '기타',
    },
  ];

  const general = [
    {
      label: '수거량',
      value: `${listData?.collectAmount ?? 0} 개`,
    },
    {
      label: '최대',
      value: `${listData?.max ?? 0} 개`,
    },
    {
      label: '무게',
      value: `${listData?.weight ?? 0} kg`,
    },
    {
      label: '최소',
      value: `${listData?.min} 개`,
    },
  ];

  return (
    <>
      <S1.Row justify="space-between">
        {general.map((item) => (
          <>
            <S1.Col span={4}>
              <S1.Text>{item.label}</S1.Text>
            </S1.Col>
            <S1.Col span={8}>
              <S1.Text>
                <span>{item.value}</span>
              </S1.Text>
            </S1.Col>
          </>
        ))}
      </S1.Row>
      <S1.Div>
        <S1.ListGrid>
          {typeClassification.map((item, index) => (
            <S1.ListGridItem key={index}>
              <span style={{ backgroundColor: item.color }}></span>
              {item.label}
            </S1.ListGridItem>
          ))}
        </S1.ListGrid>
        <div style={{ clear: 'both' }}></div>
        <S1.ListDataGrid>
          {dataClassification.map((item, index) => {
            const classification = typeClassification.find((typeItem) =>
              typeItem.key.includes(item?.type)
            );

            return classification ? (
              <S1.ListDataItem key={index}>
                <span style={{ backgroundColor: classification.color }}>
                  {classification.labelShort}
                </span>
                <S1.Text>
                  {item.mass} <br />
                  {item.quality}
                </S1.Text>
              </S1.ListDataItem>
            ) : null;
          })}
        </S1.ListDataGrid>
      </S1.Div>
    </>
  );
};
