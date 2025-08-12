import { CurrencyTypeEnum } from '@/interfaces';

export enum ROUTER_PATH {
  LOGIN = '/auth/login',
  HOMEPAGE = '/',
  ADMIN_DASHBOARD = '/admin/dashboard',
  ADMIN_USERS = '/users',
  SUPER_ADMIN = '/super-admin',
  SUPER_ADMIN_SETTING = '/super-admin/setting',
  REGISTER = '/auth/register',
  FORGOT_PASSWORD = '/auth/forgot-password',
  SET_PASSWORD = '/auth/set-password',
  USER_INFO = '/auth/information',
  ADMIN_WORKING_SCHEDULE = '/admin/schedule',
  ADMIN_REALTIME_ACTIVITY = '/admin/control-status',
  ADMIN_OPERATION_ANALYSIS = '/admin/operation-analysis', // updated
  ADMIN_ILLEGAL_DISPOSAL = '/admin/illegal-disposal', // updated
  ADMIN_DRIVING_DIARY = '/admin/driving-diary', // updated
  ADMIN_NOTIFICATION = '/admin/notification', // updated
  ADMIN_SETTINGS_USERS = '/admin/settings/users', // updated
  ADMIN_SETTINGS_COMPANY_INFO = '/admin/settings/agency', // updated
  ADMIN_SETTINGS_STAFF = '/admin/settings/workers', // updated
  ADMIN_SETTINGS_VEHICLES = '/admin/settings/vehicle', // updated
  ADMIN_SETTINGS_EDGE_SERVERS = '/admin/settings/edge-server', // updated
  ADMIN_SETTINGS_IOT_BUTTONS = '/admin/settings/iot-button', // updated
  ADMIN_SETTINGS_DISPATCH_AREAS = '/admin/settings/routes',
  ADMIN_SETTINGS_SEGMENTS = '/admin/settings/cluster',
  ADMIN_SETTINGS_ABSENCE = '/admin/settings/absence',
}
export enum ROUTER_PATH_NAME {
  ADMIN_DASHBOARD = 'dashboard',
  ADMIN_WORKING_SCHEDULE = 'work_shift',
  ADMIN_REALTIME_ACTIVITY = 'realtime_activity',
  ADMIN_OPERATION_ANALYSIS = 'operation_analysis',
  ADMIN_ILLEGAL_DISPOSAL = 'illegal_disposal',
  ADMIN_DRIVING_DIARY = 'driving_diary',
  ADMIN_NOTIFICATION = 'notification',
  ADMIN_SETTINGS_USERS = 'user_management',
  ADMIN_SETTINGS_COMPANY_INFO = 'company_management',
  ADMIN_SETTINGS_STAFF = 'staff_management',
  ADMIN_SETTINGS_VEHICLES = 'vehicle_management',
  ADMIN_SETTINGS_EDGE_SERVERS = 'updater_application_management',
  ADMIN_SETTINGS_DISPATCH_AREAS = 'route_management',
  ADMIN_SETTINGS_ABSENCE = 'absence_management',
}

export const PRIVATE_ROUTE: string[] = [ROUTER_PATH.ADMIN_DASHBOARD];
export const SUPER_ADMIN_ROUTE: string[] = [ROUTER_PATH.SUPER_ADMIN];
export const AUTH_ROUTE: string[] = [
  ROUTER_PATH.LOGIN,
  ROUTER_PATH.REGISTER,
  ROUTER_PATH.FORGOT_PASSWORD,
];

export const SCREENS = {
  DESKTOP: 1024,
};

export const LOCALE = {
  EN: 'en',
  VI: 'vi',
  KO: 'ko',
};

export const DEFAULT_LOCALE = LOCALE.KO;

export enum RESPONSE_CODE {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  PERMISSION = 403,
  SERVER_ERROR = 502,
  VALIDATION_ERROR = 422,
}

export enum Priority {
  INFO,
  LOW,
  MEDIUM,
  HIGH,
}

export enum SORT_TYPE {
  DESC = 'DESC',
  desc = 'desc',
  ASC = 'ASC',
  asc = 'asc',
  ascend = 'ASC',
  descend = 'DESC',
}

export const DATE_FORMAT = {
  MONTH_YEAR: 'MM/yy',
  BASIC: 'DD-MM-YYYY',
  BASIC1: 'DD/MM/YYYY',
  BASIC2: 'YYYY/MM/DD',
  DATE_FULL: 'YYYY/MM/DD HH:mm',
  DATE_YT: 'YYYY-MM-DD HH:mm:ss',
  DATE_TY: 'HH:mm:ss YYYY-MM-DD',
  R_BASIC: 'YYYY-MM-DD',
  ISO_BASIC: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_KOREA: 'YYYY[년] MM[월] DD[일]',
  LONG_DATE: 'MMMM D, YYYY',
  DRIVING_DIARY: 'YYYY-MM-DD dddd',
  YEAR_MONTH: 'YYYY MMMM',
  DEFAULT: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
  HOUR_MINUTE: 'HH:mm',
  DATE_KOREA_DAY_OF_WEEK: 'YYYY[년] M[월] D[일] (ddd)',
  START_OF: 'YYYY-MM-DDT00:00:00.000[Z]',
  END_OF: 'YYYY-MM-DDT23:59:59.999[Z]',
  HOURS: 'HH:mm:ss',
};

export const currencies = {
  [CurrencyTypeEnum.USD]: {
    text: 'USD',
    icon: '$',
  },
  [CurrencyTypeEnum.BTC]: {
    text: 'BTC',
    icon: '₿',
  },
  [CurrencyTypeEnum.ETH]: {
    text: 'ETH',
    icon: 'Ξ',
  },
};

export const passwordPattern = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);

export const websitePattern =
  /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?/gi;

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const daysKorea = ['일', '월', '화', '수', '목', '금', '토'];
