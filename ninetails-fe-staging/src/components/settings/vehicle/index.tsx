import Calendar from '@/assets/images/schedule/icon-calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import ModalConfirm from '@/components/common/modal-confirm';
import { BaseSelect } from '@/components/common/selects/base-select';
import { SelectCombobox } from '@/components/settings/combobox';
import TableSettings from '@/components/settings/table';
import * as S from '@/components/settings/vehicle/index.styles';
import useVehicle, { RadioItem } from '@/components/settings/vehicle/index.utils';
import { DATE_FORMAT } from '@/constants';
import { STATUS_VEHICLE_EN } from '@/constants/settings';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';
import { checkAllspace, checkEmoji } from '@/utils';
import { checkPattern } from '@/utils/common';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';

const Vehicle: React.FC = () => {
  const {
    initialValues,
    form,
    data,
    columns,
    total,
    setExpandedRowKeys,
    handleSelectChange,
    expandedRowRender,
    expandedRowKeys,
    setEditingKey,
    current,
    onChange,
    onFirstPage,
    onLastPage,
    isOpenConfirm,
    setIsOpenConfirm,
    handleDeleteVehicle,
    buttons,
    setIsOpenCreate,
    isOpenCreate,
    handleCreateVehicle,
    isOpenDeactive,
    setIsOpenDeactive,
    handleDeactiveVehicle,
    handleSortColumn,
    selectedRows,
    isOpenFilter,
    setIsOpenFilter,
    radios,
    checkboxs,
    selectedCheckboxes,
    setSelectedCheckboxes,
    handleCheckboxChange,
    setParams,
    selectedStatus,
    setSelectedStatus,
  } = useVehicle();
  const menus = useSettingMenusPermissions();
  const [searchValue, setSearchValue] = useState('');
  const StyledLabel = styled.span<{ isSelected: boolean }>`
    color: ${(props) => (props.isSelected ? '#57BA00' : 'inherit')};
  `;

  const [disableStatus, setDisableStatus] = useState(false);

  useEffect(() => {
    if (isOpenCreate) {
      form.resetFields(); // Reset fields when the modal is opened
      setSearchValue('');
      setDisableStatus(false);
    }
  }, [isOpenCreate, form]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setParams((params) => ({
      ...params,
      search: value || null,
      status: selectedStatus || null,
      purpose: selectedCheckboxes.join(',') || null,
    }));
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus((prevStatus) => (prevStatus === value ? null : value));
  };
  const { query, isReady } = useRouter();
  const { opId, schema } = query;
  const customHeaders = { isReady, opId, schema };

  return (
    <>
      <TableSettings
        handleSelectChange={handleSelectChange}
        handleSortColumn={handleSortColumn}
        expandedRowRender={expandedRowRender}
        tableName="차량 관리"
        columns={columns}
        buttonArr={buttons}
        data={data}
        menus={menus}
        expandedRowKeys={expandedRowKeys}
        setEditingKey={setEditingKey}
        onFirstPage={onFirstPage}
        currentPage={current}
        onChange={onChange}
        total={total}
        selectedRows={selectedRows}
        onLastPage={onLastPage}
        searchValue={searchValue}
        setExpandedRowKeys={setExpandedRowKeys}
        showSearch={true}
        onSearchChange={handleSearchChange}
        searchPlaceholder="차번 검색"
      />

      <ModalConfirm
        text="이 차량을 삭제하시겠습니까?"
        open={isOpenConfirm}
        textStyle={{ fontSize: '20px', width: '260px' }}
        onCancel={() => setIsOpenConfirm(false)}
        onConfirm={handleDeleteVehicle}
        confirmText="확인"
        cancelText="취소"
      />

      <BaseModal
        width={600}
        title="새로운 차량 추가"
        footer={false}
        open={isOpenCreate}
        onCancel={() => setIsOpenCreate(false)}
      >
        <S.Form
          layout="vertical"
          initialValues={initialValues}
          form={form}
          onFinish={handleCreateVehicle}
        >
          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <BaseForm.Item
                label="차번"
                name="vehicle_number"
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  () => ({
                    validator(_, value) {
                      if (!value || checkPattern(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('유효한 차량 번호를 입력해 주세요.'));
                    },
                  }),
                ]}
              >
                <BaseInput placeholder="차번 입력" />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="차종"
                name="vehicle_type"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <SelectCombobox
                  headers={customHeaders}
                  fieldName="vehicle_type"
                  form={form}
                  placeholder={'차종 선택'}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="모델"
                name="vehicle_model"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <SelectCombobox
                  headers={customHeaders}
                  fieldName="vehicle_model"
                  form={form}
                  placeholder={'모델 선택'}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="제조사"
                name="manufacturer"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <SelectCombobox
                  headers={customHeaders}
                  fieldName="manufacturer"
                  form={form}
                  placeholder={'제조사 선택'}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="적재용적 (m³)"
                name="capacity"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <SelectCombobox
                  headers={customHeaders}
                  fieldName="capacity"
                  placeholder={'선택 선택'}
                  form={form}
                  isNumber={true}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="최대적재 (kg)"
                name="max_capacity"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <SelectCombobox
                  headers={customHeaders}
                  fieldName="max_capacity"
                  placeholder={'최대적재 (kg) 선택'}
                  form={form}
                  isNumber={true}
                />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol span={12}>
              <BaseForm.Item
                label="운행시작"
                name="operation_start_date"
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  ({ getFieldValue, setFields }) => ({
                    validator(_, value) {
                      const operationEndDate = getFieldValue('operation_end_date');
                      if (value && operationEndDate && value.isAfter(operationEndDate, 'day')) {
                        return Promise.reject(new Error('유효한 기간을 선택해 주세요.'));
                      } else {
                        setFields([{ name: 'operation_end_date', errors: [] }]);
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <S.DatePicker
                  disabledDate={(current) => current && current > dayjs()}
                  format={DATE_FORMAT.BASIC1}
                  placeholder="운행시작"
                  suffixIcon={<Calendar />}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                label="운행종료"
                name="operation_end_date"
                rules={[
                  ({ getFieldValue, setFields }) => ({
                    validator(_, value) {
                      if (value && value.isBefore(dayjs(), 'day')) {
                        setDisableStatus(true);
                        form.setFieldValue('status', STATUS_VEHICLE_EN.RETIRED);
                      } else {
                        setDisableStatus(false);
                        form.setFieldValue('status', STATUS_VEHICLE_EN.NORMAL);
                      }

                      const operationStartDate = getFieldValue('operation_start_date');
                      if (
                        value &&
                        operationStartDate &&
                        value.isBefore(operationStartDate, 'day')
                      ) {
                        return Promise.reject(new Error('유효한 기간을 선택해 주세요.'));
                      } else {
                        setFields([{ name: 'operation_start_date', errors: [] }]);
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <S.DatePicker
                  format={DATE_FORMAT.BASIC1}
                  placeholder="운행종료"
                  suffixIcon={<Calendar />}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={12}>
              <BaseForm.Item
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="용도 [배치 유형]"
                name="purpose"
              >
                <BaseSelect
                  placeholder="직무 [계약 형태] 선택"
                  options={[
                    { value: 'COMPOSITE_REGULAR', label: '생활 [정규]' },
                    { value: 'COMPOSITE_SUPPORT', label: '생활 [지원]' },
                    { value: 'FOOD_REGULAR', label: '음식 [정규]' },
                    { value: 'FOOD_SUPPORT', label: '음식 [지원]' },
                    { value: 'REUSABLE_REGULAR', label: '재활 [정규]' },
                    { value: 'REUSABLE_SUPPORT', label: '재활 [지원]' },
                    { value: 'TATICAL_MOBILITY_REGULAR', label: '기동 [정규]' },
                    { value: 'TATICAL_MOBILITY_SUPPORT', label: '기동 [지원]' },
                  ]}
                />
              </BaseForm.Item>
            </BaseCol>

            <BaseCol span={12}>
              <BaseForm.Item
                label="상태"
                name="status"
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
              >
                <BaseSelect
                  disabled={disableStatus}
                  defaultValue={STATUS_VEHICLE_EN.NORMAL}
                  options={[
                    { value: STATUS_VEHICLE_EN.NORMAL, label: '정상' },
                    { value: STATUS_VEHICLE_EN.MAINTENANCE, label: '정비', disabled: true },
                    { value: STATUS_VEHICLE_EN.DISPOSED, label: '매각', disabled: true },
                    { value: STATUS_VEHICLE_EN.RETIRED, label: '폐차', disabled: true },
                  ]}
                />
              </BaseForm.Item>
            </BaseCol>
            <BaseCol span={24}>
              <S.FormItem
                rules={[
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  checkAllspace('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  {
                    max: 200,
                    message: '노트 [참고사항] 200자 이상이 될 수 없습니다.',
                  },
                ]}
                label="노트 [참고사항]"
                name="note"
              >
                <BaseInput maxLength={200} placeholder="노트 입력" />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow justify="center">
            <S.BtnSave htmlType="submit" type="primary">
              생성
            </S.BtnSave>
          </BaseRow>
        </S.Form>
      </BaseModal>

      <BaseModal
        width={450}
        title=""
        footer={false}
        open={isOpenFilter}
        onCancel={() => {
          setSelectedStatus(null);
          setSelectedCheckboxes([]);
          setIsOpenFilter(false);
        }}
        rounded="md"
      >
        <S.FilterContainer>
          <S.StatusGroup>
            <S.Radios>
              {radios?.map((item: RadioItem, i: number) => (
                <S.StatusOption key={i}>
                  <S.StyledRadio
                    type="radio"
                    name="status"
                    id="normal"
                    value={item.name}
                    checked={selectedStatus === item.name}
                    onChange={() => handleStatusChange(item.name)}
                  />
                  <label htmlFor="normal">{item.label}</label>
                </S.StatusOption>
              ))}
            </S.Radios>
            <S.ResetButton
              disabled={!selectedCheckboxes.length && !selectedStatus}
              onClick={() => {
                setSelectedStatus(null);
                setSelectedCheckboxes([]);
              }}
            >
              초기화
            </S.ResetButton>
          </S.StatusGroup>
          {selectedStatus === 'NORMAL' && (
            <S.JobOptions>
              {checkboxs.map((item, index) => (
                <S.CheckBox
                  key={index}
                  name={item.name}
                  onChange={() => handleCheckboxChange(item.name)}
                  checked={selectedCheckboxes.includes(item.name)}
                >
                  <StyledLabel isSelected={selectedCheckboxes.includes(item.name)}>
                    {item.label}
                  </StyledLabel>
                </S.CheckBox>
              ))}
            </S.JobOptions>
          )}
          <S.ButtonGroup>
            <S.ApplyButton
              type="primary"
              onClick={() => {
                setParams((params) => ({
                  ...params,
                  status: selectedStatus,
                  purpose: selectedCheckboxes.join(','),
                }));
                setIsOpenFilter(false);
              }}
            >
              적용
            </S.ApplyButton>
            <S.CancelButton
              type="default"
              onClick={() => {
                setIsOpenFilter(false);
              }}
            >
              취소
            </S.CancelButton>
          </S.ButtonGroup>
        </S.FilterContainer>
      </BaseModal>

      <ModalConfirm
        text="Are you sure you want to deactive this vehicle?"
        open={isOpenDeactive}
        textStyle={{ fontSize: '20px', width: '260px' }}
        onCancel={() => setIsOpenDeactive(false)}
        onConfirm={handleDeactiveVehicle}
      />
    </>
  );
};

export default Vehicle;
