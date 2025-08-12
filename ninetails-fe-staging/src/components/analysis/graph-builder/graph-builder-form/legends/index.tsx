import { BaseCheckbox } from '@/components/common/base-checkbox';
import { ACTIONS_CHART_KEY } from '@/constants/charts';
import { ChartDataItemType } from '@/interfaces';
import { sortDataChart } from '@/utils';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useMemo } from 'react';

import { useGraphBuilderContext } from '../context';
import * as S from './index.styles';

const LegendSpline = ({ color }: { color: string }) => {
  return (
    <S.LegendSPLine>
      <S.SplineItem color={color} />
      <S.SplineItem color={color} />
      <S.SplineItem color={color} />
    </S.LegendSPLine>
  );
};

const _renderLengend = (chart: ChartDataItemType) => {
  switch (chart.type) {
    case 'line': {
      let maker = <></>;
      if (chart?.markerType) {
        switch (chart.markerType) {
          case 'circle':
            maker = <S.MakerCircle color={chart.color} isDashed={chart?.lineDashType === 'dash'} />;
            break;
          case 'square':
            maker = <S.MakerSquare color={chart.color} isDashed={chart?.lineDashType === 'dash'} />;
            break;
          default:
            break;
        }
        return (
          <S.LegendWrapper>
            {maker}
            <S.LegendLine color={chart.color}></S.LegendLine>
          </S.LegendWrapper>
        );
      }
      return <S.LegendLine color={chart.color}></S.LegendLine>;
    }
    case 'spline': {
      return <LegendSpline color={chart.color} />;
    }
    case 'column': {
      return <S.LegendColumn color={chart.color} />;
    }
    case 'stackedColumn':
      return <S.LegendColumn color={chart.color} />;
    default:
      return;
  }
};

const BuilderLegends = () => {
  const {
    dataTemps,
    legendKeys,
    setLegendKeys,
    generateChart,
    actionKeys,
    setActionKeys,
    payload,
  } = useGraphBuilderContext();

  const handleChangeLegend = (e: CheckboxChangeEvent) => {
    const { checked, value } = e.target;
    const avgKeys = payload?.yAxises2 ? ['1', '2', '3', '4'] : ['1', '2'];
    let newLegendKeys = [...legendKeys];
    const newActionKeys = { ...actionKeys };

    let newRoutesY1 = '';
    let newRoutesY2 = '';

    if (checked) {
      if (value === 'all') {
        newLegendKeys = dataTemps.map((item) => item.key);
      } else {
        newLegendKeys.push(value);
      }
    } else {
      newLegendKeys = newLegendKeys.filter((item) => item !== value);
    }

    const isCheckAVG = avgKeys.every((item) => newLegendKeys.includes(item));

    if (isCheckAVG) {
      newActionKeys.active = Array.from(new Set([...newActionKeys.active, ACTIONS_CHART_KEY.AVG]));
    } else {
      newActionKeys.active = newActionKeys.active.filter((item) => item !== ACTIONS_CHART_KEY.AVG);
    }

    const routes = newLegendKeys.filter((item) => isNaN(+item));

    newRoutesY1 = routes.filter((route) => !route.toString().includes('secondary')).join(',');
    newRoutesY2 = routes
      .filter((route) => route.toString().includes('secondary'))
      .map((item) => item.toString().replace('secondary', ''))
      .join(',');

    generateChart(newRoutesY1, newRoutesY2, newLegendKeys);

    setLegendKeys(newLegendKeys);
    setActionKeys(newActionKeys);
  };

  const isCheckAll = useMemo(() => legendKeys.length === dataTemps.length, [legendKeys, dataTemps]);

  const legendRemains = useMemo<{
    newRoutesY1: Array<string | number>;
    newRoutesY2: Array<string | number>;
  }>(() => {
    return legendKeys
      .filter((item: string | number) => isNaN(+item))
      .reduce(
        (
          acc: { newRoutesY1: Array<string | number>; newRoutesY2: Array<string | number> },
          route: string | number
        ) => {
          const routeStr = route.toString();
          routeStr.includes('secondary')
            ? acc.newRoutesY2.push(routeStr)
            : acc.newRoutesY1.push(routeStr);
          return acc;
        },
        { newRoutesY1: [], newRoutesY2: [] }
      );
  }, [legendKeys]);

  return (
    <S.Legends>
      <S.Legend>
        <BaseCheckbox
          value="all"
          checked={isCheckAll}
          disabled={isCheckAll}
          onChange={(e) => handleChangeLegend(e)}
        >
          <S.LabelCheckbox>All</S.LabelCheckbox>
        </BaseCheckbox>
      </S.Legend>
      <S.AvgLegend>
        {sortDataChart(dataTemps).legendSpLines.map((chart) => {
          return (
            <S.Legend key={chart.key}>
              {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                <BaseCheckbox
                  value={chart.key}
                  checked={legendKeys.includes(chart.key)}
                  onChange={(e) => handleChangeLegend(e)}
                  className="legends-checkbox"
                >
                  <S.LabelCheckbox>
                    {_renderLengend(chart)}
                    <S.Title>{chart.name}</S.Title>
                  </S.LabelCheckbox>
                </BaseCheckbox>
              )}
            </S.Legend>
          );
        })}
      </S.AvgLegend>
      <S.OtherLegend>
        {[...sortDataChart(dataTemps).legendLines, ...sortDataChart(dataTemps).legendColumns].map(
          (chart) => {
            const isDisable =
              (legendRemains.newRoutesY1.length === 1 &&
                legendRemains.newRoutesY1[0] === chart.key) ||
              (legendRemains.newRoutesY2.length === 1 &&
                legendRemains.newRoutesY2[0] === chart.key) ||
              ['11', '10'].includes(chart.key); // 11 và 10 là key của chart dạng bar column của Y1 và Y2

            return (
              <S.Legend key={chart.key}>
                {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                  <BaseCheckbox
                    value={chart.key}
                    checked={legendKeys.includes(chart.key)}
                    onChange={(e) => handleChangeLegend(e)}
                    className="legends-checkbox"
                    disabled={isDisable}
                    style={{ opacity: isDisable ? 0.7 : 1 }}
                  >
                    <S.LabelCheckbox>
                      {_renderLengend(chart)}
                      <S.Title>{chart.name}</S.Title>
                    </S.LabelCheckbox>
                  </BaseCheckbox>
                )}
              </S.Legend>
            );
          }
        )}
      </S.OtherLegend>
    </S.Legends>
  );
};

export default BuilderLegends;
