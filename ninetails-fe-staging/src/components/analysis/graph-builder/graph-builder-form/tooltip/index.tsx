import { useGraphBuilderContext } from '@/components/analysis/graph-builder/graph-builder-form/context';
import { DOMAINS } from '@/constants/charts';
import { formatDateKorea, formatNumberWithCommas, getUnitChartBuilder } from '@/utils';
import { kmConversion, minuteConversion } from '@/utils/control';
import { CloseOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

import * as S from './index.styles';

const TooltipChartBuilder = () => {
  const { setDataTooltip, dataTooltip } = useGraphBuilderContext();

  const getFormatedYValue = (yValue: number | null, yKey?: string) => {
    switch (yKey) {
      case DOMAINS.COLLECT_DISTANCE:
      case DOMAINS.OTHER_DISTANCE:
        return yValue !== null ? kmConversion(yValue) : null;

      case DOMAINS.COLLECT_TIME:
      case DOMAINS.OTHER_TIME:
        return yValue !== null ? minuteConversion(yValue) : null;

      default:
        return yValue !== null ? parseFloat(yValue.toFixed(3)) : null;
    }
  };

  const tooltips = useMemo(() => {
    if (!dataTooltip) return [];
    return dataTooltip.map(({ name, color, y, yKey }) => ({
      label: name,
      value: getFormatedYValue(y, yKey),
      color: color,
      unit: yKey ? getUnitChartBuilder(yKey) : '',
    }));
  }, [dataTooltip]);

  return (
    <S.TootipWrapper>
      <S.Header>
        <S.CloseIcon onClick={() => setDataTooltip(undefined)}>
          <CloseOutlined />
        </S.CloseIcon>
        <S.Title>
          {dataTooltip && dataTooltip.length > 0 ? formatDateKorea(dataTooltip[0]?.date ?? '') : ''}
        </S.Title>
      </S.Header>
      <S.Content>
        {tooltips.map(({ label, color, value, unit }) => (
          <S.Legend key={label} color={color}>
            <span>{label}:</span>
            <span>{value !== null ? `${formatNumberWithCommas(value)} ${unit}` : ' - '}</span>
          </S.Legend>
        ))}
      </S.Content>
    </S.TootipWrapper>
  );
};

export default TooltipChartBuilder;
