import { UploadInput } from '@/components/auth/register-form/user-info-form/upload-input';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseUploadInput } from '@/components/common/base-upload/upload-input';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { useUpdateLogo } from '@/hooks/features/useDashboard';
import { checkAllspace, checkEmoji, checkPhoneNumber, formatPhone } from '@/utils';
import { FormInstance } from 'antd';
import React from 'react';

import { SelectCombobox } from '../../combobox';
import { BaseForm } from '../index.style';
import * as S from './index.style';

interface ClusterFormProps {
  editing: boolean;
  onSave: () => void;
  onResetForm: () => void;
  formInstance: FormInstance;
  updateDataPening: boolean;
  fetchDataPending: boolean;
}

const AgencyForm: React.FC<ClusterFormProps> = ({
  editing,
  onSave,
  onResetForm,
  formInstance,
  updateDataPening,
  fetchDataPending,
}) => {
  const [form] = BaseForm.useForm(formInstance);
  const uploadLogo = useUpdateLogo();

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
      <BaseForm layout="vertical" form={form}>
        <BaseRow gutter={24}>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item
              label="기관명"
              required
              name="organization"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 200,
                  message: '기관명 200자 이상이 될 수 없습니다.',
                },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <BaseInput
                disabled={!editing}
                placeholder="기관명"
                style={{
                  textOverflow: 'ellipsis',
                }}
              />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item
              label="운영자"
              required
              name="operator"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 200, message: '운영자 200자 이상이 될 수 없습니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <BaseInput
                disabled={!editing}
                placeholder="운영자 이름"
                style={{
                  textOverflow: 'ellipsis',
                }}
              />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              label="부서"
              name="department"
            >
              <SelectCombobox
                disabled={!editing}
                fieldName="department"
                form={form}
                placeholder="부서 선택"
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              label="직책"
              name="position"
            >
              <SelectCombobox
                disabled={!editing}
                fieldName="position"
                form={form}
                placeholder="직책 선택"
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={24}>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item label="이메일" required name="email">
              <BaseInput disabled={true} placeholder="인증키 입력" />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item
              label="연락처"
              required
              name="phone"
              normalize={formatPhone}
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                { max: 50, message: '연락처 50자 이상이 될 수 없습니다.' },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              ]}
            >
              <BaseInput disabled={!editing} placeholder="숫자만 입력" />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item
              label="기관증빙 #1"
              required
              name="fileUpload1"
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
                disabled={!editing}
              />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item label="기관증빙 #2" name="fileUpload2">
              <UploadInput
                onError={(e) => onSetFieldError('fileUpload2', e)}
                placeholder="사업자 등록증 (pdf)"
                disabled={!editing}
              />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={24} justify={'start'}>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <BaseForm.Item label="로고" name="logo">
              <BaseUploadInput
                uploadFileMutation={uploadLogo}
                placeholder="로고 (*jpeg, png 파일, 5MB 이하)"
                onError={(e) => onSetFieldError('logo', e)}
                disabled={!editing}
                limitSize={5}
                acceptType={['image/png', 'image/jpeg', 'image/jpg']}
              />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        {editing && (
          <BaseRow justify={'center'}>
            <S.ActionBtn
              type="primary"
              onClick={onSave}
              loading={updateDataPening || fetchDataPending}
            >
              저장
            </S.ActionBtn>
            <S.ActionBtn type="primary" ghost onClick={onResetForm}>
              취소
            </S.ActionBtn>
          </BaseRow>
        )}
      </BaseForm>
    </S.EditTableFormWrap>
  );
};

export default AgencyForm;
