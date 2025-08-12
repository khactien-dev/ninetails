import IllegalStatus from '@/components/illegal-status';
import { DEFAULT_LOCALE } from '@/constants';
import AdminLayout from '@/layouts/admin-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import { NavermapsProvider } from 'react-naver-maps';

const IllegalPage = () => {
  return (
    <NavermapsProvider ncpClientId={process.env.NEXT_PUBLIC_NAVER_API_KEY || ''}>
      <IllegalStatus />
    </NavermapsProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common'])),
  },
});

IllegalPage.layout = AdminLayout;

export default IllegalPage;
