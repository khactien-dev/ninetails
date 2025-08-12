import { useAnalysisContext } from '@/components/analysis/context';
import { CHART_TABS, TOOLTIP_TABS } from '@/constants/charts';
import { formatNumberWithCommas } from '@/utils';
import { kmConversion, minuteConversion } from '@/utils/control';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

import DoughnutChart from './chart';
import * as S from './index.styles';

const _renderLegendColor = (color: string) => <S.LegendColor color={color} />;

enum NAME_PREFIX_OF_DATA_TOOLTIP {
  COLLECT_DISTANCE = '수거 거리',
  OTHER_COLLECT_DISTANCE = '기타 거리',
  COLLECT_DURATION = '수거 시간',
  OTHER_COLLECT_DURATION = '기타 시간',
}

type IProps = {
  tab?: string;
};

enum COLLECTION_AMOUNT_TYPE {
  VOLUME = 'm3',
}

const DoughnutTooltip = ({ tab }: IProps) => {
  const { dataTooltip, tabActive, unitCollectCount } = useAnalysisContext();
  const [isAvg, setIsAvg] = useState(false);

  const yAxisConversion = (name: string, yValue: number) => {
    if (
      name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.COLLECT_DISTANCE) ||
      name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.OTHER_COLLECT_DISTANCE)
    ) {
      return kmConversion(yValue);
    } else if (
      name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.COLLECT_DURATION) ||
      name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.OTHER_COLLECT_DURATION)
    ) {
      return minuteConversion(yValue);
    } else {
      return yValue;
    }
  };

  const isDrivingRouteTab = useMemo(() => tabActive === CHART_TABS.DRIVING_ROUTE, [tabActive]);

  const chartDatas = useMemo(() => {
    if (isDrivingRouteTab) {
      const dataTotals = dataTooltip.data.filter((dp) => dp.lineDashType !== 'dash');

      const data =
        tab === TOOLTIP_TABS.DISTANCE
          ? dataTotals.filter(
              (item) =>
                item.name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.COLLECT_DISTANCE) ||
                item.name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.OTHER_COLLECT_DISTANCE)
            )
          : dataTotals.filter(
              (item) =>
                item.name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.COLLECT_DURATION) ||
                item.name?.includes(NAME_PREFIX_OF_DATA_TOOLTIP.OTHER_COLLECT_DURATION)
            );

      const unit = tab === TOOLTIP_TABS.DISTANCE ? 'km' : '분';

      const total = data.reduce((acc, cur) => acc + cur.y, 0);

      let totalData = data.map((item, ind) => {
        const rate = (item.y / total) * 100;
        const formatedY = yAxisConversion(item.name, item.y);

        return {
          ...item,
          rate: !isNaN(rate) ? `${parseFloat(rate.toFixed(3))}%` : '',
          name: ind ? '기타' : '수거',
          prefix: '합계: ',
          y: formatedY ?? '0',
          unit: '',
        };
      });

      let avgData = data.map((item, ind) => {
        const formatedY = yAxisConversion(item.name, item.y);

        return {
          ...item,
          y: item.routeLength ? +(formatedY / item.routeLength).toFixed(3) : 0,
          color: ind ? '#FF82BD' : '#666666',
          rate: null,
          name: ind ? '기타' : '수거',
          prefix: '평균: ',
          unit: '',
        };
      });

      return {
        list: totalData,
        avg: avgData,
        unit,
      };
    } else {
      const avgData = dataTooltip.data
        .filter((data) => data.lineDashType)
        .map((item, ind) => ({
          ...item,
          rate: '',
          prefix: '',
          color: ind ? '#666666' : '#FF82BD',
          unit:
            unitCollectCount === COLLECTION_AMOUNT_TYPE.VOLUME ? 'm³' : unitCollectCount || '개',
        }));

      const dataList = dataTooltip.data.filter(
        (item) => !item.lineDashType && item.name !== '배차합계: 수량'
      );

      const totalList = dataList.reduce((a, b) => a + b.y, 0);

      const listData = dataList.map((item) => {
        const rate = (item.y / totalList) * 100;
        return {
          ...item,
          rate: !isNaN(rate) ? `${parseFloat(rate.toFixed(3))}%` : '',
          prefix: '',
          name: item.name.replace('배차 합계: ', ''),
          y: item.y ?? '',
          unit:
            unitCollectCount === COLLECTION_AMOUNT_TYPE.VOLUME ? 'm³' : unitCollectCount || '개',
        };
      });

      return {
        list: listData,
        avg: avgData,
        unit: '',
      };
    }
  }, [dataTooltip, tab, tabActive, isDrivingRouteTab]);

  const handleArrowAction = () => {
    setIsAvg(!isAvg);
  };

  const renderLegends = (data: (typeof chartDatas)['list' | 'avg']) => {
    return (
      <>
        {data.map(({ name, color, y, rate, prefix, unit, hiddenInTooltip }, index) => (
          <S.Legend key={index} $hidden={hiddenInTooltip}>
            {_renderLegendColor(color)}
            <S.LegendName>
              {prefix}
              {name}
            </S.LegendName>
            <S.LegendValue>
              {!isNaN(y) ? formatNumberWithCommas(+y) : '- '}
              {isDrivingRouteTab ? chartDatas.unit : unit}
            </S.LegendValue>
            {rate && <S.LegendRate>{rate}</S.LegendRate>}
          </S.Legend>
        ))}
      </>
    );
  };

  if (chartDatas)
    return (
      <>
        <S.Chart>
          {isDrivingRouteTab && (
            <S.Icon>
              <LeftOutlined onClick={handleArrowAction} style={{ fontSize: '30px' }} />
            </S.Icon>
          )}

          <DoughnutChart data={isAvg ? chartDatas.avg : chartDatas.list} unit={chartDatas.unit} />
          {isDrivingRouteTab && (
            <S.Icon>
              <RightOutlined onClick={handleArrowAction} style={{ fontSize: '30px' }} />
            </S.Icon>
          )}
        </S.Chart>

        {isDrivingRouteTab ? (
          <>
            <S.LegendList>{renderLegends(chartDatas.list)}</S.LegendList>
            <S.LegendAVG>{renderLegends(chartDatas.avg)}</S.LegendAVG>
          </>
        ) : (
          <>
            <S.LegendAVG>{renderLegends(chartDatas.avg)}</S.LegendAVG>
            <S.LegendList>{renderLegends(chartDatas.list)}</S.LegendList>
          </>
        )}
      </>
    );
};

export default DoughnutTooltip;
