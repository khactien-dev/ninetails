import IconUpload from '@/assets/images/svg/icon-upload-d1a.png';
import { UploadInput } from '@/components/auth/register-form/user-info-form/upload-input';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { SelectCombobox } from '@/components/settings/combobox';
import { DATE_FORMAT } from '@/constants';
import { ICustomer } from '@/interfaces';
import { checkAllspace, checkEmoji, checkPhoneNumber } from '@/utils';
import { formatPhone, validateEndDate, validateStartDate } from '@/utils/common';
import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import React, { useState } from 'react';

import { ConfirmUpdateModal } from '../../confirm-update-modal';
import * as S from './index.style';

interface EditFormProps {
  record: ICustomer;
  onSave: (value: any, password: string) => void;
  confirmModalForm: FormInstance;
}

export const EditCustomerForm = ({ record, onSave, confirmModalForm }: EditFormProps) => {
  const [form] = BaseForm.useForm();
  const [isOpenConfirmChangeModal, setIsOpenConfirmChangeModal] = useState<boolean>(false);

  const opId = record?.users?.length ? record?.users[0]?.id : null;
  const schema = record?.users?.length ? record?.schema : null;
  const customHeaders = { opId, schema };

  const handleSave = () => {
    form.validateFields().then(() => {
      setIsOpenConfirmChangeModal(true);
    });
  };

  const handleUpdate = (password: string) => {
    const updatedValues = form.getFieldsValue();
    const dataValues = omit(updatedValues, [
      'contract_status',
      'contract_type',
      'end_date',
      'start_date',
      'fileUpload1',
      'fileUpload2',
    ]);

    const data = {
      ...dataValues,
      is_agree: true,
      contractStartDate: updatedValues.start_date
        ? dayjs(updatedValues.start_date).format(DATE_FORMAT.ISO_BASIC)
        : null,
      contractEndDate: updatedValues.start_date
        ? dayjs(updatedValues.end_date).format(DATE_FORMAT.ISO_BASIC)
        : null,
      contractStatus: updatedValues.contract_status,
      contractType: updatedValues.contract_type,
      key: record.key,
      id: record.id,
      schema: record.schema,
      department: +updatedValues.department
        ? +updatedValues.department
        : typeof record.department === 'object' && 'id' in record.department
        ? record.department.id
        : record.department,
      position: +updatedValues.position
        ? +updatedValues.position
        : typeof record.position === 'object' && 'id' in record.position
        ? record.position.id
        : record.position,
      filename_proof1: updatedValues.fileUpload1.fileName,
      filename_proof2: updatedValues.fileUpload2.fileName,
      proof1: updatedValues.fileUpload1.url,
      proof2: updatedValues.fileUpload2.url,
    };

    onSave({ ...data }, password);
  };

  const contractInfo = record.contracts?.length ? record.contracts[0] : null;

  const initialValues = {
    ...record,
    start_date: contractInfo?.start_date ? dayjs(contractInfo.start_date) : null,
    end_date: contractInfo?.end_date ? dayjs(contractInfo.end_date) : null,
    contract_type: contractInfo?.type ? contractInfo?.type : null,
    contract_status: contractInfo?.status,
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
              <BaseInput placeholder="기관명" />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            {/* change to select position list according to department list */}
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
              <BaseInput placeholder="운영자 이름" />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            {/* change to select departmant list */}
            <BaseFormItem
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              label="부서"
              name="department"
            >
              <SelectCombobox
                fieldName="department"
                form={form}
                placeholder="부서 선택"
                headers={customHeaders}
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
                headers={customHeaders}
                fieldName="position"
                form={form}
                placeholder="직책 선택"
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem label="이메일" name="email" required>
              <BaseInput disabled />
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
              <BaseInput placeholder="숫자만 입력" />
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
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem name="fileUpload2" label="기관증빙 #2">
              <UploadInput
                onError={(e) => onSetFieldError('fileUpload2', e)}
                icon={IconUpload}
                placeholder="사업자 등록증 (pdf)"
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              label="고객 ID"
              name="schema"
            >
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <S.FormLabel>계약 정보</S.FormLabel>

        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              rules={[
                { validator: (_: RuleObject, value: StoreValue) => validateStartDate(form, value) },
              ]}
              label="계약시작일"
              name="start_date"
            >
              <S.DatePicker format={DATE_FORMAT.BASIC} placeholder="계약시작일" />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              rules={[
                { validator: (_: RuleObject, value: StoreValue) => validateEndDate(form, value) },
              ]}
              label="계약종료일"
              name="end_date"
            >
              <S.DatePicker format={DATE_FORMAT.BASIC} placeholder="계약종료일" />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem label="계약타입" name="contract_type">
              <BaseSelect
                placeholder={'계약타입'}
                options={[
                  {
                    value: 'STANDARD',
                    label: 'Standard',
                  },
                  {
                    value: 'TEMPORARY',
                    label: 'Temporary',
                  },
                ]}
              />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem label="계약상태" name="contract_status">
              <BaseSelect
                placeholder="계약상태"
                options={[
                  { value: 0, label: '비활성' },
                  { value: 1, label: '활성' },
                ]}
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <BaseRow justify="center">
          <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
        </BaseRow>
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
