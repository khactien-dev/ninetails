export enum EUserRole {
  ADMIN = 'ADMIN',
  OP = 'OP',
  BACKUP = 'BACKUP',
  DISPATCH = 'DISPATCH',
  USER = 'USER',
}

export enum EUpdateUserRole {
  BACKUP = 'BACKUP',
  DISPATCH = 'DISPATCH',
  USER = 'USER',
}

export enum OTPTYPE {
  REGISTER = 'REGISTER',
  FORGOT_USERNAME = 'FORGOT_USERNAME',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_USER = 'VERIFY_USER',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export enum situation {
  ACTIVATION = 1,
  INACTIVATION = 2,
}

export enum CONTRACTYPE {
  STANDARD = 'STANDARD',
  TEMPORARY = 'TEMPORARY',
}

export enum ESORTUSER {
  UNKNOWN = '',
  EMAIL = 'email',
  FULLNAME = 'full_name',
  PHONE = 'phone_number',
  DEPARTMENT = 'department',
  POSITION = 'position',
  ROLE = 'role',
  LASTLOGIN = 'last_login',
  STATUS = 'status',
  PERMISSION = 'permission',
}

export enum ESORTSTAFF {
  UNKNOWN = '',
  NAME = 'name',
  AGE = 'age',
  STARTDATE = 'start_date',
  ENDDATE = 'end_date',
  ABSENCEDATE = 'absence_date',
  JOBCONTRACT = 'job_contract',
  STATUS = 'status',
  PHONENUMBER = 'phone_number',
  DRIVERLISENCE = 'driver_license',
  ABSENCETYPE = 'absence_type',
  NOTE = 'note',
  REPLACESTAFF = 'replacer_staff',
}

export enum SORTASSTAFF {
  UNKNOWN = '',
  ABSENCESTAFF = 'absence_staff',
  STARTDATE = 'start_date',
  PERIOD = 'period',
  ABSENCETYPE = 'absence_type',
  REPLACESTAFF = 'replacer_staff',
  JOBCONTRACT = 'job_contract',
  ENDDATE = 'end_date',
}

export enum VEHICLE_STATUS {
  NORMAL = 'NORMAL',
  MAINTENANCE = 'MAINTENANCE',
  DISPOSED = 'DISPOSED',
  RETIRED = 'RETIRED',
}

export enum VEHICLE_PURPOSE {
  COMPOSITE_REGULAR = 'COMPOSITE_REGULAR',
  COMPOSITE_SUPPORT = 'COMPOSITE_SUPPORT',
  FOOD_REGULAR = 'FOOD_REGULAR',
  FOOD_SUPPORT = 'FOOD_SUPPORT',
  REUSABLE_REGULAR = 'REUSABLE_REGULAR',
  REUSABLE_SUPPORT = 'REUSABLE_SUPPORT',
  TATICAL_MOBILITY_REGULAR = 'TATICAL_MOBILITY_REGULAR',
  TATICAL_MOBILITY_SUPPORT = 'TATICAL_MOBILITY_SUPPORT',
}

export enum ABSENCE_VEHICLE_TYPE {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  ALLDAY = 'ALLDAY',
  OFFICIAL = 'OFFICIAL_LEAVE',
  SICK = 'SICK_LEAVE',
  TRIBUTE = 'TRIBULATION_LEAVE',
  SPECIAL = 'SPECIAL_LEAVE',
  LABOR = 'LABOR_LEAVE',
  VACATION = 'VACATION',
  TRAINING = 'TRAINING',
  INDUSTRIAL = 'INDUSTRIAL',
  DISEASE = 'DISEASE',
  PARENTAL = 'PARENTAL',
  SUSPENDED = 'SUSPENDED',
  //============
  PERIODIC_AFTERNOON = 'PERIODIC_AFTERNOON',
  PERIODIC_MORNING = 'PERIODIC_MORNING',
  PERIODIC_ALLDAY = 'PERIODIC_ALLDAY',
  LONG_TERM = 'LONG_TERM',
  REPAIR_LONG_TERM = 'REPAIR_LONG_TERM',
  ACCIDENT_LONG_TERM = 'ACCIDENT_LONG_TERM',
  OTHER = 'OTHER',
}

export enum PERMISSION_TYPE {
  OP = 'OP',
}

export enum PERMISSION {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
}

export const FULL = [
  PERMISSION.READ,
  PERMISSION.CREATE,
  PERMISSION.UPDATE,
  PERMISSION.DELETE,
  PERMISSION.EXPORT,
];
export const CRUD = [
  PERMISSION.READ,
  PERMISSION.CREATE,
  PERMISSION.UPDATE,
  PERMISSION.DELETE,
];
export const RUX = [PERMISSION.READ, PERMISSION.UPDATE, PERMISSION.EXPORT];
export const RCUX = [
  PERMISSION.READ,
  PERMISSION.CREATE,
  PERMISSION.UPDATE,
  PERMISSION.EXPORT,
];
export const UX = [PERMISSION.UPDATE, PERMISSION.EXPORT];
export const RX = [PERMISSION.READ, PERMISSION.EXPORT];
export const RU = [PERMISSION.READ, PERMISSION.UPDATE];

export enum ESORTDIARY {
  DRIVE_MODE = 'data.drive_mode',
  TOTAL_TRIP_DISTANCE = 'total_trip_distance',
  TIMESTAMP = 'data.timestamp',
  SECTION_NAME = 'data.section_name.keyword',
  DURATION = 'duration.keyword',
  COLLECT_AMOUNT = 'collect_amount',
  WEIGTH = 'weight',
}

export enum ESORTVEHICLE {
  ID = 'id',
  NUMBER = 'vehicle_number',
  TYPE = 'vehicle_type',
  MODEL = 'vehicle_model',
  MANUFACTURER = 'manufacturer',
  CAPACITY = 'capacity',
  MAXCAPACITY = 'max_capacity',
  OPERATION_START = 'operation_start_date',
  OPERATION_END = 'operation_end_date',
  ABSENCE_START = 'absence_start',
  ABSENCE_END = 'absence_end',
  PURPOSE = 'purpose',
  NOTE = 'note',
  STATUS = 'status',
  ABSENCETYPE = 'absence_type',
  REPLACE = 'replacement_vehicle',
}

export enum ESORT_EDGESERVER {
  ID = 'id',
  NAME = 'edge_name',
  VEHICLENUMBER = 'vehicle_number',
  HW = 'hw_version',
  OS = 'os_version',
  KERNEL = 'kernel_version',
  JETPACK = 'jetpack_version',
  DOCKER = 'docker_version',
  OPERATION_METRICS = 'operation_metrics',
  EDGEMETRIC = 'edge_metrics',
  COLLECTION = 'collection_metrics',
  STATUS = 'status',
  UPDATEDAT = 'updatedAt',
}

export enum ESORT_ABSENCE_VEHICLE {
  ID = 'id',
  VEHICLENUMBER = 'vehicle_number',
  PURPOSE = 'purpose',
  STARTDATE = 'start_date',
  ENDDATE = 'end_date',
  PERIOD = 'period',
  ABSENCETYPE = 'absence_type',
  REPLACE = 'replacement_vehicle',
}
