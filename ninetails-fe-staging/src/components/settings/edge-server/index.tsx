import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseInput } from '@/components/common/inputs/base-input';
import ModalConfirm from '@/components/common/modal-confirm';
import { BaseSelect } from '@/components/common/selects/base-select';
import TableSettings from '@/components/settings/table';
import { checkAllspace, checkEmoji, checkMacAddress, preventLettersMacAddress } from '@/utils';

import { CustomFormItem } from './custom-form-item';
import * as S from './index.style';
import { METRIC_OPTIONS, STATUS_OPTIONS, UI_OPTIONS, useEdgeServerTable } from './index.utils';
import { SelectInfiniteVehicle } from './select-infinite';
import { WeightConfig } from './weight-config';

const EdgeServer = () => {
  const {
    menus,
    columns,
    buttons,
    data,
    expandedRowKeys,
    total,
    setExpandedRowKeys,
    setEditingKey,
    handleSelectChange,
    expandedRowRender,
    onChange,
    onFirstPage,
    onLastPage,
    handleSortColumn,
    currentPage,
    selectedRows,
    isOpenAddEdgeServer,
    handleCloseAddEdgeServer,
    handleAddEdgeServer,
    addEdgeServerLoading,
    isOpenDeleteConfirm,
    setIsOpenDeleteConfirm,
    isOpenUpdateConfirm,
    setIsOpenUpdateConfirm,
    handleConfirmDelete,
    handleConfirmDeactivate,
    isOpenWeightConfig,
    setIsOpenWeightConfig,
    weightConfig,
    refetchWeightConfig,
  } = useEdgeServerTable();

  return (
    <S.TableWrapper>
      <TableSettings
        menus={menus}
        isSuperAdmin={false}
        tableName="엣지서버 관리"
        buttonArr={buttons}
        handleSelectChange={handleSelectChange}
        columns={columns}
        data={data}
        expandedRowRender={expandedRowRender}
        expandedRowKeys={expandedRowKeys}
        setExpandedRowKeys={setExpandedRowKeys}
        setEditingKey={setEditingKey}
        onFirstPage={onFirstPage}
        onChange={onChange}
        total={total}
        onLastPage={onLastPage}
        handleSortColumn={handleSortColumn}
        currentPage={currentPage}
        selectedRows={selectedRows}
      />

      <S.Modal
        width={935}
        title="새로운 엣지서버 추가"
        footer={false}
        open={isOpenAddEdgeServer}
        destroyOnClose={true}
        onCancel={handleCloseAddEdgeServer}
      >
        <BaseForm
          layout="vertical"
          onFinish={handleAddEdgeServer}
          initialValues={{
            edge_metrics: 30,
            collection_metrics: 5,
            operation_metrics: 5,
            operation_status_ui: true,
            collection_status_ui: true,
            volume_analysis_ui: true,
            quantity_analysis_ui: true,
            video_ui: true,
            status: true,

            edge_metrics_checkbox: false,
            collection_metrics_checkbox: false,
            operation_metrics_checkbox: false,
            operation_status_ui_checkbox: false,
            collection_status_ui_checkbox: false,
            volume_analysis_ui_checkbox: false,
            quantity_analysis_ui_checkbox: false,
            video_ui_checkbox: false,
          }}
        >
          <BaseRow gutter={24}>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <S.ModalFormItem
                required
                rules={[
                  { required: true, message: '이 필드는 필수입니다.' },
                  {
                    max: 200,
                    message: 'Edge 이름 200자 이상이 될 수 없습니다.',
                  },
                  checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                  checkAllspace('이 필드는 필수입니다.'),
                ]}
                label="Edge 이름"
                name="edge_name"
              >
                <BaseInput placeholder="Edge 이름 입력" />
              </S.ModalFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <S.ModalFormItem
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="설치 (차번)"
                name="license_plate_id"
              >
                <SelectInfiniteVehicle placeholder="차번 선택" />
              </S.ModalFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <S.ModalFormItem
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                  checkMacAddress('유효한 MAC 주소를 입력해 주세요!'),
                ]}
                label="Mac 주소"
                name="mac_address"
              >
                <BaseInput
                  maxLength={17}
                  onKeyPressCapture={preventLettersMacAddress}
                  placeholder="Mac 주소 입력"
                />
              </S.ModalFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="edge_state_metrics 주기"
                name="edge_metrics"
              >
                <BaseSelect options={METRIC_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="collect_metrics 주기"
                name="collection_metrics"
              >
                <BaseSelect options={METRIC_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="drive_metrics 주기"
                name="operation_metrics"
              >
                <BaseSelect options={METRIC_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="운행 현황 UI"
                name="operation_status_ui"
              >
                <BaseSelect options={UI_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="수거 현황 UI"
                name="collection_status_ui"
              >
                <BaseSelect options={UI_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="부피분석 UI"
                name="volume_analysis_ui"
              >
                <BaseSelect options={UI_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
                label="수량 분석 UI"
                name="quantity_analysis_ui"
              >
                <BaseSelect options={UI_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <CustomFormItem
                subLabel="전체"
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="영상 UI"
                name="video_ui"
              >
                <BaseSelect options={UI_OPTIONS} />
              </CustomFormItem>
            </BaseCol>
            <BaseCol xs={24} sm={12} md={12} lg={8}>
              <S.ModalFormItem
                required
                rules={[
                  {
                    required: true,
                    message: '이 필드는 필수입니다.',
                  },
                ]}
                label="상태"
                name="status"
              >
                <BaseSelect options={STATUS_OPTIONS} />
              </S.ModalFormItem>
            </BaseCol>
          </BaseRow>
          <S.WrapperButton>
            <S.ModalFormItem>
              <S.FlexCenter>
                <S.SubmitButton htmlType="submit" type="primary" loading={addEdgeServerLoading}>
                  생성
                </S.SubmitButton>
              </S.FlexCenter>
            </S.ModalFormItem>
          </S.WrapperButton>
        </BaseForm>
      </S.Modal>

      <ModalConfirm
        text="이 업데이터 애플리케이션을 삭제하시겠습니까?"
        open={isOpenDeleteConfirm}
        onCancel={() => setIsOpenDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        confirmText="확인"
        cancelText="취소"
      />

      <ModalConfirm
        text="이 업데이터 애플리케이션을 비활성화하시겠습니까?"
        open={isOpenUpdateConfirm}
        onCancel={() => setIsOpenUpdateConfirm(false)}
        onConfirm={handleConfirmDeactivate}
        confirmText="확인"
        cancelText="취소"
      />

      <S.Modal
        width={935}
        footer={false}
        open={isOpenWeightConfig}
        destroyOnClose={true}
        onCancel={() => setIsOpenWeightConfig(false)}
      >
        <WeightConfig intitialValues={weightConfig} refreshWeightConfig={refetchWeightConfig} />
      </S.Modal>
    </S.TableWrapper>
  );
};

export default EdgeServer;
