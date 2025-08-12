import TableSettings from '@/components/settings/table';

import * as S from './index.style';
import { useClusterTable } from './index.utils';

const Cluster = () => {
  const {
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
  } = useClusterTable();

  return (
    <S.TableWrapper>
      <TableSettings
        tableName="엣지서버 관리"
        buttonArr={buttons}
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
    </S.TableWrapper>
  );
};

export default Cluster;
