import PlayIcon from '@/assets/images/settings/icon-play.svg';
import PaginationTable from '@/components/settings/pagination';
import TableSettings from '@/components/settings/table/Table';
import React from 'react';

import * as S from './index.styles';
import useRollbackHistory from './index.utils';

export interface IProps {
  isOpenRollback: boolean;
  setIsOpenRollback: (value: boolean) => void;
  tableName: string;
  refetch: () => void;
}

const RollbackHistory = (props: IProps) => {
  const { isOpenRollback } = props;

  const {
    isLoadingTable,
    expandedRowRender,
    columns,
    data,
    expandedRowKeys,
    setEditingKey,
    selectedRows,
    onFirstPage,
    current,
    onChange,
    total,
    onLastPage,
    setExpandedRowKeys,
    handleSelectChange,
    loading,
    handleRollback,
    handleCloseModal,
    isEnableBtn,
  } = useRollbackHistory(props);

  return (
    <S.Modal
      width={1000}
      title="쿼리 실행 점검"
      footer={
        <S.Confirm
          type="primary"
          loading={loading}
          disabled={!isEnableBtn}
          onClick={handleRollback}
        >
          {'확인'} <PlayIcon />
        </S.Confirm>
      }
      open={isOpenRollback}
      onCancel={handleCloseModal}
      destroyOnClose={true}
    >
      <S.BoxTitle>쿼리 History</S.BoxTitle>
      <S.Table>
        <TableSettings
          isLoading={isLoadingTable}
          handleSelectChange={handleSelectChange}
          columns={columns}
          data={data}
          selectedRows={selectedRows}
          expandedRowRender={expandedRowRender}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          setEditingKey={setEditingKey}
          selectionType="radio"
        />
        {total > 10 && (
          <PaginationTable
            onFirstPage={onFirstPage}
            current={current}
            onChange={onChange}
            total={total}
            onLastPage={onLastPage}
          />
        )}
      </S.Table>
    </S.Modal>
  );
};

export default RollbackHistory;
