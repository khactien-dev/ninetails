import ExportIcon from '@/assets/images/chart/export-setting.svg';
import ScreenshotIcon from '@/assets/images/chart/screenshot-setting.svg';
import TrashIcon from '@/assets/images/chart/trash-setting.svg';
import ActionsChart from '@/components/analysis/charts/actions';
import CollectCountColumnChart from '@/components/analysis/charts/collect_count/column-chart';
import DrivingRouteChart from '@/components/analysis/charts/driving-route';
import DrivingRouteExtendedChart from '@/components/analysis/charts/driving-route-extended';
import LegendCharts from '@/components/analysis/charts/legends';
import TooltipChart from '@/components/analysis/charts/tooltip';
import TooltipContentDataList from '@/components/analysis/charts/tooltip/data-list';
import DoughnutTooltip from '@/components/analysis/charts/tooltip/doughnut';
import TabsTooltip from '@/components/analysis/charts/tooltip/tabs';
import Collapse from '@/components/analysis/collapse';
import { useAnalysisContext } from '@/components/analysis/context';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import {
  ACTIONS_CHART_KEY,
  CHART_TABS,
  CHART_TYPE,
  TOOLTIP_DRIVING_ROUTE_TABS,
  TOOLTIP_TABS,
} from '@/constants/charts';
import { usePermissions } from '@/hooks/usePermissions';
import { copyImageToClipboard, exportToPDF, formatDateKorea } from '@/utils';
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FullScreen } from 'react-full-screen';

import { ExportFile } from '../export-file';
import * as S from './index.styles';

const CHART: Record<CHART_TYPE, React.ReactNode> = {
  [CHART_TYPE.COMMON]: <DrivingRouteChart />,
  [CHART_TYPE.DRIVING_ROUTE]: <DrivingRouteChart />,
  [CHART_TYPE.DRIVING_ROUTE_EXTENDED]: <DrivingRouteExtendedChart />,
  [CHART_TYPE.COLLECT_COUNT_COLUMN]: <CollectCountColumnChart />,
  [CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED]: <CollectCountColumnChart />,
  [CHART_TYPE.COLLECT_COUNT_LINE]: <DrivingRouteChart />,
  [CHART_TYPE.COLLECT_COUNT_LINE_EXTENDED]: <DrivingRouteChart />,
};

const WIDTH_TOOLTIP_DOUGHNUT = 370;
const WIDTH_TOOLTIP_LIST_DATA = 250;

interface IProps {
  onDeleteSection: () => void;
}

const AnalysisChart: React.FC<IProps> = ({ onDeleteSection }) => {
  const {
    openTooltip,
    chartType,
    positionTooltip,
    fullScreenChart,
    actionKeys,
    tabActive,
    setActionKeys,
    dataTooltip,
    viewPort,
    unitCollectCount,
    loadingChart,
    params,
  } = useAnalysisContext();

  const [openExportFile, setOpenExportFile] = useState(false);
  const permission = usePermissions();
  console.log('🚀 ~ permission:', permission);
  const pdfRef = useRef<HTMLDivElement | null>(null);

  const settingButtons = [
    {
      icon: <ExportIcon />,
      title: '저장하기',
      onClick: () => permission.exportAble && setOpenExportFile(true),
      disabled: !permission.exportAble,
    },
    {
      icon: <ScreenshotIcon />,
      title: '스크린샷',
      onClick: () => copyImageToClipboard(pdfRef.current),
    },
    {
      icon: <TrashIcon />,
      title: '모두 삭제',
      onClick: () => onDeleteSection(),
      disabled: !permission?.deleteAble,
    },
  ];

  const position = useMemo(() => {
    if (!positionTooltip) return;
    const [x, y] = positionTooltip;

    const chart = document.getElementsByClassName('canvasjs-chart-canvas')[1] as HTMLElement;
    const wChart = chart?.offsetWidth;

    if (!wChart || !viewPort) return;

    const vMax = viewPort.max ?? dayjs(params.endDate).diff(dayjs(params.startDate), 'day') + 1;
    const vMin = viewPort.min ?? 0;

    const xPercent = ((x - vMin) / (vMax - vMin)) * 100; // Tính phần trăm vị trí x

    const additionWidth = [
      CHART_TYPE.DRIVING_ROUTE_EXTENDED,
      CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED,
    ].includes(chartType)
      ? WIDTH_TOOLTIP_DOUGHNUT
      : WIDTH_TOOLTIP_LIST_DATA;

    return {
      top: `${((y / 500) * 100).toFixed(2)}%`,
      left: `${xPercent - (((additionWidth - 50) / 2) * 100) / wChart}%`,
    };
  }, [positionTooltip, viewPort, params, chartType]);

  const isShowDoughNutChart = useMemo(
    () =>
      [CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED, CHART_TYPE.DRIVING_ROUTE_EXTENDED].includes(
        chartType
      ),
    [chartType]
  );

  const _renderContentTooltip = useCallback(() => {
    let content = <></>;
    switch (chartType) {
      case CHART_TYPE.DRIVING_ROUTE:
        content = <TooltipContentDataList showColor unit="점" />;
        break;
      case CHART_TYPE.DRIVING_ROUTE_EXTENDED:
        content = <TabsTooltip tabs={TOOLTIP_DRIVING_ROUTE_TABS} />;
        break;
      case CHART_TYPE.COLLECT_COUNT_COLUMN:
        content = (
          <TooltipContentDataList
            unit={unitCollectCount === 'm3' ? 'm³' : unitCollectCount || '개'}
          />
        );
        break;
      case CHART_TYPE.COLLECT_COUNT_COLUMN_EXTENDED:
        content = <DoughnutTooltip tab={TOOLTIP_TABS.QUANTITY} />;
        break;
      default:
        content = (
          <TooltipContentDataList
            showColor
            unit={unitCollectCount === 'm3' ? 'm³' : unitCollectCount || '개'}
          />
        );
        break;
    }

    return (
      <TooltipChart
        title={dataTooltip.data.length > 0 ? formatDateKorea(dataTooltip.data[0]?.date ?? '') : ''}
      >
        {content}
      </TooltipChart>
    );
  }, [chartType, dataTooltip, unitCollectCount]);

  useEffect(() => {
    const newActive = fullScreenChart.active
      ? [...actionKeys.active, ACTIONS_CHART_KEY.FULL_SCREEN]
      : actionKeys.active.filter((key) => key !== ACTIONS_CHART_KEY.FULL_SCREEN);

    setActionKeys({ ...actionKeys, active: newActive });
  }, [fullScreenChart.active, tabActive]);

  return (
    <Collapse
      type="detail"
      title="파워 그래프"
      settingContent={
        <>
          {settingButtons.map((item, index) => (
            <React.Fragment key={index}>
              <S.SettingButton onClick={item.onClick} $disabled={item?.disabled}>
                {item.icon}
                {item.title}
              </S.SettingButton>
              {index < 2 && <S.SettingDivider />}
            </React.Fragment>
          ))}
        </>
      }
    >
      <FullScreen handle={fullScreenChart}>
        <S.GlobalStyles />
        <S.Wrapper id="chart-wrapper" ref={pdfRef}>
          {loadingChart && (
            <S.Loading>
              <LoadingOutlined style={{ fontSize: '60px' }} />
            </S.Loading>
          )}

          <ActionsChart />
          {tabActive !== CHART_TABS.GRAPH_BUILDER_SETTING && (
            <S.ChartWrapper>
              <S.Chart>
                {CHART[chartType]}
                {openTooltip && position && (
                  <S.Tooltip
                    open={openTooltip}
                    placement="right"
                    arrow={false}
                    color="#fff"
                    overlayClassName={`tooltip-chart ${
                      isShowDoughNutChart ? 'tooltip-chart-doughnut' : ''
                    }`}
                    title={_renderContentTooltip()}
                    top={position.top}
                    left={position.left}
                    getPopupContainer={(triggerNode) => triggerNode}
                  />
                )}
              </S.Chart>
              <S.Legends>
                <LegendCharts />
              </S.Legends>
            </S.ChartWrapper>
          )}
        </S.Wrapper>
      </FullScreen>

      {
        <BaseModal
          destroyOnClose
          open={openExportFile}
          footer={null}
          onCancel={() => setOpenExportFile(false)}
          closeIcon={null}
          width={400}
          rounded="md"
          styles={{
            content: {
              padding: '1rem',
            },
          }}
        >
          <ExportFile
            fileNamePrefix="관제현황"
            onCancel={() => setOpenExportFile(false)}
            onExport={async ({ fileName }) => {
              await exportToPDF(pdfRef.current, fileName);
              setOpenExportFile(false);
            }}
            fileType="pdf"
            disabledFileType
          />
        </BaseModal>
      }
    </Collapse>
  );
};

export default AnalysisChart;
