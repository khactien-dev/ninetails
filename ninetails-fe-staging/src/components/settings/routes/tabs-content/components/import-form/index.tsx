import IconUpload from '@/assets/images/svg/icon-upload-d1.png';
import { BaseImage } from '@/components/common/base-image';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseUpload } from '@/components/common/base-upload';
import { BaseForm } from '@/components/common/forms/base-form';
import { FormInstance } from 'antd';
import React, { useState } from 'react';

import * as S from '../../index.styles';

interface ImportFormProps {
  open: boolean;
  selectedFile: File | null;
  onCancel: () => void;
  onFinish: () => void;
  beforeUpload: (file: File) => boolean;
  onRemove: () => void;
  form: FormInstance;
  tableName: string;
  showUploadList?: boolean;
}

export const ImportForm: React.FC<ImportFormProps> = ({
  open,
  form,
  selectedFile,
  tableName,
  onCancel,
  onFinish,
  beforeUpload,
  onRemove,
  showUploadList = false,
}) => {
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('이 필드는 필수입니다.');
      return;
    }
    setError('');
    onFinish();
  };

  const handleCancel = () => {
    setError('');
    onRemove();
    onCancel();
  };

  return (
    <BaseModal
      width={525}
      title={`파일 불러오기 into '${tableName}'`}
      footer={null}
      open={open}
      destroyOnClose={true}
      onCancel={handleCancel}
    >
      <S.Import>
        <BaseForm
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout="horizontal"
          onFinish={handleSubmit}
        >
          <BaseForm.Item label="File Name" name="File Name">
            <S.InputFile isError={!!error}>
              <BaseUpload
                beforeUpload={(file) => {
                  beforeUpload(file);
                  setError('');
                }}
                accept=".csv"
                maxCount={1}
                onRemove={onRemove}
                showUploadList={showUploadList}
              >
                <S.WrapperFile>
                  <S.FileName>
                    {selectedFile ? (
                      selectedFile.name
                    ) : (
                      <S.TextUpload>.csv 파일만 허용됩니다</S.TextUpload>
                    )}
                  </S.FileName>
                  <BaseImage src={IconUpload.src} width={16} height={16} preview={false} alt="" />
                </S.WrapperFile>
              </BaseUpload>
            </S.InputFile>
            {error && <S.TextError>{error}</S.TextError>}
          </BaseForm.Item>

          <S.GroupBtn>
            <S.BtnSubmit htmlType="submit" type="primary">
              {'확인'}
            </S.BtnSubmit>
            <S.BtnCancel onClick={handleCancel} type="default">
              {'취소'}
            </S.BtnCancel>
          </S.GroupBtn>
        </BaseForm>
      </S.Import>
    </BaseModal>
  );
};
