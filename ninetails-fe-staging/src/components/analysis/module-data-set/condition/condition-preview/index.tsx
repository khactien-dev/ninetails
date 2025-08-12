import { CONDITION } from '@/components/analysis/module-data-set/condition';
import * as S from '@/components/analysis/module-data-set/condition/index.style';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { checkEmoji, checkNumber } from '@/utils';
import React from 'react';

import { ICondition } from '../../index.utils';

interface IProps {
  initialValues: ICondition;
}

// eslint-disable-next-line react/display-name
export const ConditionPreview = React.forwardRef<any, IProps>((props) => {
  const [form] = BaseForm.useForm();
  const { initialValues } = props;

  return (
    <>
      <S.ConditionForm form={form} initialValues={initialValues}>
        <BaseRow gutter={24}>
          {initialValues.type === CONDITION.CORE_DATASET ? (
            <BaseCol xs={24} md={12} lg={8} xl={6}>
              <BaseForm.Item>
                <BaseInput disabled value={'Core dataset'} />
              </BaseForm.Item>
            </BaseCol>
          ) : (
            <BaseCol xs={24} md={12} lg={8} xl={6}>
              <BaseForm.Item name="condition_value">
                <S.Select
                  options={[
                    {
                      value: 'AND',
                      label: 'AND',
                    },
                    {
                      value: 'OR',
                      label: 'OR',
                    },
                  ]}
                />
              </BaseForm.Item>
            </BaseCol>
          )}

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="l2_domain"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="도메인 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="l3_domain"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="하위 도메인 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="columns"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="컬럼 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="operator"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.Select placeholder="연산자 선택" />
            </BaseForm.Item>
          </BaseCol>

          <BaseCol xs={24} md={12} lg={8} xl={6}>
            <BaseForm.Item
              name="value"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                checkNumber('최대 소수점 3자리까지의 유효한 숫자를 입력해 주세요'),
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
              ]}
            >
              <BaseInput placeholder="값 입력" />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <S.Divider />
      </S.ConditionForm>
    </>
  );
});
