import { BaseModal } from '@/components/common/base-modal/BaseModal';
import React, { useState } from 'react';

import Collapse from '../collapse';
import { CustomTreeTable } from '../core-data-set/tree-table';
import { ExportFile } from '../export-file';
import { PreviewPdfTemplate } from '../preview-pdf-template';
import { CONDITION, ModuleDataSetCondition } from './condition';
import { ConditionsPreview } from './condition/conditions-preview';
import * as S from './index.style';
import { ICondition, useModuleDataSet } from './index.utils';

interface IProps {
  onDeleteSection: () => void;
}

export const ModuleDataSet: React.FC<IProps> = ({ onDeleteSection }) => {
  const {
    checkboxValues,
    checkboxs,
    isOpenExport,
    previewRoute,
    isOpenPreviewPdf,
    treeData,
    getModuleDataSetPending,
    settingButtons,
    coreDataSetConfig,
    onExportSheet,
    onChangeChecbox,
    onRun,
    setIsOpenPreviewPdf,
    setIsOpenExport,
  } = useModuleDataSet({ onDeleteSection });

  const [conditions, setConditions] = useState<ICondition[]>([
    {
      type: CONDITION.CORE_DATASET,
      condition_value: 'Core Dataset',
      key: Math.random().toString(36).slice(-36),
    },
  ]);

  return (
    <Collapse
      type="detail"
      title="모듈 데이터셋"
      settingContent={
        <>
          {settingButtons.map((item, index) => (
            <React.Fragment key={index}>
              <S.SettingButton onClick={item.onClick} $disabled={item?.disabled}>
                {item.icon}
                {item.title}
              </S.SettingButton>
              {index + 1 !== settingButtons?.length && <S.SettingDivider />}
            </React.Fragment>
          ))}
        </>
      }
    >
      <S.ModuleDataSetContainer id="module-data-set-container">
        <S.WrapCheckBox>
          {checkboxs.map((item, index) => (
            <S.CheckBox
              key={index}
              checked={(checkboxValues as any)[item.name]}
              onChange={onChangeChecbox}
              name={item.name}
            >
              {item.label}
            </S.CheckBox>
          ))}
        </S.WrapCheckBox>
        <ModuleDataSetCondition
          fields={checkboxValues}
          onRun={onRun}
          getModuleDataSetPending={getModuleDataSetPending}
          setConditions={setConditions}
          conditions={conditions}
        />
        {!!treeData?.length && <CustomTreeTable dataSource={treeData} config={coreDataSetConfig} />}
        {treeData && treeData?.length === 0 && <S.Empty />}
      </S.ModuleDataSetContainer>

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
            <S.WrapMarginTop>
              <S.WrapCheckBox>
                {checkboxs.map((item, index) => (
                  <S.CheckBox
                    key={index}
                    checked={(checkboxValues as any)[item.name]}
                    onChange={onChangeChecbox}
                    name={item.name}
                  >
                    {item.label}
                  </S.CheckBox>
                ))}
              </S.WrapCheckBox>
            </S.WrapMarginTop>

            <S.WrapMarginTop>
              <ConditionsPreview conditions={conditions} />
            </S.WrapMarginTop>
            <S.WrapMarginTop>
              <CustomTreeTable dataSource={previewRoute ?? []} config={null} isPreview={true} />
            </S.WrapMarginTop>
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
          fileNamePrefix="모듈 데이터셋"
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
    </Collapse>
  );
};
