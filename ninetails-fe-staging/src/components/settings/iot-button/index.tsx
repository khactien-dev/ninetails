import TableSettings from '@/components/settings/table';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';

import * as S from './index.style';
import { useIotButtonTable } from './index.utils';

const IotButton = () => {
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
  } = useIotButtonTable();
  const menus = useSettingMenusPermissions();

  return (
    <S.TableWrapper>
      <TableSettings
        tableName="엣지서버 관리"
        buttonArr={buttons}
        handleSelectChange={handleSelectChange}
        columns={columns}
        data={data}
        menus={menus}
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

export default IotButton;
