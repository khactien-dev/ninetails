import { TabsItem } from '@/interfaces';
import { ButtonItem } from '@/interfaces/settings';
import React, { Key, ReactNode } from 'react';

import TableSetting from './Table';
import FilterTable from './filterTable';
import * as S from './index.style';

export interface TableSettingsProps {
  isLoading?: boolean;
  tableName?: string | any;
  buttonArr?: ButtonItem[] | null;
  menus?: any;
  columns?: any;
  data?: any;
  expandedRowRender?: (record: any) => ReactNode;
  expandedRowKeys?: string[];
  setExpandedRowKeys?: (data: string[]) => void;
  setEditingKey?: React.Dispatch<React.SetStateAction<string>>;
  handleSelectChange?: (selectedRowKeys: Key[]) => void;
  selectedRows?: Key[];
  isSuperAdmin?: boolean;
  isLeftMenu?: boolean;
  children?: React.ReactNode;
  searchDate?: React.ReactNode;
  tabsArr?: TabsItem[];
  showCheckbox?: boolean;
}

const TableSettings = ({
  isLoading,
  tableName,
  buttonArr,
  columns,
  data,
  expandedRowRender,
  selectedRows,
  expandedRowKeys,
  setExpandedRowKeys,
  setEditingKey,
  handleSelectChange,
  searchDate,
  showCheckbox,
  isSuperAdmin = false,
  tabsArr = [],
}: TableSettingsProps) => {
  return (
    <S.SettingWrapper>
      <S.AdmContentWrap className="base-table-setting-container">
        <S.Box>
          <S.BoxTitleRow>
            <S.BoxTitle>
              {tableName ? (React.isValidElement(searchDate) ? searchDate : tableName) : null}
            </S.BoxTitle>
            <S.SearchAndFilterWrapper>
              <S.FilterTableWrapper>
                <FilterTable
                  tabsArr={tabsArr}
                  isSuperAdmin={isSuperAdmin}
                  buttonArr={buttonArr || []}
                />
              </S.FilterTableWrapper>
            </S.SearchAndFilterWrapper>
            <S.Table>
              <TableSetting
                isLoading={isLoading}
                handleSelectChange={handleSelectChange}
                columns={columns}
                data={data}
                selectedRows={selectedRows}
                expandedRowRender={expandedRowRender}
                expandedRowKeys={expandedRowKeys}
                setExpandedRowKeys={setExpandedRowKeys}
                setEditingKey={setEditingKey}
                showCheckbox={showCheckbox}
              />
            </S.Table>
          </S.BoxTitleRow>
        </S.Box>
      </S.AdmContentWrap>
    </S.SettingWrapper>
  );
};
export default TableSettings;
