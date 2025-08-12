import IconNext from '@/assets/images/svg/icon-open_a1.svg';
import { ICoreDataSetConfig, ICoreDataTree } from '@/interfaces';
import React from 'react';

import * as S from './index.style';
import { useCustomTreeTable } from './index.utils';

interface IProps {
  dataSource: ICoreDataTree[];
  config: ICoreDataSetConfig | null;
  onSelectRoutes?: (v: string[]) => void;
  isAbleSelectRoute?: boolean;
  isPreview?: boolean;
  loading?: boolean;
}

export const CustomTreeTable: React.FC<IProps> = (props) => {
  const {
    dataSource,
    config,
    onSelectRoutes,
    isAbleSelectRoute = false,
    isPreview = false,
    loading = false,
  } = props;

  const { columnState, handleNextPage, handlePrevPage, canNext, canPrev } = useCustomTreeTable({
    dataSource,
    config,
    onSelectRoutes,
    isAbleSelectRoute,
  });

  return (
    <>
      {columnState && (
        <S.TableContainer>
          <S.WrapTable className="wrap-tree-table">
            <S.Table
              columns={columnState}
              dataSource={dataSource}
              pagination={false}
              bordered={false}
              size="middle"
              expandable={{
                defaultExpandAllRows: isPreview,
              }}
              loading={loading}
            />
          </S.WrapTable>

          {!isPreview && (
            <S.Pagination>
              <S.PreviousButton onClick={handlePrevPage} $disabled={!canPrev}>
                <IconNext />
              </S.PreviousButton>
              <S.NextButton onClick={handleNextPage} $disabled={!canNext}>
                <IconNext />
              </S.NextButton>
            </S.Pagination>
          )}
        </S.TableContainer>
      )}
    </>
  );
};
