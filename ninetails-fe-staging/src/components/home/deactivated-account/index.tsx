import { BaseRow } from '@/components/common/base-row';
import React from 'react';

import * as S from './index.styles';

interface IProps {
  isOpen: boolean;
  toggleIsOpen: (v: boolean) => void;
  handleConfirm: () => void;
}

const DeactivatedAccountModal: React.FC<IProps> = ({ isOpen, toggleIsOpen, handleConfirm }) => {
  return (
    <S.Modal
      open={isOpen}
      footer={null}
      centered
      onCancel={() => toggleIsOpen(false)}
      closeIcon={null}
      width={600}
      styles={{
        content: {
          borderRadius: 20,
          padding: 12,
        },
      }}
    >
      <S.ModalTitle>계정이 비활성화되었습니다.</S.ModalTitle>
      <S.ModalDescription>
        자세한 내용은 운영자 또는 SuperBucket 관리자에게 문의하세요
      </S.ModalDescription>
      <BaseRow justify="center">
        <S.ConfirmButton type="default" onClick={handleConfirm}>
          OK
        </S.ConfirmButton>
      </BaseRow>
    </S.Modal>
  );
};

export default DeactivatedAccountModal;
