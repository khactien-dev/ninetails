import * as S from '@/components/schedule/left-content/statistic/index.styles';
import { IWholeDataTree } from '@/interfaces/schedule';
import { ColumnType } from 'antd/es/table';
import React from 'react';

interface IProps {
  dataSource: IWholeDataTree[];
  loading: boolean;
  section: 'staff' | 'vehicle';
}

export const WholeTable: React.FC<IProps> = (props) => {
  const { dataSource, loading, section } = props;

  const wholeTableColumn: ColumnType<any>[] = [
    {
      title: () => (
        <S.WrapIndicator>
          <S.IndicatiorBtn>주요 지표</S.IndicatiorBtn>
        </S.WrapIndicator>
      ),
      key: 'key_indicator',
      dataIndex: 'key_indicator',
      render: (value: string, record: IWholeDataTree) => {
        if (record?.layer === 2)
          return (
            <S.WrapIndicatorValue>
              <S.TextGray>{value}</S.TextGray>
            </S.WrapIndicatorValue>
          );
        return <S.WrapIndicatorValue>{value}</S.WrapIndicatorValue>;
      },
    },
    {
      title: () => <S.PrimaryTitle>배치</S.PrimaryTitle>,
      key: 'dispatching',
      dataIndex: 'dispatching',
      render: (value: string, record: IWholeDataTree) => {
        if (record.bolds?.includes('dispatching')) return <S.boldText>{value}</S.boldText>;
        if (record?.layer === 2) return <S.TextGray>{value}</S.TextGray>;
        return <>{value}</>;
      },
    },
    {
      title: () => <S.PrimaryTitle>대기</S.PrimaryTitle>,
      key: 'available',
      dataIndex: 'available',
      render: (value: string, record: IWholeDataTree) => {
        if (record.bolds?.includes('available')) return <S.boldText>{value}</S.boldText>;
        if (record?.layer === 2) return <S.TextGray>{value}</S.TextGray>;
        return <>{value}</>;
      },
    },
    {
      title: () => <S.PrimaryTitle>{section === 'staff' ? '열외' : '정비'}</S.PrimaryTitle>,
      key: 'absent',
      dataIndex: 'absent',
      render: (value: string, record: IWholeDataTree) => {
        if (record.bolds?.includes('absent')) return <S.boldText>{value}</S.boldText>;
        if (record?.layer === 2) return <S.TextGray>{value}</S.TextGray>;
        return <>{value}</>;
      },
    },
    {
      title: () => <S.PrimaryTitle>합계</S.PrimaryTitle>,
      key: 'total',
      dataIndex: 'total',
      render: (value: string, record: IWholeDataTree) => {
        if (record.bolds?.includes('total')) return <S.boldText>{value}</S.boldText>;
        if (record?.layer === 2) return <S.TextGray>{value}</S.TextGray>;
        return <>{value}</>;
      },
    },
  ];

  return (
    <S.WholeTable
      columns={wholeTableColumn}
      pagination={false}
      dataSource={dataSource}
      loading={loading}
    />
  );
};
