import PrevPageIcon from '@/assets/images/settings/pagination/nav-back-s-l.svg';
import NextPageIcon from '@/assets/images/settings/pagination/nav-back-s-r.svg';
import LastPageIcon from '@/assets/images/settings/pagination/pb1.svg';
import FirstPageIcon from '@/assets/images/settings/pagination/pb2.svg';
import { Pagination } from 'antd';
import { useEffect } from 'react';
import React from 'react';

import * as S from './index.style';

interface PaginationTableProps {
  onFirstPage: () => void;
  current: number;
  onChange: (page: number, pageSize: number) => void;
  total: number;
  onLastPage: () => void;
}

const PaginationTable = ({
  onFirstPage,
  current,
  onChange,
  total,
  onLastPage,
}: PaginationTableProps) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [current]);

  return (
    <S.PaginationWrapper>
      <Pagination
        showSizeChanger={false}
        current={current}
        onChange={onChange}
        total={total}
        itemRender={(_, type, originalElement) => {
          if (type === 'prev') {
            return (
              <S.BtnWrapper>
                <div
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onFirstPage();
                  }}
                >
                  <FirstPageIcon />
                </div>

                <div>
                  <PrevPageIcon />
                </div>
              </S.BtnWrapper>
            );
          }
          if (type === 'next') {
            return (
              <S.BtnWrapper>
                <div>
                  <NextPageIcon />
                </div>

                <div
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onLastPage();
                  }}
                >
                  <LastPageIcon />
                </div>
              </S.BtnWrapper>
            );
          }
          return originalElement;
        }}
      />
    </S.PaginationWrapper>
  );
};

export default PaginationTable;
