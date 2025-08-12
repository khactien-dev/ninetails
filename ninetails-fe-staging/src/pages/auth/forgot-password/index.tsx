import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { DEFAULT_LOCALE } from '@/constants';
import AuthLayout from '@/layouts/auth-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const Login = () => {
  return <ForgotPasswordForm />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common', 'forms', 'auth'])),
    },
  };
};
Login.layout = AuthLayout;
export default Login;
