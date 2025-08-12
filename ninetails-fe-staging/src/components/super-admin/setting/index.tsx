import { AdmContentWrap, SettingWrapper } from '@/components/settings/table/index.style';
import { Box, BoxTitle, BoxTitleRow } from '@/components/settings/table/index.style';
import { Tabs } from '@/components/super-admin/index.styles';
import { MENU_SUPER_ADMIN } from '@/constants/settings';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import LeftMenu from '../../settings/left-menu';
import { ConfigMode } from '../config-mode';
import { PermissionMode } from '../permission';
import * as S from './index.styles';

const items = [
  {
    key: 'permission',
    label: '권한',
  },
  {
    key: 'config',
    label: '운전 모드',
  },
];
const SuperAdminSetting = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('tab');
  const router = useRouter();
  const { query } = useRouter();
  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    if (router.isReady) {
      setActiveKey(search === 'config' ? 'config' : 'permission');
    }
  }, [router, search]);

  const handleChangeKey = (value: string) => {
    setActiveKey(value);
    router.push({
      query: {
        tab: value,
        tenant_id: query?.tenant_id,
        title: query?.title,
      },
    });
  };

  return (
    <SettingWrapper>
      <LeftContent isSuperAdmin={true} hasCollapseBtn={false} width={364}>
        <LeftMenu isSuperAdmin={true} menus={MENU_SUPER_ADMIN} />
      </LeftContent>
      <AdmContentWrap>
        <Box>
          <BoxTitleRow>
            <BoxTitle>{'가입자 그룹 관리'}</BoxTitle>
          </BoxTitleRow>
          {activeKey && (
            <S.WrapTab>
              <Tabs items={items} activeKey={activeKey} onChange={handleChangeKey} />
              {activeKey === 'permission' ? <PermissionMode /> : <ConfigMode />}
            </S.WrapTab>
          )}
        </Box>
      </AdmContentWrap>
    </SettingWrapper>
  );
};

export default SuperAdminSetting;
