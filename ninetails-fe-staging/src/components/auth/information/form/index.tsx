import IconEye from '@/assets/images/svg/icon-fi-rr-eye.png';
import IConQuestion from '@/assets/images/svg/icon-question.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { PASSWORD_REGEX } from '@/constants';
import { STATUS } from '@/constants/settings';
import { useChangePasswordMaster, useUpdateUserInfo } from '@/hooks/features/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { RecordTypes } from '@/interfaces/settings';
import { checkPhoneNumber, formatPassword, formatPhone } from '@/utils';
import { Form, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import * as S from './index.style';

interface EditFormProps {
  record: RecordTypes;
  onSave: (value: RecordTypes) => void;
}

interface ShowPasswordState {
  currentPassword: boolean;
  newPassword: boolean;
  reNewPassword: boolean;
}

type QuestionTooltip = {
  label: string;
  text: string;
};

const UserInfoForm = ({ record, onSave }: EditFormProps) => {
  const { t } = useTranslation(['auth', 'commons']);
  const [form] = Form.useForm();
  const { notification } = useFeedback();
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    reNewPassword: false,
  });
  const updatePassword = useChangePasswordMaster();
  const updateUserInfo = useUpdateUserInfo();

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({ ...record, ...values });
    });

    form
      .validateFields(['full_name', 'phone_number'])
      .then(() => {
        const formData = {
          full_name: form.getFieldValue('full_name'),
          phone_number: form.getFieldValue('phone_number'),
        };
        updateUserInfo.mutate(formData, {
          onSuccess: () => {
            notification.success({ message: 'Update User Information successfully' });
          },
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleOpenPopup = () => {
    setIsOpenCreate(true);
  };

  const handleShowPass = (field: keyof ShowPasswordState) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const initialValues = {
    ...record,
    password: '**********',
    status: record.status === STATUS.ACTIVE ? '활성' : 'inactive',
  };

  const CustomLabel = ({ label, text }: QuestionTooltip) => (
    <>
      <Tooltip title={text}>
        <IConQuestion />
      </Tooltip>
      <span style={{ paddingLeft: '5px' }}>{label}</span>
    </>
  );

  const handleUpdatePassword = () => {
    form
      .validateFields()
      .then(() => {
        const data = {
          passwordNew: form.getFieldValue('new_password'),
          passwordOld: form.getFieldValue('currentPassword'),
        };
        updatePassword.mutate(data, {
          onSuccess: () => {
            notification.success({ message: '비밀번호가 성공적으로 변경되었습니다!' });
            form.resetFields(['new_password', 'reNewPassword', 'currentPassword']);
            setIsOpenCreate(false);
          },
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <S.EditTableFormWrap>
      <BaseForm form={form} initialValues={initialValues} layout="vertical">
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItem
              label={
                <CustomLabel
                  label="이메일"
                  text="이메일 변경이 필요할 경우, 기관 운영자에게 요청해 주세요."
                />
              }
              name="email"
              rules={[
                { required: true, message: t('validate.requiredField', { ns: 'common' }) },
                { type: 'email', message: t('validate.notValidEmail', { ns: 'common' }) },
              ]}
            >
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.Popup type={'primary'} onClick={handleOpenPopup}>
              변경
            </S.Popup>
            <S.FormItem
              label={
                <CustomLabel
                  label="암호"
                  text="영문 대문자와 소문자, 숫자 및 특수문자 8자리 이상."
                />
              }
              name="password"
              rules={[{ required: true, message: t('validate.requiredField', { ns: 'common' }) }]}
            >
              <BaseInput disabled={true} type={'password'} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="이름"
              name="full_name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('validate.requiredField', { ns: 'common' }),
                },
                { max: 200, message: '이름 200자 이상이 될 수 없습니다.' },
              ]}
            >
              <BaseInput placeholder="이름 입력" />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="연락처"
              name="phone_number"
              normalize={formatPhone}
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 50,
                  message: '연락처 50자 이상이 될 수 없습니다.',
                },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              ]}
            >
              <BaseInput placeholder="연락처 입력" />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItem label="부서" name="department">
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem label="직책" name="position">
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="권한"
              name="role"
              rules={[{ required: true, message: t('validate.requiredField', { ns: 'common' }) }]}
            >
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="상태"
              name="status"
              rules={[{ required: true, message: t('validate.requiredField', { ns: 'common' }) }]}
            >
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow justify="center">
          <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
        </BaseRow>
      </BaseForm>

      <S.Modal
        width={550}
        title="비밀번호 변경"
        footer={false}
        open={isOpenCreate}
        onCancel={() => setIsOpenCreate(false)}
      >
        <BaseForm layout="vertical" form={form}>
          <BaseRow gutter={16}>
            <BaseCol span={24}>
              <BaseForm.Item
                label="현재 비밀번호"
                name="currentPassword"
                normalize={formatPassword}
                rules={[
                  { required: true, message: t('validate.requiredField', { ns: 'common' }) },
                  {
                    max: 32,
                    message: '현재 비밀번호 32자 이상이 될 수 없습니다.',
                  },
                  {
                    pattern: PASSWORD_REGEX,
                    message:
                      '비밀번호가 충분히 강력하지 않습니다. 새 비밀번호로 다시 시도해 주세요.',
                  },
                ]}
              >
                <BaseInput
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  suffix={
                    <S.Showpass
                      onClick={() => handleShowPass('currentPassword')}
                      src={IconEye.src}
                      preview={false}
                      height={16}
                      width={16}
                    />
                  }
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={24}>
              <BaseForm.Item
                label="새 비밀번호"
                name="new_password"
                normalize={formatPassword}
                rules={[
                  { required: true, message: t('validate.requiredField', { ns: 'common' }) },
                  {
                    max: 32,
                    message: '새 비밀번호 32자 이상이 될 수 없습니다.',
                  },
                  {
                    pattern: PASSWORD_REGEX,
                    message:
                      '비밀번호가 충분히 강력하지 않습니다. 새 비밀번호로 다시 시도해 주세요.',
                  },
                ]}
              >
                <BaseInput
                  type={showPassword.newPassword ? 'text' : 'password'}
                  placeholder="비밀번호 (8~32자리)"
                  suffix={
                    <S.Showpass
                      onClick={() => handleShowPass('newPassword')}
                      src={IconEye.src}
                      preview={false}
                      height={16}
                      width={16}
                    />
                  }
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={24}>
              <BaseForm.Item
                label="비밀번호 확인"
                name="reNewPassword"
                dependencies={['new_password']}
                normalize={formatPassword}
                rules={[
                  { required: true, message: t('validate.requiredField', { ns: 'common' }) },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('비밀번호 확인이 일치하지 않습니다. 다시 시도해 주세요!')
                      );
                    },
                  }),
                ]}
              >
                <BaseInput
                  type={showPassword.reNewPassword ? 'text' : 'password'}
                  placeholder="비밀번호 재입력"
                  suffix={
                    <S.Showpass
                      onClick={() => handleShowPass('reNewPassword')}
                      src={IconEye.src}
                      preview={false}
                      height={16}
                      width={16}
                    />
                  }
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={24}>
              <S.Note>
                - 비밀번호는 8~ 32자의 영문 대소문자, 숫자, 특수문자를 조합하여 설정해 주세요.{' '}
                <br />
                - 다른사이트에서 사용하는 것과 동일하거나 쉬운 비밀번호는 사용하지 마세요.
                <br />
                - 안전한 계정 사용을 위해 비밀번호는 주기적으로 변경해 주세요
                <br />
              </S.Note>
            </BaseCol>
          </BaseRow>
          <BaseRow justify="center" gutter={24}>
            <BaseCol span={12}>
              <S.BtnSavePopup htmlType="submit" type="primary" onClick={handleUpdatePassword}>
                저장
              </S.BtnSavePopup>
            </BaseCol>
            <BaseCol span={12}>
              <S.BtnCancelPopup
                onClick={() => setIsOpenCreate(false)}
                htmlType="reset"
                type="default"
              >
                취소
              </S.BtnCancelPopup>
            </BaseCol>
          </BaseRow>
        </BaseForm>
      </S.Modal>
    </S.EditTableFormWrap>
  );
};

export default UserInfoForm;
