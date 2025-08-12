import ArrowDownIcon from '@/assets/images/svg/icon-btn-arrown.svg';
import { useAnalysisContext } from '@/components/analysis/context';
import { BaseCheckbox } from '@/components/common/base-checkbox';
import { ACTIONS_CHART_KEY, CHART_TABS, CHART_TYPE, trashBagType } from '@/constants/charts';
import { ChartDataItemType } from '@/interfaces';
import { handleSortChartsData, sortDataChart } from '@/utils';
import LegendManager from '@/utils/colors';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useCallback, useMemo } from 'react';

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
          case 'triangle':
            maker = (
              <S.MakerTriangleWrapper>
                <S.MakerTriangle color={chart.color} isDashed={chart?.lineDashType === 'dash'} />
                {chart?.lineDashType === 'dash' && (
                  <S.MakerOverlay color={chart.color} isDashed={true} />
                )}
              </S.MakerTriangleWrapper>
            );
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

const LegendCharts = () => {
  const {
    tabActive,
    chartDatas,
    area,
    legendKeys,
    collapseLegendRef,
    chartType,
    actionKeys,
    isCollapse,
    legendsTemp,
    L3Extension,
    unitCollectCount,
    routeList,
    setChartDatas,
    setLegendKeys,
    setOpenTooltip,
    setIsCollapse,
    setActionKeys,
    generateChart,
    setL3Extension,
    setLegendsTemp,
  } = useAnalysisContext();

  const legendDatas = useMemo(() => {
    if (
      (chartType === CHART_TYPE.DRIVING_ROUTE && !area) ||
      (chartType === CHART_TYPE.COLLECT_COUNT_LINE && !area) ||
      (chartType === CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED && !area) ||
      L3Extension
    ) {
      return handleSortChartsData(legendsTemp ?? [], true);
    }
    return handleSortChartsData(chartDatas ?? [], true);
  }, [area, chartType, legendsTemp, chartDatas, L3Extension]);

  const handleCheckAVG = useCallback(
    (data: ChartDataItemType[]) => {
      const isCheckAVG = data.every((item) =>
        item.type === 'spline' || (item.type === 'line' && item.lineDashType === 'dash')
          ? item.visible
          : true
      );

      if (isCheckAVG) {
        if (!actionKeys.active.includes(ACTIONS_CHART_KEY.AVG)) {
          setActionKeys({
            ...actionKeys,
            active: [...actionKeys.active, ACTIONS_CHART_KEY.AVG],
          });
        }
      } else {
        if (actionKeys.active.includes(ACTIONS_CHART_KEY.AVG)) {
          setActionKeys({
            ...actionKeys,
            active: [...actionKeys.active].filter((item) => item !== ACTIONS_CHART_KEY.AVG),
          });
        }
      }
    },
    [actionKeys]
  );

  const handleChangeLegend = async (e: CheckboxChangeEvent, index: number) => {
    const { checked, value } = e.target;

    console.log(value, checked, index);

    let newChartDatas = [...handleSortChartsData(chartDatas, true)];
    let newLegendKeys = [...legendKeys];

    if (
      (tabActive === CHART_TABS.DRIVING_ROUTE && !area && !isCollapse) ||
      (tabActive === CHART_TABS.COLLECT_COUNT &&
        !area &&
        chartType === CHART_TYPE.COLLECT_COUNT_LINE) ||
      L3Extension ||
      chartType === CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED
    ) {
      if (checked) {
        newLegendKeys.push(value);

        if (value === 'totalOfDay') {
          if (isCollapse) {
            newLegendKeys = Array.from(new Set([...newLegendKeys, ...trashBagType]));
          } else if (L3Extension) {
            if (!area) {
              newLegendKeys = Array.from(new Set([...newLegendKeys, ...LegendManager.getRoutes()]));
            } else {
              newLegendKeys = Array.from(
                new Set([...newLegendKeys, ...LegendManager.getSections()])
              );
            }
          }
        } else if (value === 'all') {
          newLegendKeys = legendsTemp ? legendsTemp?.map((item) => item.key) : [];
          setActionKeys({
            ...actionKeys,
            active: [...actionKeys.active, ACTIONS_CHART_KEY.AVG],
          });
        }
      } else {
        newLegendKeys = newLegendKeys.filter((item) => item !== value);
      }

      LegendManager.updateExcludeKeys(newLegendKeys);
      let extendsKey = '';
      const newRoute =
        chartType === CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED && (isCollapse || area)
          ? [area]
          : newLegendKeys.filter((item) => !Number(+item) && item !== 'totalOfDay');

      if (
        (isCollapse && chartType === CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED) ||
        (chartType === CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED && area && L3Extension)
      ) {
        extendsKey = newLegendKeys
          .filter((item) => !Number(+item) && item !== 'totalOfDay')
          .join(',');
      }

      await generateChart(
        tabActive,
        isCollapse,
        newRoute.length === routeList.length ? '' : newRoute.join(','),
        actionKeys.active,
        L3Extension,
        unitCollectCount,
        false,
        extendsKey
      );
    } else {
      const dataChart = newChartDatas[index];

      if (checked) {
        if (value === 'all') {
          newLegendKeys = newChartDatas.map((item) => item.key);
          newChartDatas = newChartDatas.map((item) => {
            if (item.childrenKeys && item.childrenKeys.length > 0) {
              return {
                ...item,
                visible: !item.showChildLegend,
              };
            }
            if (item.parentKey) {
              const indParent = newChartDatas.findIndex((data) => data.key === item.parentKey);
              const isShowChildLegend = newChartDatas[indParent].showChildLegend;
              return {
                ...item,
                visible: !!isShowChildLegend,
              };
            }
            return { ...item, visible: true };
          });
        } else {
          if (!value) {
            newLegendKeys = newChartDatas.map((item) => item.key);
            newChartDatas = newChartDatas.map((item) => {
              if (item.childrenKeys && item.childrenKeys.length > 0) {
                return {
                  ...item,
                  visible: !item.showChildLegend,
                };
              }
              if (item.parentKey) {
                const indParent = newChartDatas.findIndex((data) => data.key === item.parentKey);
                const isShowChildLegend = newChartDatas[indParent].showChildLegend;
                return {
                  ...item,
                  visible: !!isShowChildLegend,
                };
              }
              return { ...item, visible: true };
            });
          } else {
            newLegendKeys.push(value);
            newChartDatas[index].visible = value === 'totalOfDay' ? !L3Extension : true;
            if (dataChart?.childrenKeys && dataChart?.childrenKeys?.length > 0) {
              newLegendKeys = Array.from(new Set([...newLegendKeys, ...dataChart.childrenKeys]));
              newChartDatas = newChartDatas.map((item) => {
                if (item.key === dataChart.key) {
                  return {
                    ...item,
                    visible: !item.showChildLegend,
                  };
                }
                if (dataChart?.childrenKeys && dataChart?.childrenKeys.includes(item.key)) {
                  return {
                    ...item,
                    visible: !!dataChart.showChildLegend,
                  };
                }
                return item;
              });
            }
            if (dataChart?.parentKey) {
              const indParent = newChartDatas.findIndex((item) => item.key === dataChart.parentKey);
              if (indParent !== -1) {
                const isAllExist =
                  newChartDatas[indParent]?.childrenKeys &&
                  newChartDatas[indParent]?.childrenKeys?.every((item: string) =>
                    newLegendKeys.includes(item)
                  );
                if (isAllExist) {
                  newLegendKeys.push(newChartDatas[indParent].key);
                }
              }
            }
          }
        }
      } else {
        newChartDatas[index].visible = false;
        newLegendKeys = newLegendKeys.filter((item) => item !== value);

        if (dataChart?.parentKey) {
          newLegendKeys = newLegendKeys.filter(
            (item) => ![dataChart.parentKey, value].includes(item)
          );
        }
        if (dataChart?.childrenKeys && dataChart?.childrenKeys?.length > 0) {
          newLegendKeys = newLegendKeys.filter(
            (item) => ![...(dataChart?.childrenKeys || []), value].includes(item)
          );
          newChartDatas = newChartDatas.map((item) => {
            if (dataChart?.childrenKeys?.includes(item.key)) {
              return {
                ...item,
                visible: false,
              };
            }
            return item;
          });
        }
      }
      const newDatas = handleSortChartsData(newChartDatas);
      setChartDatas(handleSortChartsData(newChartDatas));
      LegendManager.updateExcludeKeys(newLegendKeys);
      if (value === 'totalOfDay') {
        setLegendsTemp(newDatas);
      }
      setLegendKeys(newLegendKeys);
    }

    handleCheckAVG(newChartDatas); //check AVG action
    setOpenTooltip(false);
  };

  const handleShowLegend = () => {
    const excludeKeys = LegendManager.getExcludeKeys();
    const routes = LegendManager.getRoutes();
    const avgRoute = LegendManager.getExcludeKeys().filter((item) => !isNaN(+item));

    switch (chartType) {
      case CHART_TYPE.COLLECT_COUNT_LINE:
        setL3Extension(true);
        LegendManager.updateSections([]);
        generateChart(tabActive, isCollapse, area, actionKeys.active, true, unitCollectCount, true);

        break;

      case CHART_TYPE.COLLECT_COUNT_LINE_EXTENDED:
        setL3Extension(false);
        setIsCollapse(false);
        generateChart(tabActive, false, area, actionKeys.active, false);
        break;

      case CHART_TYPE.COLLECT_COUNT_COLUMN:
        LegendManager.updateExcludeKeys(
          excludeKeys.length === 0 ? [] : Array.from(new Set([...excludeKeys, ...routes]))
        );
        setL3Extension(true);
        generateChart(tabActive, isCollapse, area, actionKeys.active, true, unitCollectCount, true);
        break;

      case CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED:
        LegendManager.updateExcludeKeys(
          excludeKeys.length === 0 ? [] : [...avgRoute, 'totalOfDay']
        );
        setIsCollapse(false);
        setL3Extension(false);
        generateChart(tabActive, false, area, actionKeys.active, false, unitCollectCount, true);
        break;

      default:
        break;
    }
  };

  const isCheckAll = useMemo(() => {
    if (
      (chartType === CHART_TYPE.DRIVING_ROUTE && !area) ||
      (chartType === CHART_TYPE.COLLECT_COUNT_LINE && !area)
    )
      return legendsTemp && legendKeys.length === legendsTemp.length;
    return legendKeys.length === chartDatas.length;
  }, [area, legendKeys, legendsTemp, chartDatas, chartType]);

  const legendRemain = useMemo(() => {
    return legendKeys.filter((item) => isNaN(+item) && item !== 'totalOfDay');
  }, [legendKeys]);

  return (
    <S.Legends>
      <S.Legend>
        <BaseCheckbox
          value="all"
          checked={isCheckAll}
          disabled={isCheckAll}
          onChange={(e) => handleChangeLegend(e, 0)}
        >
          <S.LabelCheckbox>All</S.LabelCheckbox>
        </BaseCheckbox>
      </S.Legend>

      <S.TopLegend>
        {sortDataChart(legendDatas).legendSpLines.map((chart, index) => {
          const isDisable =
            (chart.key === 'totalOfDay' && legendKeys.includes(chart.key)) ||
            (legendRemain.length === 1 && legendRemain[0] === chart.key);

          return (
            <S.Legend key={chart.key}>
              {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                <BaseCheckbox
                  value={chart.key}
                  checked={legendKeys.includes(chart.key)}
                  onChange={(e) => handleChangeLegend(e, index)}
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
        })}
      </S.TopLegend>

      <S.ScrollLegend hidescroll={tabActive === CHART_TABS.COLLECT_COUNT && !!area}>
        {sortDataChart(legendDatas).legendLines.map((chart, index) => {
          const isDisable =
            (chart.key === 'totalOfDay' && legendKeys.includes(chart.key)) ||
            (legendRemain.length === 1 && legendRemain[0] === chart.key);

          return (
            <S.Legend key={chart.key}>
              {(chart?.childrenKeys || [])?.length > 0 && (
                <S.CollapseIcon
                  ref={collapseLegendRef}
                  onClick={() => handleShowLegend()}
                  isCollapse={!!chart.showChildLegend}
                >
                  <ArrowDownIcon />
                </S.CollapseIcon>
              )}
              {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                <BaseCheckbox
                  value={chart.key}
                  checked={legendKeys.includes(chart.key)}
                  onChange={(e) =>
                    handleChangeLegend(
                      e,
                      chartType === CHART_TYPE.DRIVING_ROUTE_EXTENDED ? index : index + 2
                    )
                  }
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
        })}
      </S.ScrollLegend>

      <S.TopLegend>
        {sortDataChart(legendDatas).legendColumns.map((chart, index) => {
          const isDisable =
            (chart.key === 'totalOfDay' && legendKeys.includes(chart.key)) ||
            (legendRemain.length === 1 && legendRemain[0] === chart.key);

          return (
            <S.Legend key={chart.key}>
              {(chart?.childrenKeys || [])?.length > 0 && (
                <S.CollapseIcon
                  ref={collapseLegendRef}
                  onClick={() => handleShowLegend()}
                  isCollapse={!!chart.showChildLegend}
                >
                  <ArrowDownIcon />
                </S.CollapseIcon>
              )}
              {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                <BaseCheckbox
                  value={chart.key}
                  checked={legendKeys.includes(chart.key)}
                  onChange={(e) => handleChangeLegend(e, index)}
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
        })}
      </S.TopLegend>

      <S.ScrollLegend>
        {sortDataChart(legendDatas).legendStackColumns.map((chart, index) => {
          const isDisable =
            (chart.key === 'totalOfDay' && legendKeys.includes(chart.key)) ||
            (legendRemain.length === 1 && legendRemain[0] === chart.key);

          return (
            <S.Legend key={chart.key}>
              {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
                <BaseCheckbox
                  value={chart.key}
                  checked={legendKeys.includes(chart.key)}
                  onChange={(e) => handleChangeLegend(e, index)}
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
        })}
      </S.ScrollLegend>

      {/* {legendDatas.map((chart, index) => {
        const isDisable =
          (chart.key === 'totalOfDay' && legendKeys.includes(chart.key)) ||
          (legendRemain.length === 1 && legendRemain[0] === chart.key);

        return (
          <S.Legend key={chart.key}>
            {(chart?.childrenKeys || [])?.length > 0 && (
              <S.CollapseIcon
                ref={collapseLegendRef}
                onClick={() => handleShowLegend()}
                isCollapse={!!chart.showChildLegend}
              >
                <ArrowDownIcon />
              </S.CollapseIcon>
            )}
            {(chart.showLegend || (chart?.childrenKeys || [])?.length > 0) && (
              <BaseCheckbox
                value={chart.key}
                checked={legendKeys.includes(chart.key)}
                onChange={(e) => handleChangeLegend(e, index)}
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
      })} */}
    </S.Legends>
  );
};

export default LegendCharts;
