import { FC } from 'react';

export type StatisticColor = 'primary' | 'error' | 'secondary' | 'success';
interface ConfigStatistic {
  id: number;
  name: string;
  title: string;
  color: StatisticColor;
  Icon: FC | null;
}
export const BORDER_RADIUS = '7px';

export const BASE_COLORS = {
  white: '#ffffff',
  black: '#222222',
  green: '#57BA00',
  orange: '#ffb155',
  gray: '#555',
  white2: '#d6d7de',
  yellow: '#FFa800',
  lightgrey: '#c5d3e0',
  lightgray: '#d0d0d0',
  violet: '#ee82ee',
  lightgreen: '#89dca0',
  pink: '#ffc0cb',
  blue: '#0085f7',
  skyblue: '#0ebaff',
  red: '#ff2929',
  text: '#111',
} as const;

export const LAYOUT = {
  mobile: {
    paddingVertical: '0.75rem',
    paddingHorizontal: '1rem',
    headerHeight: '4.25rem',
    headerPadding: '1rem',
  },
  desktop: {
    paddingVertical: '1.25rem',
    paddingHorizontal: '2.25rem',
    headerHeight: '4.375rem',
  },
} as const;

export const FONT_FAMILY = {
  main: 'Pretendard',
  secondary: 'Montserrat',
} as const;

export const FONT_SIZE = {
  xxs: '0.75rem',
  xs: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  xxl: '1.5rem',
  xxxl: '1.625rem',
  xxxxl: '2rem',
} as const;

export const FONT_WEIGHT = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

export const HEIGHT = {
  xxs: '1.5rem',
  xs: '2rem',
  sm: '2.5rem',
  md: '3.125rem',
  lg: '4rem',
} as const;

export const BREAKPOINTS = {
  xs: 360,
  sm: 568,
  md: 768,
  lg: 992,
  xl: 1024,
  xxl: 1920,
  custom: 1301,
} as const;

const getMedia = <T extends number>(breakpoint: T): `(min-width: ${T}px)` =>
  `(min-width: ${breakpoint}px)`;

export const media = {
  xs: getMedia(BREAKPOINTS.xs),
  sm: getMedia(BREAKPOINTS.sm),
  md: getMedia(BREAKPOINTS.md),
  lg: getMedia(BREAKPOINTS.lg),
  xl: getMedia(BREAKPOINTS.xl),
  xxl: getMedia(BREAKPOINTS.xxl),
  custom: getMedia(BREAKPOINTS.custom),
};

interface DefaultPadding {
  mobile: [number, number];
  tablet: [number, number];
  desktop: [number, number];
}

export const defaultPaddings: DefaultPadding = {
  mobile: [30, 16],
  tablet: [40, 30],
  desktop: [50, 60],
};

interface ModalSizes {
  small: string;
  medium: string;
  large: string;
}

export const modalSizes: ModalSizes = {
  small: '400px',
  medium: '600px',
  large: '800px',
};

interface Specifity {
  id: number;
  name: string;
}

export const specifities: Specifity[] = [
  {
    id: 1,
    name: 'surgeon',
  },
  {
    id: 2,
    name: 'dermatologist',
  },
  {
    id: 3,
    name: 'oncologist',
  },
  {
    id: 4,
    name: 'cardiologist',
  },
  {
    id: 5,
    name: 'therapist',
  },
  {
    id: 6,
    name: 'ophthalmologist',
  },
  {
    id: 7,
    name: 'neurologist',
  },
];

export const statistics: ConfigStatistic[] = [
  {
    id: 1,
    name: 'protein',
    title: 'medical-dashboard.protein',
    color: 'success',
    Icon: null,
  },
  {
    id: 2,
    name: 'fat',
    title: 'medical-dashboard.fat',
    color: 'error',
    Icon: null,
  },
  {
    id: 3,
    name: 'bones',
    title: 'medical-dashboard.bones',
    color: 'primary',
    Icon: null,
  },
  {
    id: 4,
    name: 'water',
    title: 'medical-dashboard.water',
    color: 'secondary',
    Icon: null,
  },
];
