import Calendar from '@/assets/images/schedule/icon-calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { SelectCombobox } from '@/components/settings/combobox';
import { DATE_FORMAT } from '@/constants';
import { STATUS_VEHICLE_EN } from '@/constants/settings';
import { ABSENCE_TYPE } from '@/constants/settings';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { RecordTypes } from '@/interfaces/settings';
import { checkAllspace, checkEmoji } from '@/utils';
import { checkPattern } from '@/utils/common';
import { Form } from 'antd';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import * as S from './index.style';

interface EditFormProps {
  record: RecordTypes;
  onSave: (value: RecordTypes) => void;
}

interface ItemLink {
  name: string;
  link: string;
}

const EditVehicleForm = ({ record, onSave }: EditFormProps) => {
  const [form] = Form.useForm();
  const permissions = usePermissions();

  const handleSave = () => {
    form.validateFields().then((values) => {
      const updateRecord = {
        ...record,
        ...values,
        status: values.status,
        vehicle_type: {
          id:
            values.vehicle_type === record.vehicle_type?.data
              ? record.vehicle_type?.id
              : Number(values.vehicle_type),
        },
        vehicle_model: {
          id:
            values.vehicle_model === record.vehicle_model?.data
              ? record.vehicle_model?.id
              : +values.vehicle_model,
        },

        manufacturer: {
          id:
            values.manufacturer === record.manufacturer?.data
              ? record.manufacturer?.id
              : +values.manufacturer,
        },
        capacity: {
          id: values.capacity === record.capacity?.data ? record.capacity?.id : +values.capacity,
        },
        max_capacity: {
          id:
            values.max_capacity === record.max_capacity?.data
              ? record.max_capacity?.id
              : +values.max_capacity,
        },
      };

      const updatedData = omit(updateRecord, [
        'replacement_vehicle',
        'absence_start',
        'absence_type',
      ]);
      onSave(updatedData as RecordTypes);
    });
  };
  type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

  const initialValues = {
    ...record,
    operation_start_date: record.operation_start_date ? dayjs(record.operation_start_date) : null,
    operation_end_date: record.operation_end_date ? dayjs(record.operation_end_date) : null,
    status: record.status,
    vehicle_type: typeof record.vehicle_type === 'object' ? record.vehicle_type?.data : null,
    vehicle_model: typeof record.vehicle_model === 'object' ? record.vehicle_model?.data : null,
    manufacturer: typeof record.manufacturer === 'object' ? record.manufacturer?.data : null,
    capacity: typeof record.capacity === 'object' ? record.capacity?.data : null,
    max_capacity: typeof record.max_capacity === 'object' ? record.max_capacity?.data : null,
    absence_start: record?.absence
      ? dayjs(record?.absence?.start_date).format(DATE_FORMAT.R_BASIC)
      : null,
    absence_type:
      ABSENCE_TYPE?.[record?.absence?.absence_type as AbsenceTypeKeys] ||
      record?.absence?.absence_type,
    replacement_vehicle: record?.absence?.replacement_vehicle?.vehicle_number,
  };
  const linkCustom: ItemLink = {
    name: '부재 관리',
    link: `/admin/settings/absence`,
  };

  const router = useRouterWithAuthorize();

  const handlePushRoute = () => {
    router.pushWithAuthorize(linkCustom.link, { type: 'vehicle' });
  };

  const { query, isReady } = useRouter();
  const { opId, schema } = query;
  const customHeaders = { isReady, opId, schema };

  const [disableStatus, setDisableStatus] = useState(false);

  useEffect(() => {
    if (
      record.status === STATUS_VEHICLE_EN.RETIRED ||
      record.status === STATUS_VEHICLE_EN.DISPOSED ||
      record.status === STATUS_VEHICLE_EN.MAINTENANCE
    ) {
      setDisableStatus(true);
    } else {
      setDisableStatus(false);
    }
  }, [record]);

  return (
    <S.EditTableFormWrap>
      <BaseForm
        form={form}
        initialValues={initialValues}
        layout="vertical"
        disabled={!permissions.updateAble}
      >
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItem
              label="차번"
              name="vehicle_number"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                () => ({
                  validator(_, value) {
                    if (!value || checkPattern(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Please enter a valid vehicle license number'));
                  },
                }),
              ]}
            >
              <BaseInput placeholder="차번 입력" />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="차종"
              name="vehicle_type"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="vehicle_type"
                form={form}
                placeholder={'차종 선택'}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="모델"
              name="vehicle_model"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="vehicle_model"
                form={form}
                placeholder={'모델 선택'}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="제조사"
              name="manufacturer"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="manufacturer"
                form={form}
                placeholder={'제조사 선택'}
              />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItem
              label="적재용적 (m³)"
              name="capacity"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="capacity"
                placeholder={'선택 선택'}
                form={form}
                isNumber={true}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="최대적재 (kg)"
              name="max_capacity"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectCombobox
                headers={customHeaders}
                fieldName="max_capacity"
                placeholder={'최대적재 (kg) 선택'}
                form={form}
                isNumber={true}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="운행 시작일"
              name="operation_start_date"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                ({ getFieldValue, setFields }) => ({
                  validator(_, value) {
                    const operationEndDate = getFieldValue('operation_end_date');
                    if (value && operationEndDate && value.isAfter(operationEndDate, 'day')) {
                      return Promise.reject(new Error('유효한 기간을 선택해 주세요.'));
                    } else {
                      setFields([{ name: 'operation_end_date', errors: [] }]);
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <S.DatePicker
                disabledDate={(current) => current && current > dayjs()}
                format={DATE_FORMAT.BASIC1}
                placeholder="운행시작"
                suffixIcon={<Calendar />}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              label="운행종료"
              name="operation_end_date"
              rules={[
                ({ getFieldValue, setFields }) => ({
                  validator(_, value) {
                    if (value && value.isBefore(dayjs(), 'day')) {
                      setDisableStatus(true);
                      form.setFieldValue('status', STATUS_VEHICLE_EN.RETIRED);
                    } else {
                      setDisableStatus(false);
                      form.setFieldValue('status', STATUS_VEHICLE_EN.NORMAL);
                    }

                    const operationStartDate = getFieldValue('operation_start_date');
                    if (value && operationStartDate && value.isBefore(operationStartDate, 'day')) {
                      return Promise.reject(new Error('유효한 기간을 선택해 주세요.'));
                    } else {
                      setFields([{ name: 'operation_start_date', errors: [] }]);
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <S.DatePicker
                format={DATE_FORMAT.BASIC1}
                placeholder="운행종료"
                suffixIcon={<Calendar />}
              />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItemCustom>
              <S.FormCustom label="부재 시작일" name="absence_start">
                <BaseInput disabled={true} />
              </S.FormCustom>
              <S.BtnRedirect type="primary">
                <S.InfoText onClick={handlePushRoute}>부재 관리</S.InfoText>
              </S.BtnRedirect>
            </S.FormItemCustom>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem label="부재 항목" name="absence_type">
              <BaseInput disabled={true} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="용도 [배치 유형]" name="purpose">
              <BaseSelect
                placeholder="직무 [계약 형태] 선택"
                options={[
                  { value: 'COMPOSITE_REGULAR', label: '생활 [정규]' },
                  { value: 'COMPOSITE_SUPPORT', label: '생활 [지원]' },
                  { value: 'FOOD_REGULAR', label: '음식 [정규]' },
                  { value: 'FOOD_SUPPORT', label: '음식 [지원]' },
                  { value: 'REUSABLE_REGULAR', label: '재활 [정규]' },
                  { value: 'REUSABLE_SUPPORT', label: '재활 [지원]' },
                  { value: 'TATICAL_MOBILITY_REGULAR', label: '기동 [정규]' },
                  { value: 'TATICAL_MOBILITY_SUPPORT', label: '기동 [지원]' },
                ]}
              />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              rules={[
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                {
                  max: 200,
                  message: '노트 [참고사항] 200자 이상이 될 수 없습니다.',
                },
              ]}
              label="노트 [참고사항]"
              name="note"
            >
              <BaseInput placeholder="노트 입력" />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_, value) => {
                    if (
                      value === STATUS_VEHICLE_EN.RETIRED ||
                      value === STATUS_VEHICLE_EN.DISPOSED
                    ) {
                      setDisableStatus(true);
                      form.setFieldValue('operation_end_date', dayjs().subtract(1, 'day'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              label="상태"
              name="status"
            >
              <BaseSelect
                options={[
                  { value: STATUS_VEHICLE_EN.NORMAL, label: '정상' },
                  { value: STATUS_VEHICLE_EN.MAINTENANCE, label: '정비', disabled: true },
                  { value: STATUS_VEHICLE_EN.DISPOSED, label: '매각' },
                  { value: STATUS_VEHICLE_EN.RETIRED, label: '폐차' },
                ]}
                disabled={!permissions?.updateAble || disableStatus}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem label="대체자" name="replacement_vehicle">
              <BaseInput disabled={true} />
            </S.FormItem>
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

export default EditVehicleForm;
