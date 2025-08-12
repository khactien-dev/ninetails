import { useAnalysisContext } from '@/components/analysis/context';
import { CHART_TABS, CHART_TYPE } from '@/constants/charts';
import { DataTooltipItemType } from '@/interfaces';
import { formatNumberWithCommas } from '@/utils';
import { useMemo } from 'react';

import * as S from './index.styles';

interface IProps {
  unit?: string;
  showColor?: boolean;
}

const TooltipContentDataList = ({ unit, showColor }: IProps) => {
  const { dataTooltip, tabActive, chartType } = useAnalysisContext();

  const tooltips = useMemo(() => {
    if (tabActive === CHART_TABS.COLLECT_COUNT && chartType === CHART_TYPE.COLLECT_COUNT_COLUMN) {
      const labels: Array<{
        label: string;
        key: keyof DataTooltipItemType;
      }> = [
        { label: '배차 합계', key: 'y' },
        { label: '배차 평균', key: 'average' },
        { label: '배차 최대', key: 'max' },
        { label: '배차 최소', key: 'min' },
      ];

      return labels.map(({ label, key }) => ({
        label,
        value: dataTooltip.data[0][key] as number,
        color: '',
      }));
    }

    return dataTooltip.data.map(({ name, color, y }) => ({
      label: name,
      value: y,
      color: color,
    }));
  }, [dataTooltip, tabActive, chartType]);

  return (
    <S.Wrapper>
      {tooltips.map(({ label, color, value }) => (
        <S.Legend key={label} color={showColor ? color : ''}>
          <span>{label}:</span>
          <span>
            {value ? `${formatNumberWithCommas(+value.toFixed(3))} ${unit ?? ''}` : ' - '}
          </span>
        </S.Legend>
      ))}
    </S.Wrapper>
  );
};

export default TooltipContentDataList;
