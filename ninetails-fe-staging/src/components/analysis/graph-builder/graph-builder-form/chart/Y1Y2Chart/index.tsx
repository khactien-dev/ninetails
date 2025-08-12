import ChartBuilder from '@/components/analysis/graph-builder/graph-builder-form/chart';
import { kmConversion, minuteConversion } from '@/utils/control';
import React from 'react';

const option = {
  zoomEnabled: true,
  dataPointMaxWidth: 50,
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
  axisY2: {
    crosshair: {
      enabled: true,
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
  },
  legend: {
    enabled: false,
  },
};

const convertData = (targetUnit: 'km' | 'minute' | null, number: number) => {
  if (targetUnit === 'km') {
    return kmConversion(number);
  } else if (targetUnit === 'minute') {
    return minuteConversion(number);
  }
  return number;
};

interface IProps {
  y1AxisConversionUnit: 'km' | 'minute' | null;
  y2AxisConversionUnit: 'km' | 'minute' | null;
}

const Y1Y2Chart: React.FC<IProps> = ({ y1AxisConversionUnit, y2AxisConversionUnit }) => (
  <ChartBuilder
    option={{
      ...option,
      axisY: {
        ...option?.axisY,
        labelFormatter: (e: any) => {
          return convertData(y1AxisConversionUnit, e.value);
        },
        crosshair: {
          enabled: true,
          labelFormatter: (e: any) => {
            return convertData(y1AxisConversionUnit, e.value);
          },
        },
      },
      axisY2: {
        ...option?.axisY2,
        labelFormatter: (e: any) => {
          return convertData(y2AxisConversionUnit, e.value);
        },
        crosshair: {
          enabled: true,
          labelFormatter: (e: any) => {
            return convertData(y2AxisConversionUnit, e.value);
          },
        },
      },
    }}
  />
);

export default React.memo(Y1Y2Chart);
