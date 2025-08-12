import { BaseButton } from '@/components/common/base-button';
import { BaseDivider } from '@/components/common/base-divider';
import { BaseSwitch } from '@/components/common/base-switch';
import { BaseForm } from '@/components/common/forms/base-form';
import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  font-size: 14px;

  .ant-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  .ant-form-item-label {
    width: 100%;
  }

  .ant-form-item-control {
    width: 60px !important;
    height: 40px;
  }

  .ant-form-item-control-input,
  .ant-form-item-label,
  .ant-form-item-label,
  .ant-form-item-label label {
    height: 40px;
    min-height: unset;
  }

  .ant-form-item-control-input-content {
    text-align: right;
  }
`;

export const Form = styled(BaseForm)`
  max-height: 550px;
  overflow-y: auto;
  padding: 10px 10px 10px 0;
`;

export const SWitchWrapper = styled.div`
  padding-right: 15px;
  max-height: calc(100vh - 170px);
  overflow-y: auto;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    display: block !important;
    font-size: 14px;
    font-weight: bold;
    min-width: 130px;
  }
`;

export const IconType = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

export const Divider = styled(BaseDivider)`
  margin: 5px 0;
  border-color: #d9d9d9;
`;

export const ButtonWrapper = styled.div`
  margin-top: 20px;
`;

export const Button = styled(BaseButton)`
  background: var(--green);
  color: var(--white) !important;
  padding: 0px 50px;
  margin-top: 20px;
  font-size: 12px;
  height: 25px;
  margin: auto;
  width: 100px;
  font-weight: bold;
  border-radius: 4px;
`;

export const Switch = styled(BaseSwitch)<{ status: string }>`
  ${({ status }) => css`
    min-width: 30px;
    height: 16px;
    width: 30px;
    background-image: none !important;
    background-color: #f2f2f2;
    border: 1px solid #a6a6a6;

    &:hover {
      background-color: #f2f2f2 !important;
    }

    .ant-switch-handle {
      width: 12px;
      height: 12px;
      top: 1px;

      &::before {
        background-color: #a6a6a6;
      }
    }

    &.ant-switch-checked {
      background-color: ${status === 'success' ? '#cee5cc ' : '#FFF4E7'} !important;
      border: 1px solid ${status === 'success' ? '#57BA00 ' : '#FFB155'} !important;
      box-sizing: border-box;
      &:focus {
        box-shadow: none !important;
      }
      .ant-switch-handle {
        inset-inline-start: calc(100% - 14px) !important;
        top: 1px;

        &::before {
          background-color: ${status === 'success' ? '#57BA00 ' : '#FFB155'} !important;
        }
      }
    }
  `}
`;
