import BarsIcon from '@/assets/images/schedule/bars.svg';
import PlusIcon from '@/assets/images/settings/icon-plus.svg';
import MinusIcon from '@/assets/images/settings/minus11x1.svg';
import CalendarIcon from '@/assets/images/svg/icon-calendar2.svg';
import IconLayer from '@/assets/images/svg/icon_layer.svg';
import IconRecover from '@/assets/images/svg/icon_recover.svg';
import Maker from '@/assets/images/svg/maker-b4.svg';
import ModalConfirm from '@/components/common/modal-confirm';
import { LegendModal } from '@/components/schedule/modal/legend';
import CalendarDateCell from '@/components/settings/absence/Calendar';
import ModalAddAbsence from '@/components/settings/absence/ModalAddAbsence';
import PaginationCalendar from '@/components/settings/absence/PaginationCalendar';
import LeftMenu from '@/components/settings/left-menu';
import PaginationTable from '@/components/settings/pagination';
import TableSettings from '@/components/settings/table/Table';
import { usePermissions, useSettingMenusPermissions } from '@/hooks/usePermissions';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import React from 'react';

import * as S from './index.styles';
import useAbsence, { TYPE_TABS } from './index.utils';

const Absence = () => {
  const {
    form,
    params,
    currentMonth,
    selectedRows,
    currentPage,
    isViewCalendar,
    setIsViewCalendar,
    isOpenConfirm,
    optionList,
    setIsOpenConfirm,
    isOpenAddAbsence,
    setIsOpenAddAbsence,
    activeLegend,
    setActiveLegend,
    typeList,
    columns,
    onChangeMonth,
    total,
    handleChangeParams,
    handleSelectChange,
    expandedRowRender,
    expandedRowKeys,
    setExpandedRowKeys,
    setEditingKey,
    onFirstPage,
    onLastPage,
    onChange,
    handleDeleteAbsence,
    handleAddAbsence,
    absenceList,
    handleSelectOption,
    absenceListCalendar,
    optionSelect,
    isLoadingTable,
    handleChangeTab,
  } = useAbsence();
  const permissions = usePermissions();
  const menus = useSettingMenusPermissions();

  return (
    <S.SettingWrapper>
      <LeftContent hasCollapseBtn={false} width={364}>
        <LeftMenu menus={menus} />
      </LeftContent>
      <S.AdmContentWrap>
        <S.ContentWrap>
          {/*Header*/}
          <S.TitlePage>부재 관리</S.TitlePage>
          <S.HeaderWrap>
            <S.CalendarModeWrap>
              <S.FlexWrap $gap="8px">
                <S.SwitchMode onClick={() => setIsViewCalendar(!isViewCalendar)}>
                  {isViewCalendar ? <IconLayer /> : <CalendarIcon />}
                  <IconRecover />
                </S.SwitchMode>
                <div>
                  <S.TabWrap>
                    <S.WrapRadioButton
                      defaultValue={typeList}
                      onChange={(type) => {
                        handleChangeTab(type.target.value);
                      }}
                      optionType="button"
                      buttonStyle="solid"
                      options={[
                        {
                          value: TYPE_TABS.STAFF,
                          label: '인력',
                        },
                        {
                          value: TYPE_TABS.VEHICLE,
                          label: '차량',
                        },
                      ]}
                    />
                  </S.TabWrap>
                  <S.Select
                    showSearch
                    key={typeList}
                    defaultValue={0}
                    onSelect={(vehicleId) => handleSelectOption(vehicleId)}
                    options={optionSelect || []}
                    filterOption={(input, option) => {
                      const labelText =
                        option?.label?.props?.children && option.label.props.children[2];

                      return (
                        typeof labelText === 'string' &&
                        labelText.toLowerCase().includes(input.toLowerCase())
                      );
                    }}
                  ></S.Select>
                </div>
              </S.FlexWrap>
              <PaginationCalendar
                onChangeMonth={onChangeMonth}
                currentMonth={currentMonth}
                isHideButton={
                  !isViewCalendar && (Number(params.vehicle_id) > 0 || Number(params.staff_id) > 0)
                }
              />
              <S.FlexWrap $gap="12px">
                <S.ButtonAdm
                  $isActive={true}
                  $isPrimary={true}
                  $isSuperAdmin={false}
                  onClick={() => setActiveLegend('staff')}
                >
                  <BarsIcon /> 추가
                </S.ButtonAdm>
                <S.ButtonAdm
                  $isActive={permissions.createAble}
                  $isPrimary={true}
                  $isSuperAdmin={false}
                  disabled={!permissions.createAble}
                  onClick={() => setIsOpenAddAbsence(true)}
                >
                  <PlusIcon /> 추가
                </S.ButtonAdm>
                <S.ButtonAdm
                  $isActive={selectedRows.length > 0 && permissions.deleteAble}
                  disabled={selectedRows.length === 0}
                  $isPrimary={false}
                  $isSuperAdmin={false}
                  onClick={() => setIsOpenConfirm(true)}
                >
                  <MinusIcon /> 삭제
                </S.ButtonAdm>

                <S.Tooltip
                  placement="topLeft"
                  title={'부재 변경은 당일 이후 기간에 대해서만 가능합니다.'}
                >
                  <Maker />
                </S.Tooltip>
              </S.FlexWrap>
            </S.CalendarModeWrap>
          </S.HeaderWrap>
          {/*Calendar*/}
          {isViewCalendar && (
            <CalendarDateCell
              currentMonth={currentMonth}
              listAbsence={absenceListCalendar}
              type={typeList}
            />
          )}
          {/*Table*/}
          <S.Table>
            <TableSettings
              selectedRows={selectedRows}
              handleSortColumn={handleChangeParams}
              handleSelectChange={handleSelectChange}
              columns={columns}
              data={absenceList}
              expandedRowRender={expandedRowRender}
              expandedRowKeys={expandedRowKeys}
              setExpandedRowKeys={setExpandedRowKeys}
              setEditingKey={setEditingKey}
              isLoading={isLoadingTable}
            />
            {total > 0 && (
              <PaginationTable
                onFirstPage={onFirstPage}
                current={currentPage}
                onChange={onChange}
                total={total}
                onLastPage={onLastPage}
              />
            )}
          </S.Table>
        </S.ContentWrap>
      </S.AdmContentWrap>
      {/* Model */}
      <ModalConfirm
        text="이 부재를 삭제하시겠습니까?"
        open={isOpenConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        onConfirm={handleDeleteAbsence}
        confirmText="확인"
        cancelText="취소"
      />
      <ModalAddAbsence
        form={form}
        optionList={optionList}
        type={typeList}
        isOpen={isOpenAddAbsence}
        onCancel={() => setIsOpenAddAbsence(false)}
        onConfirm={(value) => handleAddAbsence(value)}
      />

      <LegendModal active={activeLegend} onChangeActive={setActiveLegend} />
    </S.SettingWrapper>
  );
};

export default Absence;
