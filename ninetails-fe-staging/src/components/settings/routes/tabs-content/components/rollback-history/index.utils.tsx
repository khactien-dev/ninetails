import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import { useGetListRevert, useRevertData } from '@/hooks/features/useRoute';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { ColumnsTypes, IRollbackHistory, PaginationParams } from '@/interfaces';
import { Button } from 'antd';
import { PaginationProps } from 'antd/lib';
import dayjs from 'dayjs';
import { Key, useState } from 'react';

import { IProps } from '.';
import * as S from './index.styles';
import RollbackForm from './rollback-form';

const inittialParams = {
  page: 1,
  pageSize: 10,
  sortBy: SORT_TYPE.DESC,
  sortField: '',
  table: '',
};

export default function useRollbackHistory(props: IProps) {
  const { isOpenRollback, setIsOpenRollback, tableName, refetch } = props;

  const [params, setParams] = useState<PaginationParams & { table: string }>({
    ...inittialParams,
    table: tableName,
  });
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const { notification } = useFeedback();

  const { data: data, isFetching } = useGetListRevert(params, isOpenRollback);

  const total = data?.data.pagination?.total || 0;
  const current = Number(data?.data.pagination?.current_page) || 1;

  const revertData = useRevertData();
  const loading = revertData.isPending;

  const permissions = usePermissions();
  const isSaveAble = permissions.createAble || permissions.updateAble;
  const isDeleteAble = permissions.deleteAble;

  const [isRollbackAble, setIsRollbackAble] = useState(true);

  const isEnableBtn = selectedRows.length > 0 && total > 0 && isRollbackAble;

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);

    const findRecord = data?.data?.data.find((item) => item.id === Number(selectedRowKeys[0]));
    if (!findRecord) return;

    if (findRecord.type.toUpperCase() !== 'DELETE' && !isSaveAble) {
      setIsRollbackAble(false);
    } else if (findRecord.type.toUpperCase() === 'DELETE' && !isDeleteAble) {
      setIsRollbackAble(false);
    } else {
      setIsRollbackAble(true);
    }
  };

  const formatString = (text: string, isMultiline: boolean) => {
    const result = JSON.parse(text);
    if (!result) return '--';

    const lines = Object.entries(result)
      .map((item) => `${JSON.stringify(item[0])}:${JSON.stringify(item[1])}`)
      .join(isMultiline ? ',\n' : ',');

    return lines;
  };

  const expandedRowRender = (record: IRollbackHistory) => {
    if (editingKey === record.key) {
      const formatRecord = {
        ...record,
        type: record.type.toUpperCase(),
        createdAt: dayjs(record?.createdAt).format(DATE_FORMAT.DATE_YT),
        old_data: formatString(record.old_data, true),
        new_data: formatString(record.new_data, true),
      };

      return <RollbackForm record={formatRecord} />;
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
    setEditingKey('');
    setExpandedRowKeys([]);
    setSelectedRows([]);
  };

  const handleMenuClick = (record: IRollbackHistory) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };

  const columns: ColumnsTypes[] = [
    {
      title: 'Action Type',
      key: 'type',
      dataIndex: 'type',
      render: (_, record: IRollbackHistory) => {
        return <>{record.type.toUpperCase()}</>;
      },
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record: IRollbackHistory) => {
        return <>{dayjs(record?.createdAt).format(DATE_FORMAT.DATE_YT)}</>;
      },
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Old Data',
      dataIndex: 'old_data',
      key: 'old_data',
      render: (_, record: IRollbackHistory) => {
        return <S.ColInfo>{formatString(record?.old_data, false)}</S.ColInfo>;
      },
    },
    {
      title: 'New Data',
      dataIndex: 'new_data',
      key: 'new_data',
      render: (_, record: IRollbackHistory) => {
        return <S.ColInfo>{formatString(record?.new_data, false)}</S.ColInfo>;
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record: IRollbackHistory) => (
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

  const handleCloseModal = () => {
    setIsOpenRollback(false);
    setEditingKey('');
    setSelectedRows([]);
    setExpandedRowKeys([]);
    setParams({ ...inittialParams, table: tableName });
  };

  const handleRollback = () => {
    if (!selectedRows[0]) return;

    revertData.mutate(
      { id: Number(selectedRows[0]), table: tableName },
      {
        onSuccess() {
          handleCloseModal();
          notification.success({ message: 'Success' });
          refetch();
        },
      }
    );
  };

  return {
    isLoadingTable: isFetching,
    expandedRowRender,
    columns,
    data: data?.data?.data.map((item) => ({ ...item, key: item.id.toString() })) ?? [],
    expandedRowKeys,
    setEditingKey,
    selectedRows,
    onFirstPage,
    current,
    onChange,
    total,
    onLastPage,
    setExpandedRowKeys,
    handleSelectChange,
    loading,
    handleRollback,
    handleCloseModal,
    isEnableBtn,
  };
}
