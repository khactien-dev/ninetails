import HomeComponent from '@/components/home';
import { DEFAULT_LOCALE } from '@/constants';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const Home = () => {
  return (
    <>
      <HomeComponent />
    </>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common'])),
  },
});

export default Home;
