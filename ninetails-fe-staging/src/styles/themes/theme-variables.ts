import { BASE_COLORS } from '@/constants';
import { ThemeType } from '@/interfaces';
import { hexToRGB } from '@/utils';
import { css } from 'styled-components';

import { antDarkColorsTheme, darkColorsTheme } from './dark';
import { antLightColorsTheme, lightColorsTheme } from './light';

export const themeObject = {
  light: lightColorsTheme,
  dark: darkColorsTheme,
};

export const antThemeObject = {
  light: antLightColorsTheme,
  dark: antDarkColorsTheme,
};

export const getThemeVariables = (theme: ThemeType) => css`
  color-scheme: ${theme};
  --primary-color: ${themeObject[theme].primary};
  --primary1-color: ${themeObject[theme].primary1};
  --primary-gradient-color: ${themeObject[theme].primaryGradient};
  --info-color: var(--primary-color);
  --secondary-color: ${themeObject[theme].secondary};
  --light-gray-color: ${themeObject[theme].lightGray};
  --error-color: ${themeObject[theme].error};
  --warning-color: ${themeObject[theme].warning};
  --success-color: ${themeObject[theme].success};
  --background-color: ${themeObject[theme].background};
  --secondary-background-color: ${themeObject[theme].secondaryBackground};
  --secondary-background-selected-color: ${themeObject[theme].secondaryBackgroundSelected};
  --additional-background-color: ${themeObject[theme].additionalBackground};
  --collapse-background-color: ${themeObject[theme].collapseBackground};
  --timeline-background-color: ${themeObject[theme].timelineBackground};
  --spinner-base-color: ${themeObject[theme].spinnerBase};
  --sider-background-color: ${themeObject[theme].siderBackground};
  --shadow-color: ${themeObject[theme].shadow};
  --border-color: ${themeObject[theme].border};
  --border-nft-color: ${themeObject[theme].borderNft};
  --scroll-color: ${themeObject[theme].scroll};
  --btn-bgr: ${themeObject[theme].btnBgr};
  --btn-content: ${themeObject[theme].btnContent};
  --btn-bg-inactive: ${themeObject[theme].bgBtnInactive};
  --btn-bg-active: ${themeObject[theme].bgBtnActive};
  --btn-active: ${themeObject[theme].btnActive};
  --btn-inactive: ${themeObject[theme].btnInactive};

  --primary-rgb-color: ${hexToRGB(themeObject[theme].primary)};
  --info-rgb-color: ${hexToRGB(themeObject[theme].primary)};
  --secondary-rgb-color: ${hexToRGB(themeObject[theme].secondary)};
  --error-rgb-color: ${hexToRGB(themeObject[theme].error)};
  --warning-rgb-color: ${hexToRGB(themeObject[theme].warning)};
  --success-rgb-color: ${hexToRGB(themeObject[theme].success)};
  --background-rgb-color: ${hexToRGB(themeObject[theme].background)};

  --text-main-color: ${themeObject[theme].textMain};
  --text-light-color: ${themeObject[theme].textLight};
  --text-superLight-color: ${themeObject[theme].textSuperLight};
  --text-secondary-color: ${themeObject[theme].textSecondary};
  --text-dark-color: ${themeObject[theme].textDark};
  --text-dark-light-color: ${themeObject[theme].textDarkLight};
  --text-nft-light-color: ${themeObject[theme].textNftLight};
  --text-sider-primary-color: ${themeObject[theme].textSiderPrimary};
  --text-sider-secondary-color: ${themeObject[theme].textSiderSecondary};
  --subtext-color: ${themeObject[theme].subText};

  --dashboard-map-background-color: ${themeObject[theme].dashboardMapBackground};
  --dashboard-map-circle-color: ${themeObject[theme].dashboardMapCircleColor};
  --dashboard-map-control-disabled-background-color: ${themeObject[theme]
    .dashboardMapControlDisabledBackground};

  --notification-success-color: ${themeObject[theme].notificationSuccess};
  --notification-primary-color: ${themeObject[theme].notificationPrimary};
  --notification-warning-color: ${themeObject[theme].notificationWarning};
  --notification-error-color: ${themeObject[theme].notificationError};

  --icon-color: ${themeObject[theme].icon};
  --icon-hover-color: ${themeObject[theme].iconHover};
  --box-shadow: ${themeObject[theme].boxShadow};
  --box-shadow-hover: ${themeObject[theme].boxShadowHover};

  --heading-color: ${themeObject[theme].heading};
  --item-hover-bg: ${themeObject[theme].itemHoverBg};
  --background-base-color: ${themeObject[theme].backgroundColorBase};
  --border-base-color: ${themeObject[theme].borderBase};
  --border-secondary-color: ${themeObject[theme].borderSecondary};
  --disabled-color: ${themeObject[theme].disable};
  --disabled-bg-color: ${themeObject[theme].disabledBg};
  --layout-body-bg-color: ${themeObject[theme].layoutBodyBg};
  --layout-header-bg-color: ${themeObject[theme].layoutHeaderBg};
  --layout-sider-bg-color: ${themeObject[theme].layoutSiderBg};
  --input-placeholder-color: ${themeObject[theme].inputPlaceholder};
  --avatar-bg: ${themeObject[theme].avatarBg};
  --alert-text-color: ${themeObject[theme].alertTextColor};
  --breadcrumb-color: ${themeObject[theme].breadcrumb};

  --ant-primary-1: ${antThemeObject[theme].primary1};
  --ant-primary-2: ${antThemeObject[theme].primary2};
  --ant-primary-3: ${antThemeObject[theme].primary3};
  --ant-primary-4: ${antThemeObject[theme].primary4};
  --ant-primary-5: ${antThemeObject[theme].primary5};
  --ant-primary-6: ${antThemeObject[theme].primary6};
  --ant-primary-7: ${antThemeObject[theme].primary7};
  --ant-primary-8: ${antThemeObject[theme].primary8};
  --ant-primary-9: ${antThemeObject[theme].primary9};
  --ant-primary-10: ${antThemeObject[theme].primary10};
`;

export const commonThemeVariables = css`
  color-scheme: light dark;
  --white: ${BASE_COLORS.white};
  --black: ${BASE_COLORS.black};
  --green: ${BASE_COLORS.green};
  --orange: ${BASE_COLORS.orange};
  --gray: ${BASE_COLORS.gray};
  --lightgrey: ${BASE_COLORS.lightgrey};
  --violet: ${BASE_COLORS.violet};
  --lightgreen: ${BASE_COLORS.lightgreen};
  --pink: ${BASE_COLORS.pink};
  --blue: ${BASE_COLORS.blue};
  --skyblue: ${BASE_COLORS.skyblue};
  --red: ${BASE_COLORS.red};
  --lightgray: ${BASE_COLORS.lightgray};
  --text: ${BASE_COLORS.text};
`;
