import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import OpenIcon from '@/assets/images/settings/open_a1.svg';
import CloseIcon from '@/assets/images/settings/open_a2.svg';
import PlusIcon from '@/assets/images/settings/plus2.svg';
import StopIcon from '@/assets/images/settings/stop9.svg';
import BaseSortTable, { SortValueType } from '@/components/common/base-sort-table';
import * as S from '@/components/settings/table/index.style';
import { SORT_TYPE } from '@/constants';
import { STATUS } from '@/constants/settings';
import { ButtonItem, ClusterItem, ClusterTableItem } from '@/interfaces/settings';
import { Button, PaginationProps } from 'antd';
import { ColumnsType, Key } from 'antd/es/table/interface';
import React, { useMemo, useState } from 'react';

import ClusterForm from './cluster-form';

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
];

const dummyDataCluster: ClusterItem[] = [
  {
    clusterName: '첨단지산센터',
    explanation: '첨단1단지 사',
    distance: '3.24 km',
    crowding: '다소 혼잡',
    avrMovementSpeed: '다소 혼잡20km/h 이하',
    avrCollectionAmount: '45개',
    situation: 0,
  },
  {
    clusterName: '첨단지산센터',
    explanation: '첨단1단지 사',
    distance: '3.24 km',
    crowding: '다소 혼잡',
    avrMovementSpeed: '다소 혼잡20km/h 이하',
    avrCollectionAmount: '45개',
    situation: 0,
  },
  {
    clusterName: '첨단지산센터',
    explanation: '첨단1단지 사',
    distance: '3.24 km',
    crowding: '다소 혼잡',
    avrMovementSpeed: '다소 혼잡20km/h 이하',
    avrCollectionAmount: '45개',
    situation: 0,
  },
  {
    clusterName: '첨단지산센터',
    explanation: '첨단1단지 사',
    distance: '3.24 km',
    crowding: '다소 혼잡',
    avrMovementSpeed: '다소 혼잡20km/h 이하',
    avrCollectionAmount: '45개',
    situation: 0,
  },
];

export const useClusterTable = () => {
  const dataList: ClusterTableItem[] = useMemo(() => {
    const data: ClusterTableItem[] = dummyDataCluster.map((item: ClusterItem, index: number) => ({
      key: '' + index,
      clusterNameDescription: `${item.clusterName}\n${item.explanation}`,
      trafficDistanceCongestion: `${item.distance}\n${item.crowding}`,
      avrMovementSpeed: `${item.avrMovementSpeed}`,
      avrCollectionAmount: `${item.avrCollectionAmount}`,
      situation: item.situation,
    }));
    return data;
  }, []);

  const [currentBtn, setCurrentBtn] = useState<ButtonItem>(buttons[0]);
  const [data, setData] = useState<ClusterTableItem[]>(dataList);
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

  const handleSort = (key: string, order: SORT_TYPE.ASC | SORT_TYPE.DESC | null) => {
    setSortValue({ key, order });
  };

  const columns: ColumnsType<ClusterTableItem> = [
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '클러스이름', key: 'vehicle_number' },
            { title: '설명', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'clusterNameDescription',
      width: '20%',
    },
    {
      title: (
        <BaseSortTable
          value={sortValue}
          data={[
            { title: '동선거리', key: 'vehicle_number' },
            { title: '혼잡', key: 'vehicle_type' },
          ]}
          onSort={handleSort}
        />
      ),
      dataIndex: 'trafficDistanceCongestion',
      width: '15%',
    },
    {
      title: '평균이동속도',
      dataIndex: 'avrMovementSpeed',
      width: '15%',
      sorter: true,
    },
    {
      title: '평균수거량',
      dataIndex: 'avrCollectionAmount',
      width: '15%',
      sorter: true,
    },
    {
      title: '상태',
      dataIndex: 'situation',
      sorter: true,
      render: (_: undefined, record: ClusterTableItem) => (
        <S.StatusWrap status={record.situation}>
          {record.situation === STATUS.INACTIVE ? 'I' : 'A'}
        </S.StatusWrap>
      ),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_: undefined, record: ClusterTableItem) => (
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

  const handleMenuClick = (record: ClusterTableItem) => {
    const isExpanded = expandedRowKeys.includes(record.key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [record.key];

    setExpandedRowKeys(newExpandedRowKeys);
    setEditingKey(isExpanded ? '' : record.key);
  };

  const handleSave = (updatedRecord: ClusterTableItem) => {
    const newData = data.map((item) => (item.key === updatedRecord.key ? updatedRecord : item));
    setData(newData);
    setEditingKey('');
    setExpandedRowKeys(expandedRowKeys.filter((key) => key !== updatedRecord.key));
  };

  const expandedRowRender = (record: ClusterTableItem) => {
    if (editingKey === record.key) {
      return <ClusterForm record={record} onSave={handleSave} />;
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
    currentBtn,
    current,
    expandedRowKeys,
    total,
    setExpandedRowKeys,
    setEditingKey,
    setCurrentBtn,
    handleSelectChange,
    expandedRowRender,
    onChange,
    onFirstPage,
    onLastPage,
  };
};
