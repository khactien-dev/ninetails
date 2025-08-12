import IconPulse from '@/assets/images/control-status/icon-pulse.png';
import { FONT_FAMILY } from '@/constants';
import * as styled from 'styled-components';

import { resetCss } from './theme-reset';
import { commonThemeVariables, getThemeVariables } from './themes/theme-variables';

export default styled.createGlobalStyle`
  ${resetCss}
  [data-theme='light'],
  :root {
    ${getThemeVariables('light')}
  }

  [data-theme='dark'] {
    ${getThemeVariables('dark')}
  }

  :root {
    ${commonThemeVariables};
  }

  [data-no-transition] * {
    transition: none !important;
  }

  html {
    scroll-behavior: smooth;
  }

  button,
  input {
    font-family: ${FONT_FAMILY.main}, sans-serif;
  }

  button {
    &:hover {
      opacity: 0.92;
    }
  }

  a {
    color: var(--primary-color);

    &:hover,
    :active {
      color: var(--ant-primary-5);
    }
  }

  .ant-input::placeholder {
    color: var(--lightgray);
  }

  .tooltip-popup {
    padding-left: 65px;
    max-width: 100%;

    .ant-tooltip-arrow {
      display: none !important;
    }

    .ant-tooltip-content {
      .ant-tooltip-inner {
        min-height: auto;
        padding: 20px 20px 20px 62px;
        color: #000;
        font-weight: 400;
        border-radius: 20px;
        background-color: #ffffff;
        background-image: url('${IconPulse.src}');
        background-position: 20px center;
        background-repeat: no-repeat;
        background-size: 32px;
      }
    }
  }

  .canvasjs-chart-credit {
    display: none;
  }

  .Flow {
    width: 100%;
    height: 100%;

    flex-grow: 1;
    font-size: 12px;
  }

  :not(:root):fullscreen::backdrop {
    background-color: #fff;
  }

  .ant-picker-time-panel-column::after {
    height: auto !important;
  }

  .ant-notification-notice-icon {
    height: 2.5rem;
  }
`;
