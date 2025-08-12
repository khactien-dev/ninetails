import Calendar from '@/assets/images/common/Calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseSelect } from '@/components/common/selects/base-select';
import { DATE_FORMAT } from '@/constants';
import { FormInstance } from 'antd';
import React from 'react';

import * as S from '../company-form/index.style';
import { BaseForm } from '../index.style';

interface ClusterFormProps {
  editing?: boolean;
  formInstance: FormInstance;
}

const ContractForm: React.FC<ClusterFormProps> = ({ editing = false, formInstance }) => {
  const [form] = BaseForm.useForm(formInstance);

  return (
    <S.EditTableFormWrap>
      <BaseForm form={form} layout="vertical">
        <BaseRow gutter={24}>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <S.FormItem label="계약시작일" name="start_date">
              <S.DatePicker
                disabled={!editing}
                placeholder="계약시작일"
                format={DATE_FORMAT.BASIC}
                suffixIcon={<Calendar />}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <S.FormItem label="계약종료일" name="end_date">
              <S.DatePicker
                disabled={!editing}
                placeholder="계약종료일"
                format={DATE_FORMAT.BASIC}
                suffixIcon={<Calendar />}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <S.FormItem label="계약타입" name="contract_type">
              <BaseSelect
                disabled={!editing}
                placeholder="계약타입"
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
            </S.FormItem>
          </BaseCol>
          <BaseCol xs={24} sm={12} md={12} lg={6}>
            <S.FormItem label="계약상태" name="contract_status">
              <BaseSelect
                placeholder="계약상태"
                disabled={!editing}
                options={[
                  { value: 0, label: 'Inactive' },
                  { value: 1, label: 'Active' },
                ]}
              />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
      </BaseForm>
    </S.EditTableFormWrap>
  );
};

export default ContractForm;
