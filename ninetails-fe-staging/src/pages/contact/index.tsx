import Contact from '@/components/contact';
import { DEFAULT_LOCALE } from '@/constants';
import MainLayout from '@/layouts/main-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const Home = () => {
  return <Contact />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common'])),
    },
  };
};

Home.layout = MainLayout;
export default Home;
