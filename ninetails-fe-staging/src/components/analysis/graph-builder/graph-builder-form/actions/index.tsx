import { actionsChartData } from '@/components/analysis/charts/actions';
import { useAnalysisContext } from '@/components/analysis/context';
import { useGraphBuilderContext } from '@/components/analysis/graph-builder/graph-builder-form/context';
import { BaseInput } from '@/components/common/inputs/base-input';
import { ACTIONS_CHART_KEY } from '@/constants/charts';

import * as S from './index.styles';

const ActionsBuilder = () => {
  const { params } = useAnalysisContext();
  const {
    actionKeys,
    setActionKeys,
    fullScreenChart,
    generateChart,
    legendKeys,
    setLegendKeys,
    payload,
  } = useGraphBuilderContext();

  const handleClickActionsChart = (key: ACTIONS_CHART_KEY) => {
    let newLegendKeys = [...legendKeys];
    let newActionsKey = { ...actionKeys };
    let newActiveKeys = actionKeys.active.includes(key)
      ? actionKeys.active.filter((item) => item !== key)
      : [...actionKeys.active, key];
    if (key === ACTIONS_CHART_KEY.FULL_SCREEN) {
      actionKeys.active.includes(key) ? fullScreenChart.exit() : fullScreenChart.enter();
    } else {
      const routes = newLegendKeys.filter((item) => isNaN(+item));
      const newRoutesY1 = routes
        .filter((route) => !route.toString().includes('secondary'))
        .join(',');
      const newRoutesY2 = routes
        .filter((route) => route.toString().includes('secondary'))
        .map((item) => item.toString().replace('secondary', ''))
        .join(',');

      if (key === ACTIONS_CHART_KEY.AVG) {
        const avgKeys = payload?.yAxises2 ? ['1', '2', '3', '4'] : ['1', '2']; // key của các giá trị trung bình
        if (newActiveKeys.includes(key)) {
          newLegendKeys = Array.from(new Set([...newLegendKeys, ...avgKeys]));
        } else {
          newLegendKeys = newLegendKeys.filter((item) => !avgKeys.includes(item.toString()));
        }
        generateChart(
          newRoutesY1,
          newRoutesY2,

          newLegendKeys
        );
        setLegendKeys(newLegendKeys);
      } else if (key === ACTIONS_CHART_KEY.CUMULATION) {
        generateChart(newRoutesY1, newRoutesY2, newLegendKeys);
      }
    }
    setActionKeys({ ...newActionsKey, active: newActiveKeys });
  };

  return (
    <S.Wrapper>
      <S.ActionsChart>
        <BaseInput
          disabled
          value={!params.routeName ? '000-전체차량' : params.routeName}
          style={{ width: 200, height: 40 }}
        />
        {actionsChartData.map(({ key, icon: Icon }) => {
          const isDisable = actionKeys.disable.includes(key);
          if (key !== ACTIONS_CHART_KEY.PLAY)
            return (
              <S.FilterIconChart
                active={actionKeys.active.includes(key)}
                isDisable={isDisable}
                key={key}
                isPlay={false}
                onClick={() => !isDisable && handleClickActionsChart(key)}
              >
                <Icon />
              </S.FilterIconChart>
            );
        })}
      </S.ActionsChart>
    </S.Wrapper>
  );
};

export default ActionsBuilder;
