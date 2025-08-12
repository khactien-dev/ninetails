import { BaseButton } from '@/components/common/base-button';
import { BaseUpload } from '@/components/common/base-upload';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

export const PseudoLabelWrapper = styled.div`
  color: #555;
  padding-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

export const LabelText = styled.label`
  font-size: 0.875rem;
  &::after {
    display: inline-block;
    margin-inline-end: 4px;
    color: #ff5252;
    font-size: 16px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    margin-left: 0.3rem;
    content: '*';
  }
`;

export const LabelActionButton = styled(BaseButton)<{ actiontype: 'danger' | 'success' | 'dark' }>`
  padding: 0 0.6rem !important;
  height: auto !important;
  font-size: 13px !important;
  background-color: ${(props) =>
    props.actiontype === 'danger'
      ? 'red'
      : props.actiontype === 'success'
      ? 'green'
      : props.actiontype === 'dark'
      ? '#444'
      : 'unset'};
  color: white !important;
  border: none !important;
  &:hover {
    color: white !important;
  }
  font-weight: ${FONT_WEIGHT.light};
`;

export const DoubleBtnWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const CountDownTime = styled.div`
  color: red;
  font-size: 16px;
`;

export const BaseUploadAntd = styled(BaseUpload)`
  width: 100% !important;
  .ant-upload {
    width: 100% !important;
  }
`;

export const BaseUploadInput = styled.div<{
  disable: string;
  uploadable: string;
}>`
  height: 34px;
  border-radius: 5px;
  border: 1px solid var(--lightgray);
  width: 100%;
  padding: 5px 13px;
  color: ${(props) =>
    props.disable === 'true' ? 'var(--disabled-color)' : 'var(--black)'} !important;
  cursor: ${(props) => (props.uploadable === 'true' ? 'pointer' : 'alias')};
  background-color: ${(props) => (props.disable === 'true' ? 'var(--disabled-bg-color)' : '')};
  position: relative;
  display: flex;
  align-items: center;
`;

export const FileName = styled.div`
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  overflow: hidden;
  padding-right: 1.6rem;
  font-size: ${FONT_SIZE.xs};
`;

export const FileDelete = styled.div<{ disable: string }>`
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-55%);
  font-size: 24px;
  cursor: pointer;

  span {
    color: ${(props) =>
      props.disable === 'true' ? 'var(--disabled-color)' : 'var(--red)'} !important;
  }
`;

export const FilePlaceHolder = styled.div<{ disable: string }>`
  color: ${(props) =>
    props.disable === 'true' ? 'var(--disabled-color)' : 'var(--text-light-color)'} !important;
  font-size: 14px;
`;

export const UploadIcon = styled.div`
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-40%);
`;

export const WrapForm = styled.div`
  .ant-form-item-has-error {
    .base-upload-input {
      border: 1px solid var(--red);
      transition: 0.1s ease-in-out border-color;
    }
  }
`;

export const UploadFileWrapper = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
`;

export const UploadFileName = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  padding-right: 1.6rem;
  font-size: ${FONT_SIZE.xs};
  color: var(--text-light-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 200px;
`;

export const DeleteIcon = styled(DeleteOutlined)`
  font-size: 1.2rem;
`;

export const PseudoLink = styled.p`
  cursor: pointer;
`;
