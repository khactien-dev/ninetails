import { useChangePasswordTemp } from '@/hooks/features/useAuth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { PassWordForm, PassWordFormData } from '../password-form';

export const SetPassWordForm = () => {
  const { mutate, isPending } = useChangePasswordTemp();
  const router = useRouter();
  const [isShowSuccess, setIsShowSuccess] = useState(false);
  const token = router.query.token;

  const handleSubmit = (values: PassWordFormData) => {
    mutate(
      { password: values.password, token: token?.toString() ?? '' },
      {
        onSuccess() {
          setIsShowSuccess(true);
        },
      }
    );
  };

  useEffect(() => {
    if (router.isReady) {
      if (!token) {
        router.push('/');
      }
    }
  }, [router, token]);

  return <PassWordForm onSubmit={handleSubmit} isSuccess={isShowSuccess} isLoading={isPending} />;
};
