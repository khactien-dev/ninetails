import SearchIcon from '@/assets/images/settings/icon-magnify-glass.svg';
import LeftMenu from '@/components/settings/left-menu';
import { MENU } from '@/constants/settings';
import { PaginationParams, TabsItem } from '@/interfaces';
import { ButtonItem } from '@/interfaces/settings';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { MainFooter } from '@/layouts/admin-layout/footer';
import { RowSelectionType } from 'antd/es/table/interface';
import React, { Key, ReactNode, useEffect, useState } from 'react';

import PaginationTable from '../pagination';
import TableSetting from './Table';
import FilterTable from './filterTable';
import * as S from './index.style';

export interface TableSettingsProps {
  isLoading?: boolean;
  tableName: string;
  buttonArr: ButtonItem[] | null;
  menus?: any;
  handleSortColumn?: (params: PaginationParams) => void;
  handleSelectChange: (selectedRowKeys: Key[]) => void;
  columns: any;
  data: any;
  expandedRowRender: (record: any) => ReactNode;
  expandedRowKeys: string[];
  setExpandedRowKeys: (data: string[]) => void;
  setEditingKey: React.Dispatch<React.SetStateAction<string>>;
  onFirstPage: () => void;
  currentPage: number;
  onChange: (page: number, pageSize: number) => void;
  total: number;
  onLastPage: () => void;
  selectedRows?: Key[];
  isSuperAdmin?: boolean;
  isLeftMenu?: boolean;
  children?: React.ReactNode;
  searchDate?: React.ReactNode;
  tabsArr?: TabsItem[];
  hasFooter?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  selectionType?: RowSelectionType;
  searchPlaceholder?: string;
}

const TableSettings = ({
  isLoading,
  tableName,
  buttonArr,
  handleSelectChange,
  handleSortColumn,
  columns,
  data,
  expandedRowRender,
  selectedRows,
  expandedRowKeys,
  setExpandedRowKeys,
  setEditingKey,
  onFirstPage,
  currentPage,
  onChange,
  total,
  onLastPage,
  isSuperAdmin = false,
  menus = MENU,
  tabsArr = [],
  isLeftMenu = true,
  children,
  searchDate = null,
  hasFooter = false,
  searchValue,
  onSearchChange,
  showSearch = false,
  selectionType,
  searchPlaceholder,
}: TableSettingsProps) => {
  const [inputValue, setInputValue] = useState(searchValue || '');
  useEffect(() => {
    setInputValue(searchValue || '');
  }, [searchValue]);
  return (
    <S.SettingWrapper>
      {isLeftMenu && (
        <LeftContent isSuperAdmin={isSuperAdmin} hasCollapseBtn={false} width={364}>
          <LeftMenu isSuperAdmin={isSuperAdmin} menus={menus} /> : <>{children}</>
        </LeftContent>
      )}
      <S.AdmContentWrap>
        <S.Box>
          <S.BoxTitleRow>
            <S.BoxTitle>
              {!React.isValidElement(searchDate) ? tableName || '사용자 그룹 관리' : searchDate}
            </S.BoxTitle>
            <S.SearchAndFilterWrapper>
              {showSearch && (
                <S.SearchInputWrapper>
                  <S.SearchInput
                    prefix={<SearchIcon />}
                    placeholder={searchPlaceholder}
                    value={inputValue}
                    maxLength={200}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                  />
                </S.SearchInputWrapper>
              )}

              <S.FilterTableWrapper>
                <FilterTable tabsArr={tabsArr} isSuperAdmin={isSuperAdmin} buttonArr={buttonArr} />
              </S.FilterTableWrapper>
            </S.SearchAndFilterWrapper>
            <S.Table>
              <TableSetting
                isLoading={isLoading}
                handleSortColumn={handleSortColumn}
                handleSelectChange={handleSelectChange}
                columns={columns}
                data={data}
                selectedRows={selectedRows}
                expandedRowRender={expandedRowRender}
                expandedRowKeys={expandedRowKeys}
                setExpandedRowKeys={setExpandedRowKeys}
                setEditingKey={setEditingKey}
                selectionType={selectionType}
              />
              {total > 0 && (
                <PaginationTable
                  onFirstPage={onFirstPage}
                  current={currentPage}
                  onChange={onChange}
                  total={total}
                  onLastPage={onLastPage}
                />
              )}
            </S.Table>
          </S.BoxTitleRow>
        </S.Box>

        {hasFooter && <MainFooter isShow={true}></MainFooter>}
      </S.AdmContentWrap>
    </S.SettingWrapper>
  );
};
export default TableSettings;
