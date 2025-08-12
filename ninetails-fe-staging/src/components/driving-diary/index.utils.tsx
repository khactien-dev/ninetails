import ActionDown from '@/assets/images/driving-diary/action-down.svg';
import ActionUp from '@/assets/images/driving-diary/action-up.svg';
import CarIcon from '@/components/control-status/car-info/car-icon';
import { driveStatus } from '@/components/settings/absence/index.utils';
import UserIcon from '@/components/settings/workers/user-icon';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import { JOB_TYPE, USER_ROLE } from '@/constants/settings';
import {
  useCreateLandfill,
  useCreateSignature,
  useDeleteSignature,
  useExportDrivingDiary,
  useGetCurrentSignature,
  useGetDataTable,
  useGetDrivingRecord,
  useGetLandfill,
  useGetRouteList,
  useGetSignature,
  useSaveDrivingRecord,
  useSignSignature,
  useUpdateLandfill,
} from '@/hooks/features/useDrivingDiary';
import { useGetSchedule } from '@/hooks/features/useSchedule';
import { useUploadFile } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { PaginationParams } from '@/interfaces';
import {
  DataTableParams,
  DataUpdateLandfill,
  DriveMetrics,
  DrivingRecordTypes,
  GetScheduleParams,
  LandfillRecord,
  RecordDataTable,
  RouteDrivingDiary,
  RouteOption,
  TotalDataTableTypes,
} from '@/interfaces/driving-diary';
import { SignatureData } from '@/interfaces/driving-diary';
import { ISchedule } from '@/interfaces/schedule';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { downloadFile, exportToPDF2, formatNumberWithCommas } from '@/utils';
import { Form, PaginationProps, TableColumnType, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { RcFile } from 'antd/es/upload';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import Papa from 'papaparse';
import React, { Key, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import * as S from './left-driving-diary/index.styles';

dayjs.extend(duration);

export const calculateDuration = (entrance_time: string, exit_time: string) => {
  const duration = dayjs.duration(dayjs(exit_time).diff(dayjs(entrance_time)));
  const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const inittialScheduleParams = {
  page: 1,
  pageSize: 999,
  sortBy: SORT_TYPE.DESC,
  sortField: '',
};

const driveModeColors: { [key: number]: { background: string; color: string; label: string } } = {
  0: { background: '#FCE7E7', color: '#EA5D5F', label: '기타' },
  1: { background: '#FEF5E7', color: '#F8BD60', label: '운전' },
  2: { background: '#FFFBE1', color: '#FFE63A', label: '매립' },
  3: { background: '#ECF6E6', color: '#83C257', label: '차고' },
  4: { background: '#E7F6FC', color: '#5FC5ED', label: '식당' },
  5: { background: '#FFE0EF', color: '#FF2E91', label: '수거' },
  6: { background: '#F1E4F6', color: '#A34BC4', label: '대기' },
  7: { background: '#EBEBEB', color: '#777777', label: '미관제' },
  8: { background: '#DEDEDE', color: '#222222', label: '휴식' },
};

interface PaginationTable {
  total?: number;
  last_page?: number;
  per_page?: number;
  current_page?: number;
}

interface DrivingRecord {
  unit: string;
  prev_total: string | number;
  today_total: string | number;
  deviation: string | number;
}

export default function useDrivingDiary() {
  const [form] = Form.useForm();
  const uploadFile = useUploadFile();
  const user = useAppSelector(selectCurrentUser);
  const getRouteList = useGetRouteList();
  const createSignature = useCreateSignature();
  const getSignature = useGetSignature();
  const signSignature = useSignSignature();
  const getDrivingRecord = useGetDrivingRecord();
  const deleteSignature = useDeleteSignature();
  const saveDrivingRecord = useSaveDrivingRecord();
  const { notification } = useFeedback();
  const getDataTable = useGetDataTable();
  const createLandfill = useCreateLandfill();
  const updateLandfill = useUpdateLandfill();
  const exportDrivingDiary = useExportDrivingDiary();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [routeData, setRouteData] = useState<RouteOption[]>([
    { label: '000-전체차량', value: '000' },
  ]);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [signatureFile, setSignatureFile] = useState<RcFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [distanceYesterday, setDistanceYesterday] = useState<number | null>(null);
  const [distanceToday, setDistanceToday] = useState<number | null>(null);
  const [fuelYesterday, setFuelYesterday] = useState<number | null>(null);
  const [fuelToday, setFuelToday] = useState<number | null>(null);
  const [expandedRowKeysLandfill, setExpandedRowKeysLandfill] = useState<number[]>([]);
  const [fuelVolume, setFuelVolume] = useState<number | null>(null);
  const [isShowAddNewRecord, setIsShowAddNewRecord] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [isNewUploadSignature, setIsNewUploadSignature] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>(routeData[0].value);
  const [drivingRecord, setDrivingRecord] = useState<DrivingRecordTypes | null>(null);
  const [openExpandInfo, setOpenExpandInfo] = useState(false);
  const [paramsSchedule, setParamsSchedule] = useState<GetScheduleParams>({
    ...inittialScheduleParams,
    working_date: selectedDate.format(DATE_FORMAT.R_BASIC),
  });
  const [landfillParams, setLandfillParams] = useState({
    ...inittialScheduleParams,
    date: dayjs().toISOString(),
  });
  const { data: workingSchedule } = useGetSchedule(paramsSchedule);
  const { data: landfillData, refetch: landfillRefresh } = useGetLandfill(landfillParams);
  const getCurrentSignature = useGetCurrentSignature();
  const [dataTable, setDataTable] = useState<RecordDataTable[]>([]);
  const [pagination, setPagination] = useState<PaginationTable>({});
  const [vehicleList, setVehicleList] = useState<any[]>([]);
  const [vehicleId, setVehicleId] = useState<number>();
  const [dataTableParams, setDataTableParams] = useState<DataTableParams>({
    page: 1,
    pageSize: 10,
  });
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [filenamePDF, setFilenamePDF] = useState('');
  const [fileType, setFileType] = useState<'csv' | 'xlsx'>('csv');
  const [fileLocation, setFileLocation] = useState('');
  const total = pagination.total || 0;
  const currentPage = pagination.current_page || 1;
  const [vehicleNumber, setVehicleNumber] = useState<string | null>(null);
  const [totalDataTable, setTotalDataTable] = useState<TotalDataTableTypes | null>(null);
  const [workingScheduleVehicle, setWorkingScheduleVehicle] = useState<ISchedule | null>(null);

  const [countTableExport, setCountTableExport] = useState(0);
  const [isDownloadExport, setIsDownloadExport] = useState(false);
  const [allDataTableExport, setAllDataTableExport] = useState<RecordDataTable[]>([]);
  const [openPDFcontent, setOpenPDFcontent] = useState(false);

  const isManager = useMemo(() => {
    return (
      user &&
      (user.role === USER_ROLE.OP ||
        user.role === USER_ROLE.BACKUP ||
        user.role === USER_ROLE.DISPATCH)
    );
  }, [user]);

  const handleSelectVehicle = (value: string) => {
    setVehicleNumber(value);
    setWorkingScheduleVehicle(
      workingSchedule?.data?.data?.find((ws) => ws?.vehicle?.vehicle_number === value) || null
    );
  };

  useEffect(() => {
    setDataTableParams((prev) => ({
      ...prev,
      vehicleNumber,
      date: selectedDate.format(DATE_FORMAT.R_BASIC),
      routeId: workingScheduleVehicle?.route_id,
    }));
  }, [workingScheduleVehicle]);

  useEffect(() => {
    if (
      selectedRoute === '000' &&
      workingSchedule?.data?.data[0]?.vehicle_id &&
      workingSchedule?.data?.data[0]?.vehicle?.vehicle_number
    ) {
      setVehicleId(workingSchedule?.data?.data[0]?.vehicle_id);
      setVehicleNumber(workingSchedule?.data?.data[0]?.vehicle?.vehicle_number);
      setWorkingScheduleVehicle(workingSchedule?.data?.data[0]);
    } else {
      setVehicleId(undefined);
      setVehicleNumber(null);
      setWorkingScheduleVehicle(null);
    }
  }, [selectedRoute, workingSchedule, selectedDate]);

  useEffect(() => {
    if (workingSchedule?.data?.data) {
      setVehicleList(
        workingSchedule?.data?.data?.map((item: ISchedule) => {
          return {
            label: item.vehicle?.vehicle_number,
            value: item.vehicle?.vehicle_number,
          };
        })
      );
    } else {
      setVehicleList([]);
      setDataTable([]);
      setTotalDataTable(null);
    }
  }, [workingSchedule]);

  const handleLandfill = (data: DataUpdateLandfill) => {
    const newData = {
      url: data.url,
      serial: +data.serial,
      loading_weight: +data.loadingWeight,
      empty_weight: +data.emptyWeight,
      entrance_time: data.entranceTime,
      exit_time: data.exitTime,
      filename: data.filename,
      date: data.date,
    };
    if (!isShowAddNewRecord) {
      updateLandfill.mutateAsync({ ...newData, id: data.id }).then((res) => {
        if (res?.data?.id) {
          landfillRefresh();
          setExpandedRowKeysLandfill([]);
          notification.success({ message: '데이터가 성공적으로 업데이트되었습니다!' });
        }
      });
      return;
    } else {
      createLandfill.mutateAsync(newData).then((res) => {
        if (res?.data?.id) {
          landfillRefresh();
          setExpandedRowKeysLandfill([]);
          notification.success({ message: '데이터가 성공적으로 생성되었습니다!' });
        }
      });
      return;
    }
  };

  const handleGetDataTable = () => {
    getDataTable.mutateAsync(dataTableParams).then((res) => {
      if (res?.data) {
        const { data, pagination, total } = res.data as unknown as {
          data: RecordDataTable[];
          pagination: PaginationTable;
          total: TotalDataTableTypes;
        };
        setDataTable(data);
        setTotalDataTable(total);
        setPagination(pagination);
      }
    });
  };

  useEffect(() => {
    if (vehicleNumber && dataTableParams && dataTableParams?.vehicleNumber) {
      handleGetDataTable();
    }
  }, [dataTableParams]);

  const handleGetDrivingRecord = () => {
    if (vehicleId) {
      getDrivingRecord
        .mutateAsync({
          vehicle_id: vehicleId,
          date: selectedDate.toISOString(),
        })
        .then((res) => {
          setDrivingRecord(res?.data);
        });
    }
  };

  const handleCreateSignature = () => {
    if (!url) {
      setError('이 필드는 필수입니다.');
      return;
    }
    if (isNewUploadSignature) {
      createSignature.mutateAsync({ url }).then((res) => {
        if (res?.data) {
          handleGetSignature(selectedDate);
          notification.success({ message: '서명이 성공적으로 업데이트되었습니다!' });
        }
      });
    } else {
      if (vehicleId) {
        signSignature.mutateAsync({ vehicle_id: vehicleId }).then((res) => {
          if (res?.data) {
            handleGetSignature(selectedDate);
            setIsExpanded(!isExpanded);
            notification.success({ message: '이 운행 일지에 서명하였습니다!' });
          }
        });
      }
    }

    setIsModalVisible(false);
    setError(null);
  };

  const handleSaveDrivingRecord = (data: DrivingRecordTypes) => {
    const newData = {
      distance_today: +data.distance_today,
      distance_yesterday: +data.distance_yesterday,
      fuel_today: +data.fuel_today,
      fuel_yesterday: +data.fuel_yesterday,
      fuel_volumn: +data.fuel_volumn,
      vehicle_id: vehicleId,
    };

    saveDrivingRecord.mutateAsync(newData).then((res) => {
      if (res?.data) {
        handleGetDrivingRecord();
        setOpenExpandInfo(false);
        notification.success({ message: '데이터가 성공적으로 업데이트되었습니다!' });
      }
    });
  };

  const handleDeleteSignature = () => {
    if (vehicleId) {
      deleteSignature.mutateAsync({ vehicle_id: vehicleId }).then((res) => {
        if (res?.data) {
          handleGetSignature(selectedDate);
          setIsModalVisible(false);
          notification.success({
            message: '이 운행 일지의 서명을 삭제하였습니다!',
          });
        }
      });
    }
  };

  const handleGetSignature = (date: dayjs.Dayjs) => {
    if (vehicleId) {
      getSignature.mutateAsync({ date, vehicle_id: vehicleId }).then((res) => {
        if (res?.data) {
          setSignatureData(res?.data);
        }
      });
    }
  };

  useEffect(() => {
    if (signatureData?.user?.url) {
      setUrl(signatureData?.user?.url);
    } else {
      setUrl(null);
    }
  }, [signatureData]);

  const handleRouteChange = (value: string) => {
    setSelectedRoute(value);
  };

  const handleExpandRowLandfill = (key: number) => {
    setExpandedRowKeysLandfill((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    getRouteList.mutateAsync({ page: 0, pageSize: 9999 }).then((res) => {
      if (res?.data?.data) {
        const convertData = res.data.data.map((item: RouteDrivingDiary) => ({
          label: item.name,
          value: item.id.toString(),
        }));
        setRouteData([...routeData, ...convertData]);
      }
    });
  }, []);

  const handleChangeParams = (data: PaginationParams) => {
    setDataTableParams((prev) => ({ ...prev, ...data }));
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const onFirstPage = () => {
    setDataTableParams((prev) => ({ ...prev, page: 1 }));
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setDataTableParams((prev) => ({ ...prev, page }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setDataTableParams((prev) => ({ ...prev, page: lastPage }));
  };

  const handleDateChange = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    setIsExpanded(false);
    setOpenExpandInfo(false);
    setExpandedRowKeysLandfill([]);
    setLandfillParams({ ...landfillParams, date: dayjs(date).toISOString() });
  };

  const handleDateChangeByType = (type: 'prev' | 'next', unit: 'day' | 'month') => {
    const newDate = selectedDate
      ? selectedDate[type === 'prev' ? 'subtract' : 'add'](1, unit)
      : dayjs()[type === 'prev' ? 'subtract' : 'add'](1, unit);
    setSelectedDate(newDate.isAfter(dayjs()) ? dayjs() : newDate);
    setIsExpanded(false);
    setOpenExpandInfo(false);
    setExpandedRowKeysLandfill([]);
    setLandfillParams({ ...landfillParams, date: dayjs(newDate).toISOString() });
  };

  const handleToday = () => {
    setSelectedDate(dayjs());
  };

  const handleChangeSignature = (params: { type: string }) => {
    if (params?.type === 'upload') {
      setIsNewUploadSignature(true);
    } else {
      setIsNewUploadSignature(false);
    }

    setIsModalVisible(true);
  };

  const handleCancelSignature = () => {
    setIsModalVisible(false);
    setError(null);
  };

  const toggleExpand = () => {
    if (signatureData?.user?.url) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleFileUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isJpgOrPng) {
      setError('JPEG, PNG 파일만 허용됩니다.');
      return false;
    }

    if (!isLt10M) {
      notification.error({
        message: '파일이 너무 큽니다. 10MB 이하의 파일을 업로드해 주세요.',
      });
      return false;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile.mutateAsync(formData);
      if (response.data.url) {
        setUrl(response.data.url);
      }
      setSignatureFile(file);
      setError(null);
    } catch (error) {
      setError('Failed to upload file!');
    }
  };

  useEffect(() => {
    setSignatureFile(null);
  }, [isModalVisible]);

  useEffect(() => {
    handleGetSignature(selectedDate);
    handleGetDrivingRecord();
  }, [selectedDate, vehicleId]);

  useEffect(() => {
    if (selectedRoute === '000') {
      setParamsSchedule((prev) => {
        const updatedParams = { ...prev, working_date: selectedDate.format(DATE_FORMAT.R_BASIC) };
        delete updatedParams.route_id;
        return updatedParams;
      });
    } else {
      setParamsSchedule((prev) => ({
        ...prev,
        working_date: selectedDate.format(DATE_FORMAT.R_BASIC),
        route_id: selectedRoute,
      }));
    }
  }, [selectedRoute, selectedDate]);

  const sortedLandfillData: LandfillRecord[] | undefined =
    landfillData && Array.isArray(landfillData?.data)
      ? landfillData.data.sort(
          (a: LandfillRecord, b: LandfillRecord) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      : [];

  const drivingRecordColumns: ColumnsType<DrivingRecord> = [
    { title: ' ', key: 'unit', dataIndex: 'unit' },
    {
      title: '번호',
      key: 'prev_total',
      dataIndex: 'prev_total',
      width: '30%',
      align: 'center',
    },
    {
      title: '번호',
      key: 'today_total',
      dataIndex: 'today_total',
      width: '30%',
      align: 'center',
    },
    {
      title: '차량번호',
      key: 'deviation',
      dataIndex: 'deviation',
      width: '30%',
      align: 'center',
    },
  ];

  const drivingRecordExport = useMemo(() => {
    return [
      {
        unit: 'km',
        today_total: drivingRecord?.distance_today ?? '--',
        prev_total: drivingRecord?.distance_yesterday ?? '--',
        deviation:
          drivingRecord?.distance_today && drivingRecord?.distance_yesterday
            ? formatNumberWithCommas(
                +drivingRecord?.distance_today - +drivingRecord?.distance_yesterday
              )
            : '--',
      },
      {
        unit: 'L',
        today_total: drivingRecord?.fuel_today ?? '--',
        prev_total: drivingRecord?.fuel_yesterday ?? '--',
        deviation:
          drivingRecord?.fuel_yesterday && drivingRecord.fuel_volumn && drivingRecord?.fuel_today
            ? formatNumberWithCommas(
                drivingRecord?.fuel_yesterday +
                  drivingRecord.fuel_volumn -
                  drivingRecord?.fuel_today
              )
            : '--',
      },
    ];
  }, [drivingRecord]);

  const landfillColumns: Array<TableColumnType<LandfillRecord>> = [
    {
      title: ' ',
      key: 'index',
      width: '12%',
      render: (_: any, __: any, index: number) => <div>{index + 1}차</div>,
    },
    {
      title: '순번',
      key: 'serial',
      dataIndex: 'serial',
      width: '18%',
      render: (serial: number) => <div>#{serial || 0}</div>,
    },
    {
      title: '전표 PDF',
      key: 'filename',
      dataIndex: 'filename',
      width: '45%',
      render: (text: string) => (
        <Tooltip title={text}>
          <S.UrlTable>{text}</S.UrlTable>
        </Tooltip>
      ),
    },
    {
      title: '매립량',
      key: 'duration',
      width: '25%',
      render: (record: LandfillRecord) => (
        <S.actionLandfill>
          <span>{record.loading_weight - record.empty_weight}</span>
          <S.ExpandedInfoIcon
            disabled={!selectedDate.isSame(dayjs(), 'day')}
            onClick={() => {
              if (selectedDate.isSame(dayjs(), 'day')) {
                handleExpandRowLandfill(record.id);
              }
            }}
            className="driving-diary-expand"
          >
            {expandedRowKeysLandfill.includes(record.id) ? <ActionUp /> : <ActionDown />}
          </S.ExpandedInfoIcon>
        </S.actionLandfill>
      ),
    },
  ];

  const landfillColumnsExport: Array<TableColumnType<LandfillRecord>> = [
    {
      title: ' ',
      key: 'index',
      width: '12%',
      render: (_: any, __: any, index: number) => <div>{index + 1}차</div>,
    },
    {
      title: '순번',
      key: 'serial',
      dataIndex: 'serial',
      width: '18%',
      render: (serial: number) => <div>#{serial || 0}</div>,
    },
    {
      title: '전표 PDF',
      key: 'filename',
      dataIndex: 'filename',
      width: '45%',
      render: (text: string) => (
        <Tooltip title={text}>
          <S.UrlTable>{text}</S.UrlTable>
        </Tooltip>
      ),
    },
    {
      title: '매립량',
      key: 'duration',
      width: '25%',
      render: (record: LandfillRecord) => (
        <S.actionLandfill>
          <span>{record.loading_weight - record.empty_weight}</span>
        </S.actionLandfill>
      ),
    },
  ];

  const calculateTotals = () => {
    if (!dataTable) return null;

    const totalDuration = dataTable.reduce((acc, record) => {
      if (!record.duration) return acc;
      const [hours, minutes, seconds] = record.duration.split(':').map(Number);
      return acc + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const totalDistance = dataTable.reduce((acc, record) => acc + (record.trip_distance || 0), 0);
    const totalCollectAmount = dataTable.reduce(
      (acc, record) => acc + (record.collect_amount || 0),
      0
    );
    const totalWeight = dataTable.reduce((acc, record) => acc + (record.weight || 0), 0);

    return {
      totalDuration,
      totalDistance,
      totalCollectAmount,
      totalWeight,
    };
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const totals = calculateTotals();

  const TableColumnData: any = [
    {
      title: '번호',
      key: 'index',
      render: (_: any, __: any, index: number) => (
        <>{!index ? <S.TextTotal>합계</S.TextTotal> : index}</>
      ),
    },
    {
      title: '구간명',
      key: 'data.section_name.keyword',
      dataIndex: 'section_name',
      sorter: true,
    },
    {
      title: '주행모드',
      key: 'data.drive_mode',
      dataIndex: 'drive_mode',
      render: (drive_mode: number, record: RecordDataTable, index: number) => {
        if (index > 0) {
          return (
            <S.DriveMode
              style={{
                background: driveModeColors[drive_mode]?.background || '#FFFFFF',
                color: driveModeColors[drive_mode]?.color || '#000000',
              }}
            >
              {driveModeColors[drive_mode]?.label || '--'}
            </S.DriveMode>
          );
        }
        return null;
      },
      sorter: true,
    },
    {
      title: '진입',
      key: 'data.timestamp',
      dataIndex: 'timestamp',
      sorter: true,
      render: (timestamp: Dayjs, _: DriveMetrics, index: number) => {
        return (
          <>{timestamp ? dayjs(timestamp).format(DATE_FORMAT.HOURS) : index > 0 ? '--' : ''}</>
        );
      },
    },
    {
      title: '기간 min',
      key: 'duration.keyword',
      dataIndex: 'duration',
      sorter: true,
      render: (duration: string) => {
        return <>{duration ?? '--'}</>;
      },
    },
    {
      title: '거리 km',
      key: 'total_trip_distance',
      dataIndex: 'total_trip_distance',
      sorter: true,
      render: (total_trip_distance: number, record: DriveMetrics, index: number) => {
        if (index > 0) {
          if ([6, 7, 8].includes(record?.drive_mode)) return '--';
        }
        return <>{total_trip_distance ? (total_trip_distance / 1000).toFixed(3) : '--'}</>;
      },
    },
    {
      title: '수거량',
      sorter: true,
      key: 'collect_amount',
      dataIndex: '',
      render: (_: any, record: RecordDataTable, index: number) => {
        if (index > 0) {
          if (![5, 4].includes(record?.drive_mode) || record?.drive_mode === 0) return '--';
        }
        return <>{record.collect_amount || '--'}</>;
      },
    },
    {
      title: '중량 kg',
      sorter: true,
      key: 'weight',
      dataIndex: '',
      render: (_: any, record: RecordDataTable, index: number) => {
        if (index > 0) {
          if (![5, 4].includes(record?.drive_mode) || record?.drive_mode === 0) return '--';
        }
        return <>{record.weight || '--'}</>;
      },
    },
  ];

  const handleDownload = (format: 'csv' | 'xlsx') => {
    let count = 1;
    const dataToDownload = dataTable.map((record) => ({
      번호: count++,
      구간명: record.section_name,
      주행모드: record.drive_mode,
      진입: record.trip_time,
      '기간 min': record.duration,
      '거리 km': record.trip_distance,
      수거량: record.collect_amount,
      '중량 kg': record.weight,
    }));

    if (format === 'csv') {
      const csv = Papa.unparse(dataToDownload);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${fileName}.csv`);
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DrivingDiary');
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
      saveAs(blob, `${fileName}.xlsx`);
    }
  };

  const handleOpenExportModal = () => {
    const currentTime = dayjs().format('HHmmss');
    const currentDate = dayjs().format('YYYYMMDD');
    const defaultFileName = `근무 일정_${selectedRoute}_${currentDate}_${currentTime}`;
    setFileName(defaultFileName);
    setIsExportModalVisible(true);
  };

  const customSummaryRow = useMemo(() => {
    return {
      key: '합계',
      index: '',
      section_name: '',
      drive_mode: 0,
      trip_time: '',
      duration: totalDataTable?.totalDuration ?? '',
      total_trip_distance: totalDataTable?.total_trip_distance || 0,
      collect_amount: totalDataTable?.total_collect_amount || 0,
      weight: totalDataTable?.total_weight || 0,
      trip_distance: 0,
    };
  }, [totalDataTable]);

  const handleExport = () => {
    form
      .validateFields()
      .then(() => {
        handleDownload(fileType);
        setIsExportModalVisible(false);
      })
      .catch((errorInfo) => {
        console.error('Validate Failed:', errorInfo);
      });
  };

  const handleFileLocationClick = async () => {
    try {
      const handle = await (window as any).showSaveFilePicker();
      setFileLocation(handle.name);
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Unexpected error:', error);
      }
    }
  };

  const renderIconJobsContract = (job_contract?: string) => {
    const job = _.find(JOB_TYPE, {
      label: job_contract,
    });
    return job ? <UserIcon key={job.id} color={job.color} /> : null;
  };

  const getIconPurposeVehicle = (purpose?: string) => {
    const status = driveStatus.find((vehicle) => vehicle.label === purpose);
    return <CarIcon color={status?.color || '#000'} />;
  };

  const handleExportDrivingDiary = async (info: {
    fileName: string;
    fileType: 'csv' | 'pdf' | 'xlsx';
  }) => {
    if (info.fileType === 'pdf') {
      setOpenPDFcontent(true);
      setIsDownloadExport(true);
      await getDataTable.mutateAsync({ ...dataTableParams, pageSize: 10000 }).then(async (res) => {
        const { data } = res.data as unknown as {
          data: RecordDataTable[];
        };
        setAllDataTableExport(data);

        const signatureContent = document.getElementById('driving-diary-signature');

        const signatureSection = document.getElementById('driving-diary-signature-pdf');
        if (!signatureSection) return;

        if (signatureContent && signatureSection) {
          const clonedContent = signatureContent.cloneNode(true);
          signatureSection.appendChild(clonedContent);

          const signatureExpanded = document.querySelector(
            '#driving-diary-signature-pdf .driving-diary-signature-expanded'
          );

          const signatureItem = signatureSection.querySelectorAll('#driving-diary-signature > div');

          if (signatureItem.length > 0) {
            signatureItem.forEach((item) => {
              const element = item as HTMLElement;
              element.style.flex = '1';
            });
          }

          if (signatureExpanded) signatureExpanded.remove();
        }

        const imageElements = signatureSection.getElementsByTagName('img');
        const imagesArray = Array.from(imageElements);

        try {
          await Promise.all(
            imagesArray.map(async (img) => {
              const imgSrc = img.getAttribute('src');
              if (imgSrc) {
                try {
                  const response: any = await fetch('/api/image-convert?url=' + imgSrc);
                  const data = await response.json();
                  img.src = data.image;
                } catch (error) {
                  console.error('Error converting image:', error);
                }
              }
            })
          );
        } catch (error) {
          console.error('Error processing images:', error);
        }

        const A4_HEIGHT_PX = 1123;
        const headerElement = document.getElementById('driving-diary-header');

        if (headerElement) {
          const headerHeight = headerElement.offsetHeight;
          const remainingHeight = A4_HEIGHT_PX - headerHeight;
          setFilenamePDF(info.fileName);
          setCountTableExport(Math.floor(remainingHeight / 54));
        }
      });
    } else {
      if (workingScheduleVehicle?.dispatch_no)
        exportDrivingDiary.mutate(
          {
            type: info.fileType === 'csv' ? 'csv' : 'excel',
            date: dayjs(selectedDate).toISOString(),
            routeId: workingScheduleVehicle?.route_id,
          },
          {
            onSuccess: (data: Blob) => {
              downloadFile(data, info.fileName, () => {
                setIsDownloadExport(false);
                setIsExportModalVisible(false);
              });
            },
          }
        );
    }
  };

  useEffect(() => {
    const exportPdf = async () => {
      const firstPageElement = document.getElementById('driving-diary-first-page');
      const remainingTableElements = Array.from(
        document.querySelectorAll('.driving-diary-remaining-table')
      );

      if (firstPageElement) {
        await exportToPDF2(
          firstPageElement as HTMLDivElement,
          remainingTableElements as HTMLDivElement[],
          filenamePDF
        );

        setCountTableExport(0);
      }

      setAllDataTableExport([]);
      setCountTableExport(0);
      setOpenPDFcontent(false);
      setIsDownloadExport(false);
      setIsExportModalVisible(false);
      setFilenamePDF('');
    };
    if (countTableExport) {
      exportPdf();
    }
  }, [countTableExport]);

  return {
    form,
    handleExportDrivingDiary,
    countTableExport,
    isDownloadExport,
    allDataTableExport,
    openPDFcontent,
    handleChangeParams,
    handleSelectChange,
    selectedRows,
    onFirstPage,
    currentPage,
    onChange,
    onLastPage,
    routeData,
    userRole: user?.role,
    signatureData,
    currentSignature: getCurrentSignature?.data?.data,
    getDataTable,
    handleSaveDrivingRecord,
    handleDeleteSignature,
    selectedDate,
    isModalVisible,
    isExpanded,
    signatureFile,
    error,
    distanceYesterday,
    setDistanceYesterday,
    distanceToday,
    setDistanceToday,
    fuelYesterday,
    setFuelYesterday,
    fuelToday,
    setFuelToday,
    expandedRowKeysLandfill,
    fuelVolume,
    setFuelVolume,
    isShowAddNewRecord,
    setIsShowAddNewRecord,
    isNewUploadSignature,
    selectedRoute,
    handleRouteChange,
    handleExpandRowLandfill,
    handleDateChangeByType,
    handleDateChange,
    handleToday,
    handleChangeSignature,
    handleCancelSignature,
    toggleExpand,
    handleFileUpload,
    handleCreateSignature,
    setOpenExpandInfo,
    openExpandInfo,
    drivingRecord,
    drivingRecordColumns,
    drivingRecordExport,
    landfillColumns,
    landfillColumnsExport,
    sortedLandfillData,
    handleLandfill,
    dataTable,
    TableColumnData,
    total,
    totals,
    formatDuration,
    vehicleList,
    handleSelectVehicle,
    vehicleId,
    handleOpenExportModal,
    customSummaryRow,
    isExportModalVisible,
    setIsExportModalVisible,
    fileName,
    setFileName,
    fileType,
    setFileType,
    fileLocation,
    handleFileLocationClick,
    handleExport,
    vehicleNumber,
    isManager,
    totalDataTable,
    workingScheduleVehicle,
    renderIconJobsContract,
    getIconPurposeVehicle,
  };
}
