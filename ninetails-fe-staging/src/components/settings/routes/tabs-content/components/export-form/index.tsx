import { BaseForm } from '@/components/common/forms/base-form';
import { checkEmoji } from '@/utils';
import dayjs from 'dayjs';
import React from 'react';

import * as S from '../../index.styles';

interface ExportFormProps {
  open: boolean;
  tableName: string;
  onCancel: () => void;
  handleExport: (values: any) => void;
}

export const ExportForm: React.FC<ExportFormProps> = ({
  open,
  tableName,
  onCancel,
  handleExport,
}) => {
  return (
    <S.ModalWrap
      footer={null}
      open={open}
      onCancel={onCancel}
      size="small"
      closable={false}
      destroyOnClose
      rounded="md"
      width={400}
      styles={{
        content: {
          padding: '1rem',
        },
      }}
    >
      <S.ModalExportContent>
        <BaseForm
          layout="horizontal"
          initialValues={{
            fileName: `${tableName}_${dayjs().format('YYYYMMDD')}`,
            fileType: 'csv',
          }}
          onFinish={handleExport}
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
              checkEmoji('유효하지 않은 문자입니다. 다시 시도해 주세요!'),
            ]}
            name="fileName"
          >
            <S.InputWrap maxLength={200} placeholder="Enter file name" />
          </S.FormItem>

          <S.FormItem label="형식" colon={false} name="fileType">
            <S.SelectOption
              style={{ height: '50px' }}
              options={[
                { label: 'CSV', value: 'csv' },
                { label: 'Excel', value: 'xlsx' },
              ]}
            />
          </S.FormItem>

          <S.GroupButton>
            <S.DownloadFileBtn htmlType="submit">저장</S.DownloadFileBtn>
            <S.CancelBtn onClick={onCancel}>취소</S.CancelBtn>
          </S.GroupButton>
        </BaseForm>
      </S.ModalExportContent>
    </S.ModalWrap>
  );
};
