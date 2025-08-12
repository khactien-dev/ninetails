import ExclamtionIcon from '@/assets/images/settings/icon-exclamtion.svg';
import FilterIcon from '@/assets/images/settings/icon-filter.svg';
import PlusIcon from '@/assets/images/settings/icon-plus.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import IconClose from '@/assets/images/svg/icon-close-modal.svg';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { StatusIcon, TruckIcon, carInfo } from '@/components/schedule/left-content/statistic/icon';
import * as S from '@/components/settings/table/index.style';
import VehicleForm from '@/components/settings/vehicle/vehicle-form';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import {
  ABSENCE_TYPE,
  LEAVE_LONG_TERM,
  PURPOSE_EN,
  PURPOSE_KR,
  STATUS_VEHICLE_EN,
  STATUS_VEHICLE_KR,
} from '@/constants/settings';
import {
  useCreatVehicle,
  useDeleteManyVehicle,
  useDeleteVehicle,
  useGetVehicle,
  useUpdateManyVehicleStatus,
  useUpdateVehicle,
} from '@/hooks/features/useSettings';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { PaginationParams, RecordTypes, SortParams } from '@/interfaces';
import { VEHICLE_TYPE } from '@/interfaces/schedule';
import { truncateName } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form, PaginationProps, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { omit } from 'lodash';
import _ from 'lodash';
import { Key, useEffect, useState } from 'react';

import * as S1 from './index.styles';

dayjs.extend(utc);
const inittialParams = {
  page: 1,
  pageSize: 10,
};
export interface RadioItem {
  key: number;
  name: string;
  label: string;
}

export default function useVehicle() {
  const [params, setParams] = useState<PaginationParams>(inittialParams);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const permissions = usePermissions();

  const { data: data } = useGetVehicle(params);

  const deleteVehicle = useDeleteVehicle();
  const deleteManyVehicle = useDeleteManyVehicle();
  const updateVehicle = useUpdateVehicle();
  const createVehicle = useCreatVehicle();
  const updateManyVehicleStatus = useUpdateManyVehicleStatus();

  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const total = data?.data.pagination?.total || 0;
  const current = data?.data.pagination?.current_page || 1;

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenDeactive, setIsOpenDeactive] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });

  const handleCreateVehicle = (vehicleData: Omit<RecordTypes, 'id'>) => {
    const { note, manufacturer, vehicle_model, vehicle_type, capacity, max_capacity } = vehicleData;

    vehicleData.operation_start_date = dayjs(vehicleData.operation_start_date).format(
      DATE_FORMAT.START_OF
    );
    if (vehicleData.operation_end_date) {
      vehicleData.operation_end_date = dayjs(vehicleData.operation_end_date).format(
        DATE_FORMAT.END_OF
      );
    }
    const transformedData = {
      ...vehicleData,
      note: _.trim(note),
      capacity: { id: Number(capacity) },
      max_capacity: { id: Number(max_capacity) },
      vehicle_type: { id: Number(vehicle_type) },
      vehicle_model: { id: Number(vehicle_model) },
      manufacturer: { id: Number(manufacturer) },
    };

    createVehicle.mutate(transformedData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['vehicle'] });
        notification.success({ message: '차량이 성공적으로 생성되었습니다!' });
        setIsOpenCreate(false);
        form.resetFields();
      },
    });
  };

  const handleDeleteVehicle = () => {
    if (selectedRows.length === 1) {
      deleteVehicle.mutate(selectedRows[0], {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['vehicle'] });
          notification.success({ message: '차량이 성공적으로 삭제되었습니다!' });
          setIsOpenConfirm(false);
          setSelectedRows([]);
        },
      });
    } else {
      deleteManyVehicle.mutate(selectedRows, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['vehicle'] });
          notification.success({ message: '차량이 성공적으로 삭제되었습니다!' });
          setIsOpenConfirm(false);
          setSelectedRows([]);
        },
      });
    }
  };

  const handleUpdateVehicle = async (updatedRecord: RecordTypes) => {
    const updatedData = omit(updatedRecord, [
      'id',
      'key',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'absence',
    ]);
    updatedData.operation_start_date = dayjs(updatedData.operation_start_date).format(
      DATE_FORMAT.START_OF
    );

    if (updatedData.operation_end_date && updatedRecord?.absence?.nearest) {
      const endDate = dayjs(updatedData.operation_end_date);
      const absenceStartDate = dayjs(updatedRecord?.absence?.nearest);

      if (absenceStartDate.isAfter(endDate)) {
        notification.error({ message: '유효한 기간을 선택해 주세요.' });
        return;
      }
    }
    if (updatedData.operation_end_date != updatedRecord?.operation_end_date) {
      updatedData.operation_end_date = dayjs(updatedData?.operation_end_date).format(
        DATE_FORMAT.END_OF
      );
    }

    updatedData.note = _.trim(updatedData.note);
    updateVehicle.mutate(
      { data: updatedData, id: updatedRecord.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['vehicle'] });
          notification.success({ message: '차량이 성공적으로 업데이트되었습니다!' });
        },
      }
    );

    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const handleDeactiveVehicle = () => {
    updateManyVehicleStatus.mutate(
      { ids: selectedRows, input: { status: false } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['vehicle'] });
          notification.success({ message: 'The vehicle has been update successfully!' });
          setIsOpenDeactive(false);
          setSelectedRows([]);
        },
      }
    );
  };
  const handleCheckboxChange = (name: string) => {
    setSelectedCheckboxes((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };
  const handleChangeParams = (params: PaginationParams) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleMenuClick = (record: RecordTypes) => {
    const isExpanded = expandedRowKeys.includes(record.key);

    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };
  const radios = [
    {
      key: 1,
      name: 'NORMAL',
      label: '정상',
    },
    {
      key: 2,
      name: 'MAINTENANCE',
      label: '정비',
    },
    {
      key: 3,
      name: 'DISPOSED',
      label: '매각',
    },
    {
      key: 4,
      name: 'RETIRED',
      label: '폐차',
    },
  ];
  const checkboxs = [
    {
      name: 'COMPOSITE_REGULAR',
      label: '생활 [정규]',
    },
    {
      name: 'COMPOSITE_SUPPORT',
      label: '생활 [지원]',
    },
    {
      name: 'FOOD_REGULAR',
      label: '음식 [정규]',
    },
    {
      name: 'FOOD_SUPPORT',
      label: '음식 [지원]',
    },
    {
      name: 'REUSABLE_REGULAR',
      label: '재활 [정규]',
    },
    {
      name: 'REUSABLE_SUPPORT',
      label: '재활 [지원]',
    },
    {
      name: 'TATICAL_MOBILITY_REGULAR',
      label: '기동 [정규]',
    },
    {
      name: 'TATICAL_MOBILITY_SUPPORT',
      label: '기동 [지원]',
    },
  ];
  const renderJobContract = (job_contract: string) => {
    switch (job_contract) {
      case PURPOSE_EN.COMPOSITE_REGULAR:
        return PURPOSE_KR.COMPOSITE_REGULAR;
      case PURPOSE_EN.COMPOSITE_SUPPORT:
        return PURPOSE_KR.COMPOSITE_SUPPORT;
      case PURPOSE_EN.FOOD_REGULAR:
        return PURPOSE_KR.FOOD_REGULAR;
      case PURPOSE_EN.FOOD_SUPPORT:
        return PURPOSE_KR.FOOD_SUPPORT;
      case PURPOSE_EN.REUSABLE_REGULAR:
        return PURPOSE_KR.REUSABLE_REGULAR;
      case PURPOSE_EN.REUSABLE_SUPPORT:
        return PURPOSE_KR.REUSABLE_SUPPORT;
      case PURPOSE_EN.TATICAL_MOBILITY_REGULAR:
        return PURPOSE_KR.TATICAL_MOBILITY_REGULAR;
      case PURPOSE_EN.TATICAL_MOBILITY_SUPPORT:
        return PURPOSE_KR.TATICAL_MOBILITY_SUPPORT;
      default:
        break;
    }
  };
  const renderStatus = (status: string) => {
    switch (status) {
      case STATUS_VEHICLE_EN.NORMAL:
        return (
          <S1.WrapVehicleStatus $color="#57BA00" $bg="#EEF8E6">
            {STATUS_VEHICLE_KR.NORMAL}
          </S1.WrapVehicleStatus>
        );
      case STATUS_VEHICLE_EN.MAINTENANCE:
        return (
          <S1.WrapVehicleStatus $color="#fe3194" $bg="#FEE2FA">
            {STATUS_VEHICLE_KR.MAINTENANCE}
          </S1.WrapVehicleStatus>
        );
      case STATUS_VEHICLE_EN.DISPOSED:
        return (
          <S1.WrapVehicleStatus $color="#555555" $bg="#ededed">
            {STATUS_VEHICLE_KR.DISPOSED}
          </S1.WrapVehicleStatus>
        );
      case STATUS_VEHICLE_EN.RETIRED:
        return (
          <S1.WrapVehicleStatus $color="#555555" $bg="#ededed">
            {STATUS_VEHICLE_KR.RETIRED}
          </S1.WrapVehicleStatus>
        );
      default:
        break;
    }
  };

  type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key ? key : undefined }));
  };

  const columns: ColumnsType<RecordTypes> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '차번', key: 'vehicle_number' },
            { title: '차종', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      key: 'vehicle_number',
      render: (_, record: RecordTypes) => {
        return (
          <S1.ColInfo>
            <S1.InfoText>{record.vehicle_number}</S1.InfoText>
            <S1.InfoText>
              {typeof record.vehicle_type === 'object' ? record.vehicle_type?.data : ''}
            </S1.InfoText>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '모델', key: 'vehicle_model' },
            { title: '제조사', key: 'manufacturer' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'vehicle_model',
      key: 'vehicle_model',
      render: (_, record) => {
        return (
          <S1.ColInfo>
            <S1.InfoText>
              {typeof record.vehicle_model === 'object' ? record.vehicle_model?.data : ''}
            </S1.InfoText>
            <S1.InfoText>
              {typeof record?.manufacturer === 'object' ? record.manufacturer?.data : ''}
            </S1.InfoText>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '용적(m3)', key: 'capacity' },
            { title: '적재(kg)', key: 'max_capacity' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'capacity',
      key: 'capacity',
      render: (_, record) => {
        return (
          <S1.ColInfo>
            <S1.InfoText>
              {typeof record.capacity === 'object' ? record.capacity?.data : ''}
            </S1.InfoText>
            <S1.InfoText>
              {typeof record?.max_capacity === 'object' ? record.max_capacity?.data : ''}
            </S1.InfoText>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '운행시작', key: 'operation_start_date' },
            { title: '운행종료', key: 'operation_end_date' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'operation_end_date',
      key: 'operation_end_date',
      render: (_, record) => {
        return (
          <S1.ColInfo>
            <S1.InfoText>
              {dayjs.utc(record.operation_start_date).format(DATE_FORMAT.R_BASIC)}
            </S1.InfoText>
            <S1.InfoText>
              {record?.operation_end_date
                ? dayjs.utc(record?.operation_end_date).format(DATE_FORMAT.R_BASIC)
                : '--'}
            </S1.InfoText>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '부재시작', key: 'absence_start' },
            { title: '부재항목', key: 'absence_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'absence_start',
      key: 'absence_start',
      render: (value, record) => {
        return (
          <S1.ColInfo>
            <S1.InfoText>
              {record?.absence
                ? dayjs.utc(record?.absence?.nearest).format(DATE_FORMAT.R_BASIC)
                : '--'}
            </S1.InfoText>
            <S1.Absence>
              {ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys] ||
                record?.absence?.absence_type}
              {_.includes(
                LEAVE_LONG_TERM,
                ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys]
              ) && <S1.InfoAbsencType>장기</S1.InfoAbsencType>}
            </S1.Absence>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '용도', key: 'purpose' },
            { title: '노트', key: 'note' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'purpose',
      key: 'purpose',
      render: (value, record) => {
        type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;
        return (
          <S1.ColInfo>
            <S1.InfoText>
              <S1.InfoJob>
                <S1.SettingPopover
                  content={
                    <S1.PopoverContent>
                      <S1.Section>
                        <S1.SectionTitle>
                          <S1.Title>
                            <TruckIcon vehicle_type={record?.purpose as VEHICLE_TYPE} />
                            <S1.WrapPopupVehicleName>
                              {record.vehicle_number}
                            </S1.WrapPopupVehicleName>
                            {carInfo?.map((drive) => {
                              if (record?.purpose === drive.type) {
                                return (
                                  <S1.TitleJob key={drive.id} $color={drive.color}>
                                    [{renderJobContract(record.purpose)}]
                                  </S1.TitleJob>
                                );
                              }
                            })}
                          </S1.Title>
                          <S1.WrapCloseIcon>
                            <IconClose onClick={() => setShowPopover(null)} />
                          </S1.WrapCloseIcon>
                        </S1.SectionTitle>
                        <S1.SectionTitle>
                          <S1.Content>
                            <ul>
                              <li>
                                시작:{' '}
                                {record?.absence?.start_date
                                  ? dayjs(record?.absence?.start_date).format(DATE_FORMAT.R_BASIC)
                                  : '--'}
                              </li>
                              <li>
                                복귀:{' '}
                                {dayjs
                                  .utc(record?.absence?.end_date)
                                  .add(1, 'day')
                                  .format(DATE_FORMAT.R_BASIC)}
                              </li>
                              <li>
                                기간:{' '}
                                {dayjs
                                  .utc(record?.absence?.end_date)
                                  .diff(dayjs(record?.absence?.start_date), 'day') +
                                  1 +
                                  '일'}
                              </li>
                              <li>
                                사유:{' '}
                                {ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys] ||
                                  '--'}
                              </li>
                              <li>
                                <S1.ContentInfoReplacer>
                                  대체:{' '}
                                  <TruckIcon
                                    vehicle_type={
                                      record?.absence?.replacement_vehicle?.purpose as VEHICLE_TYPE
                                    }
                                  />
                                  {record?.absence?.replacement_vehicle?.vehicle_number}
                                  {_.includes(
                                    LEAVE_LONG_TERM,
                                    ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys]
                                  ) ? (
                                    <StatusIcon status={'REPLACE_LONG_TERM'} />
                                  ) : (
                                    <StatusIcon status={'REPLACE_SHORT_TERM'} />
                                  )}
                                </S1.ContentInfoReplacer>
                              </li>
                            </ul>
                          </S1.Content>
                        </S1.SectionTitle>
                      </S1.Section>
                    </S1.PopoverContent>
                  }
                  trigger="click"
                  open={showPopover === record.vehicle_number}
                  onOpenChange={(newOpen: boolean) =>
                    setShowPopover(newOpen ? record.vehicle_number : null)
                  }
                >
                  {record?.absence &&
                  _.includes(
                    LEAVE_LONG_TERM,
                    ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys]
                  ) ? (
                    <div>
                      <StatusIcon status={'ABSENCE_LONG_TERM'} />
                    </div>
                  ) : record?.absence ? (
                    <div>
                      <StatusIcon status={'ABSENCE_SHORT_TERM'} />
                    </div>
                  ) : null}
                </S1.SettingPopover>
                <TruckIcon vehicle_type={record.purpose as VEHICLE_TYPE} />
                {renderJobContract(record.purpose)}
              </S1.InfoJob>
            </S1.InfoText>
            <S1.InfoText>
              <S1.InfoNote>
                <Tooltip title={record?.note}>
                  <ExclamtionIcon />
                </Tooltip>
                {record?.note?.length > 4
                  ? `${truncateName(record?.note, 5)}...`
                  : record?.note || '--'}
              </S1.InfoNote>
            </S1.InfoText>
          </S1.ColInfo>
        );
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '상태', key: 'status' },
            { title: '대체차량', key: 'replacement_vehicle' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'status',
      key: 'status',
      render: (_: undefined, record) => (
        <S1.ColInfo>
          {renderStatus(record?.status)}
          <S1.InfoText>
            {record?.status === STATUS_VEHICLE_EN.DISPOSED ||
            record?.status === STATUS_VEHICLE_EN.RETIRED
              ? '--'
              : record?.absence?.replacement_vehicle?.vehicle_number || '--'}
          </S1.InfoText>
        </S1.ColInfo>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',

      render: (_: undefined, record: RecordTypes) => (
        <Button
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record.key) ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  const buttons = [
    {
      name: '필터',
      icon: <FilterIcon />,
      isActive: permissions.readAble,
      isFilter: selectedStatus !== null,
      isOutline: true,
      onClick: () => setIsOpenFilter(true),
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
      isActive: permissions.deleteAble && selectedRows.length > 0,
      isPrimary: false,
      onClick: () => {
        if (!selectedRows.length) return notification.info({ message: 'Please select vehicle' });
        setIsOpenConfirm(true);
      },
    },
  ];

  const expandedRowRender = (record: RecordTypes) => {
    if (editingKey === record.key) {
      return <VehicleForm record={record} onSave={handleUpdateVehicle} />;
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
    setEditingKey('');
  };

  useEffect(() => {
    // @ts-ignore
    document.querySelector('.ant-layout-content').scrollTo(0, 0);
  }, [params.page]);

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };

  const handleSortColumn = (sort: SortParams) => {
    setParams((prev) => ({ ...prev, page: 1, ...sort }));
  };
  const initialValues = {
    vehicle_number: '',
    vehicle_type: '',
    vehicle_model: '',
    manufacturer: '',
    operation_start_date: '',
    operation_end_date: null,
    capacity: '',
    max_capacity: '',
    purpose: PURPOSE_EN.COMPOSITE_REGULAR,
    status: STATUS_VEHICLE_EN.NORMAL,
  };

  return {
    initialValues,
    form,
    columns,
    currentPage: params.page || 1,
    selectedRows,
    expandedRowKeys,
    data: data?.data?.data.map((item) => ({ ...item, key: item.id })),
    total,
    buttons,
    isOpenConfirm,
    isOpenCreate,
    isOpenDeactive,
    isOpenFilter,
    setIsOpenDeactive,
    handleDeleteVehicle,
    handleChangeParams,
    handleCreateVehicle,
    handleDeactiveVehicle,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    current,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
    handleSortColumn,
    setIsOpenFilter,
    radios,
    checkboxs,
    selectedCheckboxes,
    setSelectedCheckboxes,
    handleCheckboxChange,
    setParams,
    selectedStatus,
    setSelectedStatus,
  };
}
