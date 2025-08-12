import { useAnalysisContext } from '@/components/analysis/context';
import { CHART_TABS, CHART_TYPE } from '@/constants/charts';
import { DataTooltipType } from '@/interfaces';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  option: any;
  type: DataTooltipType['type'];
}
const CommonChart = ({ option, type }: IProps) => {
  const [chart, setChart] = useState<any>();
  const chartRef = useRef<HTMLDivElement | null>(null);
  const {
    chartDatas,
    chartType,
    tabActive,
    openTooltip,
    setPositionTooltip,
    setOpenTooltip,
    setDataTooltip,
    setViewPort,
    unitCollectCount,
    fullScreenChart,
  } = useAnalysisContext();

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
          zoomEnabled: true,
          animationEnabled: true,
          data: chartDatas,
          rangeChanged: function (e: any) {
            getViewPort(e.axisX[0].viewportMinimum, e.axisX[0].viewportMaximum);
          },
        });

        // if (chartDatas.length > 0 && chartDatas[0].dataPoints.length < 6) {
        //   // Nếu chỉ có 6 cột hoặc ít hơn, set viewport để chỉ hiển thị đúng 6 cột

        //   // Nếu có nhiều hơn 6 cột, thiết lập viewport bình thường
        //   chart.options.axisX.viewportMinimum = null;
        //   chart.options.axisX.viewportMaximum = null;
        // } else {
        //   // Nếu có nhiều hơn 6 cột, thiết lập viewport bình thường
        //   // chart.options.axisX.viewportMinimum = 0;
        //   chart.options.axisX.viewportMinimum = null;
        //   chart.options.axisX.viewportMaximum = 6;
        // }
        chart.render();
        setChart(chart);

        // USE HANDLE PANNING CHART WHEN DATA CHART LARGE
        // document
        //   .getElementsByClassName('canvasjs-chart-canvas')[1]
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
        //   }
        // };

        // const canvas = document.getElementsByClassName('canvasjs-chart-canvas')[1];
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
  }, [chartDatas, option]);

  useEffect(() => {
    if (chart) {
      chart.render();
    }
  }, [fullScreenChart.active]);

  // useEffect(() => {
  //   if (chartRef.current && chart) {
  //     let startX: any;
  //     let startY: any;
  //     let isDragging = false;
  //     const handleChartClick = () => {
  //       if (chartRef.current) {
  //         const { dragStartPoint } = chart;

  //         if (dragStartPoint) {
  //           const xValue = chart.axisX[0].crosshair.value;
  //           const stackData = chart.data
  //             .map((series: any) => {
  //               return {
  //                 ...series.dataPoints.find((dp: any) => dp.x === xValue),
  //                 color: series.color,
  //                 name: series.name,
  //                 visible: series.options.visible,
  //                 lineDashType: series.options.lineDashType,
  //               };
  //             })
  //             .filter((dp: any) => dp.visible);

  //           console.log(stackData);

  //           if (stackData.length > 0 && stackData[0].date) {
  //             setOpenTooltip((prev) => !prev);
  //           }
  //           if (!openTooltip) {
  //             setPositionTooltip([xValue, dragStartPoint.y]);
  //             setDataTooltip({
  //               type,
  //               data: stackData,
  //             });
  //           }
  //         }
  //       }
  //     };

  //     chart.container.addEventListener('mousedown', function (event: any) {
  //       console.log(event);
  //       startX = event.chartX; // Sử dụng event.chartX
  //       startY = event.chartY; // Sử dụng event.chartY
  //       isDragging = false;
  //     });

  //     chart.container.addEventListener('mousemove', function (event: any) {
  //       if (Math.abs(event.chartX - startX) > 5 || Math.abs(event.chartY - startY) > 5) {
  //         isDragging = true; // Nếu có di chuyển chuột, đây là thao tác kéo chuột (zoom in)
  //       }
  //     });

  //     chart.container.addEventListener('mouseup', function (event: any) {
  //       if (!isDragging) {
  //         // Nếu không kéo chuột, xử lý click và hiển thị popup
  //         var points = chart.getDataPointAtXY(event.chartX, event.chartY); // Sử dụng event.chartX, event.chartY

  //         console.log(points);
  //         if (points) {
  //           alert('You clicked on data point: ' + JSON.stringify(points.dataPoint));
  //         }
  //       }
  //     });

  //     chartRef.current.addEventListener('click', handleChartClick);

  //     return () => {
  //       if (chartRef.current) {
  //         chartRef.current.removeEventListener('click', handleChartClick);
  //       }
  //     };
  //   }
  // }, [chart, openTooltip, chartRef.current]);

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
                  hiddenInTooltip: series.options.hiddenInTooltip,
                };
              })
              .filter((dp: any) => dp.visible);

            if (stackData.length > 0 && stackData[0].date) {
              setOpenTooltip((prev) => !prev);
            }

            if (!openTooltip) {
              setPositionTooltip([xValue, dragStartPoint.y]);
              setDataTooltip({
                type,
                data: stackData,
              });
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
          const toolbarElement = document.querySelector('.canvasjs-chart-toolbar');

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
  }, [chart, openTooltip, chartRef.current]);

  const axisY = useMemo(() => {
    let axisYTitle = '';
    let axisY2Title = '';
    switch (tabActive) {
      case CHART_TABS.DRIVING_ROUTE:
        if (chartType === CHART_TYPE.DRIVING_ROUTE) {
          axisYTitle = '운행 지수 점';
        } else {
          axisYTitle = '거리 km';
          axisY2Title = '분 시간';
        }
        break;
      case CHART_TABS.COLLECT_COUNT:
        axisYTitle = !unitCollectCount
          ? '수거량 개'
          : unitCollectCount === 'kg'
          ? '수거 무 kg'
          : '수거 무 m³';
        break;
      default:
        break;
    }
    return { axisYTitle, axisY2Title };
  }, [chartType, tabActive, unitCollectCount]);

  return (
    <S.Wrapper>
      <S.AxisYTitle>{axisY.axisYTitle}</S.AxisYTitle>
      <S.Chart style={{ height: '500px', width: '100%' }} ref={chartRef} />
      {axisY.axisY2Title && <S.AxisY2Title>{axisY.axisY2Title}</S.AxisY2Title>}
    </S.Wrapper>
  );
};

export default CommonChart;
