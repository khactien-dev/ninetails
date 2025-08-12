// import '@/components/visualizer-flow/Style';
import '@/components/visualizer-flow/style/index.scss';
import Authentication from '@/hocs/authentication';
import { store } from '@/stores/store';
import { getThemeConfig } from '@/styles/theme-config';
import GlobalStyle from '@/styles/theme-global';
import { Page } from '@/types/page';
import { QueryClientProvider, queryClient } from '@/utils/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider, App as FeedbackProvider } from 'antd';
import locale from 'antd/locale/ko_KR';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import dayJSUtc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import weekday from 'dayjs/plugin/weekday';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import NextNProgress from 'nextjs-progressbar';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ParallaxProvider } from 'react-scroll-parallax';
import 'reactflow/dist/style.css';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import 'typeface-montserrat';

import RootLayout from '../layouts';

type Props = AppProps & {
  Component: Page;
};

const localeObject = {
  ...dayjs.Ls.ko, // or dayjs.Ls.en for English
  weekStart: 1,
};

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('ko', localeObject);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(localeData);
dayjs.extend(timezone);
dayjs.extend(dayJSUtc);

const persistor = persistStore(store);

function App({ Component, pageProps }: Props) {
  const Layout =
    (Component as Page).layout ||
    (({ children }: { children: ReactNode }) => <RootLayout>{children}</RootLayout>);

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && <ReactQueryDevtools />}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GlobalStyle />
          <ConfigProvider theme={getThemeConfig('light')} locale={locale}>
            <FeedbackProvider>
              <ParallaxProvider>
                <Layout>
                  <NextNProgress />
                  <Authentication>
                    <Component {...pageProps} />
                  </Authentication>
                </Layout>
              </ParallaxProvider>
            </FeedbackProvider>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(
  dynamic(() => Promise.resolve(App), {
    ssr: false,
  })
);
