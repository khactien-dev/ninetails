import SuperAdmin from '@/components/super-admin';
import { DEFAULT_LOCALE } from '@/constants';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const DashBoard = () => {
  return <SuperAdmin />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common'])),
  },
});

DashBoard.layout = SuperAdminLayout;

export default DashBoard;
