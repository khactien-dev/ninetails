import { useGraphBuilderContext } from '@/components/analysis/graph-builder/graph-builder-form/context';
import { getNameLegend, getUnitChartBuilder } from '@/utils';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  option: any;
}
const ChartBuilder = ({ option }: IProps) => {
  const [chart, setChart] = useState<any>();
  const chartRef = useRef<HTMLDivElement | null>(null);

  const {
    datas,
    idChart,
    y1Axis,
    y2Axis,
    dataTooltip,
    setDataTooltip,
    setPositionTooltip,
    setViewPort,
    fullScreenChart,
  } = useGraphBuilderContext();

  useEffect(() => {
    if (window.CanvasJS) {
      let getViewPort = debounce(function (min, max) {
        setViewPort({
          min,
          max,
        });
      }, 500);

      if (chartRef.current) {
        const chart = new window.CanvasJS.Chart(chartRef.current, {
          ...option,
          data: datas,
          animationEnabled: true,
          zoomEnabled: true,
          rangeChanged: function (e: any) {
            getViewPort(e.axisX[0].viewportMinimum, e.axisX[0].viewportMaximum);
          },
        });
        chart.render();
        setChart(chart);

        // document
        //   .querySelectorAll(`.chart-${idChart} .canvasjs-chart-canvas`)[1]
        //   .addEventListener('wheel', function (e: any) {
        //     e.preventDefault();

        //     var axisX = chart.axisX[0];
        //     var viewportMin = axisX.get('viewportMinimum'),
        //       viewportMax = axisX.get('viewportMaximum'),
        //       interval = axisX.get('interval') || 1; // Sử dụng interval mặc định là 1 nếu không có

        //     var newViewportMin, newViewportMax;

        //     // Xử lý cuộn ngang (deltaX)
        //     if (e.deltaX > 0) {
        //       // Cuộn sang phải
        //       newViewportMin = viewportMin + interval;
        //       newViewportMax = viewportMax + interval;
        //     } else if (e.deltaX < 0) {
        //       // Cuộn sang trái
        //       newViewportMin = viewportMin - interval;
        //       newViewportMax = viewportMax - interval;
        //     }

        //     // Giới hạn phạm vi viewport để không vượt ra ngoài giới hạn của biểu đồ
        //     if (
        //       newViewportMin >= chart.axisX[0].get('minimum') &&
        //       newViewportMax <= chart.axisX[0].get('maximum')
        //     ) {
        //       chart.axisX[0].set('viewportMinimum', newViewportMin, false);
        //       chart.axisX[0].set('viewportMaximum', newViewportMax);
        //     }
        //   });

        // const handlePaning = (e: any) => {
        //   e.preventDefault();

        //   const axisX = chart.axisX[0];
        //   const viewportMin = axisX.get('viewportMinimum');
        //   const viewportMax = axisX.get('viewportMaximum');
        //   const interval = axisX.get('interval') || 1;

        //   let newViewportMin, newViewportMax;

        //   // Xử lý cuộn ngang (deltaX)
        //   if (e.deltaX > 0) {
        //     // Cuộn sang phải
        //     newViewportMin = viewportMin + interval;
        //     newViewportMax = viewportMax + interval;
        //   } else if (e.deltaX < 0) {
        //     // Cuộn sang trái
        //     newViewportMin = viewportMin - interval;
        //     newViewportMax = viewportMax - interval;
        //   }

        //   // Giới hạn phạm vi viewport để không vượt ra ngoài giới hạn của biểu đồ
        //   if (
        //     newViewportMin >= chart.axisX[0].get('minimum') &&
        //     newViewportMax <= chart.axisX[0].get('maximum')
        //   ) {
        //     chart.axisX[0].set('viewportMinimum', newViewportMin, false);
        //     chart.axisX[0].set('viewportMaximum', newViewportMax);

        //     getViewPort(newViewportMin, newViewportMax);
        //   }
        // };

        // const canvas = document.getElementsByClassName(`chart-${idChart} canvasjs-chart-canvas`)[1];
        // if (canvas) {
        //   canvas.addEventListener('wheel', handlePaning);
        // }

        // return () => {
        //   if (canvas) {
        //     canvas.removeEventListener('wheel', handlePaning);
        //   }
        // };
      }
    }
  }, [option, datas, idChart]);

  useEffect(() => {
    if (chartRef.current && chart) {
      let startX: any;
      let startY: any;
      let isDragging = false;

      const handleChartClick = () => {
        if (chartRef.current) {
          const { dragStartPoint } = chart;

          if (dragStartPoint) {
            const xValue = chart.axisX[0].crosshair.value;
            const stackData = chart.data
              .map((series: any) => {
                return {
                  ...series.dataPoints.find((dp: any) => dp.x === xValue),
                  color: series.color,
                  name: series.name,
                  visible: series.options.visible,
                  lineDashType: series.options.lineDashType,
                  yKey: series.options.axisYKey,
                };
              })
              .filter((dp: any) => dp.visible);

            if (!dataTooltip) {
              if (stackData.length > 0 && stackData[0].date) {
                setDataTooltip(stackData);
                setPositionTooltip([xValue, dragStartPoint.y]);
              }
            } else {
              setDataTooltip(undefined);
            }
          }
        }
      };

      const handleMouseDown = (event: any) => {
        startX = event.clientX;
        startY = event.clientY;
        isDragging = false;
      };

      const handleMouseUp = (event: any) => {
        if (Math.abs(event.clientX - startX) > 5 || Math.abs(event.clientY - startY) > 5) {
          isDragging = true;
        }

        if (!isDragging) {
          const toolbarElement = document.querySelector(
            `.chart-${idChart} .canvasjs-chart-toolbar`
          );

          if (toolbarElement && toolbarElement.contains(event.target)) return;
          handleChartClick(); // Chỉ gọi hàm `handleChartClick` nếu không phải drag
        } else {
          console.log('Drag action detected, no click action triggered.');
        }
      };

      chart.container.addEventListener('mousedown', handleMouseDown);
      chart.container.addEventListener('mouseup', handleMouseUp);

      return () => {
        chart.container.removeEventListener('mousedown', handleMouseDown);
        chart.container.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [chart, dataTooltip, chartRef.current, idChart]);

  useEffect(() => {
    if (chart) {
      chart.render();
    }
  }, [fullScreenChart.active]);

  const axisY = useMemo(() => {
    return {
      axisYTitle: `${getNameLegend(y1Axis)} ${getUnitChartBuilder(y1Axis)}`,
      axisY2Title: `${getNameLegend(y2Axis)} ${getUnitChartBuilder(y2Axis)}`,
    };
  }, [y1Axis, y2Axis]);

  return (
    <S.Wrapper>
      <S.AxisYTitle>{axisY.axisYTitle}</S.AxisYTitle>
      <div
        className={`chart-${idChart}`}
        style={{ height: '500px', width: '100%' }}
        ref={chartRef}
      />
      {!!axisY.axisY2Title && <S.AxisY2Title>{axisY.axisY2Title}</S.AxisY2Title>}
    </S.Wrapper>
  );
};

export default ChartBuilder;
