import ChevronLeft from '@/assets/images/schedule/chevron-left.svg';
import DoubleChevronLeft from '@/assets/images/schedule/double-chevron-left.svg';
import { BaseButton } from '@/components/common/base-button';
import { BaseDatePicker } from '@/components/common/date-picker';
import { FONT_SIZE } from '@/constants';
import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 34px 28px 50px;
`;

export const SelectDatePicker = styled.div`
  display: flex;
  gap: 1rem;
`;

export const WrapTooltip = styled.div`
  margin-top: 0.4rem;
`;

export const SelectDate = styled(BaseDatePicker)`
  width: 100%;
  height: 33px;
`;

export const WrapDateSelect = styled.div`
  flex: 1;
`;

export const WrapDateButtons = styled.div`
  display: flex;
  margin-top: 1rem;
  justify-content: space-between;
`;

export const ChevronLeftButton = styled(ChevronLeft)`
  cursor: pointer;
`;

export const ChevronRightButton = styled(ChevronLeft)`
  rotate: 180deg;
  cursor: pointer;
`;

export const DoubleChevronLeftButton = styled(DoubleChevronLeft)`
  cursor: pointer;
`;

export const DoubleChevronRightButton = styled(DoubleChevronLeft)`
  rotate: 180deg;
  cursor: pointer;
`;

export const FocusDateButton = styled(BaseButton)`
  height: 33px;
  cursor: pointer;
  font-size: ${FONT_SIZE.xs};
  width: 80px;
`;

export const WrapIcon = styled.div`
  border: none;
  cursor: pointer;
  height: 33px;
  width: 33px;
  border: 1px solid var(--border-base-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }
`;

export const WrapEntityIcon = styled.div``;

export const WrapCrewIcon = styled.div`
  display: flex;
  align-items: center;
`;
