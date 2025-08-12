import UploadD1 from '@/assets/images/common/upload-d1.png';
import UploadD2 from '@/assets/images/common/upload-d2.png';
import * as S from '@/components/auth/register-form/user-info-form/index.styles';
import { BaseImage } from '@/components/common/base-image';
import { BaseSpin } from '@/components/common/base-spin';
import { LoadingOutlined } from '@ant-design/icons';
import { UseMutationResult } from '@tanstack/react-query';
import { UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';
import { StaticImageData } from 'next/image';
import Link from 'next/link';
import React from 'react';

interface IValue {
  image: string;
  name: string;
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
  acceptType?: string[];
  uploadFileMutation: UseMutationResult<any, any, FormData, any>;
}

export const BaseUploadInput: React.FC<IProps> = ({
  uploadFileMutation,
  value,
  acceptType = ['application/pdf'],
  onChange,
  placeholder,
  onError,
  disabled,
  icon,
  limitSize = 20,
  downloadable = false,
}) => {
  const beforeUpload = (file: UploadFile) => {
    if (!file.type) return false;
    const isValidType = acceptType.includes(file.type);
    const availableLimitSize = limitSize * 1000000 > (file.size ?? 0);

    if (!isValidType) {
      onError(`${acceptType.join(', ')} 파일만 허용됩니다. 다시 시도해 주세요!`);
    } else if (!availableLimitSize) {
      onError(`파일이 너무 큽니다. ${limitSize}MB 이하의 파일을 업로드해 주세요.`);
    } else {
      onError('');
    }

    return isValidType && availableLimitSize;
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
    return value?.name && value?.image ? (
      downloadable ? (
        <S.PseudoLink
          className="upload-file-link"
          onClick={() => value.image && onDownLoadFile(value.image)}
        >
          {value?.name}
        </S.PseudoLink>
      ) : (
        <Link target="_blank" href={value?.image} className="upload-file-link">
          {value?.name}
        </Link>
      )
    ) : (
      value?.name
    );
  };

  const renderInputContent = () => {
    if (uploadFileMutation.isPending) {
      const file = uploadFileMutation.variables.get('file') as File;
      return (
        <>
          <S.UploadFileWrapper>
            <BaseSpin size="small" indicator={<LoadingOutlined spin className="spinning-icon" />} />
            <S.UploadFileName className="upload-pending-file-name">{file?.name}</S.UploadFileName>
          </S.UploadFileWrapper>
        </>
      );
    }

    if (value?.name) {
      return (
        <S.FileName className="upload-file-name">
          {renderFileName()}
          <S.FileDelete
            onClick={() => {
              if (!disabled) onChange && onChange({ image: '', name: '' });
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
        formData.append('image', file);
        uploadFileMutation.mutate(formData, {
          onSuccess(response) {
            onChange &&
              onChange({
                name: file.name,
                image: response?.data?.image,
              });
            data?.onSuccess && data?.onSuccess({});
            onError('');
          },
        });
      }}
      showUploadList={false}
      disabled={!!value?.name || disabled}
      beforeUpload={beforeUpload}
      accept={acceptType.join(',')}
    >
      <S.BaseUploadInput
        disable={String(disabled)}
        uploadable={String(!value?.name)}
        className={`base-upload-input ${disabled ? 'disabled-upload' : ''}`}
      >
        {renderInputContent()}
      </S.BaseUploadInput>
    </S.BaseUploadAntd>
  );
};
