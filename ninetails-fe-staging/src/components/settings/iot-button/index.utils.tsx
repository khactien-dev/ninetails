import ReloadIcon from '@/assets/images/settings/icon-reload.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import StopIcon from '@/assets/images/settings/stop9.svg';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import * as S from '@/components/settings/table/index.style';
import { SORT_TYPE } from '@/constants';
import { usePermissions } from '@/hooks/usePermissions';
import { IotButtonItem, IotButtonTableItem } from '@/interfaces/settings';
import { Button, PaginationProps } from 'antd';
import { ColumnsType, Key } from 'antd/es/table/interface';
import React, { useMemo, useState } from 'react';

import EditIotForm from './iot-button-form';

const dummyDataIotButton = [
  {
    key: '1',
    buttonName: 'GSB_004',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
  {
    key: '2',
    buttonName: 'GSB_001',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
  {
    key: '3',
    buttonName: 'GSB_001',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
  {
    key: '4',
    buttonName: 'GSB_001',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
  {
    key: '5',
    buttonName: 'GSB_001',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
  {
    key: '6',
    buttonName: 'GSB_001',
    swVersion: '',
    hwModel: '',
    hostPhone: '010.5432.1004',
    transmissionFrequency: '',
    identifier: '',
    gpsX: '12704.9278',
    gpsY: '3728.9707',
    battery: '92%',
    pairing: 'Active',
    secureKey: '',
    gpsXY: '12704.9278\n3728.9707',
    button: '2',
    finalReport: '2 days ago\n30 seconds ago',
    finalSignal: '',
    session: 'Inactive',
    status: 'Active',
  },
];

export const useIotButtonTable = () => {
  const dataList: IotButtonTableItem[] = useMemo(() => {
    const data: IotButtonTableItem[] = dummyDataIotButton.map((item: IotButtonItem) => ({
      key: item.key,
      status: item.status,
      buttonNameHostPhone: `${item.buttonName}\n${item.hostPhone}`,
      battery: `${item.battery}`,
      gpsXY: `${item.gpsX}\n${item.gpsY}`,
      button: `${item.button}`,
      finalReportFinalSignal: `${item.finalReport}\n${item.finalSignal}`,
      pairing: `${item.pairing}`,
      session: `${item.session}`,
    }));
    return data;
  }, [dummyDataIotButton]);
  const permissions = usePermissions();

  const [data, setData] = useState<IotButtonTableItem[]>(dataList);
  const [, setSelectedRows] = useState<Key[]>([]);
  const [editingKey, setEditingKey] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [current, setCurrent] = useState(1);
  const total = 50; // Replace with the actual total number of items
  const itemsPerPage = 10;
  const [sortValue, setSortValue] = useState<SortValueType>({
    key: '',
    order: null,
  });

  const handleMenuClick = (record: IotButtonTableItem) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const buttons = [
    {
      name: '추가',
      icon: <PlusIcon />,
      isActive: permissions.createAble,
      isPrimary: false,
    },
    {
      name: '삭제',
      icon: <MinusIcon style={{ marginBottom: 4 }} />,
      isActive: permissions.deleteAble,
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

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
  };

  const columns: ColumnsType<IotButtonTableItem> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '버튼이름', key: 'vehicle_number' },
            { title: '호스트폰', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'buttonNameHostPhone',
      width: '10%',
    },
    {
      title: '배터리',
      dataIndex: 'battery',
      width: '15%',
      sorter: true,
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: 'GPS_X', key: 'vehicle_number' },
            { title: 'GPS_Y', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'gpsXY',
      width: '10%',
    },
    {
      title: '버튼#',
      dataIndex: 'button',
      width: '20%',
      sorter: true,
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '최종리포트', key: 'vehicle_number' },
            { title: '최종시그널', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'finalReportFinalSignal',
      width: '200px',
    },
    {
      title: '페어링',
      dataIndex: 'pairing',
      width: '200px',
      sorter: true,
      render: (_: undefined, record: any) => <S.IotStatusWrap status={record.pairing || ''} />,
    },
    {
      title: '세션',
      dataIndex: 'session',
      sorter: true,
      render: (_: undefined, record: any) => <S.IotStatusWrap status={record.session || ''} />,
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_: undefined, record: IotButtonTableItem) => (
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

  const handleSelectChange = (selectedRowKeys: Key[]) => {
    setSelectedRows(selectedRowKeys);
  };

  const handleSave = (updatedRecord: IotButtonTableItem) => {
    const newData = data.map((item) => (item.key === updatedRecord.key ? updatedRecord : item));
    setData(newData);
    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const expandedRowRender = (record: IotButtonTableItem) => {
    if (editingKey === record.key) {
      return <EditIotForm record={record} onSave={handleSave} />;
    }
    return null;
  };

  const onChange: PaginationProps['onChange'] = (page, pageSize) => {
    console.log(page);
    setCurrent(page);
    // Call API here with the new page number
    console.log(`Fetching data for page ${page}, ${pageSize}`);
  };

  const onFirstPage = () => {
    setCurrent(1);
    // Call API here for the first page
    console.log('Fetching data for page 1');
  };

  const onLastPage = () => {
    const lastPage = Math.ceil(total / itemsPerPage); // Assuming 10 items per page
    setCurrent(lastPage);
    // Call API here for the last page
    console.log(`Fetching data for page ${lastPage}`);
  };

  return {
    columns,
    buttons,
    data,
    current,
    expandedRowKeys,
    total,
    setExpandedRowKeys,
    setEditingKey,
    handleSelectChange,
    expandedRowRender,
    onChange,
    onFirstPage,
    onLastPage,
  };
};
