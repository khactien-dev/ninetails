import { BaseButton } from '@/components/common/base-button';
import { BaseCard } from '@/components/common/base-card';
import { BaseProgress } from '@/components/common/base-progress';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import { Skeleton } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';

import { BasePopover } from '../common/base-popover';
import { BaseRadio } from '../common/base-radio';
import { Radio } from '../common/base-radio/index.styles';
import { BaseTabs } from '../common/base-tabs';
import { BaseUpload } from '../common/base-upload';
import { BaseSelect } from '../common/selects/base-select';

export const TablesWrapper = styled(BaseRow)`
  flex-direction: column;
  @media only screen and ${media.xl} {
    flex-direction: row;
  }

  .item {
    border: 1px solid #d0d0d0 !important;
    border-radius: 5px !important;
    margin-left: 20px;
    height: 34px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: start;
  }
`;

export const WrapHeader = styled.div`
  flex: 1;
  padding: 0 0 0 1rem;
  @media only screen and ${media.xl} {
    padding: 100px 20px 20px;
  }

  @media only screen and ${media.xxl} {
    padding: 100px 50px 20px 50px;
  }

  .ant-tabs-nav::before {
    border-bottom: none;
  }

  .ant-tabs-ink-bar {
    display: none;
  }

  .ant-tabs-tab {
    color: var(--green);
    font-size: 19px;
    font-weight: ${FONT_WEIGHT.bold};
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    min-width: 120px;
    background: #f0f0f0;
    text-align: center;
    border-radius: 50px;
    justify-content: center;

    * {
      font-size: 19px;
      font-weight: ${FONT_WEIGHT.semibold};
    }

    &.ant-tabs-tab-active {
      * {
        color: var(--white) !important;
      }

      background: var(--green);
    }
  }

  .ant-tabs-tab + .ant-tabs-tab {
    margin: 0 0 0 20px;
  }
`;

export const Wrapper = styled.div`
  padding: 100px 39px 0;
`;

export const WrapContent = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  column-gap: 16px;
  row-gap: 16px;
  flex: 1;

  @media only screen and ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and ${media.lg} {
    grid-template-columns: repeat(4, 1fr);
    column-gap: 25px;
    row-gap: 25px;
  }
`;

export const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0px 0px 30px 0px #0000000d;

  background: #fff;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.1) !important;
  padding: 18px 17px 17px;
  min-height: auto;

  @media only screen and ${media.md} {
    padding: 20px;
    min-height: 280px;
  }

  @media only screen and ${media.lg} {
    padding: 24px 28px;
    border-radius: 20px;
    box-shadow: 0 0px 20px 0 rgba(0, 0, 0, 0.1) !important;
  }

  .ant-card-head,
  .ant-card-body {
    padding: 0;
  }

  .ant-card-head {
    @media only screen and ${media.md} {
      min-height: auto;
    }
    .ant-card-head-title {
      color: var(--text);
      font-weight: ${FONT_WEIGHT.semibold};
      font-size: 18px;

      @media only screen and ${media.md} {
        font-size: 20px;
      }

      @media only screen and ${media.xl} {
        padding-bottom: 0;
      }
    }
  }

  .ant-card-body {
    .content {
      > div:first-child {
        justify-content: center;
      }
    }
  }

  .sub-title {
    font-size: 14px;

    @media only screen and ${media.md} {
      font-size: 15px;
    }
  }

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    /* justify-content: normal; */
    align-items: start;

    /* @media only screen and ${media.md} {
      justify-content: space-evenly;
    } */
  }
`;

export const LeftArea = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto 50px;
  text-align: center;

  @media only screen and ${media.xl} {
    text-align: left;
    position: fixed;
    left: 60px;
    top: 0;
    width: 300px;
    padding: 170px 68px 0;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #d6d7de;
    box-shadow: 15px 0px 20px 0px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    z-index: 1;
  }
`;

export const Info = styled.div`
  margin-top: 1.2125rem;

  & > div {
    border-bottom: 1px solid var(--border-secondary-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;

    * {
      font-size: 15px;
      display: block;
      padding: 9px 0;

      &.label {
        color: var(--text-light-color) !important;
        font-weight: ${FONT_WEIGHT.regular};
        width: 77px;
      }

      &.data {
        color: #1a1a1a !important;
      }
    }
  }
`;

export const Location = styled.p`
  font-size: 1.375rem;
  line-height: 1.625rem;
  color: #111;
  margin: 10px 0 0;
  font-weight: ${FONT_WEIGHT.medium};
  text-align: center;
  font-size: 20px;
`;

export const LogoWrapper = styled.div`
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LogoLoading = styled(Skeleton.Image)`
  margin: auto;
  width: 100% !important;
  height: 100% !important;
`;

export const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  &::-webkit-scrollbar {
    height: 3px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  &:hover {
    &::-webkit-scrollbar-thumb {
      background: #888;
    }
  }

  @media only screen and ${media.xl} {
    gap: 12px;
  }
`;

export const Div = styled.div`
  display: flex;
  color: #555;
  font-weight: ${FONT_WEIGHT.regular};

  &.top {
    flex-direction: column;

    @media only screen and ${media.xl} {
      flex-direction: row;
    }
  }

  * {
    display: block;
    text-align: left;
    font-weight: ${FONT_WEIGHT.regular};
    font-size: 15px;
    line-height: 28px;
  }

  .content-center {
    margin: 40px 0 16px;

    @media only screen and ${media.md} {
      margin: 64px 0 36px;
    }
  }

  .label {
    font-size: 12px;
    width: 63px;
    color: #555;
    float: left;

    @media only screen and ${media.sm} {
      width: 74px;
      font-size: 13px;
    }

    @media only screen and ${media.md} {
      width: 90px;
      font-size: 14px;
    }
  }

  .data {
    font-size: 15px;
    font-weight: ${FONT_WEIGHT.semibold};
    float: left;

    @media only screen and ${media.sm} {
      font-size: 17px;
    }

    @media only screen and ${media.md} {
      font-size: 20px;
    }

    &.date {
      color: var(--green);
    }
  }

  .gap {
    font-weight: ${FONT_WEIGHT.bold};
    color: var(--red);
    background: #ffe5e5;
    border-radius: 5px;
    float: left;
    margin: 0 0 0 5px;
    padding: 0 5px;
    font-size: 14px;

    @media only screen and ${media.md} {
      padding: 0 8px;
      margin: 0 0 0 5px;
      font-size: 16px;
    }
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  width: 100%;

  &.tabs {
    justify-content: start;
    @media only screen and ${media.xl} {
      justify-content: end;
    }
  }
`;

export const AnalysisPeriod = styled.div`
  display: flex;
  align-items: center;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.bold};
  color: #383b40;
  height: 40px;
  flex-shrink: 0;
  margin-right: auto;
  svg {
    flex-shrink: 0;
    margin-right: 10px;
  }
`;

export const LastUpdate = styled.div`
  display: flex;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.bold};
  color: #383b40;
  flex-shrink: 0;
  margin-left: 32px;

  svg {
    flex-shrink: 0;
    margin-right: 10px;
  }
`;

export const Progress = styled(BaseProgress)`
  /* .ant-progress-text {
    font-weight: ${FONT_WEIGHT.semibold};
    font-size: ${FONT_SIZE.xl};
  } */
`;

export const Svg = styled.svg`
  display: inline-flex;
  vertical-align: bottom;
  width: 120px;
  height: 120px;
  margin: 20px 0 14px;

  * {
    font-size: 19px;
    font-weight: ${FONT_WEIGHT.bold};
  }
`;

export const Circle = styled.circle`
  stroke: #e1e1e1;
  stroke-width: 2px;
  stroke-dasharray: 0;
  fill: none;
`;

export const Meter = styled.path`
  stroke-width: 5px;
  stroke: var(--green);
  fill: none;
  transition: stroke-dashoffset 1s cubic-bezier(0.43, 0.41, 0.22, 0.91);
  transform-origin: center center;
  transform: rotate(-90deg) scaleX(-1);
  /* filter: drop-shadow(0px 0px 3px var(--green)); */
`;

export const SvgText = styled.text`
  font-size: 20px;
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const Form = styled(BaseForm)`
  .ant-select-selector {
    height: 40px !important;
    width: 100px !important;
    display: flex;
    border: 1px solid #d0d0d0 !important;
    border-radius: 4px !important;

    .ant-select-selection-item,
    .ant-select-item-option-content {
      font-weight: ${FONT_WEIGHT.bold};
    }

    .ant-select-dropdown-hidden {
      display: none;
    }
  }

  .ant-select {
    height: fit-content;
  }
`;

export const Reload = styled(BaseButton)`
  height: 40px !important;
`;

export const PopoverGlobal = createGlobalStyle`
  .setting-popover {
    .ant-popover-inner-content {
      padding-right: 4px;
    }
  }
`;

export const SettingPopover = styled(BasePopover)`
  .ant-popover-inner-content {
    padding-right: 4px;
  }
`;

export const Setting = styled(BaseButton)`
  z-index: 2;
  height: 40px !important;
  span {
    font-weight: ${FONT_WEIGHT.bold};
  }
`;

export const PopoverContent = styled.div`
  height: 400px;
  padding-right: 2px;
  overflow-y: scroll;
`;

export const Section = styled.div``;

export const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  height: 20px;
  padding-right: 10px;
  position: relative;
  padding-right: 20px;
  svg {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
`;

export const FormRadio = styled(BaseRadio.Group)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
`;

export const FormCheckbox = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Checkbox = styled.input`
  margin-left: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
`;

export const StyledRadio = styled(Radio)``;

export const SubmitButton = styled(BaseButton)`
  margin: auto;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.bold};
  width: 100px;
  height: 25px;
  color: #ffffff;
  background: var(--primary-color);
  border-radius: 4px;
  display: flex;
  margin-top: 20px;
  &:hover {
    color: #ffffff !important;
  }
`;

export const CheckboxSpan = styled.span`
  margin-top: 4px;
  font-size: 12px;
  color: #a2a2a2;
  line-height: 14.63px;
`;

export const CheckboxText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-right: 10px;
`;

export const CheckboxLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #383b40;
  flex-direction: column;
`;

export const RadioLabel = styled.div`
  display: flex;
  justify-content: space-between;
  color: #383b40;
  height: 20px;
  margin-bottom: 20px;
`;

export const Rectangle = styled.div`
  border: 1px solid #d9d9d9 !important;
  width: 221px;
  margin-bottom: 20px;
  margin-top: 10px;
`;

export const Time = styled(BaseSelect)`
  line-height: 40px !important;
  height: 40px !important;
  .ant-select-selector {
    width: 50px;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    background-color: transparent !important;
  }
`;

export const Upload = styled(BaseUpload)`
  position: relative !important;
  min-height: 200px;
  width: 100% !important;
  max-width: 300px !important;

  .ant-upload-select {
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    background-color: transparent !important;
  }
  .ant-upload-disabled {
    cursor: initial;
  }
`;

export const WrapTabs = styled(BaseTabs)`
  .ant-tabs-tab {
    background-color: transparent;
    border: 1px solid var(--primary-color);
    height: 40px;
    width: 150px;
    .ant-tabs-tab-btn {
      color: var(--primary-color) !important;
      font-weight: ${FONT_WEIGHT.semibold} !important;
      font-size: ${FONT_SIZE.md} !important;
    }
  }

  .ant-tabs-tab.ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: var(--white) !important;
    }
  }

  .ant-tabs-nav {
    margin-bottom: 0;
  }
`;

export const WrapTabsAndPeriod = styled.div`
  display: flex;
  gap: 0;
  align-items: center;
`;
