import { ColumnsTypes } from '@/interfaces/settings';
import { Table } from 'antd';
import { RowSelectionType } from 'antd/es/table/interface';
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
  handleSelectChange?: (selectedRowKeys: Key[]) => void;
  columns: ColumnsTypes[];
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
}

const TableSetting = ({
  handleSelectChange,
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
      loading={isLoading}
      columns={columns}
      dataSource={dataWithSummary}
      pagination={false}
      scroll={{ x: 'max-content' }}
      rowSelection={
        showCheckbox
          ? {
              onChange: handleSelectChange,
              selectedRowKeys: selectedRows,
              type: selectionType,
            }
          : undefined
      }
      {...rest}
      {...expandableProps}
    />
  );
};

export default TableSetting;
