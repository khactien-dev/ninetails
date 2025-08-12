import PaginationTable from '@/components/settings/pagination';
import TableSetting from '@/components/settings/table/Table';
import { Table } from '@/components/settings/table/index.style';
import React from 'react';

import * as S from './index.styles';
import useCustomer from './index.utils';

export const Customer = () => {
  const {
    columns,
    currentPage,
    expandedRowKeys,
    total,
    data = [],
    selectedRows,
    handleChangeParams,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
  } = useCustomer();

  return (
    <>
      <Table>
        <TableSetting
          handleSortColumn={handleChangeParams}
          handleSelectChange={handleSelectChange}
          columns={columns}
          data={data}
          selectedRows={selectedRows}
          expandedRowRender={expandedRowRender}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          setEditingKey={setEditingKey}
        />
        {total > 0 && (
          <S.WrapPaginationTable>
            <PaginationTable
              onFirstPage={onFirstPage}
              current={currentPage}
              onChange={onChange}
              total={total}
              onLastPage={onLastPage}
            />
          </S.WrapPaginationTable>
        )}
      </Table>
    </>
  );
};
