import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRadio } from '@/components/common/base-radio';
import { FONT_SIZE, FONT_WEIGHT, media } from '@/constants';
import styled from 'styled-components';

export const Modal = styled(BaseModal)``;

export const GroupButton = styled(BaseRadio.Group)`
  .ant-radio-button-wrapper {
    height: 33px !important;
    line-height: 33px !important;
    padding: 0 2rem;
    font-weight: ${FONT_WEIGHT.semibold};
    color: var(--text-dark-light-color);
    font-size: ${FONT_SIZE.xs};

    &:first-child {
      border-start-start-radius: 4px;
      border-end-start-radius: 4px;
    }

    &:last-child {
      border-start-end-radius: 4px;
      border-end-end-radius: 4px;
    }
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
    background-color: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
  }

  .ant-radio-button {
    height: 33px !important;
  }
`;

export const WrapGroupButton = styled.div`
  display: flex;
  justify-content: center;
`;

export const WrapCarItem = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
`;

export const WrapCarItems = styled.div<{ row?: number }>`
  margin-top: 2rem;
  height: calc(40px * ${({ row = 4 }) => row});
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  gap: 0 2rem;
  @media only screen and ${media.sm} {
    gap: 0 4rem;
  }
`;

export const WrapContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  flex-direction: column;
  @media only screen and ${media.sm} {
    flex-direction: row;
  }
`;

export const Label = styled.div`
  margin-left: 0.3rem;
  font-size: ${FONT_SIZE.xs};
  font-weight: ${FONT_WEIGHT.bold};
  color: rgba(56, 59, 64, 1) !important;
`;

export const WrapModalContent = styled.div`
  padding: 0 1rem;

  padding: 0;
  @media only screen and ${media.sm} {
    padding: 0 1rem;
  }
`;

export const WrapButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const Button = styled(BaseButton)`
  height: 40px !important;
  width: 100% !important;
`;
