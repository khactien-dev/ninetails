import { useGetUserDetailQuery } from '@/hooks/features/useAuth';
import { setCredentials } from '@/stores/auth/auth.slice';
import { useAppDispatch } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import React, { PropsWithChildren, useEffect } from 'react';

const Authentication: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch();
  const access_token = cookies.get('access_token');
  const { isSuccess, data } = useGetUserDetailQuery({ access_token });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data?.data, token: '' }));
    }
  }, [isSuccess, data, dispatch]);

  return <>{children}</>;
};

export default Authentication;
