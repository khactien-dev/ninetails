import { ROUTER_PATH } from '@/constants/common';
import { routeNamePath } from '@/constants/settings';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import * as S from './index.styles';
import { SidebarNavigationItem, sidebarNavigation } from './menu.utils';

interface SiderContentProps {
  setCollapsed: (isCollapsed: boolean) => void;
}

const sidebarNavFlat = sidebarNavigation.reduce(
  (result: SidebarNavigationItem[], current) =>
    result.concat(current.children && current.children.length > 0 ? current.children : current),
  []
);

const SiderMenu: React.FC<SiderContentProps> = ({ setCollapsed }) => {
  const { t } = useTranslation();
  const router = useRouterWithAuthorize();
  const user = useAppSelector(selectCurrentUser);
  const { mobileOnly, tabletOnly } = useResponsive();

  const currentMenuItem = sidebarNavFlat.find(({ url }) => router.pathname.includes(url));
  const defaultSelectedKeys = currentMenuItem ? [currentMenuItem.key] : [];

  const openedSubmenu = sidebarNavigation.find(({ children }) =>
    children?.some(({ url }) => url === router.pathname)
  );

  const defaultOpenKeys = openedSubmenu ? [openedSubmenu.key] : [];

  const navigations = useMemo(() => {
    const isOpLogin = router.query.opId && router.query.schema;

    if (isOpLogin) return sidebarNavigation;

    if (mobileOnly || tabletOnly) return sidebarNavigation.filter((item) => item.key != 'settings');

    return sidebarNavigation.map((menu) => {
      if (menu.key === 'settings') {
        const childrenHasPermission = Object.entries(routeNamePath)
          .filter(([key]) => key.includes('/admin/settings'))
          .filter(([, value]) => user?.permission?.[value].includes('read'));
        return {
          ...menu,
          url:
            childrenHasPermission.length === 0
              ? ROUTER_PATH.HOMEPAGE
              : childrenHasPermission?.[0]?.[0] || ROUTER_PATH.ADMIN_SETTINGS_USERS,
          disabled: childrenHasPermission.length === 0,
        };
      }
      return {
        ...menu,
        disabled:
          !user?.permission?.[routeNamePath[menu.url as keyof typeof routeNamePath]]?.includes(
            'read'
          ),
      };
    });
  }, [router.query.opId, router.query.schema, mobileOnly, tabletOnly, user?.permission]);

  return (
    <>
      <S.Menu
        mode="inline"
        selectedKeys={defaultSelectedKeys}
        openKeys={defaultOpenKeys}
        onClick={() => setCollapsed(true)}
        items={navigations.map((nav) => {
          const isSubMenu = nav.children?.length;
          // const customUrl = router.getPath(nav.url);

          return {
            key: nav.key,
            title: t(nav.title),
            label: t(nav.title),
            icon: nav.icon,
            disabled: nav?.disabled,
            onClick: () => router.pushWithAuthorize(nav.url),
            children:
              isSubMenu &&
              nav.children &&
              nav.children.map((childNav) => ({
                key: childNav.key,
                label: <Link href={childNav.url || ''}>{t(childNav.title)}</Link>,
                title: t(childNav.title),
              })),
          };
        })}
      />
    </>
  );
};

export default SiderMenu;
