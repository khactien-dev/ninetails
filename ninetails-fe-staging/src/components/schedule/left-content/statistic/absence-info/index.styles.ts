import { BasePopover } from '@/components/common/base-popover';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const WrapStatusIcon = styled.div``;

export const WrapPopupContent = styled.div`
  background-color: var(--white);
  border-radius: 8px;
  li {
    text-align: start;
    padding: 0.15rem 0;
    font-size: ${FONT_SIZE.xs};
  }

  ul {
    padding-left: 1rem;
  }
  height: 160px;
  min-width: 200px;
`;

export const WrapJobContract = styled.div<{ $color?: string }>`
  color: ${(props) => (props.$color ? props.$color : 'var(--text)')} !important;
`;

export const WrapPopupHeader = styled.div`
  display: flex;
  gap: 0.4rem;
`;

export const Dropdown = styled(BasePopover)`
  .ant-dropdown {
    position: fixed !important;
  }
`;

export const Replacer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

export const WrapDropdown = styled.div`
  .ant-dropdown {
    position: fixed !important;
  }
`;

export const WrapAbsenceName = styled.div`
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${FONT_WEIGHT.bold};
`;
