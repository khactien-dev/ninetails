import { Col, Form, Input, Row } from '@/components/request/index.styles';
import { checkAllspace, checkEmoji, checkPhoneNumber, preventSpaceAndLetters } from '@/utils';
import { FormInstance } from 'antd';
import React from 'react';
import Countdown, { zeroPad } from 'react-countdown';

import * as S from './index.styles';
import { COUNTDOWN_STATE, EMAIL_STEP, useRegisterForm } from './index.utils';
import { UploadInput } from './upload-input';

interface IProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  children: React.ReactElement;
  disabled?: boolean;
  onToggleIsFormChanged?: (status: boolean) => void;
  formInstance?: FormInstance<any>;
  disabledEmail?: boolean;
}

export const UserInfoForm: React.FC<IProps> = ({
  initialValues,
  onSubmit,
  children,
  disabled = false,
  disabledEmail = false,
  onToggleIsFormChanged,
  formInstance,
}) => {
  const {
    emailStep,
    countdownTimer,
    onNextStep,
    setCountDowmState,
    form,
    handleSubmit,
    countDownState,
    onGetOtpRequest,
    initialValues: initValues,
    onSetFieldError,
    onChangeValues,
  } = useRegisterForm({
    onSubmit: onSubmit,
    initialValues,
    onToggleIsFormChanged: onToggleIsFormChanged,
    formInstance,
  });

  const renderEmailAction = () => {
    switch (emailStep) {
      case EMAIL_STEP.STEP_1:
        return (
          <S.LabelActionButton onClick={onNextStep} actiontype="danger">
            중복확인 & 인증
          </S.LabelActionButton>
        );
      case EMAIL_STEP.STEP_2:
        return (
          <S.DoubleBtnWrapper>
            {!!countdownTimer && (
              <S.CountDownTime>
                <Countdown
                  date={countdownTimer}
                  key={countdownTimer.toString()}
                  renderer={({ minutes, seconds, completed }) => {
                    if (!completed)
                      return (
                        <span>
                          {zeroPad(minutes)}:{zeroPad(seconds)}
                        </span>
                      );
                  }}
                  onStart={() => setCountDowmState(COUNTDOWN_STATE.START)}
                  onComplete={() => setCountDowmState(COUNTDOWN_STATE.COMPLETE)}
                />
              </S.CountDownTime>
            )}
            <S.LabelActionButton actiontype="danger" onClick={onNextStep}>
              확인
            </S.LabelActionButton>
            <S.LabelActionButton
              actiontype="dark"
              disabled={!(countDownState === COUNTDOWN_STATE.COMPLETE)}
              onClick={onGetOtpRequest}
            >
              재전송
            </S.LabelActionButton>
          </S.DoubleBtnWrapper>
        );
      case EMAIL_STEP.STEP_3:
        return <S.LabelActionButton actiontype="success">인증완료</S.LabelActionButton>;
      default:
        return '';
    }
  };

  return (
    <S.WrapForm>
      <Form
        name="horizontal_login"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initValues}
        onValuesChange={onChangeValues}
      >
        <Row gutter={16}>
          <Col span={24} sm={12}>
            <Form.Item
              label="기관"
              name="organization"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 200,
                  message: '기관 200자 이상이 될 수 없습니다.',
                },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <Input placeholder={'기관명'} disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              label="부서"
              name="department"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '부서 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <Input placeholder={'부서명'} disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              name="operator"
              label="운영자"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '운영자 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <Input placeholder="운영자 이름" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              name="position"
              label="직책"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '직책 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <Input placeholder="직책" disabled={disabled} />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <S.PseudoLabelWrapper>
              <S.LabelText>이메일</S.LabelText>
              {!disabled && renderEmailAction()}
            </S.PseudoLabelWrapper>
            {emailStep === EMAIL_STEP.STEP_2 && (
              <Form.Item
                name={'emailOTP'}
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder={'인증키 입력'}
                  onKeyPress={preventSpaceAndLetters}
                  maxLength={6}
                  disabled={disabled}
                />
              </Form.Item>
            )}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 64, message: '이메일 64자 이상이 될 수 없습니다.' },
                { type: 'email', message: '유효한 이메일 주소를 입력해 주세요' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
              ]}
            >
              <Input
                placeholder="운영자(기관) 이메일"
                disabled={emailStep === EMAIL_STEP.STEP_2 || disabled || disabledEmail}
              />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item
              required
              name="fileUpload1"
              label="기관증빙 #1"
              rules={[
                {
                  validator(_: any, value: any) {
                    if (!value?.fileName) {
                      return Promise.reject(new Error('이 필드는 필수입니다.'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <UploadInput
                placeholder="사업자 등록증 (pdf)"
                onError={(e) => onSetFieldError('fileUpload1', e)}
                disabled={disabled}
              />
            </Form.Item>
          </Col>

          <Col span={24} sm={12}>
            <Form.Item
              name="phone"
              label="핸드폰"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 50, message: '핸드폰 50자 이상이 될 수 없습니다.' },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              ]}
            >
              <Input
                placeholder="숫자만 입력"
                onKeyPress={preventSpaceAndLetters}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col span={24} sm={12}>
            <Form.Item name="fileUpload2" label="기관증빙 #2">
              <UploadInput
                onError={(e) => onSetFieldError('fileUpload2', e)}
                placeholder="사업자 등록증 (pdf)"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          {children}
        </Row>
      </Form>
    </S.WrapForm>
  );
};
