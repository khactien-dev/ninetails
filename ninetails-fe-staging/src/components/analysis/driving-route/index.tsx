import Collapse from '@/components/analysis/collapse';
import * as S1 from '@/components/analysis/left-menu/index.styles';
import { roundToDecimal } from '@/utils/control';
import React from 'react';

import { useAnalysisContext } from '../context';
import IconSquare from './square-icon';

interface IDataOperationItem {
  label: string;
  icon: boolean;
  col2: string;
  col1: string;
  key: string;
  unit: string | 'percentage' | 'km' | 'minute' | 'count';
  onclick: () => void;
}

export const DrivingRoute = () => {
  const { operationStatistics, handleItemClick, dataOperation, activeKey } = useAnalysisContext();

  const calculateNumber = (num: number | string, unit: string) => {
    const epsilon = 0.000001;
    if (!isNaN(Number(num))) {
      switch (unit) {
        case 'km':
          return parseFloat((Number(num) / 1000 + epsilon).toFixed(3));
        case 'minute':
          return parseFloat((Number(num) / 60 + epsilon).toFixed(3));
        default:
          return num;
      }
    }
    return 0;
  };

  return (
    <S1.Div>
      <Collapse typeTitle={'[전체 배차]'} title={'운행경로 통계'}>
        <S1.DataColumn>
          <S1.Row>
            <S1.Col span={12}>
              <S1.Inline>
                <S1.Text>{'배차 운행'}</S1.Text>
              </S1.Inline>
              <S1.Inline>
                <S1.Text>
                  <span>{operationStatistics?.operatingRoutes}대</span>
                </S1.Text>
              </S1.Inline>
            </S1.Col>
            <S1.Col span={12}>
              <S1.InlineBetween>
                <S1.Text>{'최고'}</S1.Text>
                <S1.Text>
                  <span>{roundToDecimal(operationStatistics?.maxStandardScore ?? 0, 3)}</span>&nbsp;
                  {'점'}
                </S1.Text>
              </S1.InlineBetween>
              <S1.InlineBetween>
                <S1.Text>{'최저'}</S1.Text>
                <S1.Text>
                  <span>{roundToDecimal(operationStatistics?.minStandardScore ?? 0, 3)}</span>&nbsp;
                  {'점'}
                </S1.Text>
              </S1.InlineBetween>
            </S1.Col>
            <S1.Col span={12}>
              <S1.Text>
                <span>{'배차 운행'}</span>
              </S1.Text>
              <S1.Text>
                <span>{'평준화'}</span>
              </S1.Text>
            </S1.Col>
            <S1.Col span={12}>
              <S1.LargeText>
                <span>{roundToDecimal(operationStatistics?.averageStandardScore ?? 0, 3)}</span>
                &nbsp;
                {'점'}
              </S1.LargeText>
            </S1.Col>
          </S1.Row>
        </S1.DataColumn>
        <S1.Data>
          <S1.Row>
            <S1.Col span={11}>
              <S1.Head>{'주요 지표'}</S1.Head>
            </S1.Col>
            <S1.Col span={7}>
              <S1.Head2>{'표준편차'}</S1.Head2>
            </S1.Col>
            <S1.Col span={6}>
              <S1.Head2>{'평균'}</S1.Head2>
            </S1.Col>
          </S1.Row>
          {dataOperation.map((item: IDataOperationItem, index: number) => (
            <S1.Row
              key={index}
              onClick={() => {
                item.icon && handleItemClick(item.key, index);
              }}
            >
              <S1.Col span={11} style={{ color: activeKey === index ? '#57BA00' : '' }}>
                <S1.Flex>
                  {item.icon && (
                    <IconSquare key={activeKey} color={activeKey === index ? '#57BA00' : 'black'} />
                  )}
                  <S1.Text $hoverable={!!item.icon}>{item.label}</S1.Text>
                </S1.Flex>
              </S1.Col>
              <S1.Col span={7} style={{ color: activeKey === index ? '#57BA00' : '' }}>
                <S1.Text $hoverable={!!item.icon}>{calculateNumber(item.col2, item.unit)}</S1.Text>
              </S1.Col>
              <S1.Col span={6} style={{ color: activeKey === index ? '#57BA00' : '' }}>
                <S1.Text $hoverable={!!item.icon}>{calculateNumber(item.col1, item.unit)}</S1.Text>
              </S1.Col>
            </S1.Row>
          ))}
        </S1.Data>
      </Collapse>
    </S1.Div>
  );
};
