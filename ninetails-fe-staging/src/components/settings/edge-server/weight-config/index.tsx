// import EditIcon from '@/assets/images/svg/icon-edit3.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { useUpdateWeightConfigMutation } from '@/hooks/features/useEdgeServer';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { IWeightConfig } from '@/interfaces';
import React, { useEffect, useState } from 'react';

import * as S from './index.styles';

interface IProps {
  intitialValues?: IWeightConfig;
  refreshWeightConfig: () => void;
}

const NumericInput = ({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const reg = /^-?\d*(\.\d{0,2})?$/;

    if ((reg.test(value) || value === '') && value.length <= 5) {
      e.target.value = value;
      onChange &&
        onChange({
          target: {
            value: value,
          },
        });
    } else {
      e.preventDefault();
    }
  };

  return (
    <BaseInput
      onChange={handleChange}
      maxLength={5}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export const WeightConfig: React.FC<IProps> = (props) => {
  const { intitialValues, refreshWeightConfig } = props;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [form] = BaseForm.useForm();
  const { notification } = useFeedback();
  const permissions = usePermissions();

  const updateConfigWeightMutate = useUpdateWeightConfigMutation();

  const onSubmit = (values: { [key: string]: string }) => {
    try {
      const payload = {
        '5L_gen': parseFloat(values['5L_gen']),
        '10L_gen': parseFloat(values['10L_gen']),
        '10L_reu': parseFloat(values['10L_reu']),
        '20L_gen': parseFloat(values['20L_gen']),
        '20L_reu': parseFloat(values['20L_reu']),
        '30L_gen': parseFloat(values['30L_gen']),
        '50L_gen': parseFloat(values['50L_gen']),
        '50L_pub': parseFloat(values['50L_pub']),
        '75L_gen': parseFloat(values['75L_gen']),
        '75L_pub': parseFloat(values['75L_pub']),
        ext: parseFloat(values?.ext),
        etc: parseFloat(values?.etc),
      };
      updateConfigWeightMutate.mutate(payload, {
        onSuccess: () => {
          refreshWeightConfig();
          notification.success({ message: '데이터가 성공적으로 업데이트되었습니다!' });
          setIsEdit(false);
        },
        onError: () => {
          handleResetForm();
        },
      });
    } catch {
      return;
    }
  };

  const handleResetForm = () => {
    intitialValues && form.setFieldsValue(intitialValues);
    setIsEdit(false);
  };

  useEffect(() => {
    form.resetFields();
  }, [intitialValues]);

  const checkFloatNumber = () => ({
    validator(_: any, value: string) {
      try {
        if (value !== '' && value !== undefined && !isNaN(parseFloat(value))) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error('최대 소수점 3자리까지의 유효한 숫자를 입력해 주세요'));
        }
      } catch {
        return Promise.reject(new Error('최대 소수점 3자리까지의 유효한 숫자를 입력해 주세요'));
      }
    },
  });

  return (
    <S.WrapWeightForm>
      <S.WrapTitle>
        <S.Title>평균 무게 (kg)</S.Title>
      </S.WrapTitle>
      <S.Form form={form} initialValues={intitialValues} onFinish={onSubmit}>
        <BaseRow gutter={12}>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="5L_gen"
              name="5L_gen"
            >
              <NumericInput placeholder="5L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="10L_gen"
              name="10L_gen"
            >
              <NumericInput placeholder="10L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="10L_reu"
              name="10L_reu"
            >
              <NumericInput placeholder="10L_reu" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="20L_gen"
              name="20L_gen"
            >
              <NumericInput placeholder="20L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="20L_reu"
              name="20L_reu"
            >
              <NumericInput placeholder="20L_reu" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="30L_gen"
              name="30L_gen"
            >
              <NumericInput placeholder="30L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>

          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="50L_gen"
              name="50L_gen"
            >
              <NumericInput placeholder="50L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="50L_pub"
              name="50L_pub"
            >
              <NumericInput placeholder="50L_pub" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="75L_gen"
              name="75L_gen"
            >
              <NumericInput placeholder="75L_gen" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="75L_pub"
              name="75L_pub"
            >
              <NumericInput placeholder="75L_pub" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="ext"
              name="ext"
            >
              <NumericInput placeholder="ext" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>

          <BaseCol xs={12} sm={8} md={8} lg={4}>
            <S.Form.Item
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }, checkFloatNumber()]}
              label="etc"
              name="etc"
            >
              <NumericInput placeholder="etc" disabled={!isEdit || !permissions?.updateAble} />
            </S.Form.Item>
          </BaseCol>
        </BaseRow>
        {isEdit && (
          <S.WrapActionButtons>
            <S.Button type="primary" htmlType="submit" loading={updateConfigWeightMutate.isPending}>
              생성
            </S.Button>
            <S.CancelButton
              onClick={() => {
                setIsEdit(false);
                handleResetForm();
              }}
            >
              취소
            </S.CancelButton>
          </S.WrapActionButtons>
        )}
      </S.Form>
      {!isEdit && permissions?.updateAble && (
        <S.EditButton type={'default'} onClick={() => setIsEdit((prev) => !prev)}>
          {/*<EditIcon />*/}
          편집
        </S.EditButton>
      )}
    </S.WrapWeightForm>
  );
};
