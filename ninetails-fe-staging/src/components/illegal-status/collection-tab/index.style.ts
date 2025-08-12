import { BaseButton } from '@/components/common/base-button';
import { BaseTabs } from '@/components/common/base-tabs';
import { FONT_WEIGHT } from '@/constants';
import styled, { css } from 'styled-components';

export const ButtonCollection = styled(BaseButton)<{ $open: boolean }>`
  width: 16px;
  height: 16px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  overflow: hidden;
  padding: 0;
  font-weight: normal;
  position: absolute;
  top: 5px;
  right: 0;
  z-index: 1;
  line-height: 16px;
  background: #fff;
  /* &:after {
    content: '+';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #000;
  } */

  ${(props) =>
    !props.$open
      ? css`
          background: #777;
          border: none;
          &:after {
            /* content: '-'; */
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;

            width: 9px;
            height: 1px;
            background: #fff;
          }
        `
      : css`
          &:after {
            content: '+';
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #000;
          }
        `}
`;

export const Collection = styled.div`
  position: relative;
`;

export const CollectionTabs = styled(BaseTabs)`
  .ant-tabs-nav {
    margin: 0 0 32px;
    &:before {
      border-bottom: 1px solid #c0c0c0;
    }
    .ant-tabs-ink-bar {
      display: none;
    }
    .ant-tabs-nav-wrap {
      width: 100%;
      .ant-tabs-nav-list {
        width: 100%;
        .ant-tabs-tab {
          padding: 0;
          margin: 0;
          width: calc(100% / 3) !important;
          text-align: center;
          border-radius: 8px 8px 0 0;
          display: block;
          cursor: pointer;
          .ant-tabs-tab-btn {
            color: rgba(0, 0, 0, 0.4);
            font-size: 15px;
            font-weight: ${FONT_WEIGHT.medium};
            height: 34px;
            line-height: 33px;
            padding: 0;
            letter-spacing: -0.5px;
          }
        }
        .ant-tabs-tab-active {
          border: 1px solid #c0c0c0;
          border-bottom: 1px solid #fff;
          .ant-tabs-tab-btn {
            color: var(--green) !important;
            text-shadow: none;
          }
        }
      }
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* justify-content: space-between; */
  column-gap: 15px;
  row-gap: 14px;
`;

export const Item = styled.div`
  width: calc((100% - 30px) / 3);
  display: flex;
  align-items: center;
`;

export const Svg = styled.div<{ $check?: boolean }>`
  display: inline-block;
  position: relative;

  ${(props) =>
    props.$check
      ? css`
          &:after {
            content: '';
            position: absolute;
            top: 0px;
            right: 0px;
            z-index: 1;
            background: #555555;
            border-radius: 50%;
            padding: 8px;
          }
          &:before {
            content: '';
            position: absolute;
            top: 3px;
            right: 5px;
            z-index: 2;
            padding: 2.5px 1.5px;
            border-right: 2px solid #fff;
            border-bottom: 2px solid #fff;
            transform: rotate(45deg);
          }
        `
      : css``}
`;

export const Info = styled.div`
  float: left;
  margin: 0 0 0 7px;
`;

export const Title = styled.div`
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.regular};
  color: #555;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

export const Value = styled.div`
  text-align: left;
  font-size: 15px;
  font-weight: ${FONT_WEIGHT.medium};
  color: #222;
  line-height: 21px;
`;
