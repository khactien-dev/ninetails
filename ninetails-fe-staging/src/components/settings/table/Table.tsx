import { SORT_TYPE } from '@/constants';
import { PaginationParams } from '@/interfaces';
import { Table } from 'antd';
import { RowSelectionType } from 'antd/es/table/interface';
import { SortOrder } from 'antd/lib/table/interface';
import React, { Key, ReactNode } from 'react';

interface SumaryTypes {
  key: string;
  index: string | number;
  section_name: string;
  drive_mode: number;
  trip_time: string;
  duration: string;
  trip_distance: number;
  collect_amount: number;
  weight: number;
}
interface TableSettingsProps {
  handleSelectChange: (selectedRowKeys: Key[]) => void;
  handleSortColumn?: (params: PaginationParams) => void;
  columns: any;
  data: any[];
  expandedRowRender?: (record: any) => ReactNode;
  expandedRowKeys?: string[];
  setExpandedRowKeys?: (data: string[]) => void;
  setEditingKey?: React.Dispatch<React.SetStateAction<string>>;
  selectedRows?: Key[];
  showCheckbox?: boolean;
  selectionType?: RowSelectionType;
  isLoading?: boolean;
  customSummaryRow?: SumaryTypes;
  sortDirections?: SortOrder[];
}

const TableSetting = ({
  handleSelectChange,
  handleSortColumn,
  columns,
  data,
  selectedRows,
  expandedRowRender,
  expandedRowKeys,
  setExpandedRowKeys,
  setEditingKey,
  showCheckbox = true,
  selectionType,
  isLoading,
  customSummaryRow,
  sortDirections,
  ...rest
}: TableSettingsProps) => {
  const dataWithSummary = customSummaryRow && data.length ? [customSummaryRow, ...data] : data;

  const expandableProps = expandedRowRender
    ? {
        expandable: {
          expandedRowRender: expandedRowRender,
          expandedRowKeys: expandedRowKeys,
          onExpand: (expanded: boolean, record: any) => {
            if (expanded) {
              setExpandedRowKeys && setExpandedRowKeys([record.key]);
              setEditingKey && setEditingKey(record.key);
            } else {
              setExpandedRowKeys && setExpandedRowKeys([]);
              setEditingKey && setEditingKey('');
            }
          },
          showExpandColumn: false,
        },
      }
    : {};

  return (
    <Table
      rowClassName={(record) => (record.key === '합계' ? 'custom-summary-row' : '')}
      onChange={(_, __, sorter: any) => {
        const sortBy = SORT_TYPE[sorter.order as keyof typeof SORT_TYPE];
        if (handleSortColumn) {
          handleSortColumn({
            sortBy: sortBy,
            sortField: sortBy ? sorter.columnKey : null,
          });
        }
      }}
      rowSelection={
        showCheckbox
          ? {
              onChange: handleSelectChange,
              selectedRowKeys: selectedRows,
              type: selectionType,
            }
          : undefined
      }
      loading={isLoading}
      columns={columns}
      dataSource={dataWithSummary}
      pagination={false}
      scroll={{ x: 'max-content' }}
      sortDirections={sortDirections}
      {...rest}
      {...expandableProps}
    />
  );
};

export default TableSetting;
