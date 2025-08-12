import IconERD from '@/assets/images/settings/icon-erd.svg';
import Collapse from '@/components/analysis/collapse';
import { BaseForm } from '@/components/common/forms/base-form';
import LeftMenu from '@/components/settings/left-menu';
import useRoutes from '@/components/settings/routes/index.utils';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { Tooltip } from 'antd';
import React from 'react';

import * as S from './index.styles';

const Routes = () => {
  const [form] = BaseForm.useForm();
  const menus = useSettingMenusPermissions();
  const { hasERD, checkBoxs, onChangeChecbox, checkboxValues, onChange, activeKey, onEdit, items } =
    useRoutes();

  const isAllFalse = Object.values(checkboxValues).every((value) => value === false);
  return (
    <S.SettingWrapper>
      <LeftContent isSuperAdmin={false} hasCollapseBtn={false} width={364}>
        <LeftMenu isSuperAdmin={false} menus={menus} />
      </LeftContent>
      <S.AdmContentWrap>
        <S.Box>
          <S.BoxTitle>{'배차 경로 관리'}</S.BoxTitle>
          <Collapse title={'테이블 선택'}>
            <S.GroupTabs>
              <S.FormCheckBox form={form}>
                {checkBoxs.map((item, index) => (
                  <S.CheckBox
                    key={index}
                    checked={(checkboxValues as any)[item.name]}
                    onChange={onChangeChecbox}
                    name={item.name}
                  >
                    <Tooltip title={item.label}>
                      <S.LabelOption>{item.label}</S.LabelOption>
                    </Tooltip>
                  </S.CheckBox>
                ))}
              </S.FormCheckBox>
              {hasERD ? (
                <S.ERD
                  key={11}
                  checked={(checkboxValues as any)['ERD']}
                  onChange={onChangeChecbox}
                  name={'ERD'}
                >
                  <IconERD />
                </S.ERD>
              ) : (
                <div style={{ width: 150 }}></div>
              )}
            </S.GroupTabs>
            {isAllFalse ? (
              <S.NoData>목록에서 테이블을 선택해 주세요.</S.NoData>
            ) : (
              <S.Tabs
                hideAdd
                onChange={onChange}
                activeKey={activeKey}
                type="editable-card"
                onEdit={onEdit}
                items={items}
              />
            )}
          </Collapse>
        </S.Box>
      </S.AdmContentWrap>
    </S.SettingWrapper>
  );
};

export default Routes;
