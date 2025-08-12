import { collect_metrics } from 'libs/indexes/collect_metrics.index';
import { drive_metrics } from 'libs/indexes/drive_metrics.index';
import { edge_state } from 'libs/indexes/edge_state.index';
import { vehicle_info } from 'libs/indexes/vehicle_info.index';
import { vehicle_route } from 'libs/indexes/vehicle_route.index';
import { zscore_rollup } from 'libs/indexes/zscore_rollup.index';
import { Mixin } from 'ts-mixer';

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export const ERROR_INFO = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
};

export enum StaffStatus {
  NORMAL = 'NORMAL',
  LEAVING = 'LEAVING',
  RESIGNED = 'RESIGNED',
}

export enum JobContract {
  DRIVING_CREW_REGULAR = 'DRIVING_CREW_REGULAR',
  COLLECT_CREW_REGULAR = 'COLLECT_CREW_REGULAR',
  SUPPORT_CREW_REGULAR = 'SUPPORT_CREW_REGULAR',
  COLLECT_CREW_MONTHLY = 'COLLECT_CREW_MONTHLY',
  COLLECT_CREW_FIXED_TERM = 'COLLECT_CREW_FIXED_TERM',
  SUPPORT_CREW_FIXED_TERM = 'SUPPORT_CREW_FIXED_TERM',
  MECHANIC_REGULAR = 'MECHANIC_REGULAR',
  OFFICE_CREW_REGULAR = 'OFFICE_CREW_REGULAR',
  MANAGER_REGULAR = 'MANAGER_REGULAR',
}

export enum DriverLicense {
  NONE = 'NONE',
  UPPER_TYPE_1 = '1종 대형',
  NORMAL_TYPE_1 = '1종 보통',
  SPECIAL_TYPE_1 = '1종 특수',
  NORMAL_TYPE_2 = '2종 보통',
  LOWER_TYPE_2 = '2종 소형',
}

export enum Availability {
  'NORMAL' = 'NORMAL',
  'ANNUAL_LEAVE' = 'ANNUAL_LEAVE',
  'SICK_LEAVE' = 'SICK_LEAVE',
  'VACATION' = 'VACATION',
  'LEAVE_OF_ABSENCE' = 'LEAVE_OF_ABSENCE',
  'SUSPENDED' = 'SUSPENDED',
}

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum StaffRole {
  DRIVER = 'DRIVER',
  CREW1 = 'CREW1',
  CREW2 = 'CREW2',
}

export enum SORTBY {
  desc = 'desc',
  asc = 'asc',
  DESC = 'DESC',
  ASC = 'ASC',
}

export const NUMBER_PAGE = {
  PAGE_SIZE: 10,
  PAGE: 1,
};

export enum ESTATUS {
  ACTIVE = 1,
  INACTIVE = 0,
}

export enum SORT_COMMON {
  ID = 'id',
  CREATEDAT = 'createdAt',
}

export enum SORT_REGISTER {
  ID = 'id',
  ORGANIZATION = 'organization',
  EMAIL = 'email',
  DEPARTMENT = 'department',
  PROOF1 = 'proof1',
  PROOF2 = 'proof2',
  CREATEDAT = 'createdAt',
  APPROVEDTIME = 'approved_time',
  OPERATOR = 'operator',
  PHONE = 'phone',
  POSITION = 'position',
  STATUS = 'requestStatus',
}

export enum SORT_TENANT {
  ID = 'id',
  EMAIL = 'email',
  CONTRACTSTATUS = 'contractStatus',
  LASTLOGIN = 'lastLogin',
  CONTRACTENDDATE = 'contractEndDate',
  CONTRACTSTARTDATE = 'contractStartDate',
  ORGANIZATION = 'organization',
  CONTRACTYPE = 'contractType',
  OPERATOR = 'operator',
  PHONE = 'phone',
}

export enum EBOOL {
  TRUE = 'true',
  FALSE = 'false',
}

export enum PURPOSE {
  'COMPOSITE_WASTES' = 'COMPOSITE_WASTES',
  'FOOD_WASTES' = 'FOOD_WASTES',
  'REUSABLE_WASTES' = 'REUSABLE_WASTES',
  'TACTICAL_MOBILITY' = 'TACTICAL_MOBILITY',
}

class HitSourceData extends Mixin(
  collect_metrics,
  drive_metrics,
  edge_state,
  vehicle_info,
  vehicle_route,
  zscore_rollup,
) {}

export type IOpenSearchResult = {
  body: {
    hits: {
      hits: {
        _id: string;
        _source: HitSourceData;
      }[];
      total: { value: number };
    };
    aggregations: {
      total_trip_distance: { value: number };
      total_collect_amount: { value: number };
      total_weight: { value: number };
      max_ts: { value_as_string: string; value: Date };
      min_ts: { value_as_string: string; value: Date };
    };
  };
};

export enum EOPERATOR {
  EQUALS = '=',
  GREATER_THAN = '>',
  GREATER_THAN_EQUALS = '>=',
  LESS_THAN = '<',
  LESS_THAN_EQUALS = '<=',
  NOT_EQUALS = '!=',
  LIKE = 'like',
}

export enum ELOGICAL {
  AND = 'AND',
  OR = 'OR',
}

export enum ABSENCETYPE {
  '오전반차' = '오전반차',
  '오후반차' = '오후반차',
  '연차' = '연차',
  '공가' = '공가',
  '병가' = '병가',
  '경조휴가' = '경조휴가',
  '특별휴가' = '특별휴가',
  '노조' = '노조',
  '휴가' = '휴가',
  '[휴직] 공로연수' = '[휴직] 공로연수',
  '[휴직] 산재' = '[휴직] 산재',
  '[휴직] 질병' = '[휴직] 질병',
  '[휴직] 육아' = '[휴직] 육아',
  '[정직]' = '[정직]',
  '기타' = '기타',
}

export enum REPEAT {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ETABLEROUTEMANAGE {
  POINT = 'point',
  SEGMENT = 'segment',
  SECTION = 'section',
  CORESECTION = 'core_section',
  GUIDE = 'guide',
  GUIDE_CODE = 'guide_code',
  METADATA = 'metadata',
  ROUTE = 'route',
  SEGMENT_ROUTE = 'segment_route',
  CONGESTION = 'congestion_code',
}

export enum ECORESECTIONTYPE {
  GARAGE = 'GARAGE',
  LANDFILL = 'LANDFILL',
  ENTRY = 'ENTRY',
}

export enum EROUTETYPE {
  COMMON = 'C',
  LIVING = 'L',
  FOOD = 'F',
  REUSABLE = 'R',
  MOBILE = 'M',
}
