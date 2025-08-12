import EnvelopeIcon from '@/assets/images/schedule/envelope.svg';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { ScheduleCollapse } from '@/components/schedule/collapse';
import * as S from '@/components/schedule/left-content/statistic/index.styles';
import { SubCollapse } from '@/components/schedule/left-content/statistic/sub-collapse';
import { BackToWorkModal } from '@/components/schedule/modal/back-to-work';
import React from 'react';

import { usePersonalData } from './index.utils';

export const PersonalData = () => {
  const {
    isOpen,
    setIsOpen,
    _renderMaitenance,
    _renderWhole,
    _renderWait,
    isOpenBackToWork,
    setIsOpenBackToWork,
    waitTitle,
    maintenanceTitle,
    wholeTitle,
  } = usePersonalData();

  return (
    <S.WrapData>
      <BaseModal
        open={isOpenBackToWork}
        destroyOnClose
        onCancel={() => setIsOpenBackToWork(false)}
        footer={null}
      >
        <BackToWorkModal onCancel={() => setIsOpenBackToWork(false)} initialTab="staff" />
      </BaseModal>

      <S.WrapHeader>
        <ScheduleCollapse
          isOpen={isOpen}
          onToogle={() => setIsOpen((prev) => !prev)}
          title="인력 데이터"
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
