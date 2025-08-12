import EnvelopeIcon from '@/assets/images/schedule/envelope.svg';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { ScheduleCollapse } from '@/components/schedule/collapse';
import * as S from '@/components/schedule/left-content/statistic/index.styles';
import { BackToWorkModal } from '@/components/schedule/modal/back-to-work';
import React from 'react';

import { SubCollapse } from '../sub-collapse';
import { useVehicleData } from './index.utils';

export const VehicleData = () => {
  const {
    isOpen,
    setIsOpen,
    _renderMaitenance,
    _renderWhole,
    _renderWait,
    waitTitle,
    maintenanceTitle,
    wholeTitle,
    isOpenBackToWork,
    setIsOpenBackToWork,
  } = useVehicleData();

  return (
    <S.WrapData>
      <BaseModal
        open={isOpenBackToWork}
        destroyOnClose
        onCancel={() => setIsOpenBackToWork(false)}
        footer={null}
      >
        <BackToWorkModal onCancel={() => setIsOpenBackToWork(false)} initialTab="vehicle" />
      </BaseModal>
      <S.WrapHeader>
        <ScheduleCollapse
          isOpen={isOpen}
          onToogle={() => setIsOpen((prev) => !prev)}
          title="차량 데이터"
        />
        <S.WrapEnvelopIcon onClick={() => setIsOpenBackToWork(true)}>
          <EnvelopeIcon />
        </S.WrapEnvelopIcon>
      </S.WrapHeader>

      {isOpen && (
        <S.WrapContent>
          <SubCollapse titles={wholeTitle}>{_renderWhole()}</SubCollapse>

          <SubCollapse titles={waitTitle}>{_renderWait()}</SubCollapse>

          <SubCollapse titles={maintenanceTitle}>{_renderMaitenance()}</SubCollapse>
        </S.WrapContent>
      )}
    </S.WrapData>
  );
};
