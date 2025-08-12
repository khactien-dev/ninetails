import IconDropdown from '@/assets/images/svg/icon-dropdown.svg';
import { BaseCol } from '@/components/common/base-col';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import ModalConfirm from '@/components/common/modal-confirm';
import { BaseSelect } from '@/components/common/selects/base-select';
import TableSettings from '@/components/settings/table';
import { STATUS } from '@/constants/settings';
import { useSettingMenusPermissions } from '@/hooks/usePermissions';
import { checkPhoneNumber, formatPhone, validateEmojiRegex } from '@/utils';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { SelectCombobox } from '../combobox';
import * as S from './index.styles';
import useUsers from './index.utils';

const Users = () => {
  const { query, isReady } = useRouter();
  const { opId, schema } = query;
  const customHeaders = { isReady, opId, schema };
  const menus = useSettingMenusPermissions();
  const {
    initialValues,
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
    isOpenResetPassword,
    selectedRows,
    rolesOption,
    isLoading,
    handleChangeParams,
    setIsOpenDeactive,
    setIsOpenResetPassword,
    handleDeleteUser,
    handleCreateUser,
    handleDeactiveUser,
    handleResetPasswordUser,
    setIsOpenCreate,
    setIsOpenConfirm,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
  } = useUsers();

  columns[0].key = 'email';

  useEffect(() => {
    if (isOpenCreate) {
      form.resetFields(); // Reset form fields
    }
  }, [isOpenCreate, form]);

  return (
    <>
      <TableSettings
        selectedRows={selectedRows}
        handleSortColumn={handleChangeParams}
        tableName="사용자 그룹 관리"
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
        isLoading={isLoading}
      />
      <BaseModal
        width={600}
        title="새 사용자 추가"
        footer={false}
        open={isOpenCreate}
        onCancel={() => setIsOpenCreate(false)}
      >
        <BaseForm
          layout="vertical"
          initialValues={initialValues}
          form={form}
          onFinish={handleCreateUser}
        >
          <S.FormItem
            label="이메일"
            name="email"
            rules={[
              {
                required: true,
                whitespace: true,
                message: '이 필드는 필수입니다.',
              },
              {
                type: 'email',
                message: '유효한 이메일 주소를 입력해 주세요',
              },
            ]}
          >
            <BaseInput maxLength={64} placeholder="이메일 입력" />
          </S.FormItem>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                label="이름"
                name="full_name"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '이 필드는 필수입니다.',
                  },
                  {
                    validator: async (_, value) => {
                      await validateEmojiRegex(value);
                    },
                  },
                ]}
              >
                <BaseInput maxLength={200} placeholder="이름 입력" />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                label="연락처"
                name="phone_number"
                normalize={formatPhone}
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    min: 9,
                    message: '유효한 전화번호를 입력해 주세요',
                  },
                  {
                    max: 14,
                    message: '유효한 전화번호를 입력해 주세요',
                  },
                  checkPhoneNumber('유효한 전화번호를 입력해 주세요'),
                ]}
              >
                <BaseInput placeholder="연락처 입력" />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="부서"
                name="department"
              >
                <SelectCombobox
                  headers={customHeaders}
                  form={form}
                  fieldName="department"
                  placeholder="부서 선택"
                />
              </S.FormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="직책"
                name="position"
              >
                <SelectCombobox
                  headers={customHeaders}
                  form={form}
                  fieldName="position"
                  placeholder="직책 선택"
                />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.FormItem
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="권한"
                name="permission_id"
              >
                <BaseSelect suffixIcon={<IconDropdown />} options={rolesOption} />
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
                  suffixIcon={<IconDropdown />}
                  options={[
                    { value: STATUS.ACTIVE, label: '활성' },
                    { value: STATUS.INACTIVE, label: '비활성' },
                  ]}
                />
              </S.FormItem>
            </BaseCol>
          </BaseRow>

          <S.FormItem>
            <S.SubmitButton htmlType="submit" type="primary">
              생성
            </S.SubmitButton>
          </S.FormItem>
        </BaseForm>
      </BaseModal>

      <ModalConfirm
        text="이 사용자를 삭제하시겠습니까?"
        open={isOpenConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        onConfirm={handleDeleteUser}
        confirmText="적용"
        cancelText="취소"
      />

      <ModalConfirm
        text="이 사용자를 비활성화하시겠습니까?"
        open={isOpenDeactive}
        onCancel={() => setIsOpenDeactive(false)}
        onConfirm={handleDeactiveUser}
        confirmText="적용"
        cancelText="취소"
      />

      <ModalConfirm
        text="이 사용자의 비밀번호를 초기화하시겠습니까?"
        open={isOpenResetPassword}
        onCancel={() => setIsOpenResetPassword(false)}
        onConfirm={handleResetPasswordUser}
        confirmText="적용"
        cancelText="취소"
      />
    </>
  );
};

export default Users;
