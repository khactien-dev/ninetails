import { NewPasswordForm } from '@/components/auth/new-password-form';
import { DEFAULT_LOCALE } from '@/constants';
import AuthLayout from '@/layouts/auth-layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const NewPassWord = () => {
  return <NewPasswordForm />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LOCALE, ['common', 'auth'])),
    },
  };
};
NewPassWord.layout = AuthLayout;
export default NewPassWord;
