import CommonChart from '@/components/analysis/charts/common-chart';
import { CHART_TABS } from '@/constants/charts';

const option = {
  toolTip: {
    enabled: false,
  },
  dataPointMaxWidth: 50,
  axisX: {
    labelFontSize: 14,
    // viewportMaximum: 6,
    crosshair: {
      enabled: true,
      snapToDataPoint: true,
      labelFormatter: function (e: any) {
        return e.chart.data.length > 0 ? e.chart.data[0].dataPoints[e.value].label : ''; // Định dạng nhãn crosshair theo ngày
      },
    },
  },
  axisY: {
    includeZero: true,
    gridDashType: 'dash',
    crosshair: {
      enabled: true,
    },
    labelFontSize: 14,
    scaleBreaks: {
      autoCalculate: true,
      // collapsibleThreshold: '40%',
      spacing: '5%',
      type: 'straight',
      lineColor: 'blue',
      lineDashType: 'dash',
      color: '#fff',
    },
  },
  legend: {
    enabled: false,
  },
};

const CollectCountColumnChart = () => (
  <CommonChart option={option} type={CHART_TABS.COLLECT_COUNT} />
);

export default CollectCountColumnChart;
