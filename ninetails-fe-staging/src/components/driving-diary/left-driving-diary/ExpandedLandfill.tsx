import TimeIcon from '@/assets/images/driving-diary/time.svg';
import { DATE_FORMAT } from '@/constants';
import { useUploadFile } from '@/hooks/features/useTenant';
import { useFeedback } from '@/hooks/useFeedback';
import { usePermissions } from '@/hooks/usePermissions';
import { LandfillRecord } from '@/interfaces/driving-diary';
import { Form } from 'antd';
import { RcFile } from 'antd/es/upload';
import locale from 'antd/lib/date-picker/locale/ko_KR';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import React, { useEffect, useState } from 'react';

import { calculateDuration } from '../index.utils';
import * as S from './index.styles';

interface ExpandedLandfillProps {
  record?: LandfillRecord;
  expandedRowKeys: number[];
  isShowAddNewRecord: boolean;
  setIsShowAddNewRecord: (value: boolean) => void;
  onSave?: (values: any) => void;
}

const ExpandedLandfill = ({
  record,
  expandedRowKeys,
  setIsShowAddNewRecord,
  isShowAddNewRecord,
  onSave,
}: ExpandedLandfillProps) => {
  const [form] = Form.useForm();
  const { notification } = useFeedback();
  const uploadFile = useUploadFile();
  const [uploadUrl, setUploadUrl] = useState<{ link: string; name: string }>();
  const permissions = usePermissions();
  const [errorMsgUploadFile, setErroMsgUploadFile] = useState('');
  const [errorSerial, setErrorSerial] = useState<string>('');
  const [errorLoadingWeight, setErrorLoadingWeight] = useState<boolean>(false);
  const [errorEmptyWeight, setErrorEmptyWeight] = useState<boolean>(false);
  const [errorMsgWeight, setErrorMsgWeight] = useState<string>('');
  const [errorMsgTime, setErrorMsgTime] = useState<string>('');
  const [errorTime, setErrorTime] = useState<boolean>(false);

  const resetForm = () => {
    form.resetFields();
    setErroMsgUploadFile('');
    setErrorSerial('');
    setErrorLoadingWeight(false);
    setErrorEmptyWeight(false);
    setErrorMsgWeight('');
    setErrorMsgTime('');
    setUploadUrl(undefined);
  };

  useEffect(() => {
    if (record) {
      const values: any = {
        serial: record.serial,
        url: record.url,
        loadingWeight: record.loading_weight,
        emptyWeight: record.empty_weight,
        entranceTime: record.entrance_time,
        exitTime: record.exit_time,
        difference: record.loading_weight - record.empty_weight,
        timeDifference: calculateDuration(record.entrance_time, record.exit_time),
      };

      const dateFields: Array<keyof typeof values> = ['entranceTime', 'exitTime'];
      dateFields.forEach((field) => {
        values[field] = values[field] ? dayjs(values[field]) : null;
      });

      form.setFieldsValue(values);

      setUploadUrl({ link: record?.url, name: record.filename });
    }
  }, [record, form, expandedRowKeys]);

  useEffect(() => {
    if (!expandedRowKeys.length && isShowAddNewRecord) {
      resetForm();
    }
  }, [expandedRowKeys, isShowAddNewRecord]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const today = dayjs().startOf('day');
      const entranceTime = dayjs(values.entranceTime, DATE_FORMAT.HOUR_MINUTE)
        .set('year', today.year())
        .set('month', today.month())
        .set('date', today.date());
      const exitTime = dayjs(values.exitTime, DATE_FORMAT.HOUR_MINUTE)
        .set('year', today.year())
        .set('month', today.month())
        .set('date', today.date());

      const formattedValues = {
        ...values,
        entranceTime: entranceTime.toISOString(),
        exitTime: exitTime.toISOString(),
        id: record?.id,
        url: uploadUrl?.link,
        filename: uploadUrl?.name,
        date: dayjs().toISOString(),
      };

      onSave?.(formattedValues);
      setIsShowAddNewRecord(false);
    });
  };

  const handleFileUpload = async (file: RcFile) => {
    const isPdf = file.type === 'application/pdf';
    const isLt20M = file.size / 1024 / 1024 < 20;

    if (!isPdf) {
      setErroMsgUploadFile('PDF 파일만 허용됩니다. 다시 시도해 주세요!');
      return false;
    }

    if (!isLt20M) {
      notification.error({
        message: '파일이 너무 큽니다. 20MB 이하의 파일을 업로드해 주세요.',
      });
      return false;
    }
    const formData = new FormData();
    formData.append('file', file);

    uploadFile.mutateAsync(formData).then((res) => {
      if (res.data.url) {
        setUploadUrl({
          link: res.data.url,
          name: file.name,
        });
      }
    });
  };

  const validateWeight = () => {
    const loadingWeight = form.getFieldValue('loadingWeight');
    const emptyWeight = form.getFieldValue('emptyWeight');

    if (loadingWeight && emptyWeight && +loadingWeight < +emptyWeight) {
      setErrorLoadingWeight(true);
      setErrorMsgWeight('유효하지 않은 무게입니다. 다시 입력해 주세요!');
      return;
    }

    setErrorLoadingWeight(false);
    setErrorMsgWeight('');
    const difference = +loadingWeight - +emptyWeight;
    form.setFieldsValue({
      difference: isNaN(difference) ? '--' : difference,
    });
    return Promise.resolve();
  };

  const handleTimeChange = () => {
    const entranceTime = dayjs(form.getFieldValue('entranceTime'));
    const exitTime = dayjs(form.getFieldValue('exitTime'));

    if (entranceTime.isValid() && exitTime.isValid()) {
      if (exitTime.isBefore(entranceTime)) {
        setErrorMsgTime('유효하지 않은 시간 범위입니다. 다시 입력해 주세요!');
        setErrorTime(true);
        return;
      } else {
        setErrorTime(false);
        setErrorMsgTime('');
        const duration = dayjs.duration(exitTime.diff(entranceTime));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const formattedHours = isNaN(hours) ? '--' : hours.toString().padStart(2, '0');
        const formattedMinutes = isNaN(minutes) ? '--' : minutes.toString().padStart(2, '0');
        form.setFieldsValue({
          timeDifference: `${formattedHours}:${formattedMinutes}`,
        });
      }
    } else {
      form.setFieldsValue({
        timeDifference: '--',
      });
    }
  };

  const validateSerial = (rule: any, value: any) => {
    if (
      (value && (isNaN(value) || value.toString().length > 3 || /^0/.test(value.toString()))) ||
      value === ''
    ) {
      setErrorSerial('이 필드는 필수입니다.');
      return;
    }
    setErrorSerial('');
    return Promise.resolve();
  };

  if (record && !expandedRowKeys.includes(record.id)) {
    return null;
  }

  const handleInputValidation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    if ((value.length === 0 && e.key === '0') || value.length >= 7) {
      e.preventDefault();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={record}
      onFinish={handleSave}
      disabled={!permissions?.updateAble}
    >
      <S.ExpandedInfoGroupInput>
        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              short
              label="순번"
              name="serial"
              rules={[
                { validator: validateSerial, required: true },
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                placeholder="No"
                maxLength={3}
                onKeyDown={handleInputValidation}
                isError={!!errorSerial}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap
              label="전표 PDF"
              name="url"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
              style={{ width: '70%', marginLeft: 6 }}
            >
              <S.UploadWrap
                name="pdf"
                showUploadList={false}
                customRequest={({ file }) => handleFileUpload(file as RcFile)}
                accept=".pdf"
              >
                <S.InputWrap
                  disabled={!permissions?.updateAble}
                  style={{ padding: '8px 12px' }}
                  placeholder=".pdf file"
                  className="input-file"
                  readOnly
                  value={uploadUrl?.name ?? ''}
                  suffix={<S.UploadPdfIconWrap />}
                />
              </S.UploadWrap>
            </S.BaseFormItemWrap>
          </S.Row>
          {errorMsgUploadFile || errorSerial ? (
            <S.ErrorMsg>{errorMsgUploadFile || errorSerial}</S.ErrorMsg>
          ) : null}
        </S.RowRecord>

        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              label="상차 중량"
              name="loadingWeight"
              rules={[
                { validator: validateWeight, required: true },
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                placeholder="kg"
                type="text"
                maxLength={5}
                isError={errorLoadingWeight}
                onKeyDown={(e) => {
                  handleInputValidation(e);
                  if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                    e.preventDefault();
                  }
                }}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap
              label="공차 중량"
              name="emptyWeight"
              rules={[
                { validator: validateWeight, required: true },
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                placeholder="kg"
                type="text"
                maxLength={5}
                isError={errorEmptyWeight}
                onKeyDown={(e) => {
                  handleInputValidation(e);
                  if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                    e.preventDefault();
                  }
                }}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap short label="편차" name="difference">
              <S.InputWrap $isNumber $placeholder placeholder="--" disabled />
            </S.BaseFormItemWrap>
          </S.Row>
          {errorLoadingWeight && <S.ErrorMsg>{errorMsgWeight}</S.ErrorMsg>}
        </S.RowRecord>

        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              label="입차 시각"
              name="entranceTime"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.DatePickerWrap
                disabled={!permissions?.updateAble}
                suffixIcon={<TimeIcon />}
                format="HH:mm"
                placeholder="hh:mm"
                isError={errorTime}
                picker="time"
                onChange={(date) => {
                  if (date) handleTimeChange();
                }}
                allowClear={false}
                locale={{
                  ...locale,
                  lang: {
                    ...locale.lang,
                    now: '지금',
                    ok: 'OK',
                  },
                  timePickerLocale: {
                    placeholder: 'Select time',
                  },
                }}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap
              label="출차 시각"
              name="exitTime"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
              ]}
            >
              <S.DatePickerWrap
                disabled={!permissions?.updateAble}
                suffixIcon={<TimeIcon />}
                format="HH:mm"
                placeholder="hh:mm"
                isError={errorTime}
                picker="time"
                onChange={(date) => {
                  if (date) handleTimeChange();
                }}
                allowClear={false}
                locale={{
                  ...locale,
                  lang: {
                    ...locale.lang,
                    now: '지금',
                    ok: 'OK',
                  },
                  timePickerLocale: {
                    placeholder: 'Select time',
                  },
                }}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap short label="편차" name="timeDifference">
              <S.InputWrap $isNumber $placeholder placeholder="--" disabled />
            </S.BaseFormItemWrap>
          </S.Row>
          {errorMsgTime && <S.ErrorMsg>{errorMsgTime}</S.ErrorMsg>}
        </S.RowRecord>
      </S.ExpandedInfoGroupInput>

      {isShowAddNewRecord && !record ? (
        <S.GroupButton>
          <S.ButtonSubmit type="primary" htmlType="submit">
            저장
          </S.ButtonSubmit>
          <S.ButtonCancel type="default" onClick={() => setIsShowAddNewRecord(false)}>
            취소
          </S.ButtonCancel>
        </S.GroupButton>
      ) : (
        <>
          <S.SaveButtonWrapper>
            <S.ButtonSubmit htmlType="submit" disabled={!permissions.updateAble}>
              저장
            </S.ButtonSubmit>
          </S.SaveButtonWrapper>

          <S.AddRecord>
            <S.AddRecordWrap
              $disabled={!permissions.createAble}
              onClick={() => {
                if (permissions.createAble) {
                  setIsShowAddNewRecord(!isShowAddNewRecord);
                }
              }}
            >
              <S.PlusIconWrap />
              <S.AddRecordText className="add-record">기록 추가</S.AddRecordText>
            </S.AddRecordWrap>
          </S.AddRecord>
        </>
      )}
    </Form>
  );
};

export default ExpandedLandfill;
