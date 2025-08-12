import WarningIcon from '@/assets/images/svg/notification/warning.svg';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from './index.styles';

export const ExpiredRegister = () => {
  const router = useRouter();

  return (
    <>
      <S.Wrapper>
        <S.Card id="basic-table" padding="1rem 0rem">
          <S.WrapWarningIcon>
            <WarningIcon />
          </S.WrapWarningIcon>
          <S.Title>Oops, this link has expired</S.Title>
          <S.WrapDescription>
            <S.Description>
              You can not edit your company information anymore because your registration request
              has been approved.
            </S.Description>
            <S.Description>Please login with your account to keep using SuperBucket</S.Description>
          </S.WrapDescription>

          <S.ActionButton onClick={() => router.push('/?isOpenLogin=true')} type="primary">
            Go to Login Screen
          </S.ActionButton>
        </S.Card>
      </S.Wrapper>
      <S.pseudoHeight />
    </>
  );
};
