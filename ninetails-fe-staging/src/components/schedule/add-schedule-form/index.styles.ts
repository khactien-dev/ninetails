import { BaseButton } from '@/components/common/base-button';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseDatePicker } from '@/components/common/date-picker';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { OPERATION_STATUS } from '@/constants/settings';
import styled from 'styled-components';

export const Form = styled(BaseForm)`
  .ant-picker {
    width: 100%;
  }
`;

export const FormFilter = styled(BaseForm)`
  .ant-select {
    width: 100%;
    height: auto;
  }

  .ant-form-item-control-input {
    min-height: 28px;
  }
  .ant-select-disabled {
    opacity: 0.5 !important;
    color: #777 !important;
  }
  .ant-select-selector {
    height: 28px !important;
    display: flex;
    align-items: center;
    justify-content: start;
    border: 1px solid transparent !important;
    border-radius: 4px !important;
    background: #f2f5f2 !important;

    input {
      height: 100% !important;
      font-size: 12px;
    }
  }

  .ant-select-arrow {
    position: absolute;
    top: 65%;

    .anticon {
      width: 10px;
      height: 10px;
    }
  }
`;

export const TabsFilter = styled(BaseTabs)`
  .ant-tabs-nav {
    margin-bottom: 0;
  }
  .ant-tabs-tab {
    height: 28px;
    line-height: 26px;
    border: 1px solid #e0e0e0;
    text-align: center;
    color: #999;
    border-radius: 5px;
    padding: 0 15px;
    margin: 0 1px !important;

    &.ant-tabs-tab-active {
      border: 1px solid var(--green) !important;
      border-bottom: none;
      background-color: transparent;

      * {
        color: var(--green) !important;
      }
    }
  }

  .ant-tabs-ink-bar {
    display: none;
  }
`;

export const Search = styled(BaseButton)`
  background-color: var(--green);
  border-radius: 5px;
  color: #fff;
  height: 28px;
`;

export const ColInfo = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const SubmitButton = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const DatePicker = styled(BaseDatePicker)`
  width: 100%;
`;

export const FormItem = styled(BaseFormItem)``;

export const OperationText = styled.span<{ $type?: string }>`
  font-size: 400;
  color: ${(props) => {
    switch (props.$type) {
      case OPERATION_STATUS.DISPATCHING:
        return '#555555';
      case OPERATION_STATUS.AVAILABLE:
        return '#57BA00';
      case OPERATION_STATUS.SCHEDULED_MAINTENANCE:
        return '#0EBAFF';
      case OPERATION_STATUS.UNDER_MAINTENANCE:
        return '#0EBAFF';
      case 'area':
        return '#FF2929';
      default:
        return '';
    }
  }};
`;

export const InfoText = styled.p``;

export const SelectDatePicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;

  svg {
    width: 20px;
  }

  .ant-picker {
    border-radius: 8px;
    border: 1px solid #bec0c6;
    padding: 0 12px;
    height: 33px;
    font-size: 14px;
    margin-left: 12px;
    min-width: 150px;
  }
`;

export const BtnSave = styled(BaseButton)`
  width: 100%;
  margin-top: 2rem;
`;

export const Div = styled.div``;
