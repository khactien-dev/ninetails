import IconUpload from '@/assets/images/svg/icon-upload-d1a.png';
import { UploadInput } from '@/components/auth/register-form/user-info-form/upload-input';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { IRegisterResponse } from '@/interfaces';
import { checkAllspace, checkEmoji, checkPhoneNumber, formatPhone } from '@/utils';
import { FormInstance } from 'antd';
import { omit } from 'lodash';
import { useState } from 'react';

import { ConfirmUpdateModal } from '../../confirm-update-modal';
import * as S from './index.style';

interface EditFormProps {
  record: IRegisterResponse;
  onSave: (value: IRegisterResponse, password: string) => void;
  confirmModalForm: FormInstance;
  disabled: boolean;
}

const EditRegisterForm = ({ record, onSave, confirmModalForm, disabled }: EditFormProps) => {
  const [form] = BaseForm.useForm();
  const [isOpenConfirmChangeModal, setIsOpenConfirmChangeModal] = useState<boolean>(false);

  const handleSave = () => {
    form.validateFields().then(() => {
      setIsOpenConfirmChangeModal(true);
    });
  };

  const initialValues = {
    ...record,
    department: typeof record.department === 'object' ? record.department?.data : record.department,
    position: typeof record.position === 'object' ? record.position?.data : record.position,
    fileUpload1: {
      fileName: record?.filename_proof1 ?? '',
      url: record?.proof1 ?? '',
    },
    fileUpload2: {
      fileName: record?.filename_proof2 ?? '',
      url: record?.proof2 ?? '',
    },
  };

  const handleUpdate = (password: string) => {
    const updatedValues = form.getFieldsValue();
    const dataValues: any = omit(updatedValues, ['fileUpload1', 'fileUpload2']);

    onSave(
      {
        ...dataValues,
        key: record?.key,
        id: record.id,
        filename_proof1: updatedValues.fileUpload1.fileName,
        filename_proof2: updatedValues.fileUpload2.fileName,
        proof1: updatedValues.fileUpload1.url,
        proof2: updatedValues.fileUpload2.url,
      },
      password
    );
  };

  const onSetFieldError = (fieldName: string, error: string) => {
    form.setFields([
      {
        name: fieldName,
        errors: error ? [error] : [],
      },
    ]);
  };

  return (
    <S.EditTableFormWrap>
      <BaseForm form={form} initialValues={initialValues} layout="vertical">
        <S.FormLabel>기관(법인) 정보</S.FormLabel>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 200,
                  message: '기관명 200자 이상이 될 수 없습니다.',
                },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="기관명"
              name="organization"
            >
              <BaseInput placeholder="기관명" disabled={disabled} />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '운영자 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="운영자"
              name="operator"
            >
              <BaseInput placeholder="운영자 이름" disabled={disabled} />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '부서 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="부서"
              name="department"
            >
              <BaseInput placeholder="부서명" disabled={disabled} />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '직책 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="직책"
              name="position"
            >
              <BaseInput placeholder="직책" disabled={disabled} />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem required label="이메일" name="email">
              <BaseInput disabled={true} />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              required
              normalize={formatPhone}
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 50,
                  message: '연락처 50자 이상이 될 수 없습니다.',
                },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              ]}
              label="연락처"
              name="phone"
            >
              <BaseInput placeholder="숫자만 입력" disabled={disabled} />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              name="fileUpload1"
              label="기관증빙 #1"
              required
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
                onError={(e) => onSetFieldError('fileUpload1', e)}
                placeholder="사업자 등록증 (pdf)"
                icon={IconUpload}
                disabled={disabled}
              />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem name="fileUpload2" label="기관증빙 #2">
              <UploadInput
                onError={(e) => onSetFieldError('fileUpload2', e)}
                placeholder="사업자 등록증 (pdf)"
                icon={IconUpload}
                disabled={disabled}
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>
        {!disabled && (
          <BaseRow justify="center">
            <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
          </BaseRow>
        )}
      </BaseForm>
      <ConfirmUpdateModal
        isOpen={isOpenConfirmChangeModal}
        toggleIsOpen={setIsOpenConfirmChangeModal}
        handleUpdate={handleUpdate}
        form={confirmModalForm}
      />
    </S.EditTableFormWrap>
  );
};

export default EditRegisterForm;
