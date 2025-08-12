import { useUserResetPasswordRequestMutate } from '@/hooks/features/useAuth';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { PassWordForm, PassWordFormData } from '../password-form';

export const NewPasswordForm = () => {
  const router = useRouter();
  const { mutate, isPending } = useUserResetPasswordRequestMutate();
  const [isShowSuccess, setIsShowSuccess] = useState(false);

  const codeURL = router.query.code;

  const handleSubmit = (values: PassWordFormData) => {
    mutate(
      {
        code: codeURL?.toString() ?? '',
        password: values.password,
      },
      {
        onSuccess() {
          setIsShowSuccess(true);
        },
      }
    );
  };

  useEffect(() => {
    if (router.isReady) {
      if (!codeURL) {
        router.push('/');
      }
    }
  }, [router, codeURL]);

  return <PassWordForm onSubmit={handleSubmit} isSuccess={isShowSuccess} isLoading={isPending} />;
};
