import WarningIcon from '@/assets/images/svg/icon-warning-24-filled.svg';

import { BaseModal } from '../base-modal/BaseModal';
import * as S from './index.style';

interface ModalConfirmPropsType {
  open: boolean;
  text: string;
  textStyle?: {
    [key: string]: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isSuperAdmin?: boolean;
  width?: number;
}

export default function ModalConfirm({
  open,
  text,
  textStyle,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  isSuperAdmin = false,
  width = 448,
}: ModalConfirmPropsType) {
  return (
    <BaseModal open={open} footer={null} closeIcon={false} centered width={width}>
      <S.ModalContent>
        <WarningIcon />

        <S.AlertText style={textStyle}>{text}</S.AlertText>

        <S.BtnContainer>
          <S.SubmitButton onClick={onConfirm} $isSuperAdmin={isSuperAdmin}>
            {confirmText ?? 'Confirm'}
          </S.SubmitButton>

          <S.CancelButton type="default" onClick={onCancel} $isSuperAdmin={isSuperAdmin}>
            {cancelText ?? 'Cancel'}
          </S.CancelButton>
        </S.BtnContainer>
      </S.ModalContent>
    </BaseModal>
  );
}
