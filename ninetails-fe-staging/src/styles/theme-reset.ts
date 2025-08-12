import { css } from 'styled-components';

export const resetCss = css`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.06);
  }
  body {
    font-weight: 500;
  }

  img {
    display: block;
  }
`;
