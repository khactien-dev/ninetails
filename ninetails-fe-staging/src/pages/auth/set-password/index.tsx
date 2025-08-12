import { SetPassWordForm } from '@/components/auth/set-password-form';
import { DEFAULT_LOCALE } from '@/constants';
import AuthLayout from '@/layouts/auth-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const SetPassWord = () => <SetPassWordForm />;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common', 'auth'])),
    },
  };
};

SetPassWord.layout = AuthLayout;
export default SetPassWord;
