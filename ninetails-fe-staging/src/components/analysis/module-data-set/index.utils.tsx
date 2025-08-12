import ExportIcon from '@/assets/images/chart/export-setting.svg';
import ScreenshotIcon from '@/assets/images/chart/screenshot-setting.svg';
import TrashIcon from '@/assets/images/chart/trash-setting.svg';
import { useGetModuleDataSetMutation } from '@/hooks/features/useAnalysis';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { ICoreDataTree, IModuleDataSetCondition } from '@/interfaces';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { omit } from 'lodash';
import Papa from 'papaparse';
import { useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { useAnalysisContext } from '../context';
import { CONDITION } from './condition';
import { parseData } from './parse-data';

const checkboxs = [
  {
    name: 'distanceRatios',
    label: '수거/기타 거리 %',
  },
  {
    name: 'collectDistance',
    label: '수거 거리',
  },
  {
    name: 'otherDistance',
    label: '기타 거리',
  },
  {
    name: 'durationRatios',
    label: '수거/기타 시간 %',
  },
  {
    name: 'collectDuration',
    label: '수거 시간',
  },
  {
    name: 'otherDuration',
    label: '기타 시간',
  },
  {
    name: 'collectCount',
    label: '수거량',
  },
  {
    name: 'manualCollectRatios',
    label: '도보수거 거리',
  },
  {
    name: 'manualCollectTime',
    label: '도보수거 시간',
  },
];
export interface IMouduleDatasetField {
  distanceRatios: boolean;
  collectDistance: boolean;
  otherDistance: boolean;
  durationRatios: boolean;
  collectDuration: boolean;
  otherDuration: boolean;
  collectCount: boolean;
  manualCollectRatios: boolean;
  manualCollectTime: boolean;
}

export interface ICondition {
  type: CONDITION;
  condition_value: string;
  key: string;
}

interface IProps {
  onDeleteSection: () => void;
}

export const useModuleDataSet = ({ onDeleteSection }: IProps) => {
  const { params: analysisParams, coreDataSetConfig } = useAnalysisContext();
  const { mutate: mutateModuleDataset, isPending: getModuleDataSetPending } =
    useGetModuleDataSetMutation();
  const [treeData, setTreeData] = useState<ICoreDataTree[] | null>(null);
  const { notification } = useFeedback();
  const permission = usePermissions();
  const [isOpenExport, setIsOpenExport] = useState<boolean>(false);
  const [isOpenPreviewPdf, setIsOpenPreviewPdf] = useState<boolean>(false);

  const takeScreenshot = useCallback(() => {
    const element = document.querySelector('#module-data-set-container') as HTMLElement;
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

  const settingButtons = [
    {
      icon: <ExportIcon />,
      title: '저장하기',
      onClick: () => setIsOpenExport(true),
      disabled: !permission?.exportAble,
    },
    {
      icon: <ScreenshotIcon />,
      title: '스크린샷',
      onClick: () => takeScreenshot(),
    },
    {
      icon: <TrashIcon />,
      title: '모두 삭제',
      onClick: () => onDeleteSection(),
      disabled: !permission?.deleteAble,
    },
  ];

  const [checkboxValues, setCheckboxValues] = useState({
    distanceRatios: true,
    collectDistance: true,
    otherDistance: true,
    durationRatios: true,
    collectDuration: true,
    otherDuration: true,
    collectCount: true,
    manualCollectRatios: true,
    manualCollectTime: true,
  });

  const onChangeChecbox = (event: any) => {
    setCheckboxValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const onRun = (conditions: IModuleDataSetCondition[]) => {
    mutateModuleDataset(
      {
        startDate: analysisParams.startDate,
        endDate: analysisParams.endDate,
        ...(analysisParams?.routeName ? { routeNames: analysisParams?.routeName } : {}),
        conditions,
      },
      {
        onSuccess: (response) => {
          const parsedData = parseData(response.data);

          setTreeData(parsedData);
        },
      }
    );
  };

  const previewRoute = useMemo(() => {
    const data = treeData?.find((item) => item.dispatch_area === analysisParams.routeName);
    return data ? [data] : treeData;
  }, [analysisParams, treeData]);

  const onExportSheet = (v: { fileName: string; fileType: 'csv' | 'pdf' | 'xlsx' }) => {
    const dataToDownload = treeData?.map((record, index) => {
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
        'Start Date': dayjs(analysisParams?.startDate).format('YYYY/MM/DD'),
        'End Date': dayjs(analysisParams?.endDate).format('YYYY/MM/DD'),
        'Route Name': record.dispatch_area,
        등급: record.rating,
        진단: record.diagnosis,
        '평균 (EWM)': record.EWM,
        ...reversedDates,
      };
    });

    if (v.fileType === 'csv' && dataToDownload) {
      const csv = Papa.unparse(dataToDownload);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${v.fileName}.csv`);
    } else if (v.fileType === 'xlsx' && dataToDownload) {
      const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CoreDataset');
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
      saveAs(blob, `${v.fileName}.xlsx`);
    }
  };

  return {
    checkboxValues,
    checkboxs,
    isOpenExport,
    isOpenPreviewPdf,
    previewRoute,
    treeData,
    getModuleDataSetPending,
    settingButtons,
    coreDataSetConfig,
    onChangeChecbox,
    onRun,
    setIsOpenExport,
    setIsOpenPreviewPdf,
    onExportSheet,
  };
};
