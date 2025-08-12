import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseInput } from '@/components/common/inputs/base-input';
import { BaseSelect } from '@/components/common/selects/base-select';
import {
  CheckableTag,
  DayList,
  FormItem,
  Modal,
  SelectMultiple,
} from '@/components/settings/absence/index.styles';
import { TYPE_TABS } from '@/components/settings/absence/index.utils';
import * as S from '@/components/settings/user/index.styles';
import {
  ABSENCE_DAY_LIST,
  ABSENCE_TYPE,
  ABSENCE_TYPE_STAFF,
  REPEAT_TYPE,
  REPEAT_TYPE_EN,
} from '@/constants/settings';
import { FormValues, IWorker, RecordTypes } from '@/interfaces';
import { getOrdinalSuffix } from '@/utils';
import { Form, FormInstance } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import { DatePickerWrap } from '../index.styles';
import { countSundays, useModelAddAbsence } from './index.utils';

interface ModelAddAbsenceProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (value: FormValues) => void;
  optionList?: RecordTypes[] | IWorker[];
  form: FormInstance<FormValues>;
  type: TYPE_TABS;
}

export const WEEK_DAYS = [
  { number: 1, value: 'MONDAY' },
  { number: 2, value: 'TUESDAY' },
  { number: 3, value: 'WEDNESDAY' },
  { number: 4, value: 'THURSDAY' },
  { number: 5, value: 'FRIDAY' },
  { number: 6, value: 'SATURDAY' },
];

const ModelAddAbsence: React.FC<ModelAddAbsenceProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  optionList,
  form,
  type,
}) => {
  const {
    isHaftDayLeave,
    handleChangeAbsence,
    handleOnSelectAbsence,
    disablePastDates,
    LABEL,
    title,
    optionVehicleList,
    STAFF_LABEL,
    absenceTypeList,
    daysInMonth,
    isHaftDay,
    setIsHaftDayLeave,
  } = useModelAddAbsence(form, type, optionList);

  const [errorTag, setErrorTag] = useState(false);
  const watchStartDate = Form.useWatch(['start_date'], form);
  const watchEndDate = Form.useWatch(['end_date'], form);
  const watchMultipleDay = Form.useWatch(['multiple_day'], form);
  const watchAbsenceType = Form.useWatch(['absence_type'], form);

  const onValueChange = (
    changeValue: Partial<{
      start_date: string;
      end_date: number;
    }>
  ) => {
    const type = form.getFieldValue('absence_type');
    const changedField = Object.keys(changeValue)[0];
    type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;
    if (
      changedField === 'start_date' ||
      changedField === 'end_date' ||
      changedField === 'absence_type'
    ) {
      handleChangeAbsence(type);
    }
    const absence_type = ABSENCE_TYPE[type as AbsenceTypeKeys] || type;
    setIsHaftDayLeave(isHaftDay(absence_type));
  };

  const handleCancelModal = () => {
    form.resetFields();
    setSelectedTags([]);
    setSelectedRepeatType(REPEAT_TYPE.NONE);
    onCancel();
  };

  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedRepeatType, setSelectedRepeatType] = useState(REPEAT_TYPE_EN.NONE);

  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);
    form.setFieldValue('day', nextSelectedTags);
  };

  useEffect(() => {
    if (selectedRepeatType === REPEAT_TYPE_EN.WEEKLY && watchStartDate && watchEndDate) {
      let countOffDay = 0;

      selectedTags.forEach((item) => {
        let start = dayjs(form.getFieldValue('start_date'));
        let end = dayjs(form.getFieldValue('end_date'));

        const foundDay = WEEK_DAYS.find((el) => el.value === item);
        if (foundDay) {
          while (start.isBefore(end) || start.isSame(end)) {
            if (start.day() === foundDay.number) {
              countOffDay++;
            }
            start = start.add(1, 'day');
          }
        }
      });

      form.setFieldValue('period', `${countOffDay}일 [${countOffDay * 8}H]`);
    } else if (selectedRepeatType === REPEAT_TYPE_EN?.NONE && watchStartDate && watchEndDate) {
      // count sunday:

      const sundayNum = countSundays(watchStartDate, watchEndDate);
      const diffDays = dayjs(watchEndDate).diff(dayjs(watchStartDate), 'day') + 1 - sundayNum;
      form.setFieldValue('period', `${diffDays}일 [${diffDays * 8}H]`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, selectedRepeatType, watchStartDate, watchEndDate]);

  useEffect(() => {
    if (selectedRepeatType === REPEAT_TYPE_EN.MONTHLY && watchStartDate && watchEndDate) {
      let countOffDay = 0;

      watchMultipleDay?.forEach((item) => {
        let start = dayjs(form.getFieldValue('start_date'));
        let end = dayjs(form.getFieldValue('end_date'));

        while (start.isBefore(end) || start.isSame(end)) {
          // check if current is not sunday
          if (start.date() === Number(item) && start.day() !== 0) {
            countOffDay++;
          }
          start = start.add(1, 'day');
        }
      });

      form.setFieldValue('period', `${countOffDay}일 [${countOffDay * 8}H]`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchMultipleDay, selectedRepeatType, watchStartDate, watchEndDate]);

  return (
    <Modal width={600} title={title} footer={false} open={isOpen} onCancel={handleCancelModal}>
      <S.Form layout="vertical" form={form} onFinish={onConfirm} onValuesChange={onValueChange}>
        <BaseRow gutter={16}>
          <BaseCol span={12}>
            <S.FormItem
              label={LABEL.NAME}
              name="absence"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                {
                  validator: (_, value) => {
                    const replacement = form.getFieldValue('replacement');
                    if (replacement === value) {
                      form.setFields([
                        {
                          name: 'replacement',
                          errors: [
                            'Absence and replacement cannot be the same. Please choose another!',
                          ],
                        },
                      ]);
                    } else {
                      form.setFields([{ name: 'replacement', errors: [] }]);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <BaseSelect
                showSearch
                optionFilterProp="label"
                placeholder={type === TYPE_TABS.STAFF ? '이름 선택' : '차번 선택'}
                onChange={(value) => handleOnSelectAbsence(value as number)}
                options={optionVehicleList}
              />
            </S.FormItem>
          </BaseCol>

          <BaseCol span={12}>
            <S.FormItem label={LABEL.PURPOSE} name="purpose" required>
              <BaseInput disabled={true} placeholder="--" value={'--'} />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={12}>
            <S.FormItem
              label={LABEL.TYPE}
              name="absence_type"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <BaseSelect
                placeholder="부재 항목 선택"
                onSelect={(type) => handleChangeAbsence(type)}
                options={absenceTypeList}
              />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={12}>
            <S.FormItem
              label={LABEL.REPLACE}
              name="replacement"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_, value, callback) => {
                    const absence = form.getFieldValue('absence');
                    if (absence === value) {
                      callback(
                        'Absence and replacement cannot be the same. Please choose another!'
                      );
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              <BaseSelect
                showSearch
                optionFilterProp="label"
                placeholder={type === TYPE_TABS.STAFF ? '대체자 선택' : '대체차량 선택'}
                options={optionVehicleList}
              />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        {type === TYPE_TABS.STAFF && watchAbsenceType === ABSENCE_TYPE_STAFF.OTHER && (
          <BaseRow>
            <BaseCol span={24}>
              <S.FormItem
                name="other"
                label={STAFF_LABEL.OTHER_TYPE}
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                  { max: 200, message: `${STAFF_LABEL.OTHER_TYPE} 200자 이상이 될 수 없습니다.` },
                ]}
              >
                <BaseInput placeholder="이유 입력" />
              </S.FormItem>
            </BaseCol>
          </BaseRow>
        )}
        <BaseRow gutter={16}>
          <BaseCol span={12}>
            <S.FormItem
              required
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_, value) => {
                    const endDate = form.getFieldValue('end_date');
                    if (value && endDate && value.isAfter(endDate)) {
                      return Promise.reject('유효한 기간을 선택해 주세요.');
                    } else {
                      form.setFields([{ name: 'end_date', errors: [] }]);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              label={LABEL.START_DATE}
              name="start_date"
            >
              <DatePickerWrap placeholder="시작일 선택" disabledDate={disablePastDates} />
            </S.FormItem>
          </BaseCol>
          <BaseCol span={12}>
            <S.FormItem
              required
              rules={[
                {
                  validator: (_, value, callback) => {
                    const absenceType = form.getFieldValue('absence_type');
                    if ((!absenceType && !value) || (!isHaftDayLeave && !value)) {
                      callback('이 필드는 필수입니다.');
                    } else {
                      callback();
                    }
                  },
                },
                {
                  validator: (_, value) => {
                    const startDate = form.getFieldValue('start_date');
                    if (value && startDate && value.isBefore(startDate)) {
                      return Promise.reject('유효한 기간을 선택해 주세요.');
                    } else {
                      form.setFields([{ name: 'start_date', errors: [] }]);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              label={LABEL.END_DATE}
              name="end_date"
            >
              <DatePickerWrap
                placeholder="종료일 선택"
                disabled={isHaftDayLeave}
                disabledDate={disablePastDates}
              />
            </S.FormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={12}>
            <S.FormItem required label={LABEL.TIME} name="period">
              <BaseInput disabled={true} placeholder="--" value={'--'} />
            </S.FormItem>
          </BaseCol>
          {type === TYPE_TABS.STAFF && (
            <BaseCol span={12}>
              <S.FormItem required label={STAFF_LABEL.DAY} name="repeat">
                <BaseSelect
                  value={selectedRepeatType}
                  defaultValue={REPEAT_TYPE_EN.NONE}
                  options={[
                    { label: REPEAT_TYPE.NONE, value: REPEAT_TYPE_EN.NONE },
                    { label: REPEAT_TYPE.WEEKLY, value: REPEAT_TYPE_EN.WEEKLY },
                    { label: REPEAT_TYPE.MONTHLY, value: REPEAT_TYPE_EN.MONTHLY },
                  ]}
                  onChange={(value) => setSelectedRepeatType(value as string)}
                />
              </S.FormItem>
              {selectedRepeatType === REPEAT_TYPE_EN.WEEKLY && (
                <FormItem
                  name="day"
                  rules={[
                    {
                      validator: (_, value, callback) => {
                        if (!value || value.length === 0) {
                          setErrorTag(true);

                          callback('이 필드는 필수입니다.');
                        } else {
                          setErrorTag(false);
                          callback();
                        }
                      },
                    },
                  ]}
                >
                  <DayList>
                    {ABSENCE_DAY_LIST.map((item) => (
                      <CheckableTag
                        $isError={errorTag}
                        checked={selectedTags.includes(item.value)}
                        onChange={(checked) => handleChange(item.value, checked)}
                        key={item.value}
                      >
                        {item.label}
                      </CheckableTag>
                    ))}
                  </DayList>
                </FormItem>
              )}

              {selectedRepeatType === REPEAT_TYPE_EN.MONTHLY && (
                <FormItem
                  name="multiple_day"
                  rules={[
                    {
                      required: true,
                      message: '이 필드는 필수입니다.',
                    },
                  ]}
                >
                  <SelectMultiple
                    mode="multiple"
                    maxTagCount="responsive"
                    options={Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      return {
                        value: String(day),
                        label: getOrdinalSuffix(day),
                      };
                    })}
                  />
                </FormItem>
              )}
            </BaseCol>
          )}
        </BaseRow>
        <S.FormItem>
          <S.SubmitButton htmlType="submit" type="primary">
            생성
          </S.SubmitButton>
        </S.FormItem>
      </S.Form>
    </Modal>
  );
};

export default ModelAddAbsence;
