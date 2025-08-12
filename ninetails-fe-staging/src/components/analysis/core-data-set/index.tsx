import { BaseModal } from '@/components/common/base-modal/BaseModal';
import React from 'react';

import Collapse from '../collapse';
import { DEFAULT_CORE_DATASET_CONFIG } from '../context/index.utils';
import { ExportFile } from '../export-file';
import { PreviewPdfTemplate } from '../preview-pdf-template';
import { AlphaModal } from './alpha-modal';
import { DiagnosisModal } from './diagnosis-modal';
import * as S from './index.style';
import { useCoreDataSet } from './index.utils';
import { RankingModal } from './ranking-modal';
import { CustomTreeTable } from './tree-table';

interface IProps {
  onDeleteSection: () => void;
}

export const CoreDataSet: React.FC<IProps> = ({ onDeleteSection }) => {
  const {
    isOpenAlphaSetting,
    isOpenConfig,
    isOpenDiagnosis,
    treeData,
    settingButtons,
    coreDataSetConfig,
    isOpenPreviewPdf,
    defaultLevelRange,
    defaultWeightRange,
    isOpenExport,
    previewRoute,
    loadingCoreDataset,
    loadingUpdateMetric,
    onChangeConfigWeight,
    setIsOpenPreviewPdf,
    setIsOpenAlphaSetting,
    setIsOpenConfig,
    setIsOpenDiagnosis,
    onExportSheet,
    onChangeSelectRoutes,
    setIsOpenExport,
    onChangeAlpha,
    onChangePValue,
  } = useCoreDataSet({ onDeleteSection });

  return (
    <>
      <Collapse
        type="detail"
        defaultCollapsed={true}
        title="코어 데이터셋"
        settingContent={
          <>
            {settingButtons.map((item, index) => (
              <React.Fragment key={index}>
                <S.SettingButton
                  onClick={() => !item.disabled && item.onClick()}
                  $disabled={item.disabled}
                >
                  {item.icon}
                  {item.title}
                </S.SettingButton>
                {index + 1 !== settingButtons?.length && <S.SettingDivider />}
              </React.Fragment>
            ))}
          </>
        }
      >
        <S.CoreDataSetContainer id="core-data-set-container">
          <CustomTreeTable
            dataSource={treeData}
            config={coreDataSetConfig}
            onSelectRoutes={onChangeSelectRoutes}
            isAbleSelectRoute
            loading={loadingCoreDataset}
          />
        </S.CoreDataSetContainer>
      </Collapse>

      <BaseModal
        open={isOpenPreviewPdf}
        width={1380}
        footer={null}
        onCancel={() => setIsOpenPreviewPdf(false)}
        destroyOnClose
        styles={{
          body: {
            overflowX: 'auto',
            height: 600,
          },
        }}
      >
        <PreviewPdfTemplate subTitle="코어 데이터셋" fileNamePrefix={`코어 데이터셋`}>
          <S.WrapCoreDataSet>
            <CustomTreeTable dataSource={previewRoute} config={null} isPreview={true} />
          </S.WrapCoreDataSet>
        </PreviewPdfTemplate>
      </BaseModal>

      <BaseModal
        open={isOpenExport}
        footer={null}
        onCancel={() => setIsOpenExport(false)}
        destroyOnClose
        width={400}
        closeIcon={null}
        rounded="md"
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <ExportFile
          fileNamePrefix="코어 데이터셋"
          onCancel={() => setIsOpenExport(false)}
          onExport={(v) => {
            setIsOpenExport(false);
            if (v.fileType === 'pdf') {
              return setIsOpenPreviewPdf(true);
            }

            return onExportSheet(v);
          }}
        />
      </BaseModal>

      <BaseModal
        open={isOpenConfig}
        centered
        onCancel={() => setIsOpenConfig(false)}
        footer={null}
        closeIcon={null}
        rounded="md"
        destroyOnClose
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <RankingModal
          weightRangeSaved={defaultWeightRange}
          significantLevelRangeSaved={defaultLevelRange}
          onChangeConfigWeight={onChangeConfigWeight}
          onCancel={() => setIsOpenConfig(false)}
          loading={loadingUpdateMetric}
        />
      </BaseModal>

      <BaseModal
        open={isOpenDiagnosis}
        centered
        onCancel={() => setIsOpenDiagnosis(false)}
        footer={null}
        width={384}
        closeIcon={null}
        rounded="md"
        destroyOnClose
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <DiagnosisModal
          pValueSaved={coreDataSetConfig?.pValue ?? DEFAULT_CORE_DATASET_CONFIG.pValue}
          setPValueSaved={onChangePValue}
          onCancel={() => setIsOpenDiagnosis(false)}
          loading={loadingUpdateMetric}
        />
      </BaseModal>

      <BaseModal
        open={isOpenAlphaSetting}
        centered
        onCancel={() => setIsOpenAlphaSetting(false)}
        footer={null}
        width={384}
        closeIcon={null}
        rounded="md"
        destroyOnClose
        styles={{
          content: {
            padding: '1rem',
          },
        }}
      >
        <AlphaModal
          alphaValueSaved={coreDataSetConfig?.alpha ?? DEFAULT_CORE_DATASET_CONFIG.alpha}
          setAlphaValueSaved={onChangeAlpha}
          onCancel={() => setIsOpenAlphaSetting(false)}
          loading={loadingUpdateMetric}
        />
      </BaseModal>
    </>
  );
};
