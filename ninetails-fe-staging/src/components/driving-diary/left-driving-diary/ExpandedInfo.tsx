import { usePermissions } from '@/hooks/usePermissions';
import { DrivingRecordTypes } from '@/interfaces/driving-diary';
import { formatNumber } from '@/utils';
import { Form } from 'antd';
import React, { useEffect, useState } from 'react';

import * as S from './index.styles';

interface ExpandedInfoProps {
  onSaveDrivingRecord: (data: any) => void;
  drivingRecord: DrivingRecordTypes | null;
}

const ExpandedInfo = ({ onSaveDrivingRecord, drivingRecord }: ExpandedInfoProps) => {
  const [form] = Form.useForm();
  const permissions = usePermissions();
  const [errorDistance, setErrorDistance] = useState<boolean>(false);
  const [errorYesterday, setErrorYesterday] = useState<boolean>(false);
  const [errorToday, setErrorToday] = useState<boolean>(false);
  const [errorMsgFule, setErrorMsgFuel] = useState<string>('');
  const [errorFuelVolume, setErrorFuelVolume] = useState<boolean>(false);
  const [errorMsgVolume, setErrorMsgVolume] = useState<string>('');

  useEffect(() => {
    if (drivingRecord) {
      form.setFieldsValue({
        distance_yesterday: drivingRecord.distance_yesterday,
        distance_today: drivingRecord.distance_today,
        fuel_yesterday: drivingRecord.fuel_yesterday,
        fuel_today: drivingRecord.fuel_today,
        fuel_volumn: drivingRecord.fuel_volumn,
        distanceDriven: drivingRecord?.distance_today - drivingRecord?.distance_yesterday,
        fuelConsumption:
          drivingRecord?.fuel_yesterday + drivingRecord.fuel_volumn - drivingRecord?.fuel_today,
      });
    }
  }, [drivingRecord, form]);

  const handleSave = (values: DrivingRecordTypes) => {
    onSaveDrivingRecord(values);
  };

  const validateDistance = (rule: any, value: any) => {
    const distance_yesterday = form.getFieldValue('distance_yesterday');
    const distance_today = form.getFieldValue('distance_today');
    if (value && (isNaN(value) || value.toString().length > 7 || /^0/.test(value.toString()))) {
      setErrorDistance(true);
      return;
    }
    if (
      distance_yesterday !== null &&
      distance_today !== null &&
      +distance_yesterday > +distance_today
    ) {
      setErrorDistance(true);
      return;
    }
    setErrorDistance(false);
    return Promise.resolve();
  };

  const validateFuelYesterday = (rule: any, value: any) => {
    if (value && (isNaN(value) || value.toString().length > 7 || /^0/.test(value.toString()))) {
      setErrorYesterday(true);
      return;
    }
    setErrorMsgFuel('');
    setErrorYesterday(false);
    return Promise.resolve();
  };

  const validateFuelToday = (rule: any, value: any) => {
    const fuel_yesterday = form.getFieldValue('fuel_yesterday');
    const fuel_volumn = form.getFieldValue('fuel_volumn');
    if (value && (isNaN(value) || value.toString().length > 7 || /^0/.test(value.toString()))) {
      setErrorToday(true);

      return;
    }
    if (fuel_yesterday !== null && fuel_volumn !== null && +fuel_yesterday + +fuel_volumn < value) {
      setErrorToday(true);
      setErrorMsgFuel('유효하지 않은 연료 수준입니다. 다시 입력해 주세요!');
      return;
    }
    setErrorToday(false);
    setErrorMsgFuel('');
    return Promise.resolve();
  };

  const validateFuelVolume = (rule: any, value: any) => {
    const fuel_yesterday = form.getFieldValue('fuel_yesterday');
    const fuel_today = form.getFieldValue('fuel_today');
    if (value && (isNaN(value) || value.toString().length > 7 || /^0/.test(value.toString()))) {
      setErrorFuelVolume(true);

      return;
    }
    if (fuel_yesterday !== null && fuel_today !== null && +fuel_yesterday + +value < +fuel_today) {
      setErrorFuelVolume(true);
      setErrorMsgVolume('유효하지 않은 연료 수준입니다. 다시 입력해 주세요!');
      return;
    }
    setErrorFuelVolume(false);
    setErrorMsgVolume('');
    return Promise.resolve();
  };

  const handleInputChange = (changedValues: any, allValues: any) => {
    const { distance_yesterday, distance_today, fuel_yesterday, fuel_today, fuel_volumn } =
      allValues;
    const distanceDriven = +distance_today - +distance_yesterday;
    const fuelConsumption = +fuel_yesterday + +fuel_volumn - +fuel_today;

    form.setFieldsValue({
      distanceDriven: isNaN(distanceDriven) ? '--' : formatNumber(distanceDriven),
      fuelConsumption: isNaN(fuelConsumption) ? '--' : formatNumber(fuelConsumption),
    });
  };

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
    <Form layout="vertical" form={form} onValuesChange={handleInputChange} onFinish={handleSave}>
      <S.ExpandedInfoGroupInput>
        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              label="전일 거리"
              name="distance_yesterday"
              required
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                { validator: validateDistance },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                type="number"
                placeholder="km"
                onKeyDown={handleInputValidation}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap
              label="금일 거리"
              name="distance_today"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                { validator: validateDistance },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                isError={errorDistance}
                type="number"
                placeholder="km"
                onKeyDown={handleInputValidation}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap short label="주행" name="distanceDriven">
              <S.InputWrap placeholder="--" disabled={!permissions?.updateAble} />
            </S.BaseFormItemWrap>
          </S.Row>
          {errorDistance && <S.ErrorMsg>유효하지 않은 거리입니다. 다시 입력해 주세요!</S.ErrorMsg>}
        </S.RowRecord>

        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              label="전일 연료"
              name="fuel_yesterday"
              required
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                { validator: validateFuelYesterday },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                isError={errorToday || errorYesterday}
                type="number"
                placeholder="L"
                onKeyDown={handleInputValidation}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap
              label="금일 연료"
              name="fuel_today"
              required
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                { validator: validateFuelToday },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                isError={errorToday || errorYesterday}
                type="number"
                placeholder="L"
                onKeyDown={handleInputValidation}
              />
            </S.BaseFormItemWrap>
            <S.BaseFormItemWrap short label="소비" name="fuelConsumption">
              <S.InputWrap placeholder="--" disabled />
            </S.BaseFormItemWrap>
          </S.Row>
          {errorToday || errorYesterday ? <S.ErrorMsg>{errorMsgFule}</S.ErrorMsg> : null}
        </S.RowRecord>

        <S.RowRecord>
          <S.Row>
            <S.BaseFormItemWrap
              label="주유량"
              name="fuel_volumn"
              rules={[
                {
                  required: true,
                  message: '이 필드는 필수입니다.',
                },
                { validator: validateFuelVolume },
              ]}
            >
              <S.InputWrap
                disabled={!permissions?.updateAble}
                isError={errorFuelVolume}
                type="number"
                placeholder="L"
                onKeyDown={handleInputValidation}
              />
            </S.BaseFormItemWrap>
          </S.Row>
          {errorFuelVolume && <S.ErrorMsg>{errorMsgVolume}</S.ErrorMsg>}
        </S.RowRecord>
      </S.ExpandedInfoGroupInput>

      <S.SaveButtonWrapper>
        <S.ButtonSubmit type="primary" disabled={!permissions.updateAble} htmlType="submit">
          저장
        </S.ButtonSubmit>
      </S.SaveButtonWrapper>
    </Form>
  );
};

export default ExpandedInfo;
