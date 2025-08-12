import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseEmpty } from '@/components/common/base-empty';
import { FONT_SIZE } from '@/constants';
import styled from 'styled-components';

export const ModuleDataSetContainer = styled('div')``;

export const WrapCheckBox = styled('div')`
  display: flex;
  gap: 1rem 2rem;
  flex-wrap: wrap;
  padding: 0 2rem;
  margin-top: 1.6rem;
`;

export const WrapCondition = styled('div')``;

export const CheckBox = styled(BaseCheckbox)`
  font-size: ${FONT_SIZE.xs} !important;
`;

export const SettingButton = styled.div<{ $disabled?: boolean }>`
  border: none;
  gap: 1rem;
  color: rgba(34, 34, 34, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

export const SettingDivider = styled(BaseDivider)`
  margin: 0.6rem 0;
`;

export const Empty = styled(BaseEmpty)`
  padding-top: 2rem;
`;

export const WrapCoreDataSet = styled.div`
  transform-origin: top left;

  .wrap-tree-table {
    width: 1320px;
    .ant-table-wrapper {
      padding-left: 0 !important;
    }
    .questionare-icon {
      display: none;
    }
  }
`;

export const WrapMarginTop = styled.div`
  margin-top: 2rem;
`;
