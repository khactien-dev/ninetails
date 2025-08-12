import { ROUTER_PATH_NAME } from '@/constants';

export const usePermissionRoleConfig = () => {
  const permissionsRoleConfig: {
    [key: string]: {
      create: any;
      read: any;
      update: any;
      delete: any;
      export: any;
    };
  } = {
    [ROUTER_PATH_NAME.ADMIN_DASHBOARD]: {
      create: null,
      read: true,
      update: null,
      delete: null,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_WORKING_SCHEDULE]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
    },
    [ROUTER_PATH_NAME.ADMIN_REALTIME_ACTIVITY]: {
      create: null,
      read: true,
      update: null,
      delete: null,
      export: true,
    },
    [ROUTER_PATH_NAME.ADMIN_OPERATION_ANALYSIS]: {
      create: null,
      read: true,
      update: true,
      delete: null,
      export: true,
    },
    [ROUTER_PATH_NAME.ADMIN_ILLEGAL_DISPOSAL]: {
      create: null,
      read: true,
      update: null,
      delete: null,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_DRIVING_DIARY]: {
      create: true,
      read: true,
      update: true,
      delete: null,
      export: true,
    },
    [ROUTER_PATH_NAME.ADMIN_NOTIFICATION]: {
      create: null,
      read: true,
      update: true,
      delete: null,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_USERS]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_COMPANY_INFO]: {
      create: null,
      read: true,
      update: true,
      delete: null,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_STAFF]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_VEHICLES]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_EDGE_SERVERS]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_DISPATCH_AREAS]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
    [ROUTER_PATH_NAME.ADMIN_SETTINGS_ABSENCE]: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: null,
    },
  };

  return permissionsRoleConfig;
};
