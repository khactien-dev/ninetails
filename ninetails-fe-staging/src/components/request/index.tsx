import IK2 from '@/assets/images/common/icon-k2.png';
import IK2s from '@/assets/images/common/icon-k2s.png';
import { BaseImage } from '@/components/common/base-image';
import { useCreateRequest } from '@/hooks/features/useRequest';
import { useFeedback } from '@/hooks/useFeedback';
import { useResponsive } from '@/hooks/useResponsive';
import { IRequest } from '@/interfaces/request';
import { checkEmoji, checkPhoneNumber, preventSpaceAndLetters, validateEmoji } from '@/utils';
import { Form } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from './index.styles';

const Request: React.FC = () => {
  const [form] = Form.useForm();
  const { push } = useRouter();
  const { isTablet } = useResponsive();
  const createRequest = useCreateRequest();
  const { notification } = useFeedback();

  const handleSubmit = ({
    is_agree = false,
    organizational_name,
    name,
    request_quotation,
    ...values
  }: IRequest) => {
    const res = {
      ...values,
      is_agree,
      organizational_name: organizational_name.trim(),
      request_quotation: request_quotation.trim(),
      name: name.trim(),
    };
    createRequest.mutate(res, {
      onSuccess: () => {
        notification.success({
          message: '데모 요청이 접수되었습니다. 대한 빠른 시일 내에 연락드리겠습니다!',
        });
        push('/');
      },
    });
  };

  return (
    <S.Wrapper>
      <S.Card id="basic-table" padding="0">
        <S.Row gutter={60}>
          <S.Col span={24} md={12}>
            <S.Title>
              {!isTablet && <BaseImage src={IK2s.src} preview={false} width={30} height={30} />}
              {'데모 신청하기'}
              <ul>
                <li>궁금한 점에 대해 물어보세요</li>
                <li>서비스에 대해 자세히 알아보세요</li>
                <li>서비스를 시작할 수 있도록 도와드립니다</li>
              </ul>
              {isTablet && <BaseImage src={IK2.src} preview={false} />}
            </S.Title>
          </S.Col>
          <S.Col span={24} md={12}>
            <S.Form name="horizontal_login" form={form} layout="vertical" onFinish={handleSubmit}>
              <S.Row gutter={16}>
                <S.Col span={24} sm={12}>
                  <S.Form.Item
                    label="기관명"
                    name="organizational_name"
                    rules={[
                      { required: true, message: '이 필드는 필수입니다.' },
                      { max: 200, message: '기관명 200자 이상이 될 수 없습니다.' },
                      () => ({
                        validator(_, value) {
                          if (!value || !validateEmoji(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!')
                          );
                        },
                      }),
                      () => ({
                        validator(_, value) {
                          if (value && value.trim() === '') {
                            return Promise.reject(new Error('이 필드는 필수입니다.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <S.Input placeholder={'기관 부서명'} />
                  </S.Form.Item>
                </S.Col>
                <S.Col span={24} sm={12}>
                  <S.Form.Item
                    label="이름"
                    name="name"
                    rules={[
                      { required: true, message: '이 필드는 필수입니다.' },
                      { max: 30, message: '이름 30자 이상이 될 수 없습니다.' },
                      () => ({
                        validator(_, value) {
                          if (!value || !validateEmoji(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!')
                          );
                        },
                      }),
                      () => ({
                        validator(_, value) {
                          if (value && value.trim() === '') {
                            return Promise.reject(new Error('이 필드는 필수입니다.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <S.Input placeholder={'이름'} />
                  </S.Form.Item>
                </S.Col>
                <S.Col span={24}>
                  <S.Form.Item
                    name="email"
                    label="이메일"
                    rules={[
                      { required: true, message: '이 필드는 필수입니다.' },
                      { max: 64, message: '이메일 64자 이상이 될 수 없습니다.' },
                      { type: 'email', message: '유효한 이메일 주소를 입력해 주세요' },
                      () => ({
                        validator(_, value) {
                          if (!value || !validateEmoji(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!')
                          );
                        },
                      }),
                    ]}
                  >
                    <S.Input placeholder={'답변받으실 메일 주소'} />
                  </S.Form.Item>
                </S.Col>
                <S.Col span={24}>
                  <S.Form.Item
                    name="phone_number"
                    label="휴대폰"
                    rules={[
                      { required: true, whitespace: true, message: '이 필드는 필수입니다.' },
                      { max: 50, message: '휴대폰 50자 이상이 될 수 없습니다.' },
                      checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
                      checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                    ]}
                  >
                    <S.Input placeholder={'숫자만 입력'} onKeyPress={preventSpaceAndLetters} />
                  </S.Form.Item>
                </S.Col>
                <S.Col span={24}>
                  <S.Form.Item
                    name="request_quotation"
                    label="신청 내용"
                    rules={[
                      { required: true, message: '이 필드는 필수입니다.' },
                      { max: 1000, message: '신청 내용 1000자 이상이 될 수 없습니다.' },
                      () => ({
                        validator(_, value) {
                          if (!value || !validateEmoji(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('유효하지 않은 문자입니다. 다시 시도해 주세요!')
                          );
                        },
                      }),
                      () => ({
                        validator(_, value) {
                          if (value && value.trim() === '') {
                            return Promise.reject(new Error('이 필드는 필수입니다.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <S.Input.TextArea
                      placeholder={'서비스 도입 일정, 요구사항 등을 간략히 알려 주세요.'}
                    />
                  </S.Form.Item>
                </S.Col>
                <S.Col span={24}>
                  <S.Form.Item name="is_agree" valuePropName="checked">
                    <S.Checkbox>이메일로 새 소식을 받아볼게요.</S.Checkbox>
                  </S.Form.Item>
                </S.Col>
              </S.Row>
              <S.Button type="primary" htmlType="submit">
                {'제출하기'}
              </S.Button>
            </S.Form>
            <S.More>
              데모를 완료하셨나요? <S.Br />
              <S.Note href="/auth/register">SuperBucket에 가입</S.Note>해 보세요!
            </S.More>
          </S.Col>
        </S.Row>
      </S.Card>
    </S.Wrapper>
  );
};

export default Request;
