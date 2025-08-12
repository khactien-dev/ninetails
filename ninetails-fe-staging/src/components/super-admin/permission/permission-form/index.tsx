import DeleteIcon from '@/assets/images/svg/icon-delete-role.svg';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseFormItem } from '@/components/common/forms/components/base-form-item';
import ModalConfirm from '@/components/common/modal-confirm';
import { checkAllspace, checkEmoji } from '@/utils';
import { omit } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';

import TableSettings from '../../table';
import usePermissionMode from '../index.utils';
import * as S from './index.styles';

interface EditFormProps {
  record: any;
  onSave: (value: any) => void;
}

const EditRoleForm = ({ record, onSave }: EditFormProps) => {
  const {
    columnTableCommnon,
    convertData,
    convertToOptionCommonness,
    isOpenConfirmDelete,
    setIsOpenConfirmDelete,
    handleDeletePermission,
    checkedItems,
    convertDataUpte,
  } = usePermissionMode();
  const [form] = BaseForm.useForm();
  const [nameValue, setNameValue] = useState('');
  const initialValues = {
    ...record,
    situation: '활성',
  };

  const { query } = useRouter();
  const tenant_id = parseInt(query.tenant_id as string);

  const dataTableConvert = convertData(record);
  const dataTableConvertOption = convertToOptionCommonness(dataTableConvert);

  const dataOptionsfilter = dataTableConvertOption
    .filter((item) => !['key', 'id', 'name', 'deletedAt', 'type'].includes(item.key))
    .map((item) => ({
      ...item,
      type: record?.type,
    }));

  const checkedData = {
    ...checkedItems,
  };

  const dataRecordChange = Object.keys(dataTableConvert).reduce((value: any, key) => {
    const checkedItem = checkedData[key];
    if (checkedItem) {
      value[key] = { ...dataTableConvert[key], ...checkedItem };
    } else {
      value[key] = dataTableConvert[key];
    }

    return {
      ...value,
      name: nameValue.trim() || dataTableConvert?.name.trim(),
      tenant_id: tenant_id,
    };
  }, {});

  const dataUpdateRecord = {
    ...convertDataUpte(dataRecordChange),
    id: record?.id,
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      const updatedData = omit(dataUpdateRecord, ['key', 'deleteAt']);
      onSave(updatedData);
      form.resetFields();
    });
  };

  return (
    <S.EditTableFormWrap>
      <S.TableFormContent>
        <S.FormContent>
          <BaseForm form={form} initialValues={initialValues} layout="vertical">
            <S.ContentTop>
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
                <S.Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="역할 이름을 입력해주세요"
                />
              </BaseFormItem>
              <S.BtnDelete onClick={() => setIsOpenConfirmDelete(true)}>
                <DeleteIcon />
                삭제
              </S.BtnDelete>
            </S.ContentTop>
            <S.TableContent>
              <>
                <TableSettings
                  showCheckbox={false}
                  columns={columnTableCommnon}
                  data={dataOptionsfilter.slice(0, 7)}
                />
                <TableSettings
                  showCheckbox={false}
                  columns={columnTableCommnon}
                  data={dataOptionsfilter.slice(7)}
                />
              </>
            </S.TableContent>
            <BaseRow justify="center">
              <S.BtnSave onClick={handleSave}>저장</S.BtnSave>
            </BaseRow>
          </BaseForm>
        </S.FormContent>
      </S.TableFormContent>
      <ModalConfirm
        text="해당 역할을 삭제하시겠습니까?"
        open={isOpenConfirmDelete}
        confirmText="확인"
        cancelText="취소"
        onCancel={() => setIsOpenConfirmDelete(false)}
        onConfirm={() => handleDeletePermission(record.id)}
        isSuperAdmin={true}
      />
    </S.EditTableFormWrap>
  );
};

export default EditRoleForm;
