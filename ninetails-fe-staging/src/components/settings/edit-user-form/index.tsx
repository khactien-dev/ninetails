import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { STATUS, USER_ROLE } from '@/constants/settings';
import { usePermissions } from '@/hooks/usePermissions';
import { IUser } from '@/interfaces';
import { checkPhoneNumber, formatPhone, validateEmojiRegex } from '@/utils';
import { Form } from 'antd';
import { useRouter } from 'next/router';

import { SelectCombobox } from '../combobox';
import * as S from './index.style';

interface EditFormProps {
  record: IUser;
  rolesOption: { label: string; value: number }[];
  onSave: (value: IUser) => void;
}

const EditUserForm = ({ record, rolesOption, onSave }: EditFormProps) => {
  const [form] = Form.useForm();
  const permissions = usePermissions();

  const handleSave = () => {
    form.validateFields().then((values) => {
      onSave({
        ...record,
        ...values,
        department: +values.department ? +values.department : record.department?.id,
        position: +values.position ? +values.position : record.position?.id,
      });
    });
  };

  const newRecord = {
    ...record,
    department: record.department?.id,
    position: record.position?.id,
    permission_id: Number(record.permission?.id),
  };

  const { query, isReady } = useRouter();
  const { opId, schema } = query;
  const customHeaders = { isReady, opId, schema };

  return (
    <S.EditTableFormWrap>
      <BaseForm
        form={form}
        initialValues={newRecord}
        layout="vertical"
        disabled={!permissions.updateAble}
      >
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              label="이메일"
              name="email"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              label="이름"
              name="full_name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: '이 필드는 필수입니다.',
                },
                {
                  validator: async (_, value) => {
                    await validateEmojiRegex(value);
                  },
                },
              ]}
            >
              <BaseInput maxLength={200} placeholder="이름 입력" />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              label="연락처"
              name="phone_number"
              normalize={formatPhone}
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  min: 9,
                  message: '유효한 전화번호를 입력해 주세요',
                },
                {
                  max: 14,
                  message: '유효한 전화번호를 입력해 주세요',
                },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
              ]}
            >
              <BaseInput placeholder="연락처 입력" />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            {record.permission?.type == USER_ROLE.OP ? (
              <BaseFormItem label="권한">
                <BaseInput disabled defaultValue="운영자" />
              </BaseFormItem>
            ) : (
              <BaseFormItem
                label="권한"
                name="permission_id"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect options={rolesOption} />
              </BaseFormItem>
            )}
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              label="부서"
              name="department"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="department"
                form={form}
                placeholder="부서 선택"
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              label="직책"
              name="position"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="position"
                form={form}
                placeholder="직책 선택"
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              label="상태"
              name="status"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <BaseSelect
                options={[
                  { value: STATUS.ACTIVE, label: '활성' },
                  { value: STATUS.INACTIVE, label: '비활성' },
                ]}
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow justify="center">
          <S.BtnSave type="primary" onClick={handleSave}>
            저장
          </S.BtnSave>
        </BaseRow>
      </BaseForm>
    </S.EditTableFormWrap>
  );
};

export default EditUserForm;
