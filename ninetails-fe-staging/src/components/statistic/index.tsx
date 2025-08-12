import IconSearch from '@/assets/images/svg/icon-search-2.svg';
import { BaseTable } from '@/components/common/base-table';
import { useResponsive } from '@/hooks/useResponsive';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { MainFooter } from '@/layouts/admin-layout/footer';
import { DatePicker, Select, TabsProps } from 'antd';
import React from 'react';

import * as S from './index.styles';
import useStatistic from './index.utils';

const { Option } = Select;

const Statistic: React.FC = () => {
  const { isTablet } = useResponsive();
  const { vehicleList, driverList, tableData, columns, tabs } = useStatistic();
  const tabsFilter: TabsProps['items'] = [
    {
      key: '1',
      label: '1일',
    },
    {
      key: '2',
      label: '1주일',
    },
    {
      key: '3',
      label: '1개월',
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <S.TablesWrapper>
      <LeftContent width={340}>
        <S.Wrapper>
          <S.Form>
            <Select disabled={true} placeholder={'000-전체구역'}>
              <Option value="male">000-전체구역</Option>
            </Select>
            <DatePicker.RangePicker style={{ width: '100%' }} />
            <S.GroupButton>
              <S.TabsFilter defaultActiveKey="1" items={tabsFilter} onChange={onChange} />
              <S.Search>
                <IconSearch />
                검색
              </S.Search>
            </S.GroupButton>
          </S.Form>
          <S.TableData>
            <S.Row>
              <S.Col span={9}>{'차량'}</S.Col>
              <S.Col span={5}>{'합계'}</S.Col>
              <S.Col span={5}>{'일평균'}</S.Col>
              <S.Col span={5}>{'비중%'}</S.Col>
            </S.Row>
            {vehicleList?.map((item: any) => (
              <S.Row key={item.key}>
                <S.Col span={'9'}>
                  {item?.status?.icon}
                  <span style={{ marginLeft: '8px' }}>{item?.status?.name}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.total}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.average}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.importance}</span>
                </S.Col>
              </S.Row>
            ))}
          </S.TableData>
          <S.TableData>
            <S.Row>
              <S.Col span={9}>{'인력'}</S.Col>
              <S.Col span={5}>{'합계'}</S.Col>
              <S.Col span={5}>{'일평균'}</S.Col>
              <S.Col span={5}>{'비중%'}</S.Col>
            </S.Row>
            {driverList?.map((item: any) => (
              <S.Row key={item.key}>
                <S.Col span={'9'}>
                  {item?.status?.icon}
                  <span style={{ marginLeft: '8px' }}>{item?.status?.name}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.total}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.average}</span>
                </S.Col>
                <S.Col span={'5'}>
                  <span>{item?.importance}</span>
                </S.Col>
              </S.Row>
            ))}
          </S.TableData>
        </S.Wrapper>
      </LeftContent>

      <S.RightArea>
        <S.WrapHeader>
          <S.Row>
            <S.Col md={9}>
              <S.Heading>
                {'근무배치표'}
                <span>2023년 6월 1일 (목)</span>
              </S.Heading>
            </S.Col>
            {isTablet && (
              <S.Col span={15}>
                <S.GroupButton>
                  <S.Button className={'btn-primary'}>{'입력'}</S.Button>
                  <S.Button>{'수정'}</S.Button>
                  <S.Button className={'btn-blur-primary'}>{'EXCEL'}</S.Button>
                  <S.Button className={'btn-blur-primary'}>{'PDF'}</S.Button>
                </S.GroupButton>
              </S.Col>
            )}
          </S.Row>
          <S.Tabs defaultActiveKey="1" items={tabs} onChange={onChange} />
          <S.WrapContent>
            <BaseTable
              columns={columns}
              dataSource={tableData}
              rowKey={'id'}
              pagination={{ position: ['bottomCenter'] }}
            />
          </S.WrapContent>
        </S.WrapHeader>
        <MainFooter isShow={true}></MainFooter>
      </S.RightArea>
    </S.TablesWrapper>
  );
};

export default Statistic;
