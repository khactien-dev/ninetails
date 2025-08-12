import { BaseDatePicker } from '@/components/common/date-picker';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapPreviewPdf = styled.div``;

export const Title = styled.div`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE?.xl};
`;

export const Date = styled.div`
  font-weight: ${FONT_WEIGHT.bold};
  font-size: ${FONT_SIZE?.md};
  margin: 1rem 0;
`;

export const WrapTableItem = styled.div`
  padding: 2rem 0;
`;

export const SelectDate = styled(BaseDatePicker)`
  width: 250px;
  height: 33px;
  margin: 1rem 0 2rem 0;
`;

export const WrapTableSummary = styled.div`
  padding-top: 1rem;
`;
