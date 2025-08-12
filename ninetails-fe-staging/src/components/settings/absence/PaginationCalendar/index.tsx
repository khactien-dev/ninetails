import FirstPageIcon from '@/assets/images/svg/icon-first.svg';
import LastPageIcon from '@/assets/images/svg/icon-last.svg';
import NextPageIcon from '@/assets/images/svg/icon-next.svg';
import PrevPageIcon from '@/assets/images/svg/icon-pre.svg';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import React, { useCallback, useState } from 'react';

import * as S from './index.styles';

interface PaginationProps {
  onChangeMonth: (direction: number) => void;
  currentMonth: Dayjs;
  isHideButton: boolean;
}

enum CHANGE_MONTH {
  PRE_SIX_MONTH = -6,
  PRE_MONTH = -1,
  NEXT_MONTH = 1,
  NEXT_SIX_MONTH = 6,
  NEXT_ONE_YEAR = 12,
  PRE_ONE_YEAR = -12,
}

const PaginationCalendar: React.FC<PaginationProps> = ({
  onChangeMonth,
  currentMonth,
  isHideButton,
}) => {
  const [disabledButton, setDisabledButton] = useState<'PRE_SIX' | 'NEXT_SIX' | null>(null);

  const handleChangeMonth = useCallback(
    (change: CHANGE_MONTH, buttonToDisable: 'PRE_SIX' | 'NEXT_SIX' | null = null) => {
      onChangeMonth(change);
      setDisabledButton(buttonToDisable);
    },
    [onChangeMonth]
  );

  const renderPaginationButton = useCallback(
    (icon: React.ReactNode, change: CHANGE_MONTH) => (
      <div onClick={() => handleChangeMonth(change)}>{icon}</div>
    ),
    [handleChangeMonth]
  );

  const year = currentMonth.format('YYYY') + '년';
  const month = currentMonth.format('MMMM');

  return (
    <div>
      <S.PaginationWrap>
        {renderPaginationButton(<FirstPageIcon />, CHANGE_MONTH.PRE_ONE_YEAR)}
        {renderPaginationButton(<PrevPageIcon />, CHANGE_MONTH.PRE_MONTH)}
        <S.LabelDate>{`${year} ${month}`}</S.LabelDate>
        {renderPaginationButton(<NextPageIcon />, CHANGE_MONTH.NEXT_MONTH)}
        {renderPaginationButton(<LastPageIcon />, CHANGE_MONTH.NEXT_ONE_YEAR)}
      </S.PaginationWrap>
      {isHideButton && (
        <S.Flex>
          <S.ButtonPagination
            $type="prev"
            $isDisabled={disabledButton !== 'PRE_SIX'}
            onClick={() => handleChangeMonth(CHANGE_MONTH.PRE_SIX_MONTH, 'PRE_SIX')}
          >
            <PrevPageIcon />
            6개월
          </S.ButtonPagination>
          <S.ButtonPagination
            $type="next"
            $isDisabled={disabledButton !== 'NEXT_SIX'}
            onClick={() => handleChangeMonth(CHANGE_MONTH.NEXT_SIX_MONTH, 'NEXT_SIX')}
          >
            6개월
            <NextPageIcon />
          </S.ButtonPagination>
        </S.Flex>
      )}
    </div>
  );
};

export default React.memo(PaginationCalendar);
