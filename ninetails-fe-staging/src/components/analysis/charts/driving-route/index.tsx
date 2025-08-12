import CommonChart from '@/components/analysis/charts/common-chart';
import { CHART_TABS } from '@/constants/charts';

const option = {
  toolTip: {
    enabled: false,
  },
  axisX: {
    // minimum: 0,
    // viewportMinimum: 0,
    // viewportMaximum: 6,
    labelFontSize: 14,
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
      collapsibleThreshold: '40%',
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

const DrivingRouteChart = () => <CommonChart option={option} type={CHART_TABS.DRIVING_ROUTE} />;

export default DrivingRouteChart;
