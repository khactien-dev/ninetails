import { MENU, USER_ROLE } from '@/constants/settings';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { selectCurrentUser } from '@/stores/auth/auth.slice';
import { useAppSelector } from '@/stores/hooks';
import { subString } from '@/utils';
import { useRouter } from 'next/router';
import React from 'react';

import * as S from './index.style';

interface MenuItemTypes {
  name: string;
  icon: string | React.ReactElement;
  link: string;
  disabled?: boolean;
}

interface LeftMenuProps {
  menus?: MenuItemTypes[];
  isSuperAdmin?: boolean;
}

interface MenuItem {
  menu: MenuItemTypes;
  isSuperAdmin: boolean;
  disabled?: boolean;
}

// eslint-disable-next-line no-redeclare
const MenuItem = ({ menu, isSuperAdmin, disabled }: MenuItem) => {
  const router = useRouterWithAuthorize();

  const handlePushRoute = () => {
    if (menu.link && menu.link !== router.pathname)
      return router.pushWithAuthorize(`/${menu.link}`);
    return;
  };

  return (
    <S.AdmnMenu
      onClick={disabled ? undefined : handlePushRoute}
      $disabled={disabled}
      $isActive={!!menu.link && !!(router.pathname === menu.link)}
      $isSuperAdmin={isSuperAdmin}
    >
      <S.AdmMenuIcon
        $isSuperAdmin={isSuperAdmin}
        $isActive={!!menu.link && !!(router.pathname === menu.link)}
      >
        {menu.icon}
      </S.AdmMenuIcon>
      <S.AdmMenuName
        $isSuperAdmin={isSuperAdmin}
        $isActive={!!menu.link && !!(router.pathname === menu.link)}
      >
        {menu.name}
      </S.AdmMenuName>
    </S.AdmnMenu>
  );
};

const LeftMenu = ({ menus = MENU, isSuperAdmin = false }: LeftMenuProps) => {
  const user = useAppSelector(selectCurrentUser);
  const { query } = useRouter();
  const isOPlogged = query.opId && query.schema;

  return (
    <S.LeftMenuWrapper>
      {isOPlogged && (
        <S.AdminOP>
          <strong className="supper">{'[Super Admin]'}</strong> <strong>환영합니다 </strong>,
          <p>
            <strong className="op">[{user?.permission?.name}]</strong> 로 로그인되어 있습니다
          </p>
        </S.AdminOP>
      )}

      <S.AdmenuWrap>
        {menus?.map((menuItem: MenuItemTypes) => (
          <MenuItem
            isSuperAdmin={isSuperAdmin}
            key={menuItem.name}
            menu={menuItem}
            disabled={menuItem?.disabled}
          />
        ))}
      </S.AdmenuWrap>

      {!isOPlogged && !isSuperAdmin && (
        <S.UserInfo>
          <b>{subString(user?.full_name)}</b> 님 <br />
          <span>[{user?.role == USER_ROLE.OP ? 'Operator' : user?.role}] </span>로그인 중입니다.
        </S.UserInfo>
      )}
    </S.LeftMenuWrapper>
  );
};

export default LeftMenu;
