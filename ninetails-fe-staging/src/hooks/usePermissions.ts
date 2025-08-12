import { MENU, USER_ROLE, routeNamePath } from '@/constants/settings';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { convertDataRoles, isExcludedKey, rolesRender } from '@/utils';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useRouterWithAuthorize } from './useRouterWithAuthorize';

interface Permission {
  createAble: boolean;
  readAble: boolean;
  updateAble: boolean;
  deleteAble: boolean;
  exportAble: boolean;
}

interface RoleData {
  id?: string | number;
  name?: string;
  type?: string;
  [key: string]: any;
}

interface ConvertedRoleData extends RoleData {
  [key: string]: Permission | any;
}

const DEFAULT_PERMISSIONS: Permission = {
  createAble: false,
  readAble: false,
  updateAble: false,
  deleteAble: false,
  exportAble: false,
};

const FULL_PERMISSIONS: Permission = {
  createAble: true,
  readAble: true,
  updateAble: true,
  deleteAble: true,
  exportAble: true,
};

export const usePermissions = (): Permission => {
  const { pathname, query } = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const convertDataFinal = (inputData: RoleData): ConvertedRoleData => {
    if (!inputData) return {};
    const result: { [key: string]: Permission } = {};

    try {
      Object.entries(inputData).forEach(([key, value]) => {
        if (typeof value === 'string' && !isExcludedKey(key)) {
          result[key] = value.split(',').reduce(
            (acc: Permission, perm: string) => {
              const trimmedPerm = perm.trim();
              if (trimmedPerm) {
                acc[trimmedPerm as keyof Permission] = true;
              }
              return acc;
            },
            { ...DEFAULT_PERMISSIONS }
          );
        } else if (value === null) {
          result[key] = { ...DEFAULT_PERMISSIONS };
        }
      });

      return {
        ...result,
        id: inputData?.id,
        name: inputData?.name,
        type: inputData?.type,
      };
    } catch (error) {
      console.error('Error processing DataFinal:', error);
      return {};
    }
  };

  return useMemo(() => {
    if (!pathname) return DEFAULT_PERMISSIONS;

    if (query.opId && query.schema) return FULL_PERMISSIONS;

    if (user?.role === USER_ROLE.ADMIN) return FULL_PERMISSIONS;

    const permissionsRender = rolesRender(convertDataFinal(convertDataRoles(user?.permission)));

    return permissionsRender[pathname as keyof typeof permissionsRender] ?? DEFAULT_PERMISSIONS;
  }, [pathname, query.opId, query.schema, user?.role, user?.permission]);
};

export const useSettingMenusPermissions = () => {
  const router = useRouterWithAuthorize();
  const user = useAppSelector(selectCurrentUser);

  const menus = useMemo(() => {
    const isOpLogin = router.query.opId && router.query.schema;

    if (isOpLogin) return MENU;

    return MENU.map((menu) => ({
      ...menu,
      disabled:
        !user?.permission?.[routeNamePath[menu.link as keyof typeof routeNamePath]]?.includes(
          'read'
        ),
    }));
  }, [router.query.opId, router.query.schema, user?.permission]);

  return menus;
};
