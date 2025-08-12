// used for SSR (getServerSideProps)
const { resolve } = require('path');

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: process.env.NODE_ENV === 'development',
  i18n: {
    locales: ['ko'],
    defaultLocale: 'ko',
    localeDetection: false,
  },
  localePath: resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
