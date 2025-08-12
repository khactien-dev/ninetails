import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import UserInfoForm from '@/components/auth/information/form';
import * as S from '@/components/settings/table/index.style';
import { STATUS } from '@/constants/settings';
import { RecordTypes } from '@/interfaces';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { subString } from '@/utils';
import { Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { Key, ReactNode, useState } from 'react';

interface Utils {
  // loading: boolean;
  columns: ColumnsType<RecordTypes>;
  tableData: [] | any;
  handleSelectChange: (selectedRowKeys: Key[]) => void;
  selectedRows?: Key[];
  expandedRowRender: (record: any) => ReactNode;
  expandedRowKeys: string[];
  setExpandedRowKeys: (data: string[]) => void;
  setEditingKey: React.Dispatch<React.SetStateAction<string>>;
}

export default function useUserInfo(): Utils {
  const [selectedRows, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const user = useAppSelector(selectCurrentUser);

  const columns: ColumnsType<RecordTypes> = [
    {
      title: 'ID (이메일)',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
    },
    {
      title: '이름',
      dataIndex: 'full_name',
      key: 'full_name',
      ellipsis: true,
      render: (value) => {
        return <>{subString(value, 15)}</>;
      },
      width: '10%',
    },
    {
      title: '연락처',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: '10%',
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      width: '10%',
    },
    {
      title: '직책',
      dataIndex: 'position',
      key: 'position',
      width: '10%',
    },
    {
      title: '권한',
      dataIndex: 'role',
      key: 'role',
      width: '10%',
    },
    {
      title: '마지막 로그인',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      // render: (value) => value && Dates.getGapTime(value),
      width: '15%',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        return <>{value === STATUS.ACTIVE ? '활성' : 'Inactive'}</>;
      },
      width: '10%',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (value: string, record: RecordTypes) => {
        return (
          <Button
            onClick={() => handleMenuClick(record)}
            type="link"
            icon={
              <S.BoxIconDropdown>
                {expandedRowKeys.includes(record.key) ? <CloseIcon /> : <OpenIcon />}
              </S.BoxIconDropdown>
            }
          />
        );
      },
    },
  ];

  const tableData = [
    {
      key: 1,
      email: user?.email,
      full_name: user?.full_name,
      phone_number: user?.phone_number,
      department: user?.department?.data,
      position: user?.position?.data,
      role: user?.role,
      lastLogin: user?.last_login,
      status: user?.status,
    },
  ];

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

  const expandedRowRender = (record: RecordTypes) => {
    if (editingKey === record.key) {
      // @ts-ignore
      return <UserInfoForm record={record} />;
    }
    return null;
  };

  return {
    columns,
    tableData,
    handleSelectChange,
    selectedRows,
    expandedRowRender,
    setEditingKey,
    setExpandedRowKeys,
    expandedRowKeys,
  };
}
