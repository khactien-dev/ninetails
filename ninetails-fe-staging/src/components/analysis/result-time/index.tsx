import { useAnalysisContext } from '@/components/analysis/context';
import { DATE_FORMAT } from '@/constants';
import dayjs from 'dayjs';
import React from 'react';

import * as S from '../index.styles';

export const ResultTime = () => {
  const { params } = useAnalysisContext();
  const startDate = dayjs(params.startDate).format(DATE_FORMAT.DATE_KOREA);
  const endDate = dayjs(params.endDate).format(DATE_FORMAT.DATE_KOREA);

  return (
    <S.FilterResult>
      <span>{'기간:'}</span>
      {`${startDate} ~ ${endDate}`}
    </S.FilterResult>
  );
};
