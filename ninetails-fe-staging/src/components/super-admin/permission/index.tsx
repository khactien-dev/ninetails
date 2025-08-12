import BackIcon from '@/assets/images/svg/icon-to-back.svg';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import { useRouterWithAuthorize } from '@/hooks/useRouterWithAuthorize';
import { checkAllspace, checkEmoji } from '@/utils';
import { useRouter } from 'next/router';

import TableSettings from '../table';
import * as S from './index.styles';
import usePermissionMode from './index.utils';

interface ItemLink {
  name: string;
  link: string;
}

export const PermissionMode = () => {
  const {
    form,
    buttons,
    columns,
    handleSelectChange,
    expandedRowRender,
    expandedRowKeys,
    isOpenConfirm,
    setIsOpenConfirm,
    optionCommonness,
    optionCommonnesSecond,
    dataRecords,
    columnTableCommnonCreate,
    columnTableCommnonCreateSecond,
    handleCreatePermission,
    setCheckedItems,
    setChecked,
  } = usePermissionMode();
  const router = useRouterWithAuthorize();
  const { query } = useRouter();
  const linkCustom: ItemLink = {
    name: '부재 관리',
    link: `/super-admin`,
  };
  const handlePushRoute = () => {
    router.pushWithAuthorize(linkCustom.link);
  };
  const resTitleName = () => {
    return (
      <S.TitleTableContent>
        <S.WrapBackIcon>
          <BackIcon onClick={() => handlePushRoute()} />
        </S.WrapBackIcon>
        <S.InfoText>{query.title} - 권한 관리</S.InfoText>
      </S.TitleTableContent>
    );
  };

  const renderTables = () => {
    return (
      <>
        <TableSettings
          tableName={''}
          showCheckbox={false}
          columns={columnTableCommnonCreate}
          data={optionCommonness}
        />

        <TableSettings
          tableName={''}
          showCheckbox={false}
          columns={columnTableCommnonCreateSecond}
          data={optionCommonnesSecond}
        />
      </>
    );
  };

  return (
    <>
      <TableSettings
        tableName={resTitleName()}
        buttonArr={buttons}
        columns={columns}
        data={dataRecords}
        handleSelectChange={handleSelectChange}
        expandedRowRender={expandedRowRender}
        expandedRowKeys={expandedRowKeys}
        showCheckbox={false}
      />
      <BaseModal
        width={600}
        title="새로운 역할 추가"
        footer={false}
        open={isOpenConfirm}
        onCancel={() => {
          setIsOpenConfirm(false);
          form.resetFields();
          setCheckedItems({});
          setChecked({});
        }}
      >
        <BaseForm layout="vertical" form={form} onFinish={handleCreatePermission}>
          <S.InputName>
            <BaseFormItem
              rules={[
                { required: true, message: '이 필드는 필수입니다.', whitespace: true },
                {
                  max: 50,
                  message: '역할 이름 50자 이상이 될 수 없습니다.',
                },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
              label="역할 이름"
              name="name"
            >
              <S.Input placeholder="역할 이름을 입력해주세요" />
            </BaseFormItem>
          </S.InputName>
          <S.TableContentModal>
            <> {renderTables()}</>
          </S.TableContentModal>
          <BaseRow justify="center">
            <S.BtnSave htmlType="submit" type="default">
              생성
            </S.BtnSave>
          </BaseRow>
        </BaseForm>
      </BaseModal>
    </>
  );
};
