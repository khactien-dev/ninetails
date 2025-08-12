import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import EditRoleForm from '@/components/super-admin/permission/permission-form';
import { PERMISSION_NAME_KR } from '@/constants/settings';
import {
  useCreatePermission,
  useDeletePermission,
  useGetPermissionRole,
  useUpdatePermission,
} from '@/hooks/features/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { usePermissionRoleConfig } from '@/hooks/useRoleAuthorize.ts';
import { IPermissionRequest } from '@/interfaces';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { ColumnsType } from 'antd/es/table';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import { Key, useState } from 'react';

import * as S from './index.styles';

export interface RadioItem {
  key: number;
  name: string;
  label: string;
}

export default function usePermissionMode() {
  const permissions = usePermissions();
  const permissionRoleConfig = usePermissionRoleConfig();
  const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [isOpenStop, setIsOpenStop] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: { [key: string]: boolean } }>(
    {}
  );
  const [checked, setChecked] = useState<{ [key: string]: { [key: string]: boolean } }>({});

  const [form] = Form.useForm();
  const { query } = useRouter();

  const tenant_id = parseInt(query.tenant_id as string);
  const dataListPermission = useGetPermissionRole(tenant_id);
  const deleteWorker = useDeletePermission();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const { notification } = useFeedback();
  const queryClient = useQueryClient();

  const handleDeletePermission = (id: number) => {
    deleteWorker.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permission'] });
        notification.success({ message: '역할이 성공적으로 삭제되었습니다!' });
        setIsOpenConfirm(false);
      },
    });
  };
  const orderName = ['운영자', '배차관리자', '사용자'];
  const dataRecords = dataListPermission?.data?.data
    ?.map((record: any) => ({
      ...record,
      key: record?.name,
    }))
    .sort((value: any, valueNext: any) => {
      if (value.type === 'OP' && valueNext.type !== 'OP') return -1;
      if (value.type !== 'OP' && valueNext.type === 'OP') return 1;
      if (value.createdAt && valueNext.createdAt) {
        return new Date(value.createdAt).getTime() - new Date(valueNext.createdAt).getTime();
      }
      return orderName.indexOf(value.key) - orderName.indexOf(valueNext.key);
    });

  const buttons = [
    {
      name: '추가',
      icon: <PlusIcon />,
      isActive: permissions.createAble,
      isPrimary: true,
      onClick: () => setIsOpenConfirm(true),
    },
  ];
  const handleUpdatePermission = async (updatedRecord: any) => {
    const updatedData = omit(updatedRecord, ['createdAt', 'updatedAt', 'deletedAt', 'id']);

    updatePermission.mutate(
      { data: updatedData, id: updatedRecord.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['permission'] });
          notification.success({ message: '역할이 성공적으로 업데이트되었습니다!' });
        },
      }
    );

    setEditingKey('');
    setExpandedRowKeys([]);
  };

  const handleMenuClick = (record: any) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];
    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const formCreateChecked = Object.keys(checkedItems).reduce((acc, name) => {
    try {
      const actions = Object.keys(checkedItems[name]).filter((key) => checkedItems[name][key]);
      if (actions.length > 0) {
        acc[name] = actions;
      }
    } catch (error) {
      console.error(`Error processing checkedItems for ${name}:`, error);
    }
    return acc;
  }, {} as { [key: string]: string[] });

  const roleName = {
    route_management: 'route_management',
    updater_application_management: 'updater_application_management',
    company_management: 'company_management',
  };

  const renderCheckbox = (type: string, name: string, value: any, key: any) => {
    const handleChange = (e: CheckboxChangeEvent, name: string, key: any) => {
      setCheckedItems((prev) => ({ ...prev, [name]: { ...prev[name], [key]: e.target.checked } }));
    };

    const isDisabled =
      (name === roleName.route_management && ['create', 'update', 'delete'].includes(key)) ||
      (name === roleName.updater_application_management &&
        ['create', 'update', 'delete'].includes(key)) ||
      (name === roleName.company_management && ['update'].includes(key) && type !== 'OP');

    const permissionValue = permissionRoleConfig[name];
    if (permissionValue[key as keyof typeof permissionValue] == null) {
      return <S.InfoText>-</S.InfoText>;
    }
    return value ? (
      <S.Checkbox defaultChecked={value} onChange={(e) => handleChange(e, name, key)} />
    ) : (
      <S.Checkbox
        onChange={(e) => !isDisabled && handleChange(e, name, key)}
        disabled={isDisabled}
      />
    );
  };

  const renderCheckboxCreate = (name: string, value: null, key: any) => {
    const handleChange = (e: CheckboxChangeEvent, name: string, key: any) => {
      setCheckedItems((prev) => ({ ...prev, [name]: { ...prev[name], [key]: e.target.checked } }));
      setChecked((prev) => ({ ...prev, [name]: { ...prev[name], [key]: e.target.checked } }));
    };
    const isDisabled =
      (name === roleName.route_management && ['create', 'update', 'delete'].includes(key)) ||
      (name === roleName.updater_application_management &&
        ['create', 'update', 'delete'].includes(key)) ||
      (name === roleName.company_management && ['update'].includes(key));
    const isChecked = checked[name]?.[key] || false;
    return value === null ? (
      <S.InfoText>-</S.InfoText>
    ) : (
      <S.Checkbox
        checked={isChecked}
        onChange={(e) => !isDisabled && handleChange(e, name, key)}
        disabled={isDisabled}
      />
    );
  };

  const handleCreatePermission = (
    permissionData: Omit<IPermissionRequest, 'key' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
  ) => {
    permissionData.name = permissionData.name.trim();
    permissionData.tenant_id = tenant_id;
    permissionData.dashboard = formCreateChecked?.dashboard ? formCreateChecked.dashboard : [];
    permissionData.work_shift = formCreateChecked?.work_shift ? formCreateChecked.work_shift : [];
    permissionData.company_management = formCreateChecked?.company_management
      ? formCreateChecked.company_management
      : [];
    permissionData.driving_diary = formCreateChecked?.driving_diary
      ? formCreateChecked.driving_diary
      : [];
    permissionData.illegal_disposal = formCreateChecked?.illegal_disposal
      ? formCreateChecked.illegal_disposal
      : [];
    permissionData.notification = formCreateChecked?.notification
      ? formCreateChecked.notification
      : [];
    permissionData.operation_analysis = formCreateChecked?.operation_analysis
      ? formCreateChecked.operation_analysis
      : [];
    permissionData.realtime_activity = formCreateChecked?.realtime_activity
      ? formCreateChecked.realtime_activity
      : [];
    permissionData.route_management = formCreateChecked?.route_management
      ? formCreateChecked.route_management
      : [];
    permissionData.updater_application_management =
      formCreateChecked?.updater_application_management
        ? formCreateChecked.updater_application_management
        : [];
    permissionData.vehicle_management = formCreateChecked?.vehicle_management
      ? formCreateChecked.vehicle_management
      : [];
    permissionData.staff_management = formCreateChecked?.staff_management
      ? formCreateChecked.staff_management
      : [];
    permissionData.user_management = formCreateChecked?.user_management
      ? formCreateChecked.user_management
      : [];
    permissionData.absence_management = formCreateChecked?.absence_management
      ? formCreateChecked.absence_management
      : [];

    createPermission.mutate(permissionData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['permission'] });
        notification.success({ message: '역할이 성공적으로 생성되었습니다!' });
        setChecked({});
        setIsOpenConfirm(false);
        form.resetFields();
      },
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: '역할',
      key: 'name',
      render: (value, record: any) => {
        return <span>{record?.name}</span>;
      },
    },
    {
      title: '',
      key: 'situation',
      render: () => {
        return <span></span>;
      },
    },
    {
      title: '',
      key: 'actions',
      render: (_: undefined, record: any) => (
        <>
          <Button
            onClick={() => handleMenuClick(record)}
            type="link"
            icon={
              <S.BoxIconDropdown>
                {expandedRowKeys.includes(record.key) ? <CloseIcon /> : <OpenIcon />}
              </S.BoxIconDropdown>
            }
          />
        </>
      ),
    },
  ];

  const optionCommonness = [
    {
      key: 1,
      name: 'dashboard',
      create: null,
      read: false,
      update: null,
      delete: null,
      export: null,
    },
    {
      key: 2,
      name: 'work_shift',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: false,
    },
    {
      key: 3,
      name: 'realtime_activity',
      create: null,
      read: false,
      update: null,
      delete: null,
      export: false,
    },
    {
      key: 4,
      name: 'operation_analysis',
      create: null,
      read: false,
      update: false,
      delete: null,
      export: false,
    },
    {
      key: 5,
      name: 'illegal_disposal',
      create: null,
      read: false,
      update: null,
      delete: null,
      export: null,
    },
    {
      key: 6,
      name: 'driving_diary',
      create: false,
      read: false,
      update: false,
      delete: null,
      export: false,
    },
    {
      key: 7,
      name: 'notification',
      create: null,
      read: false,
      update: false,
      delete: null,
      export: null,
    },
  ];
  const optionCommonnesSecond = [
    {
      key: 1,
      name: 'user_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
    {
      key: 2,
      name: 'company_management',
      create: null,
      read: false,
      update: false,
      delete: null,
      export: null,
    },
    {
      key: 3,
      name: 'staff_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
    {
      key: 4,
      name: 'vehicle_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
    {
      key: 5,
      name: 'updater_application_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
    {
      key: 6,
      name: 'route_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
    {
      key: 7,
      name: 'absence_management',
      create: false,
      read: false,
      update: false,
      delete: false,
      export: null,
    },
  ];

  const convertData = (inputData: any) => {
    const result: any = {};
    for (const key in inputData) {
      if (
        typeof inputData[key] === 'string' &&
        key !== 'name' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'key' &&
        key !== 'deletedAt' &&
        key !== 'type'
      ) {
        const permissions = inputData[key].split(',').reduce(
          (value: any, perm: any) => {
            value[perm.trim()] = true;
            return value;
          },
          { create: false, read: false, update: false, delete: false, export: false }
        );
        result[key] = permissions;
      } else if (inputData[key] === null) {
        result[key] = { create: false, read: false, update: false, delete: false, export: false };
      }
    }

    Object.keys(result).forEach((key) => {
      if (result[key][''] !== undefined) {
        delete result[key][''];
      }
    });

    return {
      ...result,
      id: inputData?.id,
      name: inputData?.name,
      key: inputData?.name,
    };
  };

  const convertToOptionCommonness = (data: any) => {
    return Object.keys(data).map((key) => ({
      key: key,
      name: key,
      id: data?.id,
      create: data[key].create,
      read: data[key].read,
      update: data[key].update,
      delete: data[key].delete,
      export: data[key].export,
    }));
  };
  const convertDataUpte = (input: any) => {
    const getPermissions = (permissions: any) => {
      return Object.keys(permissions)
        .filter((key) => permissions[key])
        .map((key) => key);
    };

    return {
      tenant_id: input.tenant_id,
      name: input.name,
      dashboard: getPermissions(input.dashboard),
      work_shift: getPermissions(input.work_shift),
      realtime_activity: getPermissions(input.realtime_activity),
      operation_analysis: getPermissions(input.operation_analysis),
      illegal_disposal: getPermissions(input.illegal_disposal),
      driving_diary: getPermissions(input.driving_diary),
      notification: getPermissions(input.notification),
      user_management: getPermissions(input.user_management),
      staff_management: getPermissions(input.staff_management),
      vehicle_management: getPermissions(input.vehicle_management),
      absence_management: getPermissions(input.absence_management),
      company_management: getPermissions(input.company_management),
      route_management: getPermissions(input.route_management),
      updater_application_management: getPermissions(input.updater_application_management),
    };
  };

  const columnTableCommnon: ColumnsType<any> = [
    {
      title: '공통',
      key: 'name',
      render: (value, record: any) => {
        const permissionName = Object.keys(PERMISSION_NAME_KR).find(
          (key) => PERMISSION_NAME_KR[key as keyof typeof PERMISSION_NAME_KR] === record?.name
        );

        return (
          <S.InfoText>
            {permissionName
              ? PERMISSION_NAME_KR[permissionName as keyof typeof PERMISSION_NAME_KR]
              : PERMISSION_NAME_KR[record?.name as keyof typeof PERMISSION_NAME_KR] || record?.name}
          </S.InfoText>
        );
      },
    },
    {
      title: '추가',
      key: 'create',
      render: (value, record: any) => {
        return renderCheckbox(record?.type, record?.name, record?.create, 'create');
      },
    },
    {
      title: '읽기',
      key: 'read',
      render: (value, record: any) =>
        renderCheckbox(record?.type, record?.name, record?.read, 'read'),
    },
    {
      title: '편집',
      key: 'update',
      render: (value, record: any) =>
        renderCheckbox(record?.type, record?.name, record?.update, 'update'),
    },
    {
      title: '삭제',
      key: 'delete',
      render: (value, record: any) =>
        renderCheckbox(record?.type, record?.name, record?.delete, 'delete'),
    },
    {
      title: '저장',
      key: 'export',
      render: (value, record: any) =>
        renderCheckbox(record?.type, record?.name, record?.export, 'export'),
    },
  ];
  const columnTableCommnonCreate: ColumnsType<any> = [
    {
      title: '공통',
      key: 'name',
      render: (value, record: any) => {
        const permissionName = Object.keys(PERMISSION_NAME_KR).find(
          (key) => PERMISSION_NAME_KR[key as keyof typeof PERMISSION_NAME_KR] === record?.name
        );

        return (
          <S.InfoText>
            {permissionName
              ? PERMISSION_NAME_KR[permissionName as keyof typeof PERMISSION_NAME_KR]
              : PERMISSION_NAME_KR[record?.name as keyof typeof PERMISSION_NAME_KR] || record?.name}
          </S.InfoText>
        );
      },
    },
    {
      title: '추가',
      key: 'create',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.create, 'create'),
    },
    {
      title: '읽기',
      key: 'read',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.read, 'read'),
    },
    {
      title: '편집',
      key: 'update',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.update, 'update'),
    },
    {
      title: '삭제',
      key: 'delete',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.delete, 'delete'),
    },
    {
      title: '저장',
      key: 'export',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.export, 'export'),
    },
  ];
  const columnTableCommnonCreateSecond: ColumnsType<any> = [
    {
      title: '설정',
      key: 'name',
      render: (value, record: any) => {
        const permissionName = Object.keys(PERMISSION_NAME_KR).find(
          (key) => PERMISSION_NAME_KR[key as keyof typeof PERMISSION_NAME_KR] === record?.name
        );

        return (
          <S.InfoText>
            {permissionName
              ? PERMISSION_NAME_KR[permissionName as keyof typeof PERMISSION_NAME_KR]
              : PERMISSION_NAME_KR[record?.name as keyof typeof PERMISSION_NAME_KR] || record?.name}
          </S.InfoText>
        );
      },
    },
    {
      title: '',
      key: 'create',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.create, 'create'),
    },
    {
      title: '',
      key: 'read',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.read, 'read'),
    },
    {
      title: '',
      key: 'update',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.update, 'update'),
    },
    {
      title: '',
      key: 'delete',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.delete, 'delete'),
    },
    {
      title: '',
      key: 'export',
      render: (value, record: any) => renderCheckboxCreate(record?.name, record?.export, 'export'),
    },
  ];

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const expandedRowRender = (record: any) => {
    if (editingKey === record?.key) {
      return <EditRoleForm record={record} onSave={handleUpdatePermission} />;
    }
    return null;
  };
  return {
    buttons,
    form,
    columns,
    expandedRowRender,
    isOpenConfirm,
    setIsOpenConfirm,
    isOpenStop,
    setIsOpenStop,
    selectedRows,
    handleSelectChange,
    expandedRowKeys,
    columnTableCommnon,
    dataListPermission,
    optionCommonness,
    dataRecords,
    columnTableCommnonCreate,
    convertData,
    convertToOptionCommonness,
    handleDeletePermission,
    isOpenConfirmDelete,
    setIsOpenConfirmDelete,
    optionCommonnesSecond,
    columnTableCommnonCreateSecond,
    handleCreatePermission,
    setCheckedItems,
    checkedItems,
    convertDataUpte,
    setChecked,
  };
}
