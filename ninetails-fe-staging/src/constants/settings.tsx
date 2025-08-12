import Bank from '@/assets/images/settings/left-menu/bank.svg';
import Calendar from '@/assets/images/settings/left-menu/calendar.svg';
import Cloud from '@/assets/images/settings/left-menu/cloud.svg';
import Cpu from '@/assets/images/settings/left-menu/cpu.svg';
import Document from '@/assets/images/settings/left-menu/document.svg';
import HomeWifi from '@/assets/images/settings/left-menu/home-wifi.svg';
import Layout from '@/assets/images/settings/left-menu/layout.svg';
import Map from '@/assets/images/settings/left-menu/map.svg';
import PadLock from '@/assets/images/settings/left-menu/padlock.svg';
import PeopleCrosshair from '@/assets/images/settings/left-menu/people-crosshair.svg';
import LinearPeople from '@/assets/images/settings/left-menu/people.svg';
import Queue from '@/assets/images/settings/left-menu/queue.svg';
import Setting from '@/assets/images/settings/left-menu/setting.svg';
import Truck from '@/assets/images/settings/left-menu/truck.svg';
import UserOctagon from '@/assets/images/settings/left-menu/user-octagon.svg';

export const LOCATION_ROUTE = '/admin/settings/locations';

export const STATUS = {
  NORMAL: 'NORMAL',
  LEAVING: 'LEAVING',
  RESIGNED: 'RESIGNED',
  MAINTENANCE: 'MAINTENANCE',
  ACTIVE: 1,
  INACTIVE: 0,
};

export const STATUS_KR = {
  NORMAL: '정상',
  LEAVING: '열외',
  RESIGNED: '퇴사',
};

export const STATUS_VEHICLE_EN = {
  NORMAL: 'NORMAL',
  MAINTENANCE: 'MAINTENANCE',
  DISPOSED: 'DISPOSED',
  RETIRED: 'RETIRED',
};

export const STATUS_VEHICLE_KR = {
  NORMAL: '정상',
  MAINTENANCE: '정비',
  DISPOSED: '매각',
  RETIRED: '폐차',
};

export const OPERATION_STATUS = {
  DISPATCHING: '배차중',
  AVAILABLE: '대기중',
  SCHEDULED_MAINTENANCE: '정비예정',
  UNDER_MAINTENANCE: '정비중',
};

export const PURPOSE = {
  COMPOSITE_WASTES: '생활',
  FOOD_WASTES: '음식',
  REUSABLE_WASTES: '재활',
  TACTICAL_MOBILITY: '기타',
};

export const PURPOSE_VEHICLE = {
  COMPOSITE_WASTES: '생활 [정규]',
  COMPOSITE_WASTES_SUPPORT: '생활 [지원]',
  FOOD_WASTES: '음식 [정규]',
  FOOD_WASTES_SUPPORT: '음식 [지원]',
  REUSABLE_WASTES: '재활 [정규]',
  REUSABLE_WASTES_SUPPORT: '재활 [지원]',
  TACTICAL_MOBILITY: '기동 [정규]',
  TACTICAL_MOBILITY_SUPPORT: '기동 [지원]',
};

export const ABSENCE_TYPE = {
  MORNING: '경정비: 오전',
  AFTERNOON: '경정비: 오후',
  PERIODIC_AFTERNOON: '정기검사: 오후',
  PERIODIC_MORNING: '정기검사: 오전',
  PERIODIC_ALLDAY: '경정비: 종일',
  ALLDAY: '정기검사: 종일',
  LONG_TERM: '[수리] 대기',
  REPAIR_LONG_TERM: '[수리] 고장',
  ACCIDENT_LONG_TERM: '[수리] 사고',
} as const;

export const ABSENCE_TYPE_VEHICLE = [
  { label: '경정비: 오전', value: 'MORNING' },
  { label: '경정비: 오후', value: 'AFTERNOON' },
  { label: '정기검사: 오후', value: 'PERIODIC_AFTERNOON' },
  { label: '정기검사: 오전', value: 'PERIODIC_MORNING' },
  { label: '경정비: 종일', value: 'PERIODIC_ALLDAY' },
  { label: '정기검사: 종일', value: 'ALLDAY' },
  { label: '[수리] 대기', value: 'LONG_TERM' },
  { label: '[수리] 고장', value: 'REPAIR_LONG_TERM' },
  { label: '[수리] 사고', value: 'ACCIDENT_LONG_TERM' },
];

export const LEAVE_HAFT_DAY = [
  ABSENCE_TYPE.PERIODIC_AFTERNOON,
  ABSENCE_TYPE.AFTERNOON,
  ABSENCE_TYPE.MORNING,
  ABSENCE_TYPE.PERIODIC_MORNING,
];

export const LEAVE_LONG_TERM = [
  ABSENCE_TYPE.LONG_TERM,
  ABSENCE_TYPE.REPAIR_LONG_TERM,
  ABSENCE_TYPE.ACCIDENT_LONG_TERM,
];

export const ABSENCE_TYPE_STAFF = {
  MORNING_HALF: '오전반차',
  AFTERNOON_HALF: '오후반차',
  ANNUAL: '연차',
  OFFICIAL: '공가',
  SICK: '병가',
  TRIBULATION: '경조휴가',
  SPECIAL: '특별휴가',
  LABOR_UNION: '노조',
  VACATION: '휴가',
  LONG_TERM_MERITORIOUS: '[휴직] 공로연수',
  LONG_TERM_INDUSTRIAL: '[휴직] 산재',
  LONG_TERM_DISEASE: '[휴직] 질병',
  LONG_TERM_PARENTAL: '[휴직] 육아',
  SUSPENDED: '[정직]',
  OTHER: '기타',
};

export const LEAVE_HAFT_DAY_STAFF = [
  ABSENCE_TYPE_STAFF.MORNING_HALF,
  ABSENCE_TYPE_STAFF.AFTERNOON_HALF,
];

export const LEAVE_LONG_TERM_STAFF = [
  ABSENCE_TYPE_STAFF.LONG_TERM_MERITORIOUS,
  ABSENCE_TYPE_STAFF.LONG_TERM_INDUSTRIAL,
  ABSENCE_TYPE_STAFF.LONG_TERM_DISEASE,
  ABSENCE_TYPE_STAFF.LONG_TERM_PARENTAL,
  ABSENCE_TYPE_STAFF.SUSPENDED,
];

export const LEAVE_MORNING_VEHICLE = [ABSENCE_TYPE.MORNING, ABSENCE_TYPE.PERIODIC_MORNING];

export const REPEAT_TYPE = {
  NONE: '없음',
  WEEKLY: '매주',
  MONTHLY: '매월',
};

export const REPEAT_TYPE_EN = {
  NONE: 'NONE',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export const PURPOSE_VALUE = {
  COMPOSITE_WASTES: 'L',
  FOOD_WASTES: 'F',
  REUSABLE_WASTES: 'R',
  TACTICAL_MOBILITY: 'M',
};

export const STAFF_ROLE = {
  DRIVER: 'y',
  CREW: 'n',
};

export const USER_ROLE = {
  ADMIN: 'ADMIN',
  OP: 'OP',
  BACKUP: 'BACKUP',
  DISPATCH: 'DISPATCH',
  USER: 'USER',
};

export const STAFF_AVAILABILITY = {
  NORMAL: 'NORMAL',
};

export const CONTRACT_TYPE = {
  PERMANENT: 'PERMANENT',
  TEMPORARY: 'TEMPORARY',
};

export const ADMIN_PERMISSION = [USER_ROLE.OP, USER_ROLE.BACKUP];

export const MENU = [
  {
    name: '기관',
    icon: <Bank />,
    link: '/admin/settings/agency',
    disabled: false,
  },
  {
    name: '사용자',
    icon: <LinearPeople />,
    link: '/admin/settings/users',
    disabled: false,
  },
  {
    name: '직원',
    icon: <UserOctagon />,
    link: `/admin/settings/workers`,
    disabled: false,
  },
  {
    name: '청소차량',
    icon: <Truck />,
    link: '/admin/settings/vehicle',
    disabled: false,
  },
  {
    name: '엣지서버',
    icon: <Cloud />,
    link: '/admin/settings/edge-server',
    disabled: false,
  },
  {
    name: 'IoT 버튼',
    icon: <HomeWifi />,
    link: '/admin/settings/iot-button',
    disabled: false,
  },
  {
    name: '배차지역',
    icon: <Map />,
    link: '/admin/settings/routes',
    disabled: false,
  },
  {
    name: '클러스터',
    icon: <Cpu />,
    link: '/admin/settings/cluster',
    disabled: false,
  },
  {
    name: '부재',
    icon: <Calendar />,
    link: '/admin/settings/absence',
    disabled: false,
  },
];

export const dummyData = [
  {
    key: '1',
    nameEmail: '홍길동 (hong@example.com)',
    lastLogin: '2024-01-01 10:00',
    contact: '010-1234-5678',
    status: 'Active',
    email: 'hong@example.com',
    password: 'password123',
    name: '홍길동',
    department: 'Sales',
    position: 'Manager',
    role: 'Admin',
  },
  {
    key: '2',
    nameEmail: '김철수 (kim@example.com)',
    lastLogin: '2024-01-02 11:00',
    contact: '010-2345-6789',
    status: 'Inactive',
    email: 'kim@example.com',
    password: 'password456',
    name: '김철수',
    department: 'Marketing',
    position: 'Executive',
    role: 'User',
  },
  {
    key: '3',
    nameEmail: '김철수 (kim@example.com)',
    lastLogin: '2024-01-02 11:00',
    contact: '010-2345-6789',
    status: 'Inactive',
    email: 'kim@example.com',
    password: 'password456',
    name: '김철수',
    department: 'Marketing',
    position: 'Executive',
    role: 'User',
  },
  {
    key: '4',
    nameEmail: '김철수 (kim@example.com)',
    lastLogin: '2024-01-02 11:00',
    contact: '010-2345-6789',
    status: 'Inactive',
    email: 'kim@example.com',
    password: 'password456',
    name: '김철수',
    department: 'Marketing',
    position: 'Executive',
    role: 'User',
  },
];

export const dummyDataWorkers = [
  {
    key: '1',
    info: '홍길동 (010-1234-5678)',
    role: 'Sales (Manager)',
    terms: '2023-01-01 ~ 2024-01-01',
    contract: '정',
    rider: 'Y',
    out: '정',
    status: 'Active',
  },
  {
    key: '2',
    info: '김철수 (010-2345-6789)',
    role: 'Marketing (Executive)',
    terms: '2022-06-01 ~ 2023-06-01',
    contract: '기',
    rider: 'N',
    out: '질',
    status: 'Inactive',
  },
  {
    key: '3',
    info: '박영희 (010-3456-7890)',
    role: 'Development (Engineer)',
    terms: '2021-12-01 ~ 2022-12-01',
    contract: '정',
    rider: 'Y',
    out: '정',
    status: 'Active',
  },
  {
    key: '4',
    info: '이민호 (010-4567-8901)',
    role: 'HR (Director)',
    terms: '2020-03-01 ~ 2021-03-01',
    contract: '기',
    rider: 'N',
    out: '질',
    status: 'Inactive',
  },
  {
    key: '5',
    info: '최지우 (010-5678-9012)',
    role: 'Finance (Analyst)',
    terms: '2019-07-01 ~ 2020-07-01',
    contract: '정',
    rider: 'Y',
    out: '정',
    status: 'Active',
  },
];

export const MENU_SUPER_ADMIN = [
  {
    name: '가입자 관리',
    icon: <PeopleCrosshair />,
    link: '/super-admin',
  },
  {
    name: '설정 관리',
    icon: <Setting />,
    link: '',
  },
  {
    name: '컨텐츠 관리',
    icon: <Document />,
    link: '',
  },
  {
    name: '웹이름 분석',
    icon: <Layout />,
    link: '',
  },
  {
    name: '보안 설정',
    icon: <PadLock />,
    link: '',
  },
  {
    name: '이벤트&로그',
    icon: <Queue />,
    link: '',
  },
];

export const AVAILABILITY_EN = {
  NORMAL: 'NORMAL',
  ANNUAL_LEAVE: 'ANNUAL_LEAVE',
  SICK_LEAVE: 'SICK_LEAVE',
  VACATION: 'VACATION',
  LEAVE_OF_ABSENCE: 'LEAVE_OF_ABSENCE',
  SUSPENDED: 'SUSPENDED',
};

export const AVAILABILITY_KR = {
  NORMAL: '정상',
  ANNUAL_LEAVE: '연월차',
  SICK_LEAVE: '병가',
  VACATION: '휴가',
  LEAVE_OF_ABSENCE: '휴직',
  SUSPENDED: '정직',
};
export const JOBCONTRACT_EN = {
  DRIVING_CREW_REGULAR: 'DRIVING_CREW_REGULAR',
  COLLECT_CREW_REGULAR: 'COLLECT_CREW_REGULAR',
  SUPPORT_CREW_REGULAR: 'SUPPORT_CREW_REGULAR',
  COLLECT_CREW_MONTHLY: 'COLLECT_CREW_MONTHLY',
  COLLECT_CREW_FIXED_TERM: 'COLLECT_CREW_FIXED_TERM',
  SUPPORT_CREW_FIXED_TERM: 'SUPPORT_CREW_FIXED_TERM',
  MECHANIC_REGULAR: 'MECHANIC_REGULAR',
  OFFICE_CREW_REGULAR: 'OFFICE_CREW_REGULAR',
  MANAGER_REGULAR: 'MANAGER_REGULAR',
};
export const JOBCONTRACT_KR = {
  DRIVING_CREW_REGULAR: '운전 [정규]',
  COLLECT_CREW_REGULAR: '탑승 [정규]',
  SUPPORT_CREW_REGULAR: '지원 [정규]',
  COLLECT_CREW_MONTHLY: '탑승 [단기]',
  COLLECT_CREW_FIXED_TERM: '탑승 [계약]',
  SUPPORT_CREW_FIXED_TERM: '지원 [계약]',
  MECHANIC_REGULAR: '정비 [정규]',
  OFFICE_CREW_REGULAR: '사무 [정규]',
  MANAGER_REGULAR: '간부 [정규]',
};
export const PURPOSE_EN = {
  COMPOSITE_REGULAR: 'COMPOSITE_REGULAR',
  COMPOSITE_SUPPORT: 'COMPOSITE_SUPPORT',
  FOOD_REGULAR: 'FOOD_REGULAR',
  FOOD_SUPPORT: 'FOOD_SUPPORT',
  REUSABLE_REGULAR: 'REUSABLE_REGULAR',
  REUSABLE_SUPPORT: 'REUSABLE_SUPPORT',
  TATICAL_MOBILITY_REGULAR: 'TATICAL_MOBILITY_REGULAR',
  TATICAL_MOBILITY_SUPPORT: 'TATICAL_MOBILITY_SUPPORT',
};
export const PURPOSE_KR = {
  COMPOSITE_REGULAR: '생활 [정규]',
  COMPOSITE_SUPPORT: '생활 [지원]',
  FOOD_REGULAR: '음식 [정규]',
  FOOD_SUPPORT: '음식 [지원]',
  REUSABLE_REGULAR: '재활 [정규]',
  REUSABLE_SUPPORT: '재활 [지원]',
  TATICAL_MOBILITY_REGULAR: '기동 [정규]',
  TATICAL_MOBILITY_SUPPORT: '기동 [지원]',
};

export const ABSENCE_DAY_LIST = [
  { label: '월', value: 'MONDAY' },
  { label: '화', value: 'TUESDAY' },
  { label: '수', value: 'WEDNESDAY' },
  { label: '목', value: 'THURSDAY' },
  { label: '금', value: 'FRIDAY' },
  { label: '토', value: 'SATURDAY' },
];

export const STAFF_LABEL = {
  NAME: '이름',
  PURPOSE: '직무 [계약 형태]',
  TYPE: '부재 항목',
  REPLACE: '대체자',
  START_DATE: '시작일',
  END_DATE: '종료일',
  TIME: '기간',
  DAY: '반복',
  OTHER_TYPE: '이유',
};

export const VEHICLE_LABEL = {
  NAME: '차번',
  PURPOSE: '용도[유형]',
  TYPE: '부재 항목',
  REPLACE: '대체차량',
  START_DATE: '시작일',
  END_DATE: '종료일',
  TIME: '기간',
};

export const JOB_TYPE = [
  {
    id: 0,
    label: 'DRIVING_CREW_REGULAR',
    color: 'blue',
  },
  {
    id: 1,
    label: 'COLLECT_CREW_REGULAR',
    color: 'green',
  },
  {
    id: 2,
    label: 'SUPPORT_CREW_REGULAR',
    color: 'red',
  },
  {
    id: 3,
    label: 'COLLECT_CREW_MONTHLY',
    color: 'pink',
  },
  {
    id: 4,
    label: 'COLLECT_CREW_FIXED_TERM',
    color: 'purple',
  },
  {
    id: 5,
    label: 'SUPPORT_CREW_FIXED_TERM',
    color: 'orange',
  },
];
export const PERMISSION_NAME_EN = {
  dashboard: 'dashboard',
  work_shift: 'work_shift',
  realtime_activity: 'realtime_activity',
  operation_analysis: 'operation_analysis',
  illegal_disposal: 'illegal_disposal',
  driving_diary: 'driving_diary',
  notification: 'notification',
  user_management: 'user_management',
  company_management: 'company_management',
  staff_management: 'staff_management',
  vehicle_management: 'vehicle_management',
  route_management: 'route_management',
  absence_management: 'absence_management',
  updater_application_management: 'updater_application_management',
};
export const PERMISSION_NAME_KR = {
  dashboard: '대시보드',
  work_shift: '배차통계',
  realtime_activity: '관제현황',
  operation_analysis: '운행 분석',
  illegal_disposal: '불법배출',
  driving_diary: '차량운행일지',
  notification: '알림',
  user_management: '사용자 그룹 관리',
  company_management: '기관(법인) 정보',
  staff_management: '인력 관리',
  vehicle_management: '차량 관리',
  updater_application_management: '엣지서버 관리',
  route_management: '배차 경로 관리',
  absence_management: '부재 관리',
};
export const routeNamePath = {
  '/admin/dashboard': 'dashboard',
  '/admin/schedule': 'work_shift',
  '/admin/control-status': 'realtime_activity',
  '/admin/operation-analysis': 'operation_analysis',
  '/admin/illegal': 'illegal_disposal',
  '/admin/driving-diary': 'driving_diary',
  '/admin/notification': 'notification',
  '/admin/settings/users': 'user_management',
  '/admin/settings/agency': 'company_management',
  '/admin/settings/workers': 'staff_management',
  '/admin/settings/vehicle': 'vehicle_management',
  '/admin/settings/edge-server': 'updater_application_management',
  '/admin/settings/routes': 'route_management',
  '/admin/settings/absence': 'absence_management',
};
