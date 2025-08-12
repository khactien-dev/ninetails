import BarsIcon from '@/assets/images/schedule/bars.svg';
import ExpandIcon from '@/assets/images/schedule/expand.svg';
import PlusIcon from '@/assets/images/settings/icon-plus.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import ExportIcon from '@/assets/images/svg/icon-export.svg';
import { PURPOSE_VALUE } from '@/constants/settings';
import { useDeleteSchedule } from '@/hooks/features/useSchedule';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { TabsItem } from '@/interfaces';
import { ISchedule } from '@/interfaces/schedule';
import { exportToPDF } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { useMemo, useRef, useState } from 'react';
import { useFullScreenHandle } from 'react-full-screen';
import * as XLSX from 'xlsx';

import { useScheduleContext } from '../context';

const tabsArr: TabsItem[] = [
  {
    key: 'all',
    label: '통합',
  },
  {
    key: PURPOSE_VALUE.COMPOSITE_WASTES,
    label: '생활',
  },
  {
    key: PURPOSE_VALUE.FOOD_WASTES,
    label: '음식',
  },
  {
    key: PURPOSE_VALUE.REUSABLE_WASTES,
    label: '재활',
  },

  {
    key: PURPOSE_VALUE.TACTICAL_MOBILITY,
    label: '기동',
  },
];

export const useScheduleTab = () => {
  const {
    selectedComposite,
    selectedFood,
    selectedReusable,
    selectedTactical,
    setSelectedComposite,
    setSelectedFood,
    setSelectedReusable,
    setSelectedTatical,
  } = useScheduleContext();

  const previewRef = useRef(null);
  const permissions = usePermissions();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeLegend, setActiveLegend] = useState<string | null>(null);
  const [isOpenExport, setIsOpenExport] = useState<boolean>(false);

  const buttons = [
    {
      name: '발행',
      icon: <ExpandIcon />,
      isActive: true,
      isPrimary: false,
      isOutline: true,
      onClick: () => {
        fullScreenHandle.enter();
      },
    },
    {
      name: '범례',
      icon: <BarsIcon />,
      isActive: true,
      isPrimary: true,
      onClick: () => setActiveLegend('staff'),
    },
    {
      name: '추가',
      icon: <PlusIcon />,
      isActive: permissions.createAble,
      isPrimary: true,
      onClick: () => setIsOpenCreate(true),
    },
    {
      name: '삭제',
      icon: <MinusIcon style={{ marginBottom: 4 }} />,
      isActive:
        permissions.deleteAble &&
        !!(
          selectedComposite?.length ||
          selectedFood?.length ||
          selectedReusable?.length ||
          selectedTactical?.length
        ),
      isPrimary: false,
      onClick: () => {
        if (
          !(
            selectedComposite?.length ||
            selectedFood?.length ||
            selectedReusable?.length ||
            selectedTactical?.length
          )
        )
          return notification.info({ message: 'Please select vehicle' });
        setIsOpenConfirm(true);
      },
    },
    {
      name: '저장',
      icon: <ExportIcon style={{ marginBottom: 2 }} />,
      isActive: permissions.exportAble,
      isPrimary: false,
      onClick: () => setIsOpenExport(true),
    },
  ];

  const fullScreenHandle = useFullScreenHandle();
  const deleteSchedule = useDeleteSchedule();
  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const {
    compositeWasteSchedule,
    foodWasteSchedule,
    reusableWasteSchedule,
    taticalMobilityWasteSchedule,
    params,
  } = useScheduleContext();

  const handleDeleteSchedule = () => {
    // @ts-ignore
    deleteSchedule.mutate(
      [...selectedComposite, ...selectedFood, ...selectedReusable, ...selectedTactical],
      {
        onSuccess: () => {
          notification.success({ message: '작업 일정이 성공적으로 삭제되었습니다!' });
          setIsOpenConfirm(false);

          queryClient.invalidateQueries({
            queryKey: [`schedule-statistic`],
          });

          if (selectedComposite?.length) {
            queryClient
              .invalidateQueries({
                queryKey: [
                  `SCHEDULE_${PURPOSE_VALUE.COMPOSITE_WASTES}`,
                  { working_date: params?.working_date },
                ],
              })
              .finally(() => {
                setSelectedComposite([]);
              });
          }

          if (selectedFood?.length) {
            queryClient
              .invalidateQueries({
                queryKey: [
                  `SCHEDULE_${PURPOSE_VALUE.FOOD_WASTES}`,
                  { working_date: params?.working_date },
                ],
              })
              .finally(() => {
                setSelectedFood([]);
              });
          }

          if (selectedReusable?.length) {
            queryClient
              .invalidateQueries({
                queryKey: [
                  `SCHEDULE_${PURPOSE_VALUE.REUSABLE_WASTES}`,
                  { working_date: params?.working_date },
                ],
              })
              .finally(() => {
                setSelectedReusable([]);
              });
          }

          if (selectedTactical?.length) {
            queryClient
              .invalidateQueries({
                queryKey: [
                  `SCHEDULE_${PURPOSE_VALUE.TACTICAL_MOBILITY}`,
                  { working_date: params?.working_date },
                ],
              })
              .finally(() => {
                setSelectedTatical([]);
              });
          }
        },
      }
    );
  };

  const parseScheduleDownloadItem = (schedule: ISchedule[], domain: string) => {
    return schedule?.map((el, index) => ({
      No: index + 1,
      Date: dayjs(params?.working_date).format('YYYY/MM/DD'),
      Domain: domain,
      'Route Name': el?.route?.name,
      'Vehicle Number': el?.wsBackupVehicle
        ? el?.wsBackupVehicle?.vehicle_number
        : el?.vehicle?.vehicle_number,
      Driver: el?.wsDriver?.name,
      'Replacer Driver': el?.wsBackupDriver?.name ?? '',
      'Field Staff 1': el?.wsFieldAgent1?.name,
      'Replace Field Staff 1': el?.wsBackupFieldAgent1?.name ?? '',
      'Field Staff 2': el?.wsFieldAgent2?.name,
      'Replace Field Staff 2': el?.wsBackupFieldAgent2?.name ?? '',
    }));
  };

  const handleExportFile = async (fileProps: {
    fileName: string;
    fileType: 'csv' | 'pdf' | 'xlsx';
  }) => {
    if (fileProps?.fileType === 'pdf') {
      previewRef?.current && (await exportToPDF(previewRef?.current, fileProps?.fileName));
      setIsOpenExport(false);
    } else {
      const compositeDownloadItem = parseScheduleDownloadItem(compositeWasteSchedule, '생활');
      const foodDownloadItem = parseScheduleDownloadItem(foodWasteSchedule, '음식');
      const reusableDownloadItem = parseScheduleDownloadItem(reusableWasteSchedule, '재활');
      const taticalDownloadItem = parseScheduleDownloadItem(taticalMobilityWasteSchedule, '기동');

      const dataToDownload = [
        ...compositeDownloadItem,
        ...foodDownloadItem,
        ...reusableDownloadItem,
        ...taticalDownloadItem,
      ];

      if (fileProps.fileType === 'csv') {
        const csv = Papa.unparse(dataToDownload);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${fileProps.fileName}.csv`);
      } else if (fileProps.fileType === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Workshift');
        const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
        saveAs(blob, `${fileProps.fileName}.xlsx`);
      }
      setIsOpenExport(false);
    }
  };

  const activeDomain = useMemo(() => {
    return tabsArr.find((item) => item.key === activeTab);
  }, [activeTab]);

  return {
    setActiveLegend,
    setIsOpenCreate,
    setIsOpenConfirm,
    handleDeleteSchedule,
    setActiveTab,
    setIsOpenExport,
    handleExportFile,
    previewRef,
    isOpenExport,
    isOpenConfirm,
    isOpenCreate,
    activeLegend,
    buttons,
    tabsArr,
    fullScreenHandle,
    activeTab,
    activeDomain,
  };
};
