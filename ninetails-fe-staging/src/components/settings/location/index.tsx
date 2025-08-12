import ReloadIcon from '@/assets/images/settings/icon-reload.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import StopIcon from '@/assets/images/settings/stop9.svg';
import EditLocationForm from '@/components/settings/edit-location-form';
import TableSettings from '@/components/settings/table';
import * as S from '@/components/settings/table/index.style';
import { STATUS, dummyData } from '@/constants/settings';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';
import { RecordTypes } from '@/interfaces/settings';
import { Button, PaginationProps } from 'antd';
import { Key } from 'antd/es/table/interface';
import { useState } from 'react';

const buttons = [
  {
    name: '추가',
    icon: <PlusIcon />,
    isActive: false,
    isPrimary: false,
  },
  {
    name: '삭제',
    icon: <MinusIcon style={{ marginBottom: 4 }} />,
    isActive: false,
    isPrimary: false,
  },
  {
    name: '비활성',
    icon: <StopIcon style={{ marginBottom: 2 }} />,
    isActive: false,
    isPrimary: false,
  },
  {
    name: '새로고침',
    isActive: false,
    isPrimary: false,
    icon: <ReloadIcon />,
  },
];

const Locations = () => {
  const [data, setData] = useState<RecordTypes[]>(dummyData as any);
  const [, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [current, setCurrent] = useState(1);
  const total = 50; // Replace with the actual total number of items
  const menus = useSettingMenusPermissions();
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

  const handleSave = (updatedRecord: RecordTypes) => {
    const newData = data.map((item) => (item.key === updatedRecord.key ? updatedRecord : item));
    setData(newData);
    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const columns = [
    {
      title: '지역이름/설명',
      dataIndex: 'nameEmail',
      sorter: true,
    },
    {
      title: '동선거리',
      dataIndex: 'lastLogin',
      sorter: true,
    },
    {
      title: '평균수거시간',
      dataIndex: 'contact',
      sorter: true,
    },
    {
      title: '평균수거량',
      dataIndex: 'contact',
      sorter: true,
    },
    {
      title: '동선버전/갱신시점',
      dataIndex: 'contact',
      sorter: true,
    },
    {
      title: '상태',
      dataIndex: 'status',
      sorter: true,
      render: (_: undefined, record: RecordTypes) => (
        <S.StatusWrap status={record.status}>
          {record.status === STATUS.INACTIVE ? 'I' : 'A'}
        </S.StatusWrap>
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

  const expandedRowRender = (record: RecordTypes) => {
    if (editingKey === record.key) {
      return <EditLocationForm record={record} onSave={handleSave} />;
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page);
  };

  const onFirstPage = () => {
    setCurrent(1);
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / 10); // Assuming 10 items per page
    setCurrent(lastPage);
  };

  return (
    <TableSettings
      tableName="배차지역 관리"
      buttonArr={buttons}
      menus={menus}
      handleSelectChange={handleSelectChange}
      columns={columns}
      data={data}
      expandedRowRender={expandedRowRender}
      expandedRowKeys={expandedRowKeys}
      setExpandedRowKeys={setExpandedRowKeys}
      setEditingKey={setEditingKey}
      onFirstPage={onFirstPage}
      currentPage={current}
      onChange={onChange}
      total={total}
      onLastPage={onLastPage}
    />
  );
};

export default Locations;
