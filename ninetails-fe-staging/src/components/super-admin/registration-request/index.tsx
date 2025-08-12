import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import PaginationTable from '@/components/settings/pagination';
import TableSetting from '@/components/settings/table/Table';
import { Table } from '@/components/settings/table/index.style';
import { checkEmoji, checkID, preventSpecialCharacters } from '@/utils';

import * as S from './index.styles';
import useRegistrationRequest from './index.utils';

const RegistrationRequest = () => {
  const {
    form,
    columns,
    currentPage,
    expandedRowKeys,
    data = [],
    total,
    isOpenCreate,
    selectedRows,
    handleChangeParams,
    handleCreateCustomer,
    setIsOpenCreate,
    onChange,
    onLastPage,
    onFirstPage,
    expandedRowRender,
    handleSelectChange,
    setExpandedRowKeys,
    setEditingKey,
  } = useRegistrationRequest();

  const handleUppercaseBlur = (e: any) => {
    const { value } = e.target;
    form.setFieldsValue({ customerId: value.toUpperCase() });
  };

  return (
    <>
      <Table>
        <TableSetting
          handleSortColumn={handleChangeParams}
          handleSelectChange={handleSelectChange}
          columns={columns}
          data={data}
          selectedRows={selectedRows}
          expandedRowRender={expandedRowRender}
          expandedRowKeys={expandedRowKeys}
          setExpandedRowKeys={setExpandedRowKeys}
          setEditingKey={setEditingKey}
        />
        {total > 0 && (
          <S.WrapPaginationTable>
            <PaginationTable
              onFirstPage={onFirstPage}
              current={currentPage}
              onChange={onChange}
              total={total}
              onLastPage={onLastPage}
            />
          </S.WrapPaginationTable>
        )}
      </Table>
      <S.Modal
        width={600}
        title="새 고객 만들기"
        footer={false}
        open={(typeof isOpenCreate === 'number' && isOpenCreate > 0) || !!isOpenCreate}
        onCancel={() => setIsOpenCreate(null)}
        destroyOnClose={true}
      >
        <BaseForm layout="vertical" form={form} onFinish={handleCreateCustomer}>
          <BaseRow gutter={16}>
            <BaseCol span={12}>
              <S.ModalFormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    max: 200,
                    message: '회사 이름 200자 이상이 될 수 없습니다.',
                  },
                ]}
                label="회사 이름"
                name="organization"
              >
                <S.ModalInput disabled />
              </S.ModalFormItem>
            </BaseCol>

            <BaseCol span={12}>
              <S.ModalFormItem
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="운영자 이메일"
                name="email"
              >
                <S.ModalInput disabled />
              </S.ModalFormItem>
            </BaseCol>
          </BaseRow>
          <BaseRow gutter={16}>
            <BaseCol span={24}>
              <S.ModalFormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    min: 2,
                    message: 'Customer ID must be longer than or equal to 2 characters',
                  },
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  checkID('유효하지 않은 고객 ID입니다. 다시 시도해 주세요!'),
                ]}
                label="고객 ID"
                name="customerId"
              >
                <S.ModalInput
                  onKeyPress={preventSpecialCharacters}
                  // onPaste={(e) => e.preventDefault()}
                  maxLength={10}
                  onChange={handleUppercaseBlur}
                />
              </S.ModalFormItem>
            </BaseCol>
          </BaseRow>

          <S.WrapNote>
            <strong>고객 ID 명명 규칙: </strong>
            <ul style={{ marginLeft: 20 }}>
              <li>고객 ID는 최소 2자, 최대 10자여야 합니다</li>
              <li>{'a~z까지의 문자, 0~9까지의 숫자, 특수문자 "-" 및 "_"만 허용합니다.'}</li>
              <li>문자로 시작해야 합니다</li>
            </ul>
          </S.WrapNote>

          <S.WrapperButton>
            <S.ModalFormItem>
              <S.SubmitButton htmlType="submit" type="default">
                생성
              </S.SubmitButton>
            </S.ModalFormItem>
          </S.WrapperButton>
        </BaseForm>
      </S.Modal>
    </>
  );
};

export default RegistrationRequest;
