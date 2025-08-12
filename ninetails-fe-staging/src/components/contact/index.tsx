import Logo from '@/assets/images/common/sb_logo.png';
import { BaseImage } from '@/components/common/base-image';
import { useContactRequest } from '@/hooks/features/useRequest';
import { useFeedback } from '@/hooks/useFeedback';
import { IRequest } from '@/interfaces/request';
import { checkEmoji, checkPhoneNumber, formatPhone, validateEmoji } from '@/utils';
import { Form } from 'antd';
import Router from 'next/router';
import React from 'react';

import * as S from './index.styles';

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const { notification } = useFeedback();
  const contactRequest = useContactRequest();

  const handleSubmit = ({
    is_agree = false,
    organizational_name,
    request_quotation,
    ...values
  }: IRequest) => {
    const res = {
      ...values,
      is_agree,
      organizational_name: organizational_name.trim(),
      request_quotation: request_quotation.trim(),
    };

    contactRequest.mutate(res, {
      onSuccess: () => {
        notification.success({
          message: '문의가 접수되었습니다. 최대한 빠른 시일 내에 연락드리겠습니다!',
        });
        Router.push('/');
      },
    });
  };

  return (
    <S.Wrapper>
      <S.Card id="basic-table" padding="1.25rem 1.25rem 0">
        <S.Header>
          <BaseImage src={Logo.src} width={154} height={31} preview={false} />에 문의하기
        </S.Header>
        <S.Form form={form} layout="vertical" onFinish={handleSubmit}>
          <S.Content>
            <S.Title>
              <S.Div>현대화된 청소행정 업무 도구들을 경험해 보세요.</S.Div>
              <ul>
                <li>support@superbucket.kr</li>
                <li>02-560-4888</li>
              </ul>
            </S.Title>
            <S.More>아래 내용을 입력해 주세요.</S.More>
            <S.Row gutter={16}>
              <S.Col span={24}>
                <S.Form.Item
                  label="이름 (소속)"
                  name="organizational_name"
                  rules={[
                    { required: true, message: '이 필드는 필수입니다.' },
                    { max: 200, message: '이름 (소속) 200자 이상이 될 수 없습니다.' },
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
              <S.Col span={24}>
                <S.Form.Item
                  name="phone_number"
                  normalize={formatPhone}
                  label="연락처"
                  rules={[
                    { required: true, whitespace: true, message: '이 필드는 필수입니다.' },
                    {
                      max: 50,
                      message: '연락처 50자 이상이 될 수 없습니다.',
                    },
                    checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
                    checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  ]}
                >
                  <S.Input placeholder={'숫자만 입력'} />
                </S.Form.Item>
              </S.Col>
              <S.Col span={24}>
                <S.Form.Item
                  name="email"
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
                  label="이메일"
                >
                  <S.Input placeholder={'답변 받으실 메일 주소'} />
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
                    maxLength={1000}
                  />
                </S.Form.Item>
              </S.Col>
              <S.Col span={24}>
                <S.Form.Item name="is_agree" valuePropName="checked">
                  <S.Checkbox>이메일로 새 소식을 받아볼게요</S.Checkbox>
                </S.Form.Item>
              </S.Col>
            </S.Row>
          </S.Content>
          <S.Button type="primary" htmlType="submit">
            {'제출하기'}
          </S.Button>
        </S.Form>
      </S.Card>
    </S.Wrapper>
  );
};

export default Contact;
