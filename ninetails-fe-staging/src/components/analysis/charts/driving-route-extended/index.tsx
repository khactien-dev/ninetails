import CommonChart from '@/components/analysis/charts/common-chart';
import { CHART_TABS } from '@/constants/charts';
import { kmConversion, minuteConversion } from '@/utils/control';

const option = {
  toolTip: {
    enabled: false,
  },
  axisX: {
    // minimum: 0,
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
    crosshair: {
      enabled: true,
      labelFormatter: (e: any) => {
        return kmConversion(e.value);
      },
    },
    // minimum: 0,
    // maximum: 200,
    gridDashType: 'dash',
    labelFontSize: 14,
    scaleBreaks: {
      autoCalculate: true,
      // collapsibleThreshold: '30%',
      spacing: '5%',
      type: 'straight',
      lineColor: 'blue',
      lineDashType: 'dash',
      color: '#fff',
    },
    labelFormatter: (e: any) => kmConversion(e.value), // Add unit to label
  },
  axisY2: {
    crosshair: {
      enabled: true,
      labelFormatter: (e: any) => {
        return minuteConversion(e.value);
      },
    },
    minimum: 0,
    labelFontSize: 14,
    gridDashType: 'dash',
    scaleBreaks: {
      autoCalculate: true,
      collapsibleThreshold: '40%',
      spacing: '5%',
      type: 'straight',
      lineColor: 'blue',
      lineDashType: 'dash',
      color: '#fff',
    },
    legend: {
      enabled: false,
    },
    labelFormatter: (e: any) => minuteConversion(e.value), // Add unit to label
  },
};

const DrivingRouteExtendedChart = () => (
  <CommonChart option={option} type={CHART_TABS.DRIVING_ROUTE_EXTENDED} />
);

export default DrivingRouteExtendedChart;
