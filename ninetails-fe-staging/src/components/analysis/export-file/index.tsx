import { useAnalysisContext } from '@/components/analysis/context';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import dayjs from 'dayjs';
import React from 'react';

import * as S from './index.styles';

interface IProps {
  fileNamePrefix?: string;
  fileName?: string;
  fileType?: 'csv' | 'pdf' | 'xlsx';
  disabledFileType?: boolean;
  loading?: boolean;
  onExport: (v: { fileName: string; fileType: 'csv' | 'pdf' | 'xlsx' }) => void;
  onCancel?: () => void;
  isShowTimeFileName?: boolean;
}

export const ExportFile: React.FC<IProps> = ({
  fileNamePrefix,
  fileName,
  onExport,
  onCancel,
  fileType,
  disabledFileType,
  loading,
  isShowTimeFileName = true,
}) => {
  const { params } = useAnalysisContext();

  return (
    <S.ModalExportContent>
      <BaseForm
        initialValues={{
          fileName:
            fileName ??
            `${fileNamePrefix}_${params?.routeName ?? '000-전체차량'}_${dayjs().format(
              'YYYYMMDD'
            )}${isShowTimeFileName ? `_${dayjs().format('hhmmss')}` : ''}`,
          fileType: fileType ?? 'csv',
          location: 'Downloads',
        }}
        onFinish={(v) => {
          onExport(v);
        }}
        labelAlign="left"
        labelCol={{ span: 4 }}
        layout="horizontal"
      >
        <S.FormItem
          label="이름"
          colon={false}
          rules={[
            { required: true, whitespace: true, message: '이 필드는 필수입니다.' },
            {
              pattern: /^[^\\/:*?"<>|]+$/,
              message: '유효하지 않은 파일 이름입니다. 다시 확인해 주세요!',
            },
          ]}
          name="fileName"
        >
          <S.InputWrap maxLength={200} placeholder="Enter file name" />
        </S.FormItem>
        <S.FormItem label="형식" colon={false} name="fileType">
          <BaseSelect
            style={{ height: '50px' }}
            options={[
              { label: 'PDF', value: 'pdf' },
              { label: 'CSV', value: 'csv' },
              { label: 'Excel', value: 'xlsx' },
            ]}
            disabled={disabledFileType}
          />
        </S.FormItem>
        <S.GroupButton>
          <S.Button type="primary" htmlType="submit" loading={loading}>
            저장
          </S.Button>
          <S.CancelButton onClick={onCancel}>취소</S.CancelButton>
        </S.GroupButton>
      </BaseForm>
    </S.ModalExportContent>
  );
};
