import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { IRollbackHistory } from '@/interfaces';
import { Form } from 'antd';
import React from 'react';

import * as S from './index.styles';

interface IFormProps {
  record: IRollbackHistory;
}

const RollbackForm = (props: IFormProps) => {
  const { record } = props;

  const [form] = Form.useForm();

  const initialValues = { ...record };

  return (
    <S.DetailFormWrap>
      <BaseForm form={form} initialValues={initialValues} layout="vertical">
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem label="Table Name" name="table">
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem label="Action Type" name="type">
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem label="Timestamp" name="createdAt">
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem label="ID" name="id">
              <BaseInput disabled />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <BaseRow gutter={16}>
          <BaseCol span={12}>
            <BaseFormItem label="Old Data" name="old_data">
              <BaseInput.TextArea disabled rows={6} />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={12}>
            <BaseFormItem label="New Data" name="new_data">
              <BaseInput.TextArea disabled rows={6} />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>
      </BaseForm>
    </S.DetailFormWrap>
  );
};

export default RollbackForm;
