import { BaseButton } from '@/components/common/base-button';
import { BaseDivider } from '@/components/common/base-divider';
import { BasePopover } from '@/components/common/base-popover';
import { FONT_WEIGHT } from '@/constants';
import { Badge } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';

export const Wrapper = styled.section``;

export const PopoverComponent = styled(BasePopover)``;

export const PopoverWrapper = styled.div``;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 50px;
  font-weight: ${FONT_WEIGHT.bold};
  position: relative;
  margin-bottom: 10px;

  > span {
    font-size: 20px;
    font-weight: bold;
  }
`;

export const GroupButton = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1;
  display: flex;
  gap: 10px;
`;

export const Button = styled(BaseButton)`
  display: inline-block;
  padding: 0;
  border: none !important;
  height: auto;
  font-size: 20px;
  margin-left: 8px;
  outline: none !important;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }

  > section span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const ButtonText = styled(Button)`
  font-size: 12px;
`;

export const PopoverContent = styled.div``;

export const PopoverFooter = styled.div`
  text-align: center;
  button {
    background: var(--green);
    color: var(--white) !important;
    padding: 5px 50px;
    margin-top: 20px;
    font-size: 14px;
  }
`;

export const CustomBadge = styled(Badge)<{ $disabled?: boolean }>`
  position: relative;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;

  .ant-popover-inner-content {
    padding: 16px 24px;
    .ant-popover-inner-content {
      padding: 16px 32px;
    }
  }
  .ant-popover {
    left: calc(100% + 10px) !important;
    top: 0% !important;
    min-width: 500px;
    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-content {
      .ant-popover-inner {
        border: 1px solid rgb(217 217 217);
        border-radius: 10px;
        box-shadow: none;
      }
    }
    // popover setting
    .ant-popover {
      left: calc(100% + 75px) !important;
      top: -22px !important;
      min-width: 300px;
    }
  }
  .ant-badge-count {
    top: 3px;
    right: 3px;
    height: 16px;
    min-width: 16px;
    line-height: 16px;
    font-size: 9px;
  }
`;

export const Divider = styled(BaseDivider)`
  margin: 10px 0;
  border: 1px solid #d9d9d9;
`;

export const GlobalStyles = createGlobalStyle`
.notificationsRoot {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0 !important;
  left: 0 !important;

  .notifications {
    padding: 10px 10px 0;
    max-height: calc(100vh - 110px);

    > div {
      padding: 10px 15px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: darkgrey;
      visibility: visible;
    }
  }

   .notificationsButtonGroup {
      padding-top: 10px;
      margin-top: 0;
      border-top: 1px solid #d9d9d9;
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: calc(100vw - 20px);
    }

  .ant-popover-content, .ant-popover-inner, .ant-popover-inner-content{
    height: 100vh;
  }

  .ant-popover-inner-content {
    padding: 0;

    .ant-divider {
      display: none;
    }
  }

  .notificationsHeader {
    background-color: #0F8001;
    color: #fff;
    span {
      font-size: 18px;
    }

    > div {
      right: 20px;
    }

    .ant-btn  {
      display: flex;
      align-items: center;
      svg {
        font-size: 20px;
      }
    }

    svg {
      filter: invert(1);
    }
  }
}

.notificationsSettingRoot {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0 !important;
  left: 0 !important;
  background-color: #fff;

  .ant-popover-inner {
    box-shadow: none;
  }

  .ant-popover-inner-content {
    padding: 0
  }

  .ant-form  {
     padding: 4px 10px;
     max-height: calc(100vh - 100px);
     overflow-y: auto;

     > div:first-child {
      max-height: fit-content;
      padding-right: 0;
      overflow-y: unset;
     }

    .ant-form-item-label {
      max-width: calc(100% - 40px) !important;
      label {
        width: 100%;
      }
    }

     .ant-form-item-control {
      max-width: 40px !important;
    }
  }



  .notificationsSettingHeader {
    background-color: #0F8001;
    color: #fff;
    span {
      font-size: 18px;
    }

    > div {
      right: 20px;
    }

    .ant-btn  {
      display: flex;
      align-items: center;
      svg {
        font-size: 20px;
      }
    }
    svg {
      filter: invert(1);
    }
  }

   .notificationsSettingButtonGroup {
      padding: 10px 0;
      margin-top: 0;
      position: fixed;
      bottom: 0;
      left: 0;
      text-align: center;
      width: 100vw;
      background-color: #fff;

      button {
        height: 32px;
      }
  }
}
`;
