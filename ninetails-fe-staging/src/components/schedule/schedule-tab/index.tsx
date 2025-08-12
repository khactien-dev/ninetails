import { ExportFile } from '@/components/analysis/export-file';
import { BaseCol } from '@/components/common/base-col';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { BaseRow } from '@/components/common/base-row';
import ModalConfirm from '@/components/common/modal-confirm';
import { ProfileDropdown } from '@/components/header/profile/profile-dropdown';
import FilterTable from '@/components/settings/table/filterTable';
import { DATE_FORMAT } from '@/constants';
import { PURPOSE_VALUE } from '@/constants/settings';
import dayjs from 'dayjs';
import React from 'react';
import { FullScreen } from 'react-full-screen';

import { AddScheduleForm } from '../add-schedule-form';
import { AllTable } from '../all-table';
import { useScheduleContext } from '../context';
import { DomainTable } from '../domain-table';
import { FullScreenTable } from '../full-screen-table';
import { LegendModal } from '../modal/legend';
import * as S from './index.styles';
import { useScheduleTab } from './index.utils';
import { PreviewPdf } from './preview-pdf';

export const ScheduleTab: React.FC = () => {
  const {
    compositeWasteSchedule,
    foodWasteSchedule,
    reusableWasteSchedule,
    taticalMobilityWasteSchedule,
    compositeWasteLoading,
    foodWasteLoading,
    reusableWasteLoading,
    taticalMobilityLoading,
    selectedComposite,
    selectedFood,
    selectedReusable,
    selectedTactical,
    params,
    setSelectedComposite,
    setSelectedFood,
    setSelectedReusable,
    setSelectedTatical,
  } = useScheduleContext();

  const {
    tabsArr,
    fullScreenHandle,
    activeTab,
    buttons,
    isOpenCreate,
    activeLegend,
    isOpenConfirm,
    isOpenExport,
    previewRef,
    activeDomain,
    handleExportFile,
    setIsOpenExport,
    setIsOpenConfirm,
    setActiveLegend,
    setIsOpenCreate,
    handleDeleteSchedule,
    setActiveTab,
  } = useScheduleTab();

  return (
    <>
      <LegendModal active={activeLegend} onChangeActive={setActiveLegend} />
      <BaseModal
        width={600}
        title="새로운 근무 일정 추가"
        footer={false}
        open={isOpenCreate}
        destroyOnClose
        onCancel={() => setIsOpenCreate(false)}
      >
        <AddScheduleForm onCreatedSusccess={() => setIsOpenCreate(false)} />
      </BaseModal>

      <BaseModal
        open={isOpenExport}
        footer={null}
        onCancel={() => setIsOpenExport(false)}
        destroyOnClose
        width={400}
        closeIcon={false}
        rounded="md"
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <ExportFile
          onExport={handleExportFile}
          onCancel={() => setIsOpenExport(false)}
          fileName={`근무 일정_${activeDomain?.label}_${dayjs(params?.working_date).format(
            'YYYYMMDD'
          )}_${dayjs().format('hhmmss')}`}
          fileType="pdf"
        />
      </BaseModal>

      <ModalConfirm
        text="이 일정을 삭제하시겠습니까?"
        open={isOpenConfirm}
        textStyle={{ fontSize: '20px', width: '260px' }}
        onCancel={() => setIsOpenConfirm(false)}
        onConfirm={handleDeleteSchedule}
        confirmText="확인"
        cancelText="취소"
      />

      <FilterTable buttonArr={buttons} isSuperAdmin={false} />
      <S.Tabs items={tabsArr} onChange={(v) => setActiveTab(v)} />
      <FullScreen handle={fullScreenHandle}>
        <S.FullScreenContainer>
          {fullScreenHandle?.active && (
            <S.Header>
              <BaseRow justify="space-between" align="middle">
                <BaseCol lg={10} xl={8} xxl={8}>
                  <S.WrapFullScreenHeaderLeft>
                    <S.BackButton
                      type="primary"
                      onClick={() => fullScreenHandle?.exit()}
                    >{`< 근무 일정`}</S.BackButton>
                    <S.WrapDate>
                      {dayjs(params?.working_date).format(DATE_FORMAT.DATE_KOREA_DAY_OF_WEEK)}
                    </S.WrapDate>
                  </S.WrapFullScreenHeaderLeft>
                </BaseCol>
                <S.UserProfileRow align="middle" justify="end" gutter={[5, 5]}>
                  <BaseCol>
                    <ProfileDropdown />
                  </BaseCol>
                </S.UserProfileRow>
              </BaseRow>
            </S.Header>
          )}

          {fullScreenHandle?.active ? (
            <>
              <S.WrapFullScreenContent $isFullScreen={fullScreenHandle.active}>
                <FullScreenTable />
              </S.WrapFullScreenContent>
            </>
          ) : (
            <>
              {activeTab === 'all' ? (
                <AllTable key={0} isFullScreen={fullScreenHandle.active} />
              ) : activeTab === PURPOSE_VALUE.COMPOSITE_WASTES ? (
                <DomainTable
                  domain={{ en: PURPOSE_VALUE.COMPOSITE_WASTES, kr: '생활' }}
                  colorTheme="#57BA00"
                  key={1}
                  scheduleList={compositeWasteSchedule}
                  loading={compositeWasteLoading}
                  selectedRows={selectedComposite}
                  setSelectedRows={setSelectedComposite}
                  isFullScreen={fullScreenHandle.active}
                />
              ) : activeTab === PURPOSE_VALUE.FOOD_WASTES ? (
                <DomainTable
                  domain={{ en: PURPOSE_VALUE.FOOD_WASTES, kr: '음식' }}
                  colorTheme="#F08D14"
                  key={2}
                  scheduleList={foodWasteSchedule}
                  loading={foodWasteLoading}
                  selectedRows={selectedFood}
                  setSelectedRows={setSelectedFood}
                  isFullScreen={fullScreenHandle.active}
                />
              ) : activeTab === PURPOSE_VALUE.REUSABLE_WASTES ? (
                <DomainTable
                  domain={{ en: PURPOSE_VALUE.REUSABLE_WASTES, kr: '재활' }}
                  colorTheme="#BD00FF"
                  key={3}
                  scheduleList={reusableWasteSchedule}
                  loading={reusableWasteLoading}
                  selectedRows={selectedReusable}
                  setSelectedRows={setSelectedReusable}
                  isFullScreen={fullScreenHandle.active}
                />
              ) : activeTab === PURPOSE_VALUE.TACTICAL_MOBILITY ? (
                <DomainTable
                  domain={{ en: PURPOSE_VALUE.TACTICAL_MOBILITY, kr: '기동' }}
                  colorTheme="#BD00FF"
                  key={4}
                  scheduleList={taticalMobilityWasteSchedule}
                  loading={taticalMobilityLoading}
                  selectedRows={selectedTactical}
                  setSelectedRows={setSelectedTatical}
                  isFullScreen={fullScreenHandle.active}
                />
              ) : (
                <AllTable isFullScreen={fullScreenHandle.active} />
              )}
            </>
          )}
        </S.FullScreenContainer>
      </FullScreen>

      <S.WrapPreviewPdf>
        <div ref={previewRef}>
          <PreviewPdf activeTab={activeTab} />
        </div>
      </S.WrapPreviewPdf>
    </>
  );
};
