import SuperAdminSetting from '@/components/super-admin/setting';
import { DEFAULT_LOCALE } from '@/constants';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const Setting = () => {
  return <SuperAdminSetting />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common'])),
  },
});

Setting.layout = SuperAdminLayout;

export default Setting;
