import AVGIcon from '@/assets/images/chart/avg.svg';
import FullScreenIcon from '@/assets/images/chart/full-screen.svg';
import MinusIcon from '@/assets/images/chart/minus.svg';
import PlayIcon from '@/assets/images/chart/play.svg';
import PlusIcon from '@/assets/images/chart/plus.svg';
import SigmaIcon from '@/assets/images/chart/sigma.svg';
import StackIcon from '@/assets/images/chart/stack.svg';
import { useAnalysisContext } from '@/components/analysis/context';
import PowerGraph from '@/components/analysis/graph-builder';
import { BaseSelect } from '@/components/common/selects/base-select';
import { ACTIONS_CHART_KEY, CHART_TABS, trashBagType } from '@/constants/charts';
import LegendManager from '@/utils/colors';
import { useMemo } from 'react';

import * as S from './index.styles';

export const actionsChartData = [
  { key: ACTIONS_CHART_KEY.AVG, icon: AVGIcon },
  { key: ACTIONS_CHART_KEY.CUMULATION, icon: StackIcon },
  { key: ACTIONS_CHART_KEY.TOTAL, icon: SigmaIcon },
  { key: ACTIONS_CHART_KEY.FULL_SCREEN, icon: FullScreenIcon },
  { key: ACTIONS_CHART_KEY.PLAY, icon: PlayIcon },
];

const unitCollectCountOptions = [
  {
    label: '개',
    value: '',
  },
  {
    label: 'Volumn',
    value: 'm3',
  },
  {
    label: 'Weight',
    value: 'kg',
  },
];

const chartTabs = [
  {
    key: CHART_TABS.DRIVING_ROUTE,
    text: '운행 경로',
  },
  {
    key: CHART_TABS.COLLECT_COUNT,
    text: '수거량',
  },
  {
    key: CHART_TABS.GRAPH_BUILDER_SETTING,
    text: '그래프 빌더',
  },
];

const ActionsChart = () => {
  const {
    tabActive,
    isCollapse,
    actionKeys,
    fullScreenChart,
    area,
    params,
    routeList,
    unitCollectCount,
    L3Extension,
    legendKeys,
    setChartDatas,
    setLegendKeys,
    setTabActive,
    setIsCollapse,
    setOpenTooltip,
    generateChart,
    setActionKeys,
    setArea,
    setUnitCollectCount,
    setL3Extension,
    chartDatas,
  } = useAnalysisContext();

  const handleChangeTab = (key: CHART_TABS) => {
    let newActionKeys = { ...actionKeys };

    if (key === CHART_TABS.DRIVING_ROUTE) {
      setActionKeys({
        active: [ACTIONS_CHART_KEY.AVG],
        disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
      });
      newActionKeys = {
        active: [ACTIONS_CHART_KEY.AVG],
        disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
      };
    } else if (key === CHART_TABS.COLLECT_COUNT) {
      if (!area) {
        newActionKeys = { active: [ACTIONS_CHART_KEY.AVG], disable: [] };
      } else {
        newActionKeys = { active: [ACTIONS_CHART_KEY.AVG], disable: [ACTIONS_CHART_KEY.TOTAL] };
      }
    }
    LegendManager.updateExcludeKeys([]);
    generateChart(key, false, area, newActionKeys.active, false, unitCollectCount, true);
    setTabActive(key);
    setOpenTooltip(false);
    setIsCollapse(false);
    setActionKeys(newActionKeys);
    setL3Extension(false);
  };

  const handleClickActionsChart = (key: ACTIONS_CHART_KEY) => {
    if (key === ACTIONS_CHART_KEY.PLAY) {
      generateChart(tabActive, isCollapse, area, actionKeys.active, L3Extension, unitCollectCount);
      return;
    }

    let isNewTemp = false;
    let newL3Extension = L3Extension;
    let newIsCollapse = isCollapse;
    let newActionsKey = { ...actionKeys };
    let newActiveKeys = actionKeys.active.includes(key)
      ? actionKeys.active.filter((item) => item !== key)
      : [...actionKeys.active, key];

    if (key === ACTIONS_CHART_KEY.AVG) {
      let newLegendKeys = [...legendKeys];
      let newChartDatas = [...chartDatas];

      if (newActiveKeys.includes(ACTIONS_CHART_KEY.AVG)) {
        const avgKeys = newChartDatas.filter((item) => !isNaN(+item.key)).map((item) => item.key);
        newLegendKeys = Array.from(new Set([...newLegendKeys, ...avgKeys]));
        newChartDatas = newChartDatas.map((item) => ({
          ...item,
          visible: isNaN(+item.key) ? item.visible : true,
        }));
      } else {
        newLegendKeys = newLegendKeys.filter((item) => !+item);
        newChartDatas = newChartDatas.map((item) => ({
          ...item,
          visible: isNaN(+item.key) ? item.visible : false,
        }));
      }

      setLegendKeys(newLegendKeys);
      setActionKeys({ ...newActionsKey, active: newActiveKeys });
      setChartDatas(newChartDatas);
      LegendManager.updateExcludeKeys(newLegendKeys);

      return;
    } else if (key === ACTIONS_CHART_KEY.FULL_SCREEN) {
      actionKeys.active.includes(key) ? fullScreenChart.exit() : fullScreenChart.enter();
    } else {
      if (tabActive === CHART_TABS.COLLECT_COUNT) {
        if (key === ACTIONS_CHART_KEY.CUMULATION) {
          newActionsKey.disable =
            newActiveKeys.includes(key) || area ? [ACTIONS_CHART_KEY.TOTAL] : [];
        }
        if (key === ACTIONS_CHART_KEY.TOTAL) {
          if (newActiveKeys.includes(key)) {
            LegendManager.updateExcludeKeys(
              LegendManager.getExcludeKeys().filter(
                (item) => !isNaN(+item) || item === 'totalOfDay'
              )
            );
            newActionsKey.disable = [ACTIONS_CHART_KEY.CUMULATION];
            newL3Extension = false;
            isNewTemp = true;
          } else {
            newActionsKey.disable = [];
            newIsCollapse = false;
            isNewTemp = true;
            newL3Extension = false;
          }
        }
      } else if (tabActive === CHART_TABS.DRIVING_ROUTE) {
        if (key === ACTIONS_CHART_KEY.TOTAL) {
          newActionsKey.disable = [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL];
          newActiveKeys = [ACTIONS_CHART_KEY.AVG];
          newIsCollapse = false;
          isNewTemp = true;
          LegendManager.updateExcludeKeys([]);
        }
      }
    }

    setActionKeys({ ...newActionsKey, active: newActiveKeys });
    setIsCollapse(newIsCollapse);
    key !== ACTIONS_CHART_KEY.FULL_SCREEN &&
      generateChart(
        tabActive,
        newIsCollapse,
        area,
        newActiveKeys,
        newL3Extension,
        unitCollectCount,
        isNewTemp
      );
  };

  const handleCollapseChart = () => {
    const excludeKeys = LegendManager.getExcludeKeys();
    let newIsCollapse = !isCollapse;
    let newActionKeys = { ...actionKeys };
    let isNewTemp = false;
    if (tabActive === CHART_TABS.DRIVING_ROUTE) {
      if (!newIsCollapse) {
        newActionKeys = {
          disable: [ACTIONS_CHART_KEY.CUMULATION, ACTIONS_CHART_KEY.TOTAL],
          active: [ACTIONS_CHART_KEY.AVG],
        };
        isNewTemp = true;
        LegendManager.updateExcludeKeys([]);
      } else {
        newActionKeys = {
          disable: [],
          active: [ACTIONS_CHART_KEY.TOTAL],
        };
        isNewTemp = true;
        LegendManager.updateExcludeKeys([]);
      }
    } else if (tabActive === CHART_TABS.COLLECT_COUNT) {
      if (newIsCollapse) {
        isNewTemp = true;
        const newExcludeKeys = excludeKeys.filter((item) => !isNaN(+item) || item === 'totalOfDay');
        LegendManager.updateExcludeKeys(
          excludeKeys.length === 0 ? [] : Array.from(new Set([...newExcludeKeys, ...trashBagType]))
        );
      } else {
        const avgRoute = excludeKeys.filter((item) => !isNaN(+item));
        LegendManager.updateExcludeKeys(
          excludeKeys.length === 0 ? [] : [...avgRoute, 'totalOfDay']
        );
      }
    }

    setIsCollapse(newIsCollapse);
    setActionKeys(newActionKeys);
    setL3Extension(false);
    generateChart(
      tabActive,
      newIsCollapse,
      area,
      newActionKeys.active,
      false,
      unitCollectCount,
      isNewTemp
    );
  };

  const isDisableCollapse = useMemo(
    () =>
      tabActive === CHART_TABS.COLLECT_COUNT &&
      !actionKeys.active.includes(ACTIONS_CHART_KEY.TOTAL) &&
      !area,
    [tabActive, actionKeys, area]
  );

  const handleChangeArea = (value: string) => {
    let newActionKeys = { ...actionKeys };
    let newIsCollapse = isCollapse;
    if (tabActive === CHART_TABS.COLLECT_COUNT) {
      if (value) {
        newActionKeys.disable = [ACTIONS_CHART_KEY.TOTAL];
        newActionKeys.active = newActionKeys.active.filter(
          (item) => item !== ACTIONS_CHART_KEY.TOTAL
        );
        setActionKeys(newActionKeys);
      } else {
        if (newActionKeys.active.includes(ACTIONS_CHART_KEY.CUMULATION)) {
          newActionKeys.disable = [ACTIONS_CHART_KEY.TOTAL];
          setActionKeys(newActionKeys);
        } else {
          newActionKeys.disable = [];
          setActionKeys(newActionKeys);
        }
        newIsCollapse = false;
      }
    }

    setArea(value);
    setIsCollapse(newIsCollapse);
    setL3Extension(false);
    generateChart(
      tabActive,
      newIsCollapse,
      value,
      newActionKeys.active,
      false,
      unitCollectCount,
      true
    );
  };

  const handleChangeUnitCollectCount = (value: string) => {
    setUnitCollectCount(value);
    generateChart(tabActive, isCollapse, area, actionKeys.active, L3Extension, value);
  };

  return (
    <S.Wrapper>
      {!fullScreenChart.active && (
        <S.Tabs>
          {chartTabs.map(({ key, text }) => (
            <S.Tab
              key={key}
              active={tabActive === key}
              isgraph={key === CHART_TABS.GRAPH_BUILDER_SETTING}
              onClick={() => tabActive !== key && handleChangeTab(key)}
            >
              {text}
            </S.Tab>
          ))}
        </S.Tabs>
      )}

      {tabActive === CHART_TABS.GRAPH_BUILDER_SETTING && (
        <S.GraphBuilder>
          <PowerGraph />
        </S.GraphBuilder>
      )}
      {tabActive !== CHART_TABS.GRAPH_BUILDER_SETTING && (
        <S.ActionsChart>
          <S.Collapse
            disable={isDisableCollapse}
            onClick={() => !isDisableCollapse && handleCollapseChart()}
          >
            {isCollapse ? <MinusIcon /> : <PlusIcon />}
          </S.Collapse>
          {tabActive === CHART_TABS.COLLECT_COUNT && (
            <BaseSelect
              options={unitCollectCountOptions}
              size="small"
              width={200}
              value={unitCollectCount}
              onChange={(value) => handleChangeUnitCollectCount(value as string)}
              disabled={!!params.routeName}
              style={{ marginRight: '10px' }}
            />
          )}
          <BaseSelect
            options={
              !params.routeName
                ? routeList
                : [
                    {
                      label: params.routeName,
                      value: params.routeName,
                    },
                  ]
            }
            size="small"
            width={200}
            placeholder="Area"
            value={area}
            onChange={(value) => handleChangeArea(value as string)}
            disabled={!!params.routeName}
          />
          {actionsChartData.map(({ key, icon: Icon }) => {
            const isDisable = actionKeys.disable.includes(key);
            const isActive = actionKeys.active.includes(key);
            return (
              <S.FilterIconChart
                active={isActive}
                isPlay={key === ACTIONS_CHART_KEY.PLAY}
                isDisable={isDisable}
                key={key}
                onClick={() => !isDisable && handleClickActionsChart(key)}
              >
                <Icon />
              </S.FilterIconChart>
            );
          })}
        </S.ActionsChart>
      )}
    </S.Wrapper>
  );
};

export default ActionsChart;
