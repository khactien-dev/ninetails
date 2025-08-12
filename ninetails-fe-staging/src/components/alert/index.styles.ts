import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled, { css } from 'styled-components';

interface BtnProps {
  $status?: boolean;
}

export const Modal = styled(BaseModal)`
  width: calc(100% - 40px) !important;
  max-width: 460px;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .ant-modal-content {
    padding: 30px;
    border-radius: 20px;
    animation-name: modalUp;
    animation-duration: 0.7s;
  }

  .ant-modal-header {
    border-bottom: 0;
    padding: 0;
    margin: 16px 0 0;

    .ant-modal-title {
      font-size: ${FONT_SIZE.xs};
      font-weight: ${FONT_WEIGHT.medium};
      color: var(--text);
      line-height: 21px;
    }
  }

  .ant-modal-body {
    padding: 0;
    font-size: 14px;
    font-weight: ${FONT_WEIGHT.regular};
    color: var(--text);
    line-height: 21px;
  }

  .ant-modal-footer {
    border-top: 0;
    padding: 0;
    margin: 0 auto;
    text-align: center;
  }
`;

export const Button = styled(BaseButton)<BtnProps>`
  width: 100%;
  max-width: 240px;
  height: 40px;
  border-radius: 5px;
  text-align: center;
  line-height: 40px;
  color: var(--white);
  font-size: 16px;
  padding: 0;
  margin: 24px auto 0;
  background: var(--green);

  ${(props) =>
    props.$status &&
    css`
      background: var(--red);
    `}
`;
