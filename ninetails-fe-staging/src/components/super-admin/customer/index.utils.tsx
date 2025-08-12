import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import { BaseButton } from '@/components/common/base-button';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import { BaseTooltipParagraph } from '@/components/common/base-tooltip-paragaph';
import { BaseForm } from '@/components/common/forms/base-form';
import * as S from '@/components/settings/table/index.style';
import { DATE_FORMAT, SORT_TYPE } from '@/constants';
import { useGetCustomerListQuery, useUpdateCustomer } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { ICustomer, PaginationParams } from '@/interfaces';
import { useQueryClient } from '@tanstack/react-query';
import { PaginationProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { Key, useEffect, useState } from 'react';

import { TableCellEllipsis } from '../index.styles';
import { EditCustomerForm } from './edit-customer-form';
import * as SuperAdmin from './index.styles';

interface ItemLink {
  name: string;
  link: string;
}

const inittialParams = {
  page: 1,
};

export default function useCustomer() {
  const [params, setParams] = useState<PaginationParams>(inittialParams);
  const [showPermission, setShowPermission] = useState<boolean>(false);
  const router = useRouterWithAuthorize();
  const { data: customerList } = useGetCustomerListQuery({
    enabled: true,
    params: params,
  });

  const data = customerList?.data?.data ?? [];
  const total = customerList?.data?.pagination?.total ?? 0;

  const updateCustomer = useUpdateCustomer();

  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenDeactive, setIsOpenDeactive] = useState(false);
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });
  const [confirmModalForm] = BaseForm.useForm();

  const linkCustom: ItemLink = {
    name: '부재 관리',
    link: `/super-admin/setting`,
  };
  const handleUpdateCustomer = async (updatedRecord: any, password: string) => {
    const updatedData = {
      ...omit(updatedRecord, ['key']),
      password,
    };

    const id = updatedRecord.id;
    updateCustomer.mutate(
      { id: id, body: updatedData as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['customer_list'] });
          notification.success({ message: '고객 정보가 성공적으로 업데이트되었습니다!' });

          setEditingKey('');
          setExpandedRowKeys(expandedRowKeys.filter((key) => key !== (updatedRecord as any)?.key));
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
    if (params.sortField && params.sortBy) {
      setParams((prev) => ({ ...prev, ...params }));
    } else {
      setParams((prev) => ({ page: prev.page }));
    }
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleMenuClick = (record: ICustomer) => {
    const isExpanded = expandedRowKeys.includes(record.key as string);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : (record.key as string));
  };

  const renderContractPeriod = (record: ICustomer) => {
    const contract = record.contracts.length ? record.contracts[0] : null;
    const startDate = contract?.start_date
      ? dayjs(contract?.start_date).format(DATE_FORMAT.BASIC)
      : null;
    const endDate = contract?.start_date
      ? dayjs(contract?.end_date).format(DATE_FORMAT.BASIC)
      : null;
    if (!startDate && !endDate) {
      return '[미정]';
    }
    if (startDate && !endDate) {
      return `${startDate} / [미정]`;
    }
    if (!startDate && endDate) {
      return `[미정] / ${endDate}`;
    }

    return `${startDate} / ${endDate}`;
  };

  const renderUnit = (text: string, count: number) => {
    return count > 1 ? `${text}s` : text;
  };

  const renderLastLogin = (record: ICustomer) => {
    const user = record?.users?.length ? record?.users[0] : null;
    if (user?.last_login) {
      const diffMinutes = dayjs().diff(dayjs(user.last_login), 'minutes');
      const diffHours = dayjs().diff(dayjs(user.last_login), 'hours');
      const diffDays = dayjs().diff(dayjs(user.last_login), 'days');
      const diffYears = dayjs().diff(dayjs(user.last_login), 'years');

      if (diffHours < 1) {
        return `${diffMinutes} ${renderUnit('minute', diffMinutes)} ago`;
      }
      if (diffDays < 1) {
        return `${diffHours} ${renderUnit('hour', diffHours)} ago`;
      }
      if (diffYears < 1) {
        return `${diffDays} ${renderUnit('day', diffDays)} ago`;
      }
      if (diffYears >= 1) {
        return `${diffYears} ${renderUnit('year', diffYears)} ago`;
      }
    }
    return '';
  };

  const handleOPLogin = (record: ICustomer) => {
    const opId = record?.users?.length ? record?.users[0]?.id : null;
    const schema = record?.users?.length ? record?.schema : null;
    // opId &&
    //   opLoginMutation.mutate(
    //     {
    //       opId: opId,
    //     },
    //     {
    //       onSuccess(responses) {
    //         cookies.set('access_token', responses.data?.accessToken);
    //         cookies.set('refreshToken', responses.data?.refreshToken);
    //         dispatch(
    //           setCredentials({
    //             user: responses.data as any,
    //             token: responses.data?.accessToken,
    //           })
    //         );
    //         push('/admin/dashboard');
    //       },
    //     }
    //   );
    opId && schema && window.open(`/admin/dashboard?opId=${opId}&schema=${schema}`, '_blank');
  };

  const handlePushRoute = (record: any) => {
    router.pushWithAuthorize(linkCustom.link, {
      tab: 'permission',
      tenant_id: record?.id,
      title: record?.organization,
    });
  };

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
    setParams((prev) => ({ ...prev, sortBy: order, sortField: key }));
  };

  const columns: ColumnsType<ICustomer> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '계약타입', key: 'contractType' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'contract_type',
      key: 'contractType',
      width: '15%',
      render: (value, record: ICustomer) => {
        const contactType = record.contracts?.length ? record.contracts[0]?.type : '-';
        return (
          <>
            <p>{contactType}</p>
          </>
        );
      },
    },
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
      width: '15%',
      render: (value, record: ICustomer) => (
        <>
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.organization}</BaseTooltipParagraph>
            <BaseTooltipParagraph>{record.operator}</BaseTooltipParagraph>
          </TableCellEllipsis>
        </>
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
      dataIndex: 'contact',
      key: 'email',
      width: '15%',
      render: (value, record: ICustomer) => (
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
            { title: '계약시작', key: 'contractStartDate' },
            { title: '계약종료', key: 'contractEndDate' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'date',
      key: 'contractEndDate',
      render: (_, record) => renderContractPeriod(record),
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '계약상태', key: 'contractStatus' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'contract_status',
      key: 'contractStatus',
      render: (_, record: ICustomer) => {
        const contactType = record.contracts?.length ? record.contracts[0]?.status : null;
        switch (contactType) {
          case null:
            return '';
          case 0:
            return 'Inactive';
          case 1:
            return 'Active';
        }
      },
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[{ title: '마지막 로그인', key: 'lastLogin' }]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'time',
      key: 'lastLogin',
      render: (_, record) => renderLastLogin(record),
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      width: '50',
      render: (value, record: ICustomer) => {
        if (!record?.users?.length) {
          return null;
        }
        return (
          <SuperAdmin.BtnContent>
            <SuperAdmin.ButtonOpLogin
              type={'default'}
              id={value}
              onClick={() => handleOPLogin(record)}
            >
              <b>OP</b>Login
            </SuperAdmin.ButtonOpLogin>
            <SuperAdmin.BtnRole onClick={() => handlePushRoute(record)}>
              권한 관리
            </SuperAdmin.BtnRole>
          </SuperAdmin.BtnContent>
        );
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      width: '20',
      render: (_, record: ICustomer) => (
        <BaseButton
          onClick={() => handleMenuClick(record)}
          type="link"
          icon={
            <S.BoxIconDropdown>
              {expandedRowKeys.includes(record.key as string) ? <CloseIcon /> : <OpenIcon />}
            </S.BoxIconDropdown>
          }
        />
      ),
    },
  ];

  useEffect(() => {
    // @ts-ignore
    document.querySelector('.ant-layout-content').scrollTo(0, 0);
  }, [params.page]);

  const expandedRowRender = (record: ICustomer) => {
    if (editingKey === (record as any).key) {
      return (
        <EditCustomerForm
          record={record}
          onSave={handleUpdateCustomer}
          confirmModalForm={confirmModalForm}
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

  return {
    columns,
    currentPage: params.page || 1,
    selectedRows,
    expandedRowKeys,
    data: data.map((data) => ({ ...data, key: data?.id ?? '' })),
    total,
    isOpenConfirm,
    isOpenCreate,
    isOpenDeactive,
    setIsOpenDeactive,
    handleChangeParams,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
    showPermission,
    setShowPermission,
  };
}
