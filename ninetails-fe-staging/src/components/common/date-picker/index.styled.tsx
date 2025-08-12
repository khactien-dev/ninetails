import { FONT_SIZE } from '@/constants';
import { DatePicker as AntDatePicker } from 'antd';
import styled, { css } from 'styled-components';

const datePickerSizes = css`
  &.ant-picker {
    &.ant-picker-small {
      padding: 3.1px 7px;
    }
    &.ant-picker-large {
      padding: 17.6px 11px;
    }
  }
`;

export const DatePicker = styled(AntDatePicker)`
  ${datePickerSizes}

  input {
    font-size: ${FONT_SIZE.xs} !important;
  }
  input::placeholder {
    font-size: ${FONT_SIZE.xs} !important;
    color: #a3a5a7 !important;
  }
`;

export const RangePicker = styled(AntDatePicker.RangePicker)`
  ${datePickerSizes}
`;

export const TimePicker = styled(AntDatePicker.TimePicker)`
  ${datePickerSizes}
`;
