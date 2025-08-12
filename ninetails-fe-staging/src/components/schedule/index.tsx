import LeftContent from '@/layouts/admin-layout/content/left-content';
import React from 'react';

import ScheduleProvider from './context';
import * as S from './index.styles';
import LeftSchedule from './left-content';
import { ScheduleTab } from './schedule-tab';

const Schedule: React.FC = () => {
  return (
    <ScheduleProvider>
      <S.PageWrapper>
        <LeftContent width={364}>
          <LeftSchedule />
        </LeftContent>

        <S.WrapContent>
          <S.Box>
            <ScheduleTab />
          </S.Box>
        </S.WrapContent>
      </S.PageWrapper>
    </ScheduleProvider>
  );
};

export default Schedule;
