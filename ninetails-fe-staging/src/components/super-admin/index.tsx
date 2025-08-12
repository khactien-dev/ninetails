import {
  AdmContentWrap,
  Box,
  BoxTitle,
  BoxTitleRow,
  SettingWrapper,
} from '@/components/settings/table/index.style';
import { MENU_SUPER_ADMIN } from '@/constants/settings';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import LeftMenu from '../settings/left-menu';
import { Customer } from './customer';
import * as S from './index.styles';
import RegistrationRequest from './registration-request';

const items = [
  {
    key: 'customer',
    label: '고객',
  },
  {
    key: 'registration-request',
    label: '등록 요청',
  },
];

const SuperAdmin = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('tab');
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<string>();
  useEffect(() => {
    if (router.isReady) {
      setActiveKey(search === 'registration-request' ? 'registration-request' : 'customer');
    }
  }, [router, search]);

  const handleChangeKey = (value: string) => {
    setActiveKey(value);
    router.push({
      query: {
        tab: value,
      },
    });
  };

  return (
    <>
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
                <S.Tabs items={items} activeKey={activeKey} onChange={handleChangeKey} />
                {activeKey === 'customer' ? <Customer /> : <RegistrationRequest />}
              </S.WrapTab>
            )}
          </Box>
        </AdmContentWrap>
      </SettingWrapper>
    </>
  );
};

export default SuperAdmin;
