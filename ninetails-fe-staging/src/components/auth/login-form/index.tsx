import { BaseForm } from '@/components/common/forms/base-form';
import { useLoginMutate } from '@/hooks/features/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { LoginResponse, ResponseData } from '@/interfaces';
import * as Auth from '@/layouts/auth-layout/index.styles';
import { setCredentials } from '@/stores/auth/auth.slice';
import { useAppDispatch } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import { Form } from 'antd';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from './index.styles';

interface LoginFormData {
  username: string;
  password: string;
}

export const initValues: LoginFormData = {
  username: '',
  password: '',
};

export const LoginForm: React.FC = () => {
  const { t } = useTranslation(['auth', 'commons']);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { push } = useRouter();
  const { notification } = useFeedback();
  const { mutate, isPending } = useLoginMutate();

  const handleSubmit = (values: LoginFormData) => {
    mutate(values, {
      onSuccess(responses: ResponseData<LoginResponse>) {
        cookies.set('access_token', responses.data?.accessToken);
        dispatch(
          setCredentials({
            user: responses.data as any,
            token: responses.data?.accessToken,
          })
        );
        push('/');
        notification.success({ message: t('login.loginSuccess') });
      },
    });
  };

  return (
    <Auth.FormWrapper>
      <BaseForm
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
        initialValues={initValues}
      >
        <Auth.FormTitle>{t('login', { ns: 'common' })}</Auth.FormTitle>
        <S.LoginDescription>{t('login.loginInfo')}</S.LoginDescription>
        <Auth.FormItem
          name="username"
          label={t('email', { ns: 'common' })}
          rules={[
            { required: true, message: t('validate.requiredField', { ns: 'common' }) },
            // {
            //   type: 'string',
            //   message: t('validate.notValidEmail', { ns: 'common' }),
            // },
            {
              max: 64,
              message: '이메일 64자 이상이 될 수 없습니다.',
            },
          ]}
        >
          <Auth.FormInput placeholder={t('email', { ns: 'common' })} />
        </Auth.FormItem>
        <Auth.FormItem
          label={t('password', { ns: 'common' })}
          name="password"
          rules={[{ required: true, message: t('validate.requiredField', { ns: 'common' }) }]}
        >
          <Auth.FormInputPassword placeholder={t('password', { ns: 'common' })} />
        </Auth.FormItem>
        <Auth.ActionsWrapper>
          <BaseForm.Item name="rememberMe" valuePropName="checked" noStyle>
            <Auth.FormCheckbox>
              <S.RememberMeText>{t('login.rememberMe')}</S.RememberMeText>
            </Auth.FormCheckbox>
          </BaseForm.Item>
          <Link href="/auth/forgot-password">
            <S.ForgotPasswordText>{t('forgotPass', { ns: 'common' })}</S.ForgotPasswordText>
          </Link>
        </Auth.ActionsWrapper>
        <BaseForm.Item noStyle>
          <Auth.SubmitButton type="primary" htmlType="submit" loading={isPending}>
            {t('login', { ns: 'common' })}
          </Auth.SubmitButton>
        </BaseForm.Item>

        <Auth.FooterWrapper>
          <Auth.Text>
            {t('login.noAccount')}{' '}
            <Link href="/auth/register">
              <Auth.LinkText>{t('here', { ns: 'common' })}</Auth.LinkText>
            </Link>
          </Auth.Text>
        </Auth.FooterWrapper>
      </BaseForm>
    </Auth.FormWrapper>
  );
};
