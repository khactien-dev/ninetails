import Logo from '@/assets/images/common/sb_logo3.png';
import { BaseForm } from '@/components/common/forms/base-form';
import { RESPONSE_CODE, ROUTER_PATH } from '@/constants';
import { USER_ROLE } from '@/constants/settings';
import { useUserLoginMutate } from '@/hooks/features/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { LoginRequest, ResponseData, UserLoginResponse } from '@/interfaces';
import { setCredentials } from '@/stores/auth/auth.slice';
import { useAppDispatch } from '@/stores/hooks';
import cookies from '@/utils/cookie';
import { Form } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import DeactivatedAccountModal from '../deactivated-account';
import s from '../index.module.css';
import * as S from './login.styles';

interface HomePageLoginProps {
  toggleOpen: () => void;
}

export const HomePageLogin: React.FC<HomePageLoginProps> = ({ toggleOpen }) => {
  const { mutate } = useUserLoginMutate();
  const dispatch = useAppDispatch();
  const { notification } = useFeedback();
  const { push } = useRouter();
  const [form] = Form.useForm();
  const [isOpenDeactiveAccountModal, setIsOpenDeactiveAccountModal] = useState(false);

  const handleConfirm = () => {
    setIsOpenDeactiveAccountModal(false);
  };

  const handleSubmit = (values: LoginRequest) => {
    mutate(values, {
      onSuccess(responses: ResponseData<UserLoginResponse>) {
        const userRole = responses?.data?.role;
        cookies.set('access_token', responses.data?.accessToken);
        cookies.set('refreshToken', responses.data?.refreshToken);
        dispatch(
          setCredentials({
            user: responses.data?.user,
            token: responses.data?.accessToken,
          })
        );

        notification.success({ message: '로그인 성공!' });
        if (userRole && userRole == USER_ROLE.ADMIN) {
          return push('/super-admin');
        }
        if (responses.data?.permission?.dashboard?.includes('read')) {
          return push('/admin/dashboard');
        }

        return push('/');
      },
      onError(error: any) {
        const { data } = error;

        if (data?.first_login) {
          router.push({
            pathname: ROUTER_PATH.SET_PASSWORD,
            query: {
              token: data.token,
            },
          });
          return;
        }

        if (error.status === RESPONSE_CODE.BAD_REQUEST) {
          notification.error({ message: data.message });
        }

        if (error.status === RESPONSE_CODE.PERMISSION) {
          setIsOpenDeactiveAccountModal(true);
        }

        if (error?.status === RESPONSE_CODE.NOT_FOUND) {
          notification.error({
            message: '이메일 또는 비밀번호가 잘못되었습니다. 다시 시도해 주세요!',
          });
        }
      },
    });
  };

  const router = useRouter();

  const scrollToOtherRouter = (path: string, id: string) => {
    router.push({
      pathname: path,
      query: { id },
    });
  };
  const emojiRegex =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  const handleChange = (event: any) => {
    const { value } = event.target;
    event.target.value = value.replace(emojiRegex, '');
  };

  const handlePaste = (event: any) => {
    const paste = event.clipboardData;
    const cleanedPaste = paste?.replace(emojiRegex, '');
    event.preventDefault();
    document.execCommand('insertText', false, cleanedPaste);
  };

  return (
    <div className={s.loginArea}>
      <Link href="/" className={s.laLogo}>
        <img alt="SuperBucket" src={Logo.src} />
      </Link>
      <div className={s.laMenuWrap}>
        <div className={s.row}>
          <button
            type="button"
            className={`${s.normalMenu} ${s.homepageHeaderButton} buttonLink1 home`}
            onClick={() => scrollToOtherRouter('/', 'homeSection3')}
          >
            기술개요
          </button>
        </div>
        <div className={s.row}>
          <button
            type="button"
            className={`${s.normalMenu} ${s.homepageHeaderButton} buttonLink2 home`}
            onClick={() => scrollToOtherRouter('/', 'homeSection4a')}
          >
            주요기능
          </button>
        </div>
        <div className={s.row}>
          <button
            type="button"
            className={`${s.normalMenu} ${s.homepageHeaderButton} openCs`}
            onClick={() => router.push('/contact')}
          >
            문의
          </button>
        </div>
        <div className={s.row}>
          <Link href="/request" className={`${s.normalMenu}`}>
            데모신청
          </Link>
        </div>
      </div>

      <div className={s.loginContent}>
        <div className={s.loginTitle}>로그인</div>
        <button
          type="button"
          title="로그인 취소"
          className={`${s.closeLogin} ${s.footerButton}`}
          onClick={toggleOpen}
        ></button>
        <BaseForm form={form} onFinish={handleSubmit}>
          <div className={s.row}>
            <S.FormItem
              name="email"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  type: 'email',
                  message: '유효한 이메일 주소를 입력해 주세요',
                },
                {
                  max: 64,
                  message: '이메일 64자 이상이 될 수 없습니다.',
                },
              ]}
            >
              <S.Input
                type="text"
                title="이메일"
                placeholder="이메일"
                onChange={handleChange}
                onPaste={handlePaste}
              />
            </S.FormItem>
          </div>
          <div className={s.row}>
            <S.FormItem
              name="password"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 32,
                  message: '비밀번호 32자 이상이 될 수 없습니다.',
                },
              ]}
            >
              <S.Input
                type="password"
                title="비밀번호"
                placeholder="비밀번호"
                onChange={handleChange}
                onPaste={handlePaste}
              />
            </S.FormItem>
          </div>
          {/* <div className={s.row}>
            <label className={s.bInput}>
              <input type="checkbox" name="" />
              <div className={s.txt}>아이디 저장</div>
            </label>
          </div> */}

          <div className={s.row}>
            <button className={`${s.buttonLogin} ${s.footerButton}`} type="submit">
              <span>로그인</span>
            </button>
          </div>
        </BaseForm>

        <div className={`${s.row} ${s.rowFindIdPw}`} style={{ overflow: 'auto' }}>
          <Link href="/auth/forgot-password">비밀번호 찾기</Link>
        </div>

        <div className={`${s.row} ${s.gotoJoinRow}`}>
          계정이 없으신가요?
          <br />
          <Link href="/auth/register">SuperBucket에 가입</Link>해 보세요.
        </div>
      </div>
      <DeactivatedAccountModal
        isOpen={isOpenDeactiveAccountModal}
        toggleIsOpen={setIsOpenDeactiveAccountModal}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};
