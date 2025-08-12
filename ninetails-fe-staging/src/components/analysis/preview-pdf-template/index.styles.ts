import { BaseSelect } from '@/components/common/selects/base-select';
import { FONT_SIZE } from '@/constants';
import styled from 'styled-components';

export const WrapPdfPreview = styled.div`
  position: relative;
  transform-origin: top left;
`;

export const OverLay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

export const WrapTitle = styled.div`
  font-weight: 700;
  font-size: ${FONT_SIZE.lg};
  margin-bottom: 0.6rem;
`;

export const WrapSubTitle = styled.div`
  font-weight: 700;
  font-size: ${FONT_SIZE.md};
  margin-bottom: 0.6rem;
`;

export const WrapLeftContent = styled.div`
  display: flex;
  gap: 2rem;
  align-items: start;
`;

export const LeftContentItem = styled.div`
  flex: 1;
`;

export const WrapDownLoadButton = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-base-color);
`;

export const Select = styled(BaseSelect)`
  height: 33px;
  margin-top: 1.6rem;
`;
