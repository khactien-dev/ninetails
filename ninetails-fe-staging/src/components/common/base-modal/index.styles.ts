import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import { Modal } from 'antd';
import styled from 'styled-components';

export const AntModal = styled(Modal)<{ $rounded: 'md' | 'lg' }>`
  .ant-modal-title {
    font-size: ${FONT_SIZE.xl};
    font-weight: ${FONT_WEIGHT.semibold};
    color: rgba(56, 59, 64, 1);
  }

  .ant-modal-header {
    border-bottom: none;
    padding-bottom: 0;
    padding-top: 2rem;
    border-radius: 20px;
  }

  .ant-modal-close {
    top: ${(props) => (props.$rounded === 'lg' ? '2rem' : '0.6rem')};
    right: ${(props) => (props.$rounded === 'lg' ? '2rem' : '0.6rem')};
  }

  /* .ant-modal,
  .ant-modal-content {
    border-radius: 20px;
  } */

  .ant-modal-footer {
    border-top: none;
    padding: 0;
  }
`;
