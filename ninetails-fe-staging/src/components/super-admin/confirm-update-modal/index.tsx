import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { FormInstance } from 'antd';
import React, { useEffect } from 'react';

import * as S from './index.styles';

interface IProps {
  isOpen: boolean;
  toggleIsOpen: (v: boolean) => void;
  handleUpdate: (password: string) => void;
  form: FormInstance;
  color?: string;
}

export const ConfirmUpdateModal: React.FC<IProps> = ({
  isOpen,
  toggleIsOpen,
  handleUpdate,
  form,
  color = '#0085f7',
}) => {
  const [cfForm] = BaseForm.useForm(form);

  const handleConfirm = () => {
    cfForm.validateFields().then((values) => {
      handleUpdate(values.password);
    });
  };

  useEffect(() => {
    cfForm.resetFields();
  }, [isOpen]);

  return (
    <S.Modal
      open={isOpen}
      footer={null}
      centered
      onCancel={() => toggleIsOpen(false)}
      closeIcon={null}
      width={600}
      styles={{
        content: {
          borderRadius: 20,
          padding: 12,
        },
      }}
    >
      <S.ModalTitle>업데이트 확인</S.ModalTitle>
      <BaseForm
        form={cfForm}
        layout="vertical"
        initialValues={{
          password: '',
        }}
      >
        <BaseFormItem
          required
          name="password"
          label="슈퍼 어드민 비밀번호"
          rules={[
            { required: true, message: '이 필드는 필수입니다.' },
            { max: 32, message: '슈퍼 어드민 비밀번호 32자 이상이 될 수 없습니다.' },
          ]}
          normalize={(value) => value.trim()}
        >
          <S.PasswordInput placeholder="슈퍼 어드민 비밀번호 입력" />
        </BaseFormItem>

        <S.WrapModalAction>
          <S.ConfirmButton color={color} onClick={() => handleConfirm()} type="default">
            확인
          </S.ConfirmButton>
          <S.CancelButton color={color} onClick={() => toggleIsOpen(false)}>
            취소
          </S.CancelButton>
        </S.WrapModalAction>
      </BaseForm>
    </S.Modal>
  );
};
