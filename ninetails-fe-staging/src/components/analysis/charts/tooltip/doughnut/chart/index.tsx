import { DataTooltipItemType } from '@/interfaces';
import { formatNumberWithCommas } from '@/utils';
import { useEffect, useMemo, useRef } from 'react';

interface IProps {
  data: Array<DataTooltipItemType>;
  unit: string;
}

const DoughnutChart = ({ data, unit }: IProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const chartData = useMemo(() => {
    return data.filter((el) => !el.hiddenInTooltip);
  }, [data]);

  const total = useMemo(
    () => data.reduce((acc: number, cur: DataTooltipItemType) => acc + +cur.y, 0),
    [data]
  );

  const option = useMemo(() => {
    return {
      // width: 370,
      // height: 370,
      animationEnabled: true,
      data: [
        {
          type: 'doughnut',
          // indexLabel: '{name} - {y}',
          // indexLabelWrap: true,
          indexLabelPlacement: 'outside',
          // indexLabelTextAlign: 'center',
          indexLabelFontSize: 14,
          // indexLabelMaxWidth: 90,
          indexLabelFormatter: function (e: any) {
            return e.dataPoint.name;
          },
          innerRadius: '60%',
          dataPoints: chartData,
        },
      ],
      subtitles: [
        {
          text: formatNumberWithCommas(+total.toFixed(3)) + unit,
          verticalAlign: 'center',
          horizontalAlign: 'center',
          textAlign: 'center',
          fontSize: 14,
          padding: 5,
        },
      ],
    };
  }, [chartData, total, unit]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.CanvasJS && option) {
      if (chartRef.current) {
        const chart = new window.CanvasJS.Chart(chartRef.current, {
          ...option,
        });
        chart.render();
      }
    }
  }, [option]);

  if (total > 0) return <div style={{ height: '200px', width: '100%' }} ref={chartRef} />;
};

export default DoughnutChart;
