import BarIcon from '@/assets/images/settings/icon-bar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { TABLE_NAME, initialQueryValues, operator } from '@/constants';
import React from 'react';

import { ExportForm } from '../components/export-form';
import { ImportForm } from '../components/import-form';
import { QueryForm } from '../components/query-form';
import RollbackHistory from '../components/rollback-history';
import * as S from '../index.styles';
import useRoute from './index.utils';

const Route = () => {
  const {
    loading,
    columns,
    columnOptions,
    data,
    rowSelection,
    buttons,
    buttonsAction,
    isOpenImport,
    isOpenExport,
    isOpenRollback,
    formQuery,
    formImport,
    ref,
    isRollbackAble,
    selectedFile,
    handleRenderIcon,
    setIsOpenRollback,
    setIsOpenImport,
    setIsOpenExport,
    handleExport,
    handleImportRoute,
    handleFileChange,
    handleRemoveFile,
    handleQuery,
    refetch,
  } = useRoute();

  return (
    <>
      <S.Wrapper>
        {/* Query Form */}
        <QueryForm
          handleQuery={handleQuery}
          formQuery={formQuery}
          initialQueryValues={initialQueryValues}
          columnOptions={columnOptions}
          operator={operator}
          tableName={TABLE_NAME.ROUTE}
          loading={loading}
        />

        {/* Main Table */}
        <BaseRow gutter={24}>
          <BaseCol xs={24} md={12}>
            <S.FloatLeft>
              {buttonsAction?.map((button) => (
                <S.ButtonAdm
                  disabled={!button.isActive}
                  key={button.name}
                  $isActive={button.isActive}
                  $isOutline={button.isOutline}
                  onClick={button.onClick}
                  $isPrimary={button.isPrimary}
                >
                  <span>{button.name}</span>
                  {handleRenderIcon(button)}
                </S.ButtonAdm>
              ))}
              <S.ButtonAdm
                disabled={!isRollbackAble}
                $isActive={isRollbackAble}
                $isPrimary={false}
                $isOutline={true}
                onClick={() => setIsOpenRollback(true)}
                name={'리뷰'}
              >
                <span>
                  {'리뷰'}
                  <BarIcon />
                </span>
              </S.ButtonAdm>
            </S.FloatLeft>
          </BaseCol>
          <BaseCol xs={24} md={12}>
            <S.FloatRight>
              {buttons?.map((button) => (
                <S.ButtonAdm
                  disabled={!button.isActive}
                  key={button.name}
                  $isActive={button.isActive}
                  $isOutline={button.isOutline}
                  onClick={button.onClick}
                  $isPrimary={button.isPrimary}
                >
                  {handleRenderIcon(button)}
                  <span>{button.name}</span>
                </S.ButtonAdm>
              ))}
            </S.FloatRight>
          </BaseCol>
        </BaseRow>
        <div ref={ref}>
          <S.Table
            loading={loading}
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
            scroll={{
              scrollToFirstRowOnChange: false,
              y: 250,
            }}
            pagination={false}
          />
        </div>
      </S.Wrapper>

      {/* Rollback History */}
      <RollbackHistory
        isOpenRollback={isOpenRollback}
        setIsOpenRollback={setIsOpenRollback}
        tableName={TABLE_NAME.ROUTE}
        refetch={refetch}
      />

      {/* Import Form */}
      <ImportForm
        open={isOpenImport}
        onCancel={() => setIsOpenImport(false)}
        onFinish={handleImportRoute}
        form={formImport}
        selectedFile={selectedFile}
        beforeUpload={handleFileChange}
        onRemove={handleRemoveFile}
        tableName={TABLE_NAME.ROUTE}
      />

      {/* Export Form */}
      <ExportForm
        open={isOpenExport}
        onCancel={() => setIsOpenExport(false)}
        handleExport={handleExport}
        tableName={TABLE_NAME.ROUTE}
      />
    </>
  );
};

export default Route;
