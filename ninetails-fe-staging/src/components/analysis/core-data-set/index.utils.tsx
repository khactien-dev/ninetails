import AverageIcon from '@/assets/images/chart/average-setting.svg';
import DiagnosisIcon from '@/assets/images/chart/diagnosis-setting.svg';
import ExportIcon from '@/assets/images/chart/export-setting.svg';
import RankingIcon from '@/assets/images/chart/rank-setting.svg';
import ScreenshotIcon from '@/assets/images/chart/screenshot-setting.svg';
import TrashIcon from '@/assets/images/chart/trash-setting.svg';
import {
  useGetCoreDataSet,
  useGetMetricWeighQuery,
  useUpdateMetricMutation,
} from '@/hooks/features/useAnalysis';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { ICoreDataSetConfig, ICoreDataTree } from '@/interfaces';
import { queryClient } from '@/utils/react-query';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { omit } from 'lodash';
import Papa from 'papaparse';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { useAnalysisContext } from '../context';
import { DEFAULT_CORE_DATASET_CONFIG } from '../context/index.utils';
import { parseData } from './parse-data';
import { LevelRangeType, WeightRangeType } from './ranking-modal/index.utils';

export const DEFAULT_LEVEL_RANGE: LevelRangeType = [10, 30, 70, 90];
export const DEFAULT_WEIGHT_RANGE: WeightRangeType = [15, 30, 45, 60, 70];

interface IProps {
  onDeleteSection: () => void;
}

export const useCoreDataSet = ({ onDeleteSection }: IProps) => {
  const {
    params: paramsAnalysis,
    coreDataSetConfig,
    setCoreDataSetConfig,
    setCoreDataSetSections,
    setCoreDataSetSelectedRoutes,
    paramsUseWidgetDataset,
    handleItemClickRouteName,
  } = useAnalysisContext();

  const [isOpenConfig, setIsOpenConfig] = useState<boolean>(false);
  const [isOpenDiagnosis, setIsOpenDiagnosis] = useState<boolean>(false);
  const [isOpenAlphaSetting, setIsOpenAlphaSetting] = useState<boolean>(false);
  const [isOpenExport, setIsOpenExport] = useState<boolean>(false);
  const [isOpenPreviewPdf, setIsOpenPreviewPdf] = useState<boolean>(false);
  const permission = usePermissions();
  const { notification } = useFeedback();

  const { data: metricWeightData } = useGetMetricWeighQuery();

  const decimalToPercentage = (v: number) => {
    return Math.floor(v * 100);
  };

  const percentageToDecimal = (v: number) => {
    return parseFloat((v / 100).toFixed(2));
  };

  const { mutate: updateMetricMutate, isPending: loadingUpdateMetric } = useUpdateMetricMutation();

  useEffect(() => {
    if (metricWeightData?.data) {
      const distanceRatioRate = decimalToPercentage(metricWeightData?.data?.distanceRatioRate ?? 0);
      const durationRatioRate = decimalToPercentage(metricWeightData?.data?.durationRatioRate ?? 0);
      const collectDistanceRate = decimalToPercentage(
        metricWeightData?.data?.collectDistanceRate ?? 0
      );
      const collectDurationRate = decimalToPercentage(
        metricWeightData?.data?.collectDurationRate ?? 0
      );
      const collectCountRate = decimalToPercentage(metricWeightData?.data?.collectCountRate ?? 0);
      const manualCollectTimeRate = decimalToPercentage(
        metricWeightData?.data?.manualCollectTimeRate ?? 0
      );
      const alpha = decimalToPercentage(metricWeightData?.data?.alpha ?? 0);
      const pValue = decimalToPercentage(metricWeightData?.data?.pValue ?? 0);

      const percentageAE = decimalToPercentage(metricWeightData?.data?.percentageAE ?? 0);
      const percentageBD = decimalToPercentage(metricWeightData?.data?.percentageBD ?? 0);
      const percentageC = decimalToPercentage(metricWeightData?.data?.percentageC ?? 0);

      setCoreDataSetConfig({
        distanceRatioRate,
        durationRatioRate,
        collectDistanceRate,
        collectDurationRate,
        collectCountRate,
        manualCollectTimeRate,
        alpha,
        pValue,
        percentageAE,
        percentageBD,
        percentageC,
      });
    }
  }, [metricWeightData]);

  const takeScreenshot = useCallback(() => {
    const element = document.querySelector('#core-data-set-container') as HTMLElement;
    if (element) {
      html2canvas(element).then((canvas) => {
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard
              .write([new ClipboardItem({ 'image/png': blob })])
              .then(() => {
                notification.success({ message: 'Screenshot copied to clipboard' });
              })
              .catch((err) => {
                console.log('Screenshot copied to clipboard', err);
              });
          }
        });
      });
    }
  }, []);

  const defaultWeightRange: WeightRangeType = useMemo(() => {
    const v = coreDataSetConfig ?? DEFAULT_CORE_DATASET_CONFIG;
    if (
      v?.distanceRatioRate != undefined &&
      v?.collectDistanceRate != undefined &&
      v?.durationRatioRate != undefined &&
      v?.collectDurationRate != undefined &&
      v?.manualCollectTimeRate != undefined &&
      v?.collectCountRate != undefined
    ) {
      return [
        v?.distanceRatioRate,
        v?.distanceRatioRate + v?.collectDistanceRate,
        v?.distanceRatioRate + v?.collectDistanceRate + v?.durationRatioRate,
        v?.distanceRatioRate +
          v?.collectDistanceRate +
          v?.durationRatioRate +
          v?.collectDurationRate,
        100 - v?.collectCountRate,
      ];
    }

    return DEFAULT_WEIGHT_RANGE;
  }, [coreDataSetConfig]);

  const defaultLevelRange: LevelRangeType = useMemo(() => {
    const v = coreDataSetConfig ?? DEFAULT_CORE_DATASET_CONFIG;
    if (
      v?.percentageAE != undefined &&
      v?.percentageBD != undefined &&
      v?.percentageC != undefined
    ) {
      return [
        v?.percentageAE,
        v?.percentageAE + v?.percentageBD,
        v?.percentageAE + v?.percentageBD + v?.percentageC,
        100 - v?.percentageAE,
      ];
    }
    return DEFAULT_LEVEL_RANGE;
  }, [coreDataSetConfig]);

  const onChangeConfigWeight = (v: ICoreDataSetConfig) => {
    const decimalAE = percentageToDecimal(v.percentageAE ?? 0);
    const decimalBD = percentageToDecimal(v.percentageBD ?? 0);
    const decimalC = percentageToDecimal(v.percentageC ?? 0);

    const decimalDistanceRatio = percentageToDecimal(v.distanceRatioRate ?? 0);
    const decimalCollectDistance = percentageToDecimal(v.collectDistanceRate ?? 0);
    const decimalDurationRatio = percentageToDecimal(v.durationRatioRate ?? 0);
    const decimalCollectDuration = percentageToDecimal(v.collectDurationRate ?? 0);
    const decimalManualCollectTime = percentageToDecimal(v.manualCollectTimeRate ?? 0);
    const decimalCollectCount = percentageToDecimal(v.collectCountRate ?? 0);

    const decimalAlpha = percentageToDecimal(coreDataSetConfig?.alpha ?? 0);
    const decimalPValue = percentageToDecimal(coreDataSetConfig?.pValue ?? 0);

    updateMetricMutate(
      {
        percentageAE: decimalAE,
        percentageBD: decimalBD,
        percentageC: decimalC,
        distanceRatioRate: decimalDistanceRatio,
        collectCountRate: decimalCollectCount,
        collectDistanceRate: decimalCollectDistance,
        collectDurationRate: decimalCollectDuration,
        manualCollectTimeRate: decimalManualCollectTime,
        durationRatioRate: decimalDurationRatio,
        pValue: decimalPValue,
        alpha: decimalAlpha,
      },
      {
        onSuccess(response) {
          if (response?.data) {
            queryClient.invalidateQueries({
              queryKey: ['metric-weight'],
            });
            setIsOpenConfig(false);
          }
        },
      }
    );
  };

  const onChangeAlpha = (v: number) => {
    const decimalAlpha = percentageToDecimal(v);
    updateMetricMutate(
      {
        alpha: decimalAlpha,
      },
      {
        onSuccess(response) {
          if (response?.data) {
            queryClient.invalidateQueries({
              queryKey: ['metric-weight'],
            });
            setIsOpenConfig(false);
          }
        },
      }
    );
  };

  const onChangePValue = (v: number) => {
    const decimalPvalue = percentageToDecimal(v);
    updateMetricMutate(
      {
        pValue: decimalPvalue,
      },
      {
        onSuccess(response) {
          if (response?.data) {
            queryClient.invalidateQueries({
              queryKey: ['metric-weight'],
            });
            setIsOpenConfig(false);
          }
        },
      }
    );
  };

  const { data: coreDataset, isLoading: loadingCoreDataset } = useGetCoreDataSet({
    startDate: paramsAnalysis?.startDate,
    endDate: paramsAnalysis?.endDate,
    ...(paramsAnalysis?.routeName ? { routeNames: paramsAnalysis?.routeName } : {}),
  });

  const rawData = coreDataset?.data;
  const [treeData, setTreeData] = useState<ICoreDataTree[]>([]);

  useEffect(() => {
    if (rawData) {
      const { data, collectAmount, collectDistance, collectionDuration } = parseData(rawData);
      setCoreDataSetSections({
        collectDistance,
        collectionDuration,
        collectAmount,
      });

      setTreeData(data ?? []);
    } else {
      setTreeData([]);
    }
  }, [rawData]);

  const settingButtons = [
    {
      icon: <RankingIcon />,
      title: '등급 설정',
      onClick: () => {
        return setIsOpenConfig(true);
      },
      disabled: !permission.updateAble,
    },
    {
      icon: <DiagnosisIcon />,
      title: '진단 설정',
      onClick: () => {
        return setIsOpenDiagnosis(true);
      },
      disabled: !permission.updateAble,
    },
    {
      icon: <AverageIcon />,
      title: '평균 설정',
      onClick: () => {
        return setIsOpenAlphaSetting(true);
      },
      disabled: !permission.updateAble,
    },
    {
      icon: <ExportIcon />,
      title: '저장하기',
      onClick: () => {
        return setIsOpenExport(true);
      },
      disabled: !permission?.exportAble,
    },
    {
      icon: <ScreenshotIcon />,
      title: '스크린샷',
      onClick: () => takeScreenshot(),
      disabled: false,
    },
    {
      icon: <TrashIcon />,
      title: '모두 삭제',
      onClick: () => onDeleteSection(),
      disabled: !permission?.deleteAble,
    },
  ];

  const onChangeSelectRoutes = (key: string[]) => {
    if (!paramsUseWidgetDataset?.routerNames) {
      handleItemClickRouteName(key[0]);
    }
  };

  const previewRoute = useMemo(() => {
    const data = treeData.find((item) => item.dispatch_area === paramsAnalysis.routeName);
    return data ? [data] : treeData;
  }, [paramsAnalysis, treeData]);

  const onExportSheet = (v: { fileName: string; fileType: 'csv' | 'pdf' | 'xlsx' }) => {
    const dataToDownload = treeData.map((record, index) => {
      const dataByDaysObj: ICoreDataTree = omit(record, [
        'EWM',
        'diagnosis',
        'dispatch_area',
        'key',
        'layer',
        'parent',
        'rating',
        'schemaKey',
        'titleBold',
        'unit',
        'unit_code',
        'children',
      ]);

      const entries = Object.entries(dataByDaysObj);
      const reversedEntries = entries.reverse();

      const reversedDates = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        reversedEntries.map(([date, value], index) => {
          return [`${index + 1}일 전`, value];
        })
      );

      return {
        No: index + 1,
        'Start Date': dayjs(paramsAnalysis?.startDate).format('YYYY/MM/DD'),
        'End Date': dayjs(paramsAnalysis?.endDate).format('YYYY/MM/DD'),
        'Route Name': record.dispatch_area,
        등급: record.rating,
        진단: record.diagnosis,
        '평균 (EWM)': record.EWM,
        ...reversedDates,
      };
    });

    if (v.fileType === 'csv') {
      const csv = Papa.unparse(dataToDownload);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${v.fileName}.csv`);
    } else if (v.fileType === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CoreDataset');
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
      saveAs(blob, `${v.fileName}.xlsx`);
    }
  };

  return {
    isOpenAlphaSetting,
    isOpenConfig,
    isOpenDiagnosis,
    treeData,
    settingButtons,
    coreDataSetConfig,
    isOpenPreviewPdf,
    loadingCoreDataset,
    loadingUpdateMetric,
    defaultLevelRange,
    defaultWeightRange,
    isOpenExport,
    previewRoute,
    setIsOpenPreviewPdf,
    setCoreDataSetSelectedRoutes,
    setCoreDataSetConfig,
    setIsOpenAlphaSetting,
    setIsOpenConfig,
    setIsOpenDiagnosis,
    onExportSheet,
    onChangeAlpha,
    onChangePValue,
    onChangeConfigWeight,
    setIsOpenExport,
    onChangeSelectRoutes,
  };
};
