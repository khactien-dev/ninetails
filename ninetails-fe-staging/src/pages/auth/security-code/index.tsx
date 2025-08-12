import { SecurityCodeForm } from '@/components/auth/security-form';
import { DEFAULT_LOCALE } from '@/constants';
import AuthLayout from '@/layouts/auth-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const Login = () => {
  return <SecurityCodeForm />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common', 'auth'])),
    },
  };
};
Login.layout = AuthLayout;
export default Login;
