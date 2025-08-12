import { getGuide } from '@/api/route/guide';
import ExportIcon from '@/assets/images/settings/icon-export.svg';
import ImportIcon from '@/assets/images/settings/icon-import.svg';
import PlayIcon from '@/assets/images/settings/icon-play.svg';
import PlusIcon from '@/assets/images/settings/icon-plus.svg';
import ReloadIcon from '@/assets/images/settings/icon-reload.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import { TABLE_NAME, inittialParams } from '@/constants';
import {
  useCreateGuide,
  useDeleteManyGuide,
  useExportData,
  useImportGuide,
  useUpdateGuide,
} from '@/hooks/features/useRoute';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { ButtonItem, ColumnOption, RouteParams } from '@/interfaces';
import { checkPolygonGeometry, validateFloatNumber, validateIntNumber } from '@/utils';
import { Form, RadioChangeEvent } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { saveAs } from 'file-saver';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { ContentEditable } from '../components/cell-table';

const initialValuesDefault = {
  id: null,
  instructions: '',
  point_index: null,
  route_id: null,
  distance: null,
  duration: null,
  type: null,
  point_count: null,
  bbox: '',
};

export default function useGuideRoute() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isOpenRollback, setIsOpenRollback] = useState(false);
  const [isOpenImport, setIsOpenImport] = useState(false);
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [params, setParams] = useState<RouteParams>(inittialParams);
  const { notification } = useFeedback();
  const [form] = Form.useForm();
  const [formQuery] = Form.useForm();
  const [formImport] = Form.useForm();
  const deleteGuide = useDeleteManyGuide();
  const createGuide = useCreateGuide();
  const importGuide = useImportGuide();
  const exportData = useExportData();
  const updateGuide = useUpdateGuide();

  const [loadingSaveData, setLoadingSaveData] = useState(false);
  const [dataTable, setDataTable] = useState<any[]>([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [rowError, setRowError] = useState<{ key: string; columnError: string[] }[]>([]);
  const [updatedRowKeys, setUpdatedRowKeys] = useState<string[]>([]);
  const [deleteRowKeys, setDeleteRowKeys] = useState<React.Key[]>([]);

  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<any>(null);

  const createRow = dataTable.filter((item) => item.key.includes('+'));
  const updateRow = dataTable.filter((item) => !item.key.includes('+'));

  const isFetching = isLoading && params.page === 1;

  const isLoadingTable =
    isFetching || loadingSaveData || deleteGuide.isPending || importGuide.isPending;

  const permissions = usePermissions();
  const isSaveAble = permissions.createAble || permissions.updateAble;
  const isDeleteAble = permissions.deleteAble;
  const isEnableSaveBtn = isSaveAble || isDeleteAble;
  const isRollbackAble = !isLoadingTable && isEnableSaveBtn;

  const handleGetData = async (newParams: RouteParams, refetch: boolean) => {
    const updateParams = { ...params, ...newParams };
    setParams(updateParams);

    try {
      setIsLoading(true);
      const data = await getGuide(updateParams);
      setIsLoading(false);

      const table = data?.data?.data.map((item) => ({
        ...item,
        key: String(item.id),
      }));
      setDataTable(refetch ? table : [...dataTable, ...table]);
      setTotal(Number(data.data.pagination?.total) || 0);
    } catch (error: any) {
      setIsLoading(false);
      error?.data?.message && notification.error({ message: error.data.message });
    }
  };

  const refetch = () => handleGetData({ page: 1 }, true);

  useEffect(() => {
    const tableBody = ref.current?.querySelector('.ant-table-body');
    if (tableBody) {
      let isLoadMore = false;
      const onScroll = async () => {
        if (Math.abs(tableBody.scrollHeight - tableBody.scrollTop - tableBody.clientHeight) <= 1) {
          if (updateRow.length && updateRow.length < total) {
            if (isLoadMore) return;
            isLoadMore = true;
            await handleGetData({ page: Number(params.page) + 1 }, false);
            isLoadMore = false;
          }
        }
      };

      tableBody.addEventListener('scroll', onScroll);

      return () => {
        tableBody.removeEventListener('scroll', onScroll);
      };
    }
  }, [dataTable]);

  useEffect(() => {
    refetch();
  }, []);

  const validateColumn = (column: string, isColumnError: boolean, key: string) => {
    if (isColumnError) {
      const findRow = rowError.find((row) => row.key === key);
      if (findRow) {
        const updateRowError = rowError.map((row) => {
          if (row.key === key) {
            const findColumn = row.columnError.find((item) => item === column);
            return findColumn ? row : { ...row, columnError: [...row.columnError, column] };
          } else {
            return row;
          }
        });
        setRowError(updateRowError);
      } else {
        setRowError([...rowError, { key, columnError: [column] }]);
      }
    } else {
      const updateRowError = rowError
        .map((row) => {
          if (row.key === key) {
            const filterColumn = row.columnError.filter((item) => item !== column);
            return { ...row, columnError: filterColumn };
          } else {
            return row;
          }
        })
        .filter((item) => item.columnError.length > 0);

      setRowError(updateRowError);
    }
  };

  const handleChangeColumn = (value: any, column: string, key: string) => {
    const updateTable = dataTable.map((item) => {
      return item.key === key ? { ...item, [column]: value } : item;
    });
    setDataTable(updateTable);

    if (key.includes('+')) return;
    setUpdatedRowKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleSave = async () => {
    let filterDataTable = dataTable;

    if (deleteRowKeys.length > 0) {
      filterDataTable = dataTable.filter((row) => !deleteRowKeys.includes(row.key));
    }

    const isInvalidRow = filterDataTable.some(
      (row) =>
        row.point_index === initialValuesDefault.point_index ||
        row.route_id === initialValuesDefault.route_id ||
        row.type === initialValuesDefault.type ||
        row.instructions === initialValuesDefault.instructions ||
        row.distance === initialValuesDefault.distance ||
        row.duration === initialValuesDefault.duration ||
        row.point_count === initialValuesDefault.point_count ||
        row.bbox === initialValuesDefault.bbox
    );

    if (isInvalidRow || rowError.length > 0) {
      notification.error({ message: 'Please enter a valid value' });
      return;
    }

    deleteRowKeys.length > 0 && (await handleDeleteGuide());

    const createRow = filterDataTable.filter((item) => item.key.includes('+'));
    const updateRow = filterDataTable.filter((item) => !item.key.includes('+'));

    const filterUpdateRow = updateRow.filter((item) => updatedRowKeys.includes(item.key));

    const createPayload = JSON.parse(JSON.stringify(createRow));
    const updatePayload = JSON.parse(JSON.stringify(filterUpdateRow));

    createPayload.forEach((item: any) => {
      delete item.id;
      delete item.key;
    });

    updatePayload.forEach((item: any) => {
      delete item.key;
    });

    const createPromise = () => createGuide.mutateAsync({ data: createPayload });
    const updatePromise = () => updateGuide.mutateAsync(updatePayload);

    const promiseValue = [];

    createPayload.length > 0 && promiseValue.push(createPromise());
    updatePayload.length > 0 && promiseValue.push(updatePromise());

    if (promiseValue.length === 0) return;

    try {
      setLoadingSaveData(true);
      const [promise1, promise2] = await Promise.allSettled(promiseValue);
      setLoadingSaveData(false);

      if (createPayload.length > 0 && promise1?.status === 'fulfilled') {
        const createData = promise1?.value?.data.map((item: any) => ({
          ...item,
          key: String(item.id),
        }));
        setDataTable([...createData, ...updateRow]);

        const filterSelectedRowKeys = selectedRowKeys.filter(
          (key) => !key.toString().includes('+')
        );
        setSelectedRowKeys(filterSelectedRowKeys);
      }

      if (updatePayload.length > 0) {
        const isUpdateSuccess =
          (createPayload.length === 0 && promise1?.status === 'fulfilled') ||
          (createPayload.length > 0 && promise2?.status === 'fulfilled');

        if (isUpdateSuccess) {
          setUpdatedRowKeys([]);

          const filterSelectedRowKeys = selectedRowKeys.filter((key) =>
            key.toString().includes('+')
          );
          setSelectedRowKeys(filterSelectedRowKeys);
        }
      }

      if (promise1?.status === 'rejected' || promise2?.status === 'rejected') return;
      notification.success({ message: 'Guide saved successfully' });
    } catch (error) {
      setLoadingSaveData(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'id',
      key: 'id',
      dataIndex: 'id',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            data={record.id}
            disabled={true}
            isRefresh={isRefresh}
          />
        );
      },
    },
    {
      title: 'point_index',
      key: 'point_index',
      dataIndex: 'point_index',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.point_index}
            validate={validateIntNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('point_index', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'point_index', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'route_id',
      key: 'route_id',
      dataIndex: 'route_id',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.route_id}
            validate={validateIntNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('route_id', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'route_id', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'type',
      key: 'type',
      dataIndex: 'type',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.type}
            validate={validateIntNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('type', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'type', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'instructions',
      key: 'instructions',
      dataIndex: 'instructions',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            maxLength={64}
            required={true}
            isRefresh={isRefresh}
            data={record.instructions}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('instructions', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(value, 'instructions', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'distance',
      key: 'distance',
      dataIndex: 'distance',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.distance}
            validate={validateFloatNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('distance', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'distance', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'duration',
      key: 'duration',
      dataIndex: 'duration',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.duration}
            validate={validateFloatNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('duration', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'duration', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'point_count',
      key: 'point_count',
      dataIndex: 'point_count',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.point_count}
            validate={validateIntNumber}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('point_count', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(Number(value), 'point_count', record.key);
            }}
          />
        );
      },
    },
    {
      title: 'bbox',
      key: 'bbox',
      dataIndex: 'bbox',
      render: (_, record) => {
        return (
          <ContentEditable
            activeKey={record.key}
            deleteRowKeys={deleteRowKeys}
            disabled={!isSaveAble}
            required={true}
            isRefresh={isRefresh}
            data={record.bbox ? JSON.stringify(record.bbox) : ''}
            validate={checkPolygonGeometry}
            handleConfirm={(value: string, isColumnError: boolean) => {
              validateColumn('bbox', isColumnError, record.key);
              if (isColumnError) return;
              handleChangeColumn(JSON.parse(value), 'bbox', record.key);
            }}
          />
        );
      },
    },
  ];

  const columnOptions: ColumnOption[] = columns.map((item) => {
    return {
      value: item.key,
      label: item.title,
    };
  });

  const buttons: ButtonItem[] = [
    {
      name: '파일',
      icon: <ImportIcon />,
      isActive: !isLoadingTable && !exportData.isPending && isSaveAble,
      isPrimary: false,
      onClick: () => setIsOpenImport(true),
    },
    {
      name: '추가',
      icon: <PlusIcon />,
      isActive: !isLoadingTable && !exportData.isPending && isSaveAble,
      isPrimary: false,
      onClick: () => setDataTable([{ ...initialValuesDefault, key: `${uuid()}+` }, ...dataTable]),
    },
    {
      name: '삭제',
      icon: <MinusIcon />,
      isActive:
        !isLoadingTable && selectedRowKeys.length > 0 && !exportData.isPending && isDeleteAble,
      isPrimary: false,
      onClick: () => setDeleteRowKeys(selectedRowKeys),
    },
    {
      name: '저장',
      icon: <ExportIcon />,
      isActive:
        !isLoadingTable && updateRow.length > 0 && !exportData.isPending && permissions.exportAble,
      isPrimary: false,
      onClick: () => setIsOpenExport(true),
    },
  ];

  const buttonsAction: ButtonItem[] = [
    {
      name: '실행',
      isActive: !isLoadingTable && dataTable.length > 0 && !exportData.isPending && isEnableSaveBtn,
      isPrimary: true,
      icon: <PlayIcon />,
      onClick: () => handleSave(),
    },
    {
      name: '복구',
      isActive: !isLoadingTable && dataTable.length > 0 && !exportData.isPending && isEnableSaveBtn,
      isPrimary: false,
      isOutline: true,
      icon: <ReloadIcon />,
      onClick: () => handleRevert(),
    },
  ];

  const handleRenderIcon = (button: ButtonItem) => {
    if (button?.icon) return button.icon;
    if (button?.pngIcon)
      return (
        <Image
          style={{ display: 'inline-block' }}
          height={11}
          width={11}
          src={button.pngIcon}
          alt={''}
        />
      );
    return null;
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    const filterDeleteRowKeys = deleteRowKeys.filter((key) => newSelectedRowKeys.includes(key));
    setDeleteRowKeys(filterDeleteRowKeys);
  };

  const rowSelection: any = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
  };

  const onChangeHeader = (e: RadioChangeEvent) => {
    return e;
  };

  const handleDeleteGuide = async () => {
    const listRowKeys = deleteRowKeys.filter((item) => !item.toString().includes('+'));
    const listRowKeysPlus = deleteRowKeys.filter((item) => item.toString().includes('+'));

    const updateListRowPlus = createRow.filter((item) => {
      const result = listRowKeysPlus.find((key) => key === item.key);
      return result ? false : true;
    });

    const updateRowPlusError = rowError.filter((row) => {
      const result = listRowKeysPlus.find((key) => key === row.key);
      return result ? false : true;
    });

    listRowKeys.length > 0 && (await deleteGuide.mutateAsync(listRowKeys));

    const updateListRow = updateRow.filter((item) => {
      const result = listRowKeys.find((key) => key === item.key);
      return result ? false : true;
    });

    const updateRowError = updateRowPlusError.filter((row) => {
      const result = listRowKeys.find((key) => key === row.key);
      return result ? false : true;
    });

    const listUpdatedKeys = updatedRowKeys.filter((item) => {
      const result = listRowKeys.find((key) => key === item);
      return result ? false : true;
    });

    setDataTable([...updateListRowPlus, ...updateListRow]);
    setRowError(updateRowError);
    setUpdatedRowKeys(listUpdatedKeys);

    const filterSelectedRowKeys = selectedRowKeys.filter((key) => !deleteRowKeys.includes(key));
    setSelectedRowKeys(filterSelectedRowKeys);
    setDeleteRowKeys([]);
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    return false;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleImportGuide = () => {
    if (selectedFile) {
      importGuide.mutate(selectedFile, {
        onSuccess: () => {
          refetch();
          notification.success({ message: '파일이 성공적으로 가져와졌습니다!' });
          setIsOpenImport(false);
          form.resetFields();
        },
      });
    } else {
      notification.error({ message: '이 필드는 필수입니다.' });
    }
  };

  const handleExport = (values: any) => {
    setIsOpenExport(false);

    exportData.mutate(
      { table: TABLE_NAME.GUIDE, type: values.fileType === 'csv' ? 'csv' : 'excel' },
      {
        onSuccess: (data) => {
          saveAs(data, `${values.fileName}.${values.fileType === 'csv' ? 'csv' : 'xlsx'}`);
        },
      }
    );
  };

  const handleRevert = async () => {
    await refetch();
    setIsRefresh((prev) => !prev);
    setRowError([]);
    setSelectedRowKeys([]);
    setUpdatedRowKeys([]);
    setDeleteRowKeys([]);
  };

  const handleQuery = async (values: any) => {
    handleGetData({ query: values, page: 1 }, true);
    setIsRefresh((prev) => !prev);
    setRowError([]);
    setSelectedRowKeys([]);
    setUpdatedRowKeys([]);
    setDeleteRowKeys([]);
  };

  return {
    loading: isLoadingTable,
    columns,
    columnOptions,
    data: dataTable,
    rowSelection,
    buttons,
    buttonsAction,
    isOpenRollback,
    isOpenImport,
    isOpenExport,
    selectedRowKeys,
    form,
    selectedFile,
    initialValuesDefault,
    formQuery,
    formImport,
    ref,
    isRollbackAble,
    handleRenderIcon,
    setIsOpenRollback,
    setIsOpenImport,
    setIsOpenExport,
    handleExport,
    onChangeHeader,
    handleDeleteGuide,
    handleImportGuide,
    handleFileChange,
    setSelectedFile,
    handleRemoveFile,
    handleQuery,
    refetch,
  };
}
