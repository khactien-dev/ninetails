import { useGetTenantRegisterQuery } from '@/hooks/features/useTenant';
import { useSearchParams } from 'next/navigation';
import React from 'react';

import Confirm from './confirm';
import { ExpiredRegister } from './expired-register';
import * as S from './index.styles';

export const ConfirmMemberShip = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { data: tenant, error } = useGetTenantRegisterQuery({
    enabled: !!token,
    token: token,
  });

  if (error) {
    return <ExpiredRegister />;
  }

  if (tenant?.data) {
    return <Confirm tenantData={tenant?.data} />;
  }

  return <S.Wrapper />;
};
