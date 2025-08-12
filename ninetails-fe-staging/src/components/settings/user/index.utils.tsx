import ReloadIcon from '@/assets/images/settings/icon-reload.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import StopIcon from '@/assets/images/settings/stop9.svg';
import { BaseButton } from '@/components/common/base-button';
import { BaseTooltipParagraph } from '@/components/common/base-tooltip-paragaph';
import * as S from '@/components/settings/table/index.style';
import { TableCellEllipsis } from '@/components/super-admin/index.styles';
import { STATUS } from '@/constants/settings';
import {
  useCreateUser,
  useCreateUserStatus,
  useDeleteUser,
  useGetRoles,
  useGetUsers,
  useResetPasswordUser,
  useUpdateUser,
} from '@/hooks/features/useUser';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { IUser, PaginationParams } from '@/interfaces';
// import { Dates } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Form, PaginationProps } from 'antd';
import { ColumnsType } from 'antd/es/table/interface';
import { omit } from 'lodash';
import { Key, useMemo, useState } from 'react';

import EditUserForm from '../edit-user-form';
import * as SUser from './index.styles';

const inittialParams = {
  page: 1,
  sortBy: null,
};

export default function useUsers() {
  const [params, setParams] = useState<PaginationParams>(inittialParams);
  const permissions = usePermissions();

  const { data: roles } = useGetRoles();
  const { data: users, isLoading } = useGetUsers(params);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const updateUserStatus = useCreateUserStatus();
  const resetPasswordUser = useResetPasswordUser();

  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const total = users?.data.pagination?.total || 0;

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenDeactive, setIsOpenDeactive] = useState(false);
  const [isOpenResetPassword, setIsOpenResetPassword] = useState(false);

  const handleCreateUser = (
    workerData: Omit<IUser, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
  ) => {
    workerData.password = '1!Password';
    createUser.mutate(workerData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-management'] });
        notification.success({ message: '사용자가 성공적으로 생성되었습니다!' });
        setIsOpenCreate(false);
        form.resetFields();
      },
    });
  };

  const handleDeleteUser = () => {
    deleteUser.mutate(selectedRows, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-management'] });
        notification.success({ message: '이 옵션이 성공적으로 삭제되었습니다!' });
        setIsOpenConfirm(false);
      },
    });
  };

  const handleUpdateUser = async (updatedRecord: IUser) => {
    const data = omit(updatedRecord, ['createdAt', 'updatedAt', 'deletedAt', 'id', 'email']);
    updateUser.mutate(
      { data: data, id: updatedRecord.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user-management'] });
          notification.success({ message: '사용자가 성공적으로 업데이트되었습니다!' });
        },
      }
    );

    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const handleDeactiveUser = () => {
    updateUserStatus.mutate(
      { id: selectedRows, status: 0 },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user-management'] });
          notification.success({ message: '사용자가 성공적으로 업데이트되었습니다!' });
          setIsOpenDeactive(false);
          setSelectedRows([]);
        },
      }
    );
  };

  const handleResetPasswordUser = () => {
    resetPasswordUser.mutate(
      { id: selectedRows },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user-management'] });
          notification.success({ message: '사용자가 성공적으로 업데이트되었습니다!' });
          setIsOpenResetPassword(false);
          setSelectedRows([]);
        },
      }
    );
  };

  const handleChangeParams = (params: PaginationParams) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleMenuClick = (record: IUser) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const rolesOption = useMemo(() => {
    return roles?.data.map((role) => ({ label: role.name, value: role.id })) || [];
  }, [roles]);

  const columns: ColumnsType<IUser> = [
    {
      title: '이름 및 이메일',
      sorter: true,
      key: 'username',
      render: (_, record: IUser) => {
        return (
          <SUser.ColInfo>
            {record.username && <SUser.InfoText>{record.username}</SUser.InfoText>}
            <SUser.InfoText>{record.email}</SUser.InfoText>
          </SUser.ColInfo>
        );
      },
      width: '20%',
    },
    {
      title: '이름',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: true,
      width: '10%',
      render: (_, record: IUser) => {
        return (
          <TableCellEllipsis>
            <BaseTooltipParagraph>{record.full_name}</BaseTooltipParagraph>
          </TableCellEllipsis>
        );
      },
    },
    {
      title: '연락처',
      dataIndex: 'phone_number',
      key: 'phone_number',
      sorter: true,
      width: '10%',
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      sorter: true,
      width: '20%',
      render: (_, record: IUser) => {
        return (
          <SUser.ColInfo>
            <SUser.InfoText>{record.department?.data}</SUser.InfoText>
          </SUser.ColInfo>
        );
      },
    },
    {
      title: '직책',
      dataIndex: 'position',
      key: 'position',
      sorter: true,
      width: '10%',
      render: (_, record: IUser) => {
        return (
          <SUser.ColInfo>
            <SUser.InfoText>{record.position?.data}</SUser.InfoText>
          </SUser.ColInfo>
        );
      },
    },
    {
      title: '권한',
      dataIndex: 'permission',
      key: 'permission',
      sorter: true,
      width: '10%',
      render: (_, record: IUser) => {
        return <>{record?.permission?.name}</>;
      },
    },
    {
      title: '마지막 로그인',
      dataIndex: 'last_login',
      key: 'last_login',
      sorter: true,
      // render: (value) => value && Dates.getGapTime(value),
      width: '10%',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (_: undefined, record: IUser) => (
        <SUser.StatusWrap $isActive={record.status === STATUS.ACTIVE}>
          {record.status === STATUS.INACTIVE ? 'I' : 'A'}
        </SUser.StatusWrap>
      ),
      width: '10%',
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record: IUser) => (
        <BaseButton
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
      onClick: () => setIsOpenConfirm(true),
    },
    {
      name: '비활성',
      icon: <StopIcon style={{ marginBottom: 2 }} />,
      isActive: permissions.updateAble && selectedRows.length > 0,
      isPrimary: false,
      onClick: () => setIsOpenDeactive(true),
    },
    {
      name: '암호초기화',
      icon: <ReloadIcon />,
      isActive: permissions.updateAble && selectedRows.length > 0,
      isPrimary: false,
      onClick: () => setIsOpenResetPassword(true),
    },
  ];

  const initialValues = {
    email: '',
    full_name: '',
    phone_number: '',
    department: '',
    position: '',
    permission_id: rolesOption?.[0]?.value,
    status: STATUS.ACTIVE,
  };

  const expandedRowRender = (record: IUser) => {
    if (editingKey === record.key) {
      return <EditUserForm record={record} onSave={handleUpdateUser} rolesOption={rolesOption} />;
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
    initialValues,
    form,
    columns,
    currentPage: params.page || 1,
    selectedRows,
    expandedRowKeys,
    data: users?.data?.data.map((worker) => ({ ...worker, key: worker.id })),
    total,
    buttons,
    isOpenConfirm,
    isOpenCreate,
    isOpenDeactive,
    isOpenResetPassword,
    rolesOption,
    isLoading,
    setIsOpenDeactive,
    setIsOpenResetPassword,
    handleDeleteUser,
    handleChangeParams,
    handleCreateUser,
    handleDeactiveUser,
    handleResetPasswordUser,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
  };
}
