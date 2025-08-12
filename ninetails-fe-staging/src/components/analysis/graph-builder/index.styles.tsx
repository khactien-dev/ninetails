import { BaseButton } from '@/components/common/base-button';
import { BaseTabs } from '@/components/common/base-tabs';
import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-left: 35px;
`;

export const Form = styled.div`
  position: relative;
  margin-top: 16px;
`;

export const Delete = styled(BaseButton)`
  padding: 0;
  background-color: transparent;
  border: none;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 20px;
  left: -40px;
  transform: translateY(-50%);
`;

export const AddCondition = styled.div`
  width: 234px;
  height: 47px;
  padding: 0 15px;
  border-radius: 6px;
  border: 1px solid #bec0c6;
  background: #f7f6f9;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;

  svg {
    margin-right: 16px;
  }
`;

export const Tabs = styled(BaseTabs)`
  margin-top: 30px;

  .ant-tabs-nav {
    &::before {
      border-bottom: none;
    }
  }

  .ant-tabs-nav-list {
    .ant-tabs-tab {
      min-width: 100px;
      padding: 11px 11px;
      justify-content: center;

      &.ant-tabs-tab-active {
        border-radius: 6px;
        border: none;
        background-color: var(--green);

        * {
          color: var(--white);
        }
      }
    }

    .ant-tabs-ink-bar {
      display: none;
    }
  }
`;
