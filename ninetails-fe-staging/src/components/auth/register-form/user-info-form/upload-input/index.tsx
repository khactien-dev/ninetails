import UploadD1 from '@/assets/images/common/upload-d1.png';
import UploadD2 from '@/assets/images/common/upload-d2.png';
import * as S from '@/components/auth/register-form/user-info-form/index.styles';
import { BaseImage } from '@/components/common/base-image';
import { BaseSpin } from '@/components/common/base-spin';
import { useUploadFile } from '@/hooks/features/useTenant';
import { LoadingOutlined } from '@ant-design/icons';
import { UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface IValue {
  fileName: string;
  url: string;
}
interface IProps {
  value?: IValue;
  onChange?: (v: IValue) => void;
  placeholder?: string;
  onError: (e: string) => void;
  disabled?: boolean;
  icon?: StaticImageData;
  limitSize?: number;
  downloadable?: boolean;
}

export const UploadInput: React.FC<IProps> = ({
  value,
  onChange,
  placeholder,
  onError,
  disabled,
  icon,
  limitSize = 20,
  downloadable = false,
}) => {
  const updateFileMutation = useUploadFile();

  const beforeUpload = (file: UploadFile) => {
    const isPdf = file.type === 'application/pdf';
    const availableLimitSize = limitSize * 1000000 > (file.size ?? 0);
    if (!isPdf) {
      onError('PDF 파일만 허용됩니다. 다시 시도해 주세요!');
    } else if (!availableLimitSize) {
      onError(`파일이 너무 큽니다. ${limitSize}MB 이하의 파일을 업로드해 주세요.`);
    } else {
      onError('');
    }

    return isPdf && availableLimitSize;
  };

  const onDownLoadFile = (url: string, filename: string = 'proof.pdf') => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.style.display = 'none';

        if (filename && filename.length) a.download = filename;
        document.body.appendChild(a);
        a.click();
      })
      .catch(() => {
        return;
      });
  };

  const renderFileName = () => {
    return value?.fileName && value?.url ? (
      downloadable ? (
        <S.PseudoLink
          className="upload-file-link"
          onClick={() => value.url && onDownLoadFile(value.url)}
        >
          {value?.fileName}
        </S.PseudoLink>
      ) : (
        <Link target="_blank" href={value?.url} className="upload-file-link">
          {value?.fileName}
        </Link>
      )
    ) : (
      value?.fileName
    );
  };

  const renderInputContent = () => {
    if (updateFileMutation.isPending) {
      const file = updateFileMutation.variables.get('file') as File;
      return (
        <>
          <S.UploadFileWrapper>
            <BaseSpin size="small" indicator={<LoadingOutlined spin className="spinning-icon" />} />
            <S.UploadFileName className="upload-pending-file-name">{file.name}</S.UploadFileName>
          </S.UploadFileWrapper>
        </>
      );
    }

    if (value?.fileName) {
      return (
        <S.FileName className="upload-file-name">
          {renderFileName()}
          <S.FileDelete
            onClick={() => {
              if (!disabled) onChange && onChange({ fileName: '', url: '' });
            }}
            disable={String(disabled)}
          >
            <S.DeleteIcon />
          </S.FileDelete>
        </S.FileName>
      );
    }

    return (
      <S.FilePlaceHolder disable={String(disabled)} className="upload-placeholder">
        {placeholder}
        <S.UploadIcon>
          {disabled ? (
            <BaseImage src={UploadD2.src} preview={false} width={16} height={16} />
          ) : (
            <BaseImage
              src={icon ? icon.src : UploadD1.src}
              preview={false}
              width={16}
              height={16}
            />
          )}
        </S.UploadIcon>
      </S.FilePlaceHolder>
    );
  };

  return (
    <S.BaseUploadAntd
      customRequest={(data) => {
        const file = data.file as RcFile;
        const formData = new FormData();
        formData.append('file', file);
        updateFileMutation.mutate(formData, {
          onSuccess(response) {
            onChange &&
              onChange({
                fileName: file.name,
                url: response.data.url,
              });
            data?.onSuccess && data?.onSuccess({});
            onError('');
          },
        });
      }}
      showUploadList={false}
      disabled={!!value?.fileName || disabled}
      beforeUpload={beforeUpload}
      accept="application/pdf"
    >
      <S.BaseUploadInput
        disable={String(disabled)}
        uploadable={String(!value?.fileName)}
        className={`base-upload-input ${disabled ? 'disabled-upload' : ''}`}
      >
        {renderInputContent()}
      </S.BaseUploadInput>
    </S.BaseUploadAntd>
  );
};
