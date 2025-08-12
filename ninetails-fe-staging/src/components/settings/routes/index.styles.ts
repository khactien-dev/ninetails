import { BaseCheckbox } from '@/components/common/base-checkbox';
import { BaseTabs } from '@/components/common/base-tabs';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, media } from '@/constants';
import styled from 'styled-components';

export const SettingWrapper = styled.div`
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  flex-direction: column;
  @media only screen and ${media.custom} {
    display: flex;
    flex-direction: row;
  }
`;

export const AdmContentWrap = styled.div`
  display: block;
  width: 100%;
  overflow-x: hidden;
  padding: 8px;
  background-color: #f6f6f9;

  @media only screen and ${media.lg} {
    padding: 30px 16px 30px 30px;
  }
`;

export const Box = styled.div`
  display: block;
  border-radius: 20px;
  background: #fff;
  padding: 24px 28px 30px;
  box-shadow: var(--box-shadow);
`;

export const BoxTitle = styled.div`
  display: block;
  height: 34px;
  line-height: 34px;
  text-align: left;
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 24px;
`;

export const CheckBox = styled(BaseCheckbox)`
  font-size: ${FONT_SIZE.xs} !important;
  /* border-right: solid 1px #ebebed; */
  border-bottom: solid 1px #ebebed;
  width: 20%;
  padding: 0;

  @media screen and (max-width: 768px) {
    width: 50%;
  }

  span {
    padding: 10px;

    &:nth-of-type(2) {
      /* border-left: solid 1px #ebebed; */
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;
    }
  }
`;

export const FormCheckBox = styled(BaseForm)`
  background-color: #f7f6f9;
  border-radius: 5px;
  border-left: solid 1px #ebebed;
  border-top: solid 1px #ebebed;
  display: flex;
  flex-wrap: wrap;
`;

export const LabelOption = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
  font-weight: 600;
`;

export const NoData = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
`;

export const Tabs = styled(BaseTabs)`
  margin-top: 50px;

  .ant-tabs-nav {
    &::before {
      border-bottom: 1px solid var(--lightgray);
    }

    .ant-tabs-tab {
      color: var(--lightgray);
      background: var(--white);
      border: none;
      border-bottom: solid 1px var(--lightgray);
      padding: 10px 20px;
    }

    .ant-tabs-tab-active {
      border: solid 1px var(--lightgray);
      border-radius: 10px 10px 0 0 !important;

      .ant-tabs-tab-btn {
        color: var(--primary-color) !important;
      }
    }
  }
`;

export const GroupTabs = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
`;
export const ERD = styled(BaseCheckbox)`
  width: 150px;
  background-color: #f7f6f9;
  border-radius: 5px;
  border: solid 1px #ebebed;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .ant-checkbox {
    display: none;
  }
`;
