import { BaseLayout } from '@/components/common/base-layout';
import { media } from '@/constants';
import styled, { css } from 'styled-components';

interface HeaderProps {
  $isTwoColumnsLayout: boolean;
}

export default styled(BaseLayout.Content)<HeaderProps>`
  padding: 0;
  height: calc(100vh - 4.375rem);
  overflow-y: auto;
  position: relative;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--green);
  }

  @media only screen and ${media.xl} {
    //width: 100%;
    ${(props) =>
      props?.$isTwoColumnsLayout &&
      css`
        padding: 0;
      `}
  }

  @media only screen and (min-width: 1301px) {
    & > .ant-row {
      flex-wrap: nowrap;
    }
  }
`;
