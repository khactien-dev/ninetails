import { BaseLayout } from '@/components/common/base-layout';
import { media } from '@/constants';
import styled from 'styled-components';

export const LayoutMaster = styled(BaseLayout)`
  //height: 100vh;
`;

export const LayoutMain = styled(BaseLayout)`
  &.ant-layout {
    width: 100% !important;
    display: block;
  }

  .ant-layout-content {
    width: 100% !important;
  }

  @media only screen and ${media.md} {
  }

  @media only screen and ${media.xl} {
    //overflow-x: scroll;
    padding-left: 61px;
  }
`;

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  @media only screen and ${media.xl} {
    flex-direction: row;
  }
`;
