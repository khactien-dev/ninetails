import CloseIcon from '@/assets/images/svg/icon-close-modal.svg';
import { modalSizes } from '@/constants';
import { ModalProps } from 'antd';
import { ModalFooterRender } from 'antd/es/modal/interface';
import React from 'react';

import * as S from './index.styles';

interface BaseModalProps extends ModalProps {
  size?: 'small' | 'medium' | 'large';
  rounded?: 'md' | 'lg';
  footer?: ModalFooterRender | React.ReactNode;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  size = 'medium',
  children,
  closeIcon = <CloseIcon />,
  rounded = 'lg',
  footer = null,
  ...props
}) => {
  const modalSize = modalSizes[size];

  return (
    <S.AntModal
      $rounded={rounded}
      getContainer={false}
      width={modalSize}
      {...props}
      centered
      closeIcon={closeIcon}
      footer={footer}
      styles={{
        ...props.styles,
        content: {
          ...props.styles?.content,
          borderRadius: rounded === 'lg' ? '20px' : '8px',
        },
        body: {
          ...props.styles?.body,
          padding: rounded === 'lg' ? '24px' : '12px',
        },
      }}
    >
      {children}
    </S.AntModal>
  );
};
