import BackupDataModal from '@/components/backup-data';
import { Header } from '@/components/header';
import { USER_ROLE } from '@/constants/settings';
import { useGetTenantDetailForOpQuery } from '@/hooks/features/useTenant';
import { isTwoColumns, toggleBackupData } from '@/stores/app/app.slice';
import { selectCurrentUser, setUserOperationInfo } from '@/stores/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { sessionGetBackupData } from '@/utils/sessionStorage';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

import MainContent from './content';
import { MainHeader } from './header';
import * as S from './index.styles';
import MainSider from './sider';

interface AppLayoutProps {
  children: React.ReactNode;
}

function isLessThanSevenDays(expirationDateString?: string) {
  if (!expirationDateString) return false;
  const differenceInDays = dayjs(expirationDateString)
    .startOf('day')
    .diff(dayjs().startOf('day'), 'day');
  return differenceInDays <= 6;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isTwoColumnsLayout = useAppSelector(isTwoColumns);
  const [siderCollapsed, setSiderCollapsed] = useState(true);
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useGetTenantDetailForOpQuery();
  const { query, isReady } = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const toggleSider = () => setSiderCollapsed(!siderCollapsed);

  const contract = useMemo(() => {
    const contracts = data?.data?.contracts;
    return contracts && contracts?.length > 0
      ? {
          data: contracts[contracts.length - 1],
          email: data?.data?.email,
          organization: data?.data?.organization,
          is_backup: data.data.is_backup,
        }
      : null;
  }, [data]);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUserOperationInfo(data.data));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    if (isReady) {
      if (
        user &&
        user.role === USER_ROLE.OP &&
        contract &&
        isLessThanSevenDays(contract?.data.end_date) &&
        !contract.is_backup &&
        !sessionGetBackupData() &&
        !query.opId &&
        !query.schema
      ) {
        dispatch(toggleBackupData());
      }
    }
  }, [contract, query, isReady, user]);

  return (
    <S.LayoutMaster>
      <MainSider isCollapsed={siderCollapsed} setCollapsed={setSiderCollapsed} />
      <S.LayoutMain>
        <MainHeader isTwoColumnsLayout={false}>
          <Header
            toggleSider={toggleSider}
            isSiderOpened={!siderCollapsed}
            isTwoColumnsLayout={false}
          />
        </MainHeader>
        <MainContent id="main-content" $isTwoColumnsLayout={isTwoColumnsLayout}>
          {children}
        </MainContent>
      </S.LayoutMain>
      {contract && <BackupDataModal contract={contract} />}
    </S.LayoutMaster>
  );
};

export default AppLayout;
