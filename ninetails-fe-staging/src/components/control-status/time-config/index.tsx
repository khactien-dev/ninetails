import IconNext from '@/assets/images/svg/icon-open_a1.svg';
import IconTime from '@/assets/images/svg/lastup.svg';
import IconReload from '@/assets/images/svg/reload.svg';
import { DATE_FORMAT } from '@/constants';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import * as S from '../index.style';
import { IParams, SelectData } from '../index.utils';

interface TimeConfigProps {
  timeOptions: SelectData[];
  lastUpdated: string | null;
  params: IParams;
  isLoading: boolean;
  isExport?: boolean;
  onChangeParams: (params: IParams) => void;
}

const TimeConfig: React.FC<TimeConfigProps> = ({
  onChangeParams,
  params,
  lastUpdated,
  timeOptions,
  isExport = false,
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const dateRef = useRef(null);

  const onDateChange = (values: any) => {
    onChangeParams({
      date: values ? values?.format(DATE_FORMAT.R_BASIC) : null,
      isRealTime: false,
      vehicleNumber: null,
      routeName: null,
      // startDate: values?.[0]?.format(DATE_FORMAT.R_BASIC),
      // endDate: values?.[1]?.format(DATE_FORMAT.R_BASIC),
    });
  };

  const onTimeChange = (value: any) => {
    if (!value) return;
    onChangeParams({ updateTime: value });
  };

  const onRealTime = () => {
    onChangeParams({ isRealTime: true, date: null });
  };

  return (
    <S.FlexCenter className={'tabs'} $isExport={isExport}>
      {visible && (
        <S.LastUpdate>
          <IconTime />
          <span>Last Updated</span> {lastUpdated ?? '--'}
        </S.LastUpdate>
      )}

      <S.Form open={visible}>
        <S.Form.Item>
          <S.TimeSelect
            options={timeOptions}
            value={params.updateTime}
            onChange={onTimeChange}
            popupMatchSelectWidth={false}
            placement="bottomRight"
            disabled={!!params?.date}
          />
        </S.Form.Item>
      </S.Form>

      <S.Reload
        className={'item'}
        $active={(params?.isRealTime && !params?.date) || false}
        $open={visible}
        onClick={onRealTime}
      >
        <IconReload />
      </S.Reload>
      {/* {visible && (
        <>
          <S.Calendar
            autoFocus
            onChange={onDateChange}
            defaultValue={[dayjs(params.startDate), dayjs(params.endDate)]}
            format={DATE_FORMAT.R_BASIC}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
            getPopupContainer={(triggerNode) => triggerNode}
          />
        </>
      )} */}
      {visible && (
        <S.Date
          inputReadOnly
          allowClear={false}
          suffixIcon={<CalendarOutlined />}
          value={params?.date ? dayjs(params?.date) : null}
          $active={(!params?.isRealTime && !!params?.date) || false}
          onChange={onDateChange}
          disabledDate={(current) => current && current >= dayjs().startOf('day')}
          ref={dateRef}
        />
      )}

      <S.Setting className={'item'} onClick={() => setVisible((prev) => !prev)} open={visible}>
        <IconNext />
      </S.Setting>
    </S.FlexCenter>
  );
};

export default React.memo(TimeConfig);
