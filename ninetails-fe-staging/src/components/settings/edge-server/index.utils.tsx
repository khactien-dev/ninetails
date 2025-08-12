import WeightIcon from '@/assets/images/settings/icon-weight.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import StopIcon from '@/assets/images/settings/stop9.svg';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { BaseTooltipParagraph } from '@/components/common/base-tooltip-paragaph';
import { BaseForm } from '@/components/common/forms/base-form';
import * as S from '@/components/settings/table/index.style';
import { SORT_TYPE } from '@/constants';
import {
  useCreateEdgeServer,
  useDeleteManyEdgeServer,
  useGetEdgeServers,
  useGetWeightConfigQuery,
  useUpdateEdgeServer,
  useUpdateManyEdgeServer,
} from '@/hooks/features/useEdgeServer';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions, useSettingMenusPermissions } from '@/hooks/usePermissions';
import { ButtonItem, IEdgeServer, PaginationParams } from '@/interfaces';
import { queryClient } from '@/utils/react-query';
import { Button, PaginationProps } from 'antd';
import { ColumnsType, Key } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';

import EditEdgeServerForm from './edge-server-form';
import { StatusWrap, TableCellEllipsis } from './index.style';

const inittialParams = {
  page: 1,
};

export const METRIC_OPTIONS = [
  {
    value: 5,
    label: '5초',
  },
  {
    value: 10,
    label: '10초',
  },
  {
    value: 30,
    label: '30초',
  },
  {
    value: 60,
    label: '1분',
  },
];

export const UI_OPTIONS = [
  {
    // yes
    label: '제공',
    value: true,
  },
  {
    // no/
    label: '미제공',
    value: false,
  },
];

export const STATUS_OPTIONS = [
  {
    // active
    label: '활성',
    value: true,
  },
  {
    // inactive
    label: '비활성',
    value: false,
  },
];

export const useEdgeServerTable = () => {
  const [params, setParams] = useState<PaginationParams>(inittialParams);
  const [addEdgeServerForm] = BaseForm.useForm();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [isOpenAddEdgeServer, setIsOpenAddEdgeServer] = useState<boolean>(false);
  const { notification } = useFeedback();
  const [isOpenDeleteConfirm, setIsOpenDeleteConfirm] = useState<boolean>(false);
  const [isOpenUpdateConfirm, setIsOpenUpdateConfirm] = useState<boolean>(false);
  const [isOpenWeightConfig, setIsOpenWeightConfig] = useState<boolean>(false);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });

  const permissions = usePermissions();
  const menus = useSettingMenusPermissions();

  const { data: edgeServers } = useGetEdgeServers(params);
  const { data: weightConfig, refetch: refetchWeightConfig } = useGetWeightConfigQuery();

  const updateEdgeServerMutation = useUpdateEdgeServer();
  const addEdgeServerMutation = useCreateEdgeServer();
  const deleteManyMutation = useDeleteManyEdgeServer();
  const updateManyMutation = useUpdateManyEdgeServer();

  const data = edgeServers?.data?.data ?? [];
  const total = edgeServers?.data?.pagination?.total ?? 0;

  const renderLastUpdated = (lastUpdated: string) => {
    if (lastUpdated) {
      const diffMinutes = dayjs().diff(dayjs(lastUpdated), 'minutes');
      const diffHours = dayjs().diff(dayjs(lastUpdated), 'hours');
      const diffDays = dayjs().diff(dayjs(lastUpdated), 'days');
      const diffYears = dayjs().diff(dayjs(lastUpdated), 'years');

      if (diffHours < 1) {
        return `${diffMinutes}분 전`;
      }
      if (diffDays < 1) {
        return `${diffHours}시간 전`;
      }
      if (diffYears < 1) {
        return `${diffDays}일 전`;
      }
      if (diffYears >= 1) {
        return `${diffYears}년 전`;
      }
    }
    return '';
  };

  const getMetricLabel = (value: string | number) => {
    return METRIC_OPTIONS.find((item) => item.value === value)?.label ?? '--';
  };

  const buttons: ButtonItem[] = useMemo(() => {
    return [
      {
        name: '평균 무게',
        icon: <WeightIcon />,
        isActive: true,
        isOutline: true,
        onClick: () => setIsOpenWeightConfig(true),
      },
      {
        name: '추가',
        icon: <PlusIcon />,
        isActive: permissions.createAble,
        isPrimary: true,
        onClick: () => setIsOpenAddEdgeServer(true),
      },
      {
        name: '삭제',
        icon: <MinusIcon style={{ marginBottom: 4 }} />,
        isActive: permissions.deleteAble && !!selectedRows.length,
        isPrimary: false,
        onClick: () => setIsOpenDeleteConfirm(true),
      },
      {
        name: '비활성',
        icon: <StopIcon style={{ marginBottom: 2 }} />,
        isActive: permissions.updateAble && !!selectedRows.length,
        isPrimary: false,
        onClick: () => setIsOpenUpdateConfirm(true),
      },
    ];
  }, [selectedRows, permissions]);

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key }));
  };

  const columns: ColumnsType<IEdgeServer> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'Edge 이름', key: 'edge_name' },
            { title: '설치 (차번)', key: 'vehicle_number' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'edge_name',
      width: '15%',
      key: 'edge_name',
      render: (_, record: IEdgeServer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.edge_name ?? '--'}</BaseTooltipParagraph>
            <BaseTooltipParagraph>{record.vehicle?.vehicle_number ?? '--'}</BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'HW 모델', key: 'hw_version' },
            { title: 'OS 버전', key: 'os_version' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'hw_model',
      width: '15%',
      key: 'hw_version',
      render: (_, record: IEdgeServer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.hw_version ?? '--'}</BaseTooltipParagraph>
            <BaseTooltipParagraph>{record.os_version ?? '--'}</BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'Kernel 버전', key: 'kernel_version' },
            { title: 'JetPack 버전', key: 'jetpack_version' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'kernel_version',
      width: '15%',
      key: 'kernel_version',
      render: (_, record: IEdgeServer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.kernel_version ?? '--'}</BaseTooltipParagraph>
            <BaseTooltipParagraph>{record.jetpack_version ?? '--'}</BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'Docker 버전', key: 'docker_version' },
            { title: 'edge_state_metrics 주기', key: 'edge_metrics' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'docker_version',
      width: '15%',
      key: 'docker_version',
      render: (_, record: IEdgeServer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.docker_version ?? '--'}</BaseTooltipParagraph>
            <BaseTooltipParagraph>
              {record.edge_metrics ? getMetricLabel(record.edge_metrics) : '--'}
            </BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'drive_metrics 주기', key: 'operation_metrics' },
            { title: 'collect_metrics 주기', key: 'collection_metrics' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'operation_collectionMetrics',
      width: '15%',
      key: 'operation_metrics',
      render: (_, record: IEdgeServer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>
              {record.operation_metrics ? getMetricLabel(record.operation_metrics) : '--'}
            </BaseTooltipParagraph>
            <BaseTooltipParagraph>
              {record.collection_metrics ? getMetricLabel(record.collection_metrics) : '--'}
            </BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '상태', key: 'status' },
            { title: '업데이트', key: 'updatedAt' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'situation22',
      width: '15%',
      key: 'status',
      render: (_: undefined, record: IEdgeServer) => (
        <>
          <StatusWrap $isActive={record.status}>
            {record.status === false ? '비활성' : '활성'}
          </StatusWrap>
          <p>{record.updatedAt ? renderLastUpdated(record.updatedAt) : '--'}</p>
        </>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_: undefined, record: IEdgeServer) => (
        <Button
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record.key ?? '') ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleCloseAddEdgeServer = () => {
    setIsOpenAddEdgeServer(false);
  };

  const handleSortColumn = (params: PaginationParams) => {
    if (params.sortBy && params.sortField) {
      setParams((prev) => ({
        ...prev,
        ...params,
      }));
    } else {
      setParams({
        page: params.page,
      });
    }
  };

  const handleMenuClick = (record: IEdgeServer) => {
    if (record.key) {
      const isExpanded = expandedRowKeys.includes(record.key);
      const newExpandedRowKeys = isExpanded
        ? expandedRowKeys.filter((key) => key !== record.key)
        : [record.key];

      setExpandedRowKeys(newExpandedRowKeys);
      setEditingKey(isExpanded ? '' : record.key);
    }
  };

  const handleUpdateEdgeServer = (rawRecord: IEdgeServer) => {
    const updatedRecord: IEdgeServer = {
      ...rawRecord,
      vehicle: {
        id: rawRecord?.license_plate_id,
      },
      edge_setting_version: Number(rawRecord.edge_setting_version)
        ? Number(rawRecord.edge_setting_version) + 0.01
        : 1,
    };
    const payload = omit(updatedRecord, [
      'createdAt',
      'deletedAt',
      'updatedAt',
      'docker_version',
      'hw_version',
      'hw_model',
      'jetpack_version',
      'kernel_version',
      'os_version',
      'key',
      'license_plate_id',
    ]);

    updatedRecord.id &&
      updateEdgeServerMutation.mutate(
        {
          body: payload,
          id: updatedRecord.id,
        },
        {
          onSuccess() {
            queryClient.invalidateQueries({ queryKey: ['edge-servers'] });
            notification.success({ message: '업데이트 담당자가 성공적으로 업데이트되었습니다!"' });

            setEditingKey('');
            setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
          },
        }
      );
  };

  const handleAddEdgeServer = (values: IEdgeServer) => {
    const payload = {
      ...values,
      vehicle: {
        id: values.license_plate_id,
      },
      edge_setting_version: 1.0,
    };

    addEdgeServerMutation.mutate(payload, {
      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ['edge-servers'] });
        notification.success({
          message: '업데이트 담당자가 성공적으로 생성되었습니다!',
        });
        setIsOpenAddEdgeServer(false);
      },
    });

    return;
  };

  const expandedRowRender = (record: IEdgeServer) => {
    if (editingKey === record.key) {
      const initialVehicleOption = record?.vehicle?.id
        ? { value: record?.vehicle?.id, label: record?.vehicle?.vehicle_number ?? '' }
        : null;
      return (
        <EditEdgeServerForm
          record={record}
          onSave={handleUpdateEdgeServer}
          initialVehicleOption={initialVehicleOption}
        />
      );
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
    setExpandedRowKeys([]);
  };

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };

  const handleConfirmDelete = () => {
    deleteManyMutation.mutate(
      {
        ids: selectedRows,
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: ['edge-servers'] });
          notification.success({
            message: '업데이트 담당자가 성공적으로 삭제되었습니다',
          });
          setIsOpenDeleteConfirm(false);
        },
      }
    );
  };

  const handleConfirmDeactivate = () => {
    updateManyMutation.mutate(
      {
        ids: selectedRows,
        input: {
          status: false,
        },
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: ['edge-servers'] });
          notification.success({
            message: '업데이트 담당자가 성공적으로 업데이트되었습니다!"',
          });
          setIsOpenUpdateConfirm(false);
          setSelectedRows([]);
        },
      }
    );
  };

  useEffect(() => {
    if (
      edgeServers?.data?.data &&
      !edgeServers?.data?.data?.length &&
      params?.page &&
      params?.page > 1
    ) {
      setParams((prev) => ({
        ...prev,
        page: params?.page ? params?.page - 1 : 1,
      }));
    }
  }, [edgeServers?.data?.data]);

  return {
    menus,
    columns,
    buttons,
    data: data.map((data) => ({ ...data, key: data?.id ?? '' })),
    expandedRowKeys,
    total,
    setExpandedRowKeys,
    setEditingKey,
    handleSelectChange,
    expandedRowRender,
    onChange,
    onFirstPage,
    onLastPage,
    handleSortColumn,
    handleAddEdgeServer,
    params,
    selectedRows,
    currentPage: params.page || 1,
    isOpenAddEdgeServer,
    handleCloseAddEdgeServer,
    addEdgeServerForm,
    addEdgeServerLoading: addEdgeServerMutation.isPending,
    isOpenDeleteConfirm,
    setIsOpenDeleteConfirm,
    isOpenUpdateConfirm,
    setIsOpenUpdateConfirm,
    handleConfirmDeactivate,
    handleConfirmDelete,
    isOpenWeightConfig,
    setIsOpenWeightConfig,
    weightConfig: weightConfig?.data?.data,
    refetchWeightConfig,
  };
};
