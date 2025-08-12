import Calendar from '@/assets/images/common/Calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { CrewIcon, StatusIcon, TruckIcon } from '@/components/schedule/left-content/statistic/icon';
import { CheckableTag, DayList, ItemsSelect } from '@/components/settings/absence/index.styles';
import { TYPE_TABS } from '@/components/settings/absence/index.utils';
import { DATE_FORMAT } from '@/constants';
import {
  ABSENCE_DAY_LIST,
  ABSENCE_TYPE,
  ABSENCE_TYPE_STAFF,
  ABSENCE_TYPE_VEHICLE,
  JOBCONTRACT_EN,
  LEAVE_HAFT_DAY,
  LEAVE_HAFT_DAY_STAFF,
  LEAVE_LONG_TERM,
  LEAVE_LONG_TERM_STAFF,
  REPEAT_TYPE,
  REPEAT_TYPE_EN,
  STAFF_LABEL,
  STATUS,
  VEHICLE_LABEL,
} from '@/constants/settings';
import { usePermissions } from '@/hooks/usePermissions';
import {
  IAbsenceData,
  IAbsenceStaffData,
  IUpdateAbsence,
  IUpdateAbsenceStaff,
  IWorker,
  RecordTypes,
} from '@/interfaces';
import { CREW_TYPE, STATUS as ICONS_TATUS, VEHICLE_TYPE } from '@/interfaces/schedule';
import { renderJobContract, renderPurpose, truncateName } from '@/utils';
import { Form } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { WEEK_DAYS } from '../ModalAddAbsence';
import { countSundays } from '../ModalAddAbsence/index.utils';
import * as S from './index.styles';
import { SelectMultiple } from './index.styles';

dayjs.extend(utc);

interface EditFormProps {
  record: IAbsenceData | IAbsenceStaffData;
  onSave: (value: IUpdateAbsence | IUpdateAbsenceStaff) => void;
  optionList?: RecordTypes[] | IWorker[];
  type?: string;
}

type AbsenceTypeKeys = keyof typeof ABSENCE_TYPE;

const EditAbsenceForm = ({ record, onSave, optionList, type }: EditFormProps) => {
  const [errorTag, setErrorTag] = useState(false);
  const permissions = usePermissions();
  const [form] = Form.useForm();
  const watchStartDate = Form.useWatch(['start_date'], form);
  const watchEndDate = Form.useWatch(['end_date'], form);
  const watchMultipleDay = Form.useWatch(['multiple_day'], form);
  const watchAbsenceType = Form.useWatch(['absence_type'], form);

  const selectTag =
    'repeat_days_week' in record && record?.repeat_days_week
      ? (record?.repeat_days_week as string).split(',').map((day) => day.trim())
      : [];

  const [isHaftDayLeave, setIsHaftDayLeave] = useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>(selectTag || []);
  const [selectedRepeatType, setSelectedRepeatType] = useState(
    'repeat' in record ? record?.repeat : REPEAT_TYPE.NONE
  );

  const LABEL = TYPE_TABS.VEHICLE === type ? VEHICLE_LABEL : STAFF_LABEL;
  const absenceHaftDay = TYPE_TABS.VEHICLE === type ? LEAVE_HAFT_DAY : LEAVE_HAFT_DAY_STAFF;

  const listVehicle = optionList as RecordTypes[];
  const listStaff = optionList as IWorker[];
  const vehicle =
    'absence_vehicle' in record && optionList && Array.isArray(optionList)
      ? listVehicle.find((vehicle) => vehicle.id === record?.absence_vehicle?.id)
      : null;

  const handleSave = () => {
    form.validateFields().then((values) => {
      if ('absence_vehicle' in record && type === TYPE_TABS.VEHICLE) {
        onSave({
          id: record.id,
          absence_vehicle: {
            id: record?.absence_vehicle?.id,
          },
          replacement_vehicle: {
            id: values?.replacement?.value || values?.replacement,
          },
          absence_type: values?.absence_type,
          start_date: values?.start_date,
          end_date:
            dayjs(values?.end_date).format(DATE_FORMAT.END_OF) ||
            dayjs(values?.start_date).format(DATE_FORMAT.END_OF),
        });
      } else {
        if ('absence_staff' in record && type === TYPE_TABS.STAFF) {
          onSave({
            id: record?.id,
            replacer_staff: {
              id: values?.replacement?.value || values?.replacement,
            },
            repeat: values?.repeat,
            absence_type: values?.absence_type,
            start_date: values?.start_date,
            end_date:
              dayjs(values?.end_date).format(DATE_FORMAT.END_OF) ||
              dayjs(values?.start_date).format(DATE_FORMAT.END_OF),
            period: values?.period,
            days:
              values.repeat === REPEAT_TYPE_EN.MONTHLY ? values?.multiple_day : values?.day || [],
            ...(values?.other ? { other: values?.other } : {}),
          });
        }
      }
    });
  };

  const optionVehicleList =
    listVehicle
      ?.filter((vehicle) => vehicle.status !== STATUS.RESIGNED)
      .map((vehicle) => ({
        value: vehicle?.id,
        label: (
          <ItemsSelect>
            {_.includes(
              LEAVE_LONG_TERM,
              ABSENCE_TYPE?.[record?.absence_type as AbsenceTypeKeys]
            ) ? (
              <StatusIcon status={ICONS_TATUS.REPLACE_LONG_TERM} />
            ) : (
              <StatusIcon status={ICONS_TATUS.REPLACE_SHORT_TERM} />
            )}
            <TruckIcon vehicle_type={vehicle?.purpose as VEHICLE_TYPE} />
            {vehicle?.vehicle_number}
          </ItemsSelect>
        ),
      })) ?? [];

  const workersOptionSelect = [
    {
      value: 0,
      label: <ItemsSelect>전체 차량</ItemsSelect>,
    },
    ...(listStaff
      .filter((workers) => workers.status !== STATUS.RESIGNED)
      .filter((workers) => {
        return (record as IAbsenceStaffData)?.absence_staff?.job_contract ===
          JOBCONTRACT_EN.DRIVING_CREW_REGULAR
          ? workers.job_contract === JOBCONTRACT_EN.DRIVING_CREW_REGULAR
          : workers.job_contract !== JOBCONTRACT_EN.DRIVING_CREW_REGULAR;
      })
      .map((workers) => ({
        value: workers.id,
        label: (
          <ItemsSelect>
            {_.includes(LEAVE_LONG_TERM_STAFF, record?.absence_type) ? (
              <StatusIcon status={ICONS_TATUS.REPLACE_LONG_TERM} />
            ) : (
              <StatusIcon status={ICONS_TATUS.REPLACE_SHORT_TERM} />
            )}
            <CrewIcon crew_type={workers?.job_contract as CREW_TYPE} />
            {workers?.name?.length > 12 ? `${truncateName(workers?.name, 13)}...` : workers?.name}
          </ItemsSelect>
        ),
      })) ?? []),
  ];

  const listOption = type === TYPE_TABS.VEHICLE ? optionVehicleList : workersOptionSelect;

  const recordStaff = useMemo(() => {
    if ('absence_vehicle' in record) {
      return {
        ...record,
        purpose: renderPurpose(vehicle?.purpose || ''),
        absence: record?.absence_vehicle?.vehicle_number,
        replacement: optionVehicleList.find(
          (vehicle) => vehicle?.value === record?.replacement_vehicle?.id
        ),
        start_date: dayjs(record.start_date),
        end_date: dayjs.utc(record?.end_date),
        absence_type: _.find(
          ABSENCE_TYPE_VEHICLE,
          (vehicle) => vehicle.value === record.absence_type
        )?.value,
      };
    } else if ('absence_staff_id' in record) {
      return {
        ...record,
        purpose: renderJobContract(record?.absence_staff?.job_contract),
        absence: record?.absence_staff?.name,
        replacement: workersOptionSelect.find(
          (worker) => worker?.value === record?.replacer_staff?.id
        ),
        start_date: dayjs(record?.start_date),
        end_date: dayjs.utc(record?.end_date),
        repeat: record?.repeat,
        period: record?.period,
        multiple_day: record?.repeat_days_month
          ? ((record?.repeat_days_month as string) || '').split(',').map((day) => day.trim())
          : [],
      };
    }
  }, [record]);

  useEffect(() => {
    handleChangeAbsence(record?.absence_type);
  }, [form, record.absence_type]);

  const isHaftDay = (type: string | unknown) => _.includes(absenceHaftDay, type);

  const handleChangeAbsence = useCallback(
    (absence: unknown) => {
      const getAbsenceType = () => {
        if (type === TYPE_TABS.VEHICLE) {
          return ABSENCE_TYPE[absence as keyof typeof ABSENCE_TYPE];
        }
        const key = _.findKey(ABSENCE_TYPE_STAFF, (value) => value === absence);
        return key ? ABSENCE_TYPE_STAFF[key as keyof typeof ABSENCE_TYPE_STAFF] : undefined;
      };

      const absence_type = getAbsenceType();
      const leaveHaftDay = isHaftDay(absence_type);
      setIsHaftDayLeave(leaveHaftDay);

      const startDate = form.getFieldValue('start_date');
      const endDate = form.getFieldValue('end_date');

      if (leaveHaftDay) {
        form.resetFields(['end_date']);
        form.setFieldsValue({
          end_date: startDate,
          period: '0.5일 [4H]',
        });
        return;
      }

      if (!startDate || !endDate) {
        form.setFieldValue('period', '');
        return;
      }

      const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
      form.setFieldValue('period', totalDays > 0 ? `${totalDays}일 [${totalDays * 8}H]` : '');
    },
    [form]
  );

  const disablePastDates = (current: Dayjs) => {
    return (current && current.isBefore(dayjs().endOf('day'))) || (current && current.day() === 0);
  };

  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);
    form.setFieldValue('day', nextSelectedTags);
  };

  const onValueChange = (
    changeValue: Partial<{
      start_date: string;
      end_date: number;
    }>
  ) => {
    const type = form.getFieldValue('absence_type');
    const changedField = Object.keys(changeValue)[0];

    if (changedField === 'start_date' || changedField === 'end_date') {
      handleChangeAbsence(type);
    }
  };

  const absenceTypeList = useMemo(() => {
    if (type === TYPE_TABS.STAFF) {
      return Object.keys(ABSENCE_TYPE_STAFF).map((type) => ({
        label: ABSENCE_TYPE_STAFF[type as keyof typeof ABSENCE_TYPE_STAFF],
        value: ABSENCE_TYPE_STAFF[type as keyof typeof ABSENCE_TYPE_STAFF],
      }));
    } else {
      return ABSENCE_TYPE_VEHICLE.map((type) => {
        return {
          label: type.label,
          value: type.value,
        };
      });
    }
  }, [type]);

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;
  const currentDate = new Date();

  const daysInMonth = dayjs(`${currentYear}-${currentMonth}`).daysInMonth();
  const isDisabledForm = new Date(record.start_date) < currentDate;

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

      watchMultipleDay?.forEach((item: string) => {
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
    <S.EditTableFormWrap>
      <BaseForm
        form={form}
        layout="vertical"
        initialValues={recordStaff}
        disabled={!permissions.updateAble || isDisabledForm}
        onValuesChange={onValueChange}
      >
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItems label={LABEL.NAME} name="absence">
              <S.Input disabled />
            </S.FormItems>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItems label={LABEL.PURPOSE} name="purpose">
              <S.Input disabled />
            </S.FormItems>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItems
              label={LABEL.TYPE}
              name="absence_type"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <S.Select
                onSelect={(type) => handleChangeAbsence(type)}
                options={absenceTypeList}
                disabled={!permissions.updateAble || isDisabledForm}
              />
            </S.FormItems>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItems
              label={LABEL.REPLACE}
              name="replacement"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  validator: (_, value, callback) => {
                    const absence =
                      'absence_vehicle' in record
                        ? record?.absence_vehicle?.id
                        : record?.absence_staff?.id;
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
              <S.Select
                showSearch
                options={listOption}
                disabled={!permissions.updateAble || isDisabledForm}
              />
            </S.FormItems>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <S.FormItems
              label={LABEL.START_DATE}
              name="start_date"
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
                  validator: (_, value, callback) => {
                    const startDate = form.getFieldValue('start_date');
                    if (value && startDate && value.isBefore(startDate)) {
                      callback('유효한 기간을 선택해 주세요.');
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              <S.DatePickerWrap
                format={'YYYY-MM-DD'}
                disabledDate={disablePastDates}
                disabled={!permissions.updateAble || isDisabledForm}
                suffixIcon={<Calendar />}
              />
            </S.FormItems>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItems
              label={LABEL.END_DATE}
              name="end_date"
              rules={[
                { required: !isHaftDayLeave, message: '이 필드는 필수입니다.' },
                {
                  validator: (_, value, callback) => {
                    const start_date = form.getFieldValue('start_date');
                    if (value && start_date && value.isBefore(start_date)) {
                      callback('유효한 기간을 선택해 주세요.');
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              <S.DatePickerWrap
                format={'YYYY-MM-DD'}
                disabled={
                  isDisabledForm ? isDisabledForm : isHaftDayLeave || !permissions.updateAble
                }
                disabledDate={disablePastDates}
                suffixIcon={<Calendar />}
              />
            </S.FormItems>
          </BaseCol>
          <BaseCol span={6}>
            <S.FormItems label={LABEL.TIME} name="period">
              <S.Input disabled placeholder="--" value={'--'} />
            </S.FormItems>
          </BaseCol>
          {type === TYPE_TABS.STAFF && (
            <BaseCol span={6}>
              <S.DayFormItem required label={STAFF_LABEL.DAY} name="repeat">
                <S.Select
                  value={selectedRepeatType}
                  defaultValue={REPEAT_TYPE_EN.NONE}
                  options={[
                    { label: REPEAT_TYPE.NONE, value: REPEAT_TYPE_EN.NONE },
                    { label: REPEAT_TYPE.WEEKLY, value: REPEAT_TYPE_EN.WEEKLY },
                    { label: REPEAT_TYPE.MONTHLY, value: REPEAT_TYPE_EN.MONTHLY },
                  ]}
                  onChange={(value) => setSelectedRepeatType(value as string)}
                  disabled={!permissions.updateAble || isDisabledForm}
                />
              </S.DayFormItem>
              {selectedRepeatType === REPEAT_TYPE_EN.WEEKLY && (
                <S.DayFormItem
                  name="day"
                  rules={[
                    {
                      validator: (_, value, callback) => {
                        if (!value || value?.length === 0) {
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
                </S.DayFormItem>
              )}

              {selectedRepeatType === REPEAT_TYPE_EN.MONTHLY && (
                <S.MultipleSelectFormItem
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
                </S.MultipleSelectFormItem>
              )}
            </BaseCol>
          )}
          {type === TYPE_TABS?.STAFF && watchAbsenceType === ABSENCE_TYPE_STAFF.OTHER && (
            <BaseCol span={6}>
              <S.FormItems
                label={STAFF_LABEL.OTHER_TYPE}
                name="other"
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  { max: 200, message: `${STAFF_LABEL.OTHER_TYPE} 200자 이상이 될 수 없습니다.` },
                ]}
              >
                <S.Input placeholder="이유 입력" />
              </S.FormItems>
            </BaseCol>
          )}
        </BaseRow>
        {!isDisabledForm && (
          <BaseRow justify="center">
            <S.BtnSave type="primary" onClick={handleSave}>
              저장
            </S.BtnSave>
          </BaseRow>
        )}
      </BaseForm>
    </S.EditTableFormWrap>
  );
};

export default EditAbsenceForm;
