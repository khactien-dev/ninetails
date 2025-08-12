import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import { BaseButton } from '@/components/common/base-button';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { BaseTooltipParagraph } from '@/components/common/base-tooltip-paragaph';
import { BaseForm } from '@/components/common/forms/base-form';
import * as S from '@/components/settings/table/index.style';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import {
  useApproveTenant,
  useGetTenantRegisterListQuery,
  useUpdateTenantRegisterMutate,
} from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { IRegisterResponse, PaginationParams } from '@/interfaces';
import { useQueryClient } from '@tanstack/react-query';
import { Form, PaginationProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { Key, useState } from 'react';

import { TableCellEllipsis } from '../index.styles';
import EditRegisterForm from './edit-register-form';
import { FileLink } from './index.styles';
import * as Registration from './index.styles';

const inittialParams = {
  page: 1,
};

export default function useRegistrationRequest() {
  const [params, setParams] = useState<PaginationParams>(inittialParams);

  const { notification } = useFeedback();

  const { data: tenantReisterList } = useGetTenantRegisterListQuery({
    enabled: true,
    params: params,
  });
  const updateTenant = useUpdateTenantRegisterMutate();
  const approveTenant = useApproveTenant();

  const total = tenantReisterList?.data?.pagination?.total ?? 0;
  const data = tenantReisterList?.data?.data ?? [];
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });
  const [isOpenCreate, setIsOpenCreate] = useState<number | null | string>(null);
  const [confirmModalForm] = BaseForm.useForm();

  const handleCreateCustomer = (values: any) => {
    const id = isOpenCreate !== null ? isOpenCreate.toString() : null;

    id &&
      approveTenant.mutate(
        {
          body: {
            customerId: (values.customerId as string).toUpperCase(),
          },
          id: id,
        },
        {
          onSuccess() {
            setIsOpenCreate(null);
            notification.success({ message: '고객이 성공적으로 생성되었습니다!' });
            queryClient.invalidateQueries({ queryKey: ['tenant_register_list'] });
          },
        }
      );
  };

  const handleUpdateCustomer = async (updatedRecord: any, password: string) => {
    const updatedData = {
      ...omit(updatedRecord, ['key']),
      password,
    };

    const id = updatedRecord.id;
    updateTenant.mutate(
      { id: id, body: updatedData as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tenant_register_list'] });
          notification.success({ message: '고객 정보가 성공적으로 업데이트되었습니다!' });

          setEditingKey('');
          setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.id));
          confirmModalForm.resetFields();
        },
        onError: (error: any) => {
          if (error.status != 400) {
            confirmModalForm.setFields([
              {
                name: 'password',
                errors: [error.data.message],
              },
            ]);
          }
        },
      }
    );
  };

  const handleChangeParams = (params: PaginationParams) => {
    if (params.sortBy && params.sortField) {
      setParams((prev) => ({ ...prev, ...params }));
    } else {
      setParams((prev) => ({ page: prev.page }));
    }
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
    confirmModalForm.resetFields();
  };

  const handleMenuClick = (record: IRegisterResponse) => {
    const isExpanded = expandedRowKeys.includes(record.id);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.id)
      : [record.id];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.id);
  };

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key }));
  };

  const columns: ColumnsType<IRegisterResponse> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '기관명', key: 'organization' },
            { title: '운영자', key: 'operator' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'operator',
      key: 'organization',
      width: '20%',
      render: (_, record) => (
        <TableCellEllipsis>
          <BaseTooltipParagraph>{record.organization}</BaseTooltipParagraph>
          <BaseTooltipParagraph>{record.operator}</BaseTooltipParagraph>
        </TableCellEllipsis>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '연락처', key: 'phone' },
            { title: '이메일', key: 'email' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'email',
      key: 'email',
      width: '15%',
      render: (_, record) => (
        <>
          <p>{record.phone}</p>
          <p>{record.email}</p>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '부서', key: 'department' },
            { title: '직책', key: 'position' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'department',
      key: 'department',
      width: '15%',
      render: (_, record) => (
        <TableCellEllipsis>
          <BaseTooltipParagraph>
            {typeof record.department === 'object' ? record.department?.data : record.department}
          </BaseTooltipParagraph>
          <BaseTooltipParagraph>
            {typeof record.position === 'object' ? record.position?.data : record.position}
          </BaseTooltipParagraph>
        </TableCellEllipsis>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '기관증빙 #1', key: 'proof1' },
            { title: '기관증빙 #2', key: 'proof2' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'proof1',
      key: 'proof1',
      render: (_, record) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>
              <FileLink target="_blank" href={record?.filename_proof1 ? record?.proof1 : '#'}>
                {record?.filename_proof1 ?? ''}
              </FileLink>
            </BaseTooltipParagraph>
          </TableCellEllipsis>
          <TableCellEllipsis>
            <BaseTooltipParagraph>
              <FileLink target="_blank" href={record?.filename_proof2 ? record?.proof2 : '#'}>
                {record?.filename_proof2 ?? ''}
              </FileLink>
            </BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '수신 날짜', key: 'createdAt' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, record) => (
        <>
          <p>{dayjs(record?.createdAt).format(DATE_FORMAT.DATE_TY)}</p>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '승인 날짜', key: 'approved_time' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'approved_time',
      key: 'approved_time',
      render: (_, record) => (
        <>
          <p>
            {record?.approved_time ? dayjs(record.approved_time).format(DATE_FORMAT.DATE_TY) : '--'}
          </p>
        </>
      ),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '상태', key: 'requestStatus' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'id',
      key: 'id',
      width: '50',
      render: (_, record) => (
        <>
          {record.approved_time ? (
            <Registration.ApprovedText>Approved</Registration.ApprovedText>
          ) : (
            <Registration.ButtonRenew
              type={'default'}
              onClick={() => {
                form.setFieldValue('customerId', '');
                form.setFieldValue('organization', record.organization);
                form.setFieldValue('email', record.email);

                setIsOpenCreate(record?.id);
              }}
            >
              Review
            </Registration.ButtonRenew>
          )}
        </>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',
      width: '20',
      render: (_, record: IRegisterResponse) => (
        <BaseButton
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record.id) ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  const expandedRowRender = (record: IRegisterResponse) => {
    if (editingKey === record.id) {
      return (
        <EditRegisterForm
          record={record}
          onSave={handleUpdateCustomer}
          confirmModalForm={confirmModalForm}
          disabled={!!record?.approved_time}
        />
      );
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const onFirstPage = () => {
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10);
    setParams((prev) => ({ ...prev, page: lastPage }));
  };

  return {
    form,
    columns,
    currentPage: params.page || 1,
    selectedRows,
    expandedRowKeys,
    data: data.map((data) => ({ ...data, key: data.id })),
    total,
    isOpenCreate,
    handleChangeParams,
    handleCreateCustomer,
    setIsOpenCreate,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
  };
}
