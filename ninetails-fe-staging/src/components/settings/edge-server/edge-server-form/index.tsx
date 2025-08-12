import { BaseCol } from '@/components/common/base-col';
import { BaseRow } from '@/components/common/base-row';
import { BaseForm } from '@/components/common/forms/base-form';
import { DATE_FORMAT } from '@/constants';
import { usePermissions } from '@/hooks/usePermissions';
import { IEdgeServer } from '@/interfaces';
import { checkAllspace, checkEmoji, checkMacAddress, preventLettersMacAddress } from '@/utils';
import dayjs from 'dayjs';

import { CustomFormItem } from '../custom-form-item';
import { METRIC_OPTIONS, STATUS_OPTIONS, UI_OPTIONS } from '../index.utils';
import { SelectInfiniteVehicle } from '../select-infinite';
import * as S from './index.style';

interface IProps {
  record: IEdgeServer;
  onSave: (value: IEdgeServer) => void;
  initialVehicleOption: { value: number; label: string } | null;
}

const EditEdgeServerForm = ({ record, onSave, initialVehicleOption }: IProps) => {
  const [form] = BaseForm.useForm();
  const permissions = usePermissions();

  const handleSave = (values: IEdgeServer) => {
    onSave({ ...record, ...values });
  };

  const onGeneratePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    form.setFieldValue('password', newPassword);
  };

  return (
    <S.EditTableFormWrap>
      <BaseForm
        form={form}
        initialValues={{
          ...record,
          updatedAt: record?.updatedAt
            ? dayjs(record?.updatedAt).format(DATE_FORMAT.DATE_YT)
            : '--',
          license_plate_id: record?.vehicle?.id,
          hw_version: record?.hw_version ?? '--',
          os_version: record?.os_version ?? '--',
          kernel_version: record?.kernel_version ?? '--',
          jetpack_version: record?.jetpack_version ?? '--',
          docker_version: record?.docker_version ?? '--',
          edge_setting_version: record?.edge_setting_version
            ? Number(record?.edge_setting_version)?.toFixed(3).toString()
            : '1.000',
        }}
        layout="vertical"
        onFinish={handleSave}
        disabled={!permissions.updateAble}
      >
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseForm.Item
              label="Edge 이름"
              required
              name="edge_name"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                {
                  max: 200,
                  message: 'Edge 이름 200자 이상이 될 수 없습니다.',
                },
                checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
                checkAllspace('이 필드는 필수입니다.'),
              ]}
            >
              <S.StyledInput placeholder="Edge 이름 입력" />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item
              label="설치 (차번)"
              required
              name="license_plate_id"
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <SelectInfiniteVehicle placeholder="차번 선택" initialOption={initialVehicleOption} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="자동 생성"
              label="암호"
              required
              name="password"
              type="preset"
              onClickPreset={onGeneratePassword}
              rules={[{ required: true, message: '이 필드는 필수입니다.' }]}
            >
              <S.StyledInputPassword
                placeholder="Enter password"
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item
              label="Mac 주소"
              required
              name="mac_address"
              rules={[
                { required: true, message: '이 필드는 필수입니다.' },
                checkMacAddress('유효한 MAC 주소를 입력해 주세요!'),
              ]}
            >
              <S.StyledMacAddress
                maxLength={17}
                onKeyPress={preventLettersMacAddress}
                placeholder="Mac 주소 입력"
              />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseForm.Item label="HW 모델" name="hw_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="OS 버전" name="os_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="Kernel 버전" name="kernel_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="JetPack 버전" name="jetpack_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <BaseForm.Item label="Docker 버전" name="docker_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="edge_state_metrics 주기"
              required
              name="edge_metrics"
            >
              <S.StyledSelect options={METRIC_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="drive_metrics 주기"
              required
              name="operation_metrics"
            >
              <S.StyledSelect options={METRIC_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="collect_metrics 주기"
              required
              name="collection_metrics"
            >
              <S.StyledSelect options={METRIC_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="운행 현황 UI"
              required
              name="operation_status_ui"
            >
              <S.StyledSelect options={UI_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="수거 현황 UI"
              required
              name="collection_status_ui"
            >
              <S.StyledSelect options={UI_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem subLabel="전체" label="수량 분석 UI" required name="volume_analysis_ui">
              <S.StyledSelect options={UI_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <CustomFormItem
              subLabel="전체"
              label="부피분석 UI"
              required
              name="quantity_analysis_ui"
            >
              <S.StyledSelect options={UI_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
        </BaseRow>
        <BaseRow gutter={16}>
          <BaseCol span={6}>
            <CustomFormItem subLabel="전체" label="영상 UI" required name="video_ui">
              <S.StyledSelect options={UI_OPTIONS} />
            </CustomFormItem>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="Edge_setting 버전" required name="edge_setting_version">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="업데이트 Time" name="updatedAt">
              <S.StyledInput disabled={true} />
            </BaseForm.Item>
          </BaseCol>
          <BaseCol span={6}>
            <BaseForm.Item label="상태" required name="status">
              <S.StyledSelect options={STATUS_OPTIONS} />
            </BaseForm.Item>
          </BaseCol>
        </BaseRow>
        <BaseRow justify={'center'}>
          <S.BtnSave htmlType="submit" type="primary">
            저장
          </S.BtnSave>
        </BaseRow>
      </BaseForm>
    </S.EditTableFormWrap>
  );
};

export default EditEdgeServerForm;
