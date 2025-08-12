import { BaseForm } from '@/components/common/forms/base-form';
import DeactivatedAccountModal from '@/components/home/deactivated-account';
import {
  useUserForgotPasswordMutate,
  useUserForgotPasswordVerifyTokenRequestMutate,
} from '@/hooks/features/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { RESPONSE_CODE } from '@/interfaces';
import * as Auth from '@/layouts/auth-layout/index.styles';
import { checkAllspace, checkEmoji, checkPhoneNumber, formatPhone, validateEmoji } from '@/utils';
import { Form, Input } from 'antd';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import Countdown, { CountdownApi, zeroPad } from 'react-countdown';
import { CountdownRenderProps } from 'react-countdown/dist/Countdown';

import * as S from './index.styles';

interface ForgotPasswordFormData {
  code: string;
  email: string;
  phone_number: string;
  option: string;
  full_name: string;
}

export const ForgotPasswordForm: React.FC = () => {
  const [enableOTPButton, setEnableOTPButton] = useState(false);
  const [isShowValidateOTPInput, setIsShowValidateOTPInput] = useState(false);
  const [isCountDown, setIsCountDown] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { mutate, isPending } = useUserForgotPasswordMutate();
  const { mutate: verifyMutate, isPending: isPendingVerify } =
    useUserForgotPasswordVerifyTokenRequestMutate();
  const [isOpenDeactiveAccountModal, setIsOpenDeactiveAccountModal] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const { notification } = useFeedback();

  const handlePhoneAuthClick = () => {
    form.resetFields();
    setIsShowValidateOTPInput(false);
    setIsCountDown(false);
    setShowPhoneNumber((prev) => {
      if (prev) {
        form.setFields([{ name: 'phone_number', value: '' }]);
      } else {
        form.setFields([{ name: 'email', value: '' }]);
      }
      return !prev;
    });
  };

  const handleSubmit = (values: ForgotPasswordFormData) => {
    if (!isShowValidateOTPInput) {
      const errors = [];
      if (showPhoneNumber) {
        errors.push({ name: 'phone_number', errors: ['전화번호를 인증해야 합니다!'] });
      } else {
        errors.push({ name: 'email', errors: ['이메일 인증이 필요합니다!'] });
      }
      form.setFields(errors);
      return;
    }
    const inValues = { ...values, option: showPhoneNumber ? 'phone' : 'email' };

    verifyMutate(inValues, {
      onSuccess(response) {
        router.replace({
          pathname: `/auth/new-password`,
          query: { code: response.data.code },
        });
      },
    });
  };
  const countdownTimer = useMemo(() => {
    return Date.now() + 5 * 60 * 1000;
  }, [isCountDown]);

  const sendOTP = () => {
    form.validateFields(['full_name', 'email', 'phone_number']).then(() => {
      if (countdownApi) {
        countdownApi.stop();
        countdownApi.start();
      }
      mutate(
        {
          option: showPhoneNumber ? 'phone' : 'email',
          ...(showPhoneNumber
            ? { phone_number: form.getFieldValue('phone_number') }
            : { email: form.getFieldValue('email') }),
          full_name: form.getFieldValue('full_name'),
        },
        {
          onSuccess() {
            setIsCountDown(true);
            setIsShowValidateOTPInput(true);
            setEnableOTPButton(false);
            form.setFields([{ name: showPhoneNumber ? 'phone_number' : 'email', errors: [] }]);
          },
          onError(error: any) {
            const { data } = error;
            setIsCountDown(false);
            setIsShowValidateOTPInput(false);
            if (error.status === RESPONSE_CODE.BAD_REQUEST) {
              notification.error({ message: data.message });
            }

            if (error?.status === RESPONSE_CODE.PERMISSION) {
              setIsOpenDeactiveAccountModal(true);
            }

            if (error?.status === RESPONSE_CODE.NOT_FOUND) {
              const isPhoneNumber = form.getFieldValue('phone_number');
              notification.error({
                message: isPhoneNumber
                  ? 'SuperBucket 사용자와 전화번호가 일치하지 않습니다. 다시 시도해 주세요!'
                  : 'SuperBucket 사용자와 이메일이 일치하지 않습니다. 다시 시도해 주세요!',
              });
            }
          },
        }
      );
    });
  };
  // Watch all values
  const values = Form.useWatch([], form);

  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setEnableOTPButton(true))
      .catch(() => setEnableOTPButton(false));
  }, [form, values?.email, values?.full_name, values?.phone_number]);

  const renderer = ({ minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) {
      setIsCountDown(false);
      // Render a completed state
      return <></>;
    } else {
      // Render a countdown
      return (
        <span>
          ({zeroPad(minutes)}:{zeroPad(seconds)})
        </span>
      );
    }
  };
  let countdownApi: CountdownApi | null = null;
  const setRef = (countdown: Countdown | null): void => {
    if (countdown) {
      countdownApi = countdown.getApi();
    }
  };

  return (
    <Auth.FormWrapper>
      <BaseForm form={form} layout="vertical" onFinish={handleSubmit}>
        <Auth.FormTitle>슈퍼버킷 계정의 비밀번호를 재설정합니다</Auth.FormTitle>
        <Auth.FormDescription>
          슈퍼버킷을 사용 중인 전화번호 또는 이메일을 입력해 주세요
        </Auth.FormDescription>
        <Auth.FormItem
          required
          name="full_name"
          label="슈퍼버킷 사용자"
          rules={[
            { required: true, message: '이 필드는 필수입니다.' },
            { whitespace: true, message: '이 필드는 필수입니다.' },
            { max: 200, message: '슈퍼버킷 사용자 200자 이상이 될 수 없습니다.' },
            ({ setFieldValue }) => ({
              validator(_, value) {
                if (!value || !validateEmoji(value)) {
                  return Promise.resolve();
                }
                setFieldValue('full_name', value.slice(0, value.length - 2));
                return Promise.reject(new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!'));
              },
            }),
          ]}
        >
          <Auth.FormInput placeholder="이름 입력" />
        </Auth.FormItem>
        {!showPhoneNumber && (
          <Auth.FormItem
            required
            name="email"
            label={isShowValidateOTPInput ? '휴대폰 번호 또는 이메일' : '이메일'}
            rules={[
              { required: true, message: '이 필드는 필수입니다.' },
              { max: 64, message: '이메일 64자 이상이 될 수 없습니다.' },
              ({ setFieldValue }) => ({
                validator(_, value) {
                  if (!value || !validateEmoji(value)) {
                    return Promise.resolve();
                  }
                  setFieldValue('email', value.slice(0, value.length - 2));
                  return Promise.reject(new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!'));
                },
              }),
              {
                pattern: new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
                message: '유효한 이메일 주소를 입력해 주세요.',
              },
            ]}
          >
            <Input
              placeholder="이메일"
              disabled={isShowValidateOTPInput}
              suffix={
                <S.SendOTPButton
                  size="small"
                  type="primary"
                  loading={enableOTPButton && isPending}
                  disabled={isShowValidateOTPInput}
                  onClick={sendOTP}
                >
                  인증요청
                </S.SendOTPButton>
              }
            />
          </Auth.FormItem>
        )}
        {showPhoneNumber && (
          <Auth.FormItem
            required
            name="phone_number"
            label={isShowValidateOTPInput ? '휴대폰 번호 또는 이메일' : '휴대폰 번호'}
            normalize={formatPhone}
            rules={[
              { required: true, message: '이 필드는 필수입니다.' },
              {
                max: 14,
                message: '유효한 전화번호를 입력해 주세요',
              },
              checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
              checkAllspace('이 필드는 필수입니다.'),
            ]}
          >
            <Input
              placeholder="숫자만 입력"
              disabled={isShowValidateOTPInput}
              suffix={
                <S.SendOTPButton
                  size="small"
                  type="primary"
                  loading={enableOTPButton && isPending}
                  disabled={isShowValidateOTPInput}
                  onClick={sendOTP}
                >
                  인증요청
                </S.SendOTPButton>
              }
            />
          </Auth.FormItem>
        )}
        {isShowValidateOTPInput && (
          <>
            <Auth.FormItem
              required
              name="code"
              label="인증번호"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  pattern: new RegExp(/^\d{1,6}$/),
                  message: '유효한 인증 코드를 입력해 주세요',
                },
              ]}
            >
              <Auth.FormInput placeholder="인증번호 입력" />
            </Auth.FormItem>
            <S.ResendWrapper>
              <p>
                {showPhoneNumber ? '인증 메시지를 받지 못하셨나요?' : '인증메일을 받지 못하셨나요?'}
              </p>
              <S.ResendAction onClick={sendOTP} $isActive={!isCountDown}>
                재전송
              </S.ResendAction>
              {isCountDown && <Countdown ref={setRef} date={countdownTimer} renderer={renderer} />}
            </S.ResendWrapper>
          </>
        )}
        <BaseForm.Item noStyle>
          <S.SubmitButton type="primary" htmlType="submit" loading={isPendingVerify}>
            다음
          </S.SubmitButton>
        </BaseForm.Item>
        <S.InfoText onClick={handlePhoneAuthClick}>
          {showPhoneNumber ? '이메일로 인증' : '휴대폰 번호로 인증'}
        </S.InfoText>
      </BaseForm>

      <DeactivatedAccountModal
        isOpen={isOpenDeactiveAccountModal}
        toggleIsOpen={setIsOpenDeactiveAccountModal}
        handleConfirm={() => setIsOpenDeactiveAccountModal(false)}
      />
    </Auth.FormWrapper>
  );
};
