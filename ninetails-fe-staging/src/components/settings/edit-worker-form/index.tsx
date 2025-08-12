import Calendar from '@/assets/images/common/Calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import { DATE_FORMAT } from '@/constants';
import { STATUS } from '@/constants/settings';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { IWorker } from '@/interfaces/workers';
import { checkAllspace, checkEmoji, checkPhoneNumber } from '@/utils';
import { formatPhone, validateEndDate, validateStartDate } from '@/utils/common';
import { Form } from 'antd';
import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';

import { AVAILABLE_CONTRACT } from '../workers/index.utils';
import * as S from './index.style';

interface EditFormProps {
  record: IWorker;
  onSave: (value: IWorker) => void;
}
interface ItemLink {
  name: string;
  link: string;
}

const EditWorkerForm = ({ record, onSave }: EditFormProps) => {
  const [form] = Form.useForm();
  const permissions = usePermissions();
  const handleSave = () => {
    form.validateFields().then((values) => {
      const updateRecord = {
        ...record,
        ...values,
      };

      const updatedData = omit(updateRecord, ['absence_type', 'replacement', 'absence_start']);
      onSave(updatedData as IWorker);
      form.resetFields();
    });
  };

  const initialValues = {
    ...record,
    start_date: record.start_date ? dayjs(record.start_date) : null,
    end_date: record?.end_date ? dayjs(record?.end_date) : null,
    age: record.age ? dayjs(record.age) : null,
    absence_start: record?.absence_staff
      ? dayjs(record?.absence_staff?.start_date).format(DATE_FORMAT.R_BASIC)
      : null,
    absence_type: record?.absence_staff?.absence_type,
    replacement: record?.absence_staff?.replacer_staff?.name,
  };

  const linkCustom: ItemLink = {
    name: '부재 관리',
    link: `/admin/settings/absence`,
  };

  const router = useRouterWithAuthorize();

  const handlePushRoute = () => {
    return router.pushWithAuthorize(`/${linkCustom.link}`);
  };
  const statusOptions = [
    { value: STATUS.NORMAL, label: '정상' },
    {
      value: STATUS.LEAVING,
      label: '열외',
    },
    {
      value: STATUS.RESIGNED,
      label: '퇴사',
    },
  ];

  const [disableStatus, setDisableStatus] = useState(false);

  useEffect(() => {
    if (record.status === STATUS.RESIGNED || record.status === STATUS.LEAVING) {
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
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="이름"
              name="name"
            >
              <BaseInput maxLength={200} placeholder="이름 입력" />
            </BaseFormItem>
          </BaseCol>

          <BaseCol span={6}>
            <BaseFormItem
              required
              normalize={formatPhone}
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 14,
                  message: '유효한 전화번호를 입력해 주세요',
                },
                checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="연락처"
              name="phone_number"
            >
              <BaseInput placeholder="연락처 입력" />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_: RuleObject, value: StoreValue) => validateStartDate(form, value),
                },
              ]}
              label="나이 [생년월일]"
              name="age"
            >
              <S.DatePicker
                disabledDate={(current) => current && current > dayjs()}
                format={DATE_FORMAT.BASIC1}
                placeholder="생년월일 선택"
                // renderExtraFooter={() => {
                //   const birthDay = form.getFieldValue('age');
                //   const birthAge = form.getFieldValue('ageSum');
                //   return birthDay ? `${birthDay.format(DATE_FORMAT.BASIC1)} - ${birthAge}세` : null;
                // }}
                suffixIcon={<Calendar />}
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      value &&
                      value == 'NONE' &&
                      AVAILABLE_CONTRACT.includes(getFieldValue('job_contract'))
                    ) {
                      return Promise.reject(
                        new Error(
                          '운전 면허증은 "None"으로 선택할 수 없습니다. 다른 옵션을 선택해 주세요!'
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              label="운전면허"
              name="driver_license"
            >
              <BaseSelect
                placeholder="Driver License"
                options={[
                  { value: 'NONE', label: 'None' },
                  { value: '1종 대형', label: '1종 대형' },
                  { value: '1종 보통', label: '1종 보통' },
                  { value: '1종 특수', label: '1종 특수' },
                  { value: '2종 보통', label: '2종 보통' },
                  { value: '2종 소형', label: '2종 소형' },
                ]}
              />
            </BaseFormItem>
          </BaseCol>
        </BaseRow>

        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_: RuleObject, value: StoreValue) =>
                    validateStartDate(form, value, '올바른 계약 기간을 선택해 주세요'),
                },
              ]}
              label="계약 시작일"
              name="start_date"
            >
              <S.DatePicker
                disabledDate={(current) => current && current > dayjs()}
                format={DATE_FORMAT.BASIC1}
                placeholder="계약 시작일"
                suffixIcon={<Calendar />}
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
              rules={[
                {
                  validator: (_: RuleObject, value: StoreValue) => {
                    if (value && value.isBefore(dayjs(), 'day')) {
                      setDisableStatus(true);
                      form.setFieldValue('status', STATUS.RESIGNED);
                    } else {
                      setDisableStatus(false);
                      form.setFieldValue('status', STATUS.NORMAL);
                    }
                    return validateEndDate(form, value, '올바른 계약 기간을 선택해 주세요');
                  },
                },
              ]}
              label="계약 종료일"
              name="end_date"
            >
              <S.DatePicker
                format={DATE_FORMAT.BASIC1}
                placeholder="계약 종료일"
                suffixIcon={<Calendar />}
              />
            </BaseFormItem>
          </BaseCol>
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
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseFormItem
              required
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              label="직무 [계약 형태]"
              name="job_contract"
            >
              <BaseSelect
                placeholder="직무 [계약 형태] 선택"
                options={[
                  { value: 'DRIVING_CREW_REGULAR', label: '운전 [정규]' },
                  { value: 'SUPPORT_CREW_REGULAR', label: '지원 [정규]' },
                  { value: 'SUPPORT_CREW_FIXED_TERM', label: '지원 [계약]' },
                  { value: 'COLLECT_CREW_REGULAR', label: '탑승 [정규]' },
                  { value: 'COLLECT_CREW_MONTHLY', label: '탑승 [단기] ' },
                  { value: 'COLLECT_CREW_FIXED_TERM', label: '탑승 [계약]' },
                  { value: 'MECHANIC_REGULAR', label: '정비 [정규]' },
                  { value: 'OFFICE_CREW_REGULAR', label: '사무 [정규]' },
                  { value: 'MANAGER_REGULAR', label: '간부 [정규]' },
                ]}
              />
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseFormItem
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
            </BaseFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_: RuleObject, value: StoreValue) => {
                    if (value === STATUS.RESIGNED) {
                      setDisableStatus(true);
                      form.setFieldValue('end_date', dayjs().subtract(1, 'day'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              label="상태"
              name="status"
            >
              <BaseSelect
                options={statusOptions}
                disabled={!permissions.updateAble || disableStatus}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItem label="대체자" name="replacement">
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

export default EditWorkerForm;
