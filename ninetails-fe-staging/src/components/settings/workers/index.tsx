import Calendar from '@/assets/images/common/Calendar.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import ModalConfirm from '@/components/common/modal-confirm';
import { BaseSelect } from '@/components/common/selects/base-select';
import TableSettings from '@/components/settings/table';
import { ConfirmUpdateModal } from '@/components/super-admin/confirm-update-modal';
import { DATE_FORMAT } from '@/constants';
import { STATUS } from '@/constants/settings';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';
import { checkAllspace, checkEmoji, checkPhoneNumber } from '@/utils';
import { formatPhone, validateEndDate, validateStartDate } from '@/utils/common';
import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import React from 'react';
import { styled } from 'styled-components';

import * as S from './index.styles';
import useWorkers, { AVAILABLE_CONTRACT, RadioItem } from './index.utils';

const Workers = () => {
  const {
    form,
    columns,
    currentPage,
    expandedRowKeys,
    data = [],
    total,
    buttons,
    isOpenConfirm,
    isOpenCreate,
    isOpenDeactive,
    selectedRows,
    handleChangeParams,
    setIsOpenDeactive,
    handleDeleteWorker,
    handleCreateWorker,
    handleDeactiveWorker,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
    isOpenFilter,
    setIsOpenFilter,
    radios,
    checkboxs,
    selectedCheckboxes,
    setSelectedCheckboxes,
    handleCheckboxChange,
    setParams,
    setSelectedStatus,
    selectedStatus,
    handleStatusChange,
    isOpenConfirmChangeModal,
    setIsOpenConfirmChangeModal,
  } = useWorkers();
  const menus = useSettingMenusPermissions();
  const [searchValue, setSearchValue] = useState('');

  const [confirmModalForm] = BaseForm.useForm();

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setParams((params) => ({
      ...params,
      name: value || null,
      status: selectedStatus || null,
      job_contract: selectedCheckboxes || null,
    }));
  };

  const StyledLabel = styled.span<{ isSelected: boolean }>`
    color: ${(props) => (props.isSelected ? '#57BA00' : 'inherit')};
  `;

  const [disableStatus, setDisableStatus] = useState(false);

  useEffect(() => {
    if (isOpenCreate) {
      form.resetFields();
      setSearchValue('');
      setDisableStatus(false);
    }
  }, [isOpenCreate, form]);

  return (
    <>
      <TableSettings
        selectedRows={selectedRows}
        handleSortColumn={handleChangeParams}
        tableName="인력 관리"
        buttonArr={buttons}
        handleSelectChange={handleSelectChange}
        columns={columns}
        data={data}
        menus={menus}
        expandedRowRender={expandedRowRender}
        expandedRowKeys={expandedRowKeys}
        setExpandedRowKeys={setExpandedRowKeys}
        setEditingKey={setEditingKey}
        onFirstPage={onFirstPage}
        currentPage={currentPage}
        onChange={onChange}
        total={total}
        onLastPage={onLastPage}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        searchPlaceholder="이름 검색"
      />
      <BaseModal
        width={600}
        title="새로운 직원 추가"
        footer={false}
        open={isOpenCreate}
        onCancel={() => setIsOpenCreate(false)}
      >
        <BaseForm
          layout="vertical"
          form={form}
          onFinish={handleCreateWorker}
          initialValues={{
            driver_license: 'NONE',
            status: STATUS.NORMAL,
          }}
        >
          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  checkAllspace('이 필드는 필수입니다.'),
                ]}
                label="이름"
                name="name"
              >
                <BaseInput maxLength={200} placeholder="이름 입력" />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                required
                normalize={formatPhone}
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    max: 14,
                    message: '유효한 전화번호를 입력해 주세요',
                  },
                  checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  checkAllspace('이 필드는 필수입니다.'),
                ]}
                label="연락처"
                name="phone_number"
              >
                <BaseInput placeholder="연락처 입력" />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    validator: (_: RuleObject, value: StoreValue) => validateStartDate(form, value),
                  },
                ]}
                label="나이 [생년월일]"
                name="age"
              >
                <S.DatePicker
                  disabledDate={(current) => current && current > dayjs()}
                  format={DATE_FORMAT.BASIC2}
                  placeholder="생년월일 선택"
                  suffixIcon={<Calendar />}
                />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (
                        value &&
                        value == 'NONE' &&
                        AVAILABLE_CONTRACT.includes(getFieldValue('job_contract'))
                      ) {
                        return Promise.reject(
                          new Error(
                            '운전 면허증은 "None"으로 선택할 수 없습니다. 다른 옵션을 선택해 주세요!'
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                label="운전면허"
                name="driver_license"
              >
                <BaseSelect
                  defaultValue={'NONE'}
                  placeholder="Driver License"
                  options={[
                    { value: 'NONE', label: 'None' },
                    { value: '1종 대형', label: '1종 대형' },
                    { value: '1종 보통', label: '1종 보통' },
                    { value: '1종 특수', label: '1종 특수' },
                    { value: '2종 보통', label: '2종 보통' },
                    { value: '2종 소형', label: '2종 소형' },
                  ]}
                />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    validator: (_: RuleObject, value: StoreValue) =>
                      validateStartDate(form, value, '올바른 계약 기간을 선택해 주세요'),
                  },
                ]}
                label="계약 시작일"
                name="start_date"
              >
                <S.DatePicker
                  disabledDate={(current) => current && current > dayjs()}
                  format={DATE_FORMAT.BASIC2}
                  placeholder="계약 시작일"
                  suffixIcon={<Calendar />}
                />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                rules={[
                  {
                    validator: (_: RuleObject, value: StoreValue) => {
                      if (value && value.isBefore(dayjs(), 'day')) {
                        setDisableStatus(true);
                        form.setFieldValue('status', STATUS.RESIGNED);
                      } else {
                        setDisableStatus(false);
                        form.setFieldValue('status', STATUS.NORMAL);
                      }
                      return validateEndDate(form, value, '올바른 계약 기간을 선택해 주세요');
                    },
                  },
                ]}
                label="계약 종료일"
                name="end_date"
              >
                <S.DatePicker
                  format={DATE_FORMAT.BASIC2}
                  placeholder="계약 종료일"
                  suffixIcon={<Calendar />}
                />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="직무 [계약 형태]"
                name="job_contract"
              >
                <BaseSelect
                  placeholder="직무 [계약 형태] 선택"
                  options={[
                    { value: 'DRIVING_CREW_REGULAR', label: '운전 [정규]' },
                    { value: 'COLLECT_CREW_REGULAR', label: '탑승 [정규]' },
                    { value: 'SUPPORT_CREW_REGULAR', label: '지원 [정규]' },
                    { value: 'COLLECT_CREW_MONTHLY', label: '탑승 [단기] ' },
                    { value: 'COLLECT_CREW_FIXED_TERM', label: '탑승 [계약]' },
                    { value: 'SUPPORT_CREW_FIXED_TERM', label: '지원 [계약]' },
                    { value: 'MECHANIC_REGULAR', label: '정비 [정규]' },
                    { value: 'OFFICE_CREW_REGULAR', label: '사무 [정규]' },
                    { value: 'MANAGER_REGULAR', label: '간부 [정규]' },
                  ]}
                />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="상태"
                name="status"
              >
                <BaseSelect
                  disabled={disableStatus}
                  defaultValue={STATUS.NORMAL}
                  options={[
                    { value: STATUS.NORMAL, label: '정상' },
                    { value: STATUS.LEAVING, label: '열외', disabled: true },
                    { value: STATUS.RESIGNED, label: '퇴사', disabled: true },
                  ]}
                />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

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

          <S.FormItem>
            <S.SubmitButton htmlType="submit" type="primary">
              생성
            </S.SubmitButton>
          </S.FormItem>
        </BaseForm>
      </BaseModal>
      <BaseModal
        width={450}
        title=""
        footer={false}
        open={isOpenFilter}
        rounded="md"
        onCancel={() => {
          setSelectedStatus(null);
          setSelectedCheckboxes([]);
          setIsOpenFilter(false);
        }}
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
                  job_contract: selectedCheckboxes,
                }));

                setIsOpenFilter(false);
              }}
            >
              적용
            </S.ApplyButton>
            <S.CancelButton
              onClick={() => {
                setSelectedStatus(null);
                setSelectedCheckboxes([]);
                setIsOpenFilter(false);
              }}
            >
              취소
            </S.CancelButton>
          </S.ButtonGroup>
        </S.FilterContainer>
      </BaseModal>
      <ModalConfirm
        text="이 직원을 삭제하시겠습니까?"
        open={isOpenConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        onConfirm={() => {
          setIsOpenConfirm(false);
          setIsOpenConfirmChangeModal(true);
        }}
        confirmText="확인"
        cancelText="취소"
      />

      <ModalConfirm
        text="Are you sure you want to deactive this staff?"
        open={isOpenDeactive}
        onCancel={() => setIsOpenDeactive(false)}
        onConfirm={handleDeactiveWorker}
      />

      <ConfirmUpdateModal
        isOpen={isOpenConfirmChangeModal}
        toggleIsOpen={setIsOpenConfirmChangeModal}
        handleUpdate={handleDeleteWorker}
        form={confirmModalForm}
        color="#57BA00"
      />
    </>
  );
};

export default Workers;
