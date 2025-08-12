import { BaseButton } from '@/components/common/base-button';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRadio } from '@/components/common/base-radio';
import { BaseTable } from '@/components/common/base-table';
import { FONT_SIZE, FONT_WEIGHT } from '@/constants';
import styled from 'styled-components';

export const Modal = styled(BaseModal)``;

export const WrapBackToWorkModalContent = styled.div``;

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
  position: relative;
`;

export const ModalTitle = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const Table = styled(BaseTable)`
  margin-top: 2rem;
`;

export const TableTitle = styled.div`
  display: flex;
  justify-content: center;
`;

export const TableSubTitle = styled.div`
  font-weight: ${FONT_WEIGHT.regular} !important;
`;

export const WrapVehicle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
`;

export const WrapAbsenceItem = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.2rem;
  align-items: center;
`;

export const WrapTime = styled.div`
  background-color: rgba(255, 242, 204, 1);
  color: rgba(230, 116, 26, 1) !important;
  padding: 0.2rem 0.8rem;
  border-radius: 6px;
  font-weight: ${FONT_WEIGHT.semibold};
`;

export const WrapButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const Button = styled(BaseButton)`
  height: 40px;
  width: 100%;
`;

export const WrapStaffName = styled.div`
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
