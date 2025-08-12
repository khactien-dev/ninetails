import { BaseForm } from '@/components/common/forms/base-form';
import { PASSWORD_REGEX } from '@/constants';
import * as Auth from '@/layouts/auth-layout/index.styles';
import { formatPassword } from '@/utils';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import * as S from './index.styles';

export interface PassWordFormData {
  password: string;
  confirmPassword: string;
}

interface IProps {
  onSubmit: (values: PassWordFormData) => void;
  isSuccess: boolean;
  isLoading: boolean;
}

const rules = [
  '- 비밀번호는 8~ 32자의 영문 대소문자, 숫자, 특수문자를 조합하여 설정해 주세요.',
  '- 다른사이트에서 사용하는 것과 동일하거나 쉬운 비밀번호는 사용하지 마세요',
  '- 안전한 계정 사용을 위해 비밀번호는 주기적으로 변경해 주세요',
];

export const PassWordForm = ({ onSubmit, isSuccess, isLoading }: IProps) => {
  const [form] = Form.useForm();

  const router = useRouter();

  const url = window.location.href;

  useEffect(() => {
    form.resetFields();
  }, [url]);

  return (
    <Auth.FormWrapper>
      {!isSuccess ? (
        <BaseForm layout="vertical" onFinish={onSubmit} requiredMark="optional" form={form}>
          <S.Title>새로운 비밀번호를 입력해 주세요</S.Title>
          <Auth.FormItem
            name="password"
            label="새 비밀번호"
            normalize={formatPassword}
            rules={[
              { required: true, message: '이 필드는 필수입니다.' },
              {
                max: 32,
                message: '새 비밀번호 32자 이상이 될 수 없습니다.',
              },
              {
                pattern: PASSWORD_REGEX,
                message: '비밀번호가 충분히 강력하지 않습니다. 새 비밀번호로 다시 시도해 주세요.',
              },
            ]}
          >
            <Auth.FormInputPassword placeholder="비밀번호 (8~32자리)" />
          </Auth.FormItem>
          <Auth.FormItem
            name="confirmPassword"
            label="비밀번호 확인"
            dependencies={['password']}
            normalize={formatPassword}
            rules={[
              { required: true, message: '이 필드는 필수입니다.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value !== getFieldValue('password')) {
                    return Promise.reject(
                      new Error('비밀번호 확인이 일치하지 않습니다. 다시 시도해 주세요!')
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Auth.FormInputPassword placeholder="비밀번호 재입력" />
          </Auth.FormItem>
          <S.RuleList>
            {rules.map((v, i) => {
              return <S.RuleListItem key={i}>{v}</S.RuleListItem>;
            })}
          </S.RuleList>
          <BaseForm.Item noStyle>
            <S.SubmitButton type="primary" htmlType="submit" loading={isLoading}>
              완료
            </S.SubmitButton>
          </BaseForm.Item>
        </BaseForm>
      ) : (
        <S.SuccessWrapper>
          <S.SuccessWrapperTitle>비밀번호를 재설정이 완료되었습니다</S.SuccessWrapperTitle>
          <S.SuccessWrapperDescription>
            이제 새로운 비밀번호로 로그인해 주세요
          </S.SuccessWrapperDescription>
          <S.SubmitButton type="primary" onClick={() => router.replace('/')}>
            슈퍼버킷 홈으로 이동
          </S.SubmitButton>
        </S.SuccessWrapper>
      )}
    </Auth.FormWrapper>
  );
};
