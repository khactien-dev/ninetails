import ExportIcon from '@/assets/images/chart/export-setting.svg';
import ScreenshotIcon from '@/assets/images/chart/screenshot-setting.svg';
import TrashIcon from '@/assets/images/chart/trash-setting.svg';
import BorderedTrashIcon from '@/assets/images/chart/trash.svg';
import { BaseModal } from '@/components/common/base-modal/BaseModal';
import { usePermissions } from '@/hooks/usePermissions';
import { IWidgetDataset, IWidgetDatasetCollect } from '@/interfaces';
import { copyImageToClipboard } from '@/utils';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';
import React from 'react';

import Collapse from '../collapse';
import { useAnalysisContext } from '../context';
import { ExportFile } from '../export-file';
import { PreviewPdfTemplate } from '../preview-pdf-template';
import * as S from './index.style';
import * as SWidgetDataset from './index.style';
import { WidgetCustomTreeTable } from './tree-table';

interface IProps {
  onDeleteSection: () => void;
}

export const WidgetDataset: React.FC<IProps> = ({ onDeleteSection }) => {
  const {
    modeMapping,
    widgetDatas,
    paramsUseWidgetDataset,
    getShortString,
    handleModeChange,
    isOpenPreviewPdf,
    setIsOpenPreviewPdf,
    handleDownload,
  } = useAnalysisContext();
  const unit = paramsUseWidgetDataset?.statisticMode === 'otherDistance' ? ' km' : '분';
  const [isOpenExport, setIsOpenExport] = useState(false);
  const permissions = usePermissions();
  const getColumnTitle = () => {
    switch (paramsUseWidgetDataset?.statisticMode) {
      case 'otherDistance':
        return '기타 거리';
      case 'otherDuration':
        return '기타 시간';
      default:
        return '수거 시간';
    }
  };
  const [widgetPresentData, setWidgetPresentData] =
    useState<Array<IWidgetDataset | IWidgetDatasetCollect>>(widgetDatas);

  const getParsedNumber = (number: string) => {
    return paramsUseWidgetDataset?.statisticMode === 'collectDistance' ||
      paramsUseWidgetDataset?.statisticMode === 'collectCount'
      ? number
      : parseFloat((Number(number) / 60).toFixed(3));
  };

  useEffect(() => {
    setWidgetPresentData(widgetDatas);
  }, [widgetDatas]);

  const columnsWidgetOther: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record: IWidgetDataset) => {
        return (
          <SWidgetDataset.BoxIconDelete
            onClick={() =>
              setWidgetPresentData((prev) =>
                prev.filter((el: any) => el.routeName !== record?.routeName)
              )
            }
          >
            <BorderedTrashIcon />
          </SWidgetDataset.BoxIconDelete>
        );
      },
    },
    {
      title: '배차지역',
      sorter: false,
      dataIndex: 'routeName',
      key: 'routeName',
      render: (v: any, record: IWidgetDataset) => {
        return (
          <SWidgetDataset.ColInfo>
            <SWidgetDataset.InfoText>{record.routeName}</SWidgetDataset.InfoText>
          </SWidgetDataset.ColInfo>
        );
      },
    },
    {
      title: () => <SWidgetDataset.WrapTitle>{getColumnTitle()}</SWidgetDataset.WrapTitle>,
      key: 'other_times',
      dataIndex: 'other_times',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.totalOfAllSum,
            average: record.totalOfAllAverage,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoReload>
            <SWidgetDataset.Reload onClick={() => handleModeChange(record.routeName)}>
              <SWidgetDataset.TextButton>
                {modeMapping[record.routeName as keyof typeof modeMapping] === 'average'
                  ? '합계'
                  : '평균'}
              </SWidgetDataset.TextButton>
              <SWidgetDataset.ReloadIconStyled
                fill={record.routeName === '전체' ? '#57ba00' : '#ff2f91'}
              />
            </SWidgetDataset.Reload>
            <SWidgetDataset.BoldRating>
              {parsedNumber} {unit}
            </SWidgetDataset.BoldRating>
          </SWidgetDataset.InfoReload>
        );
      },
    },
    {
      title: '기타 운행',
      dataIndex: 'otherNotSelected_sum',
      key: 'otherNotSelected_sum',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.otherNotSelected_sum,
            average: record.otherNotSelected_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.ColInfo>
            <SWidgetDataset.InfoText>
              {parsedNumber} {unit}
            </SWidgetDataset.InfoText>
          </SWidgetDataset.ColInfo>
        );
      },
    },
    {
      title: '수거지로 이동',
      dataIndex: 'goingToCollectionArea_sum',
      key: 'goingToCollectionArea_sum',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.goingToCollectionArea_sum,
            average: record.goingToCollectionArea_average,
          },
          record.routeName
        );
        const parsedNunber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNunber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
    {
      title: '매립지로 이동',
      dataIndex: 'goingToTheLandfill_sum',
      key: 'goingToTheLandfill_sum',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.goingToTheLandfill_sum,
            average: record.goingToTheLandfill_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
    {
      title: '차고지로 복귀',
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.returnToGarage_sum,
            average: record.returnToGarage_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },

    {
      title: '식당으로 이동',
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.goingToRestaurant_sum,
            average: record.goingToRestaurant_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
    {
      title: '대기 (공회전)',
      dataIndex: 'idling_sum',
      key: 'idling_sum',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.idling_sum,
            average: record.idling_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
    {
      title: '미관제',
      dataIndex: 'notManaged_sum',
      key: 'notManaged_sum',
      sorter: false,
      render: (v: any, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.notManaged_sum,
            average: record.notManaged_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
    {
      title: '운행종료 (휴식)',
      dataIndex: 'outOfControl_sum',
      key: 'outOfControl_sum',
      sorter: false,
      render: (_, record: IWidgetDataset) => {
        const number = getShortString(
          {
            sum: record.outOfControl_sum,
            average: record.outOfControl_average,
          },
          record.routeName
        );
        const parsedNumber = getParsedNumber(number);

        return (
          <SWidgetDataset.InfoText>
            {parsedNumber} {unit}
          </SWidgetDataset.InfoText>
        );
      },
    },
  ];

  const renderContent = () => {
    if (
      paramsUseWidgetDataset?.statisticMode === 'otherDistance' ||
      paramsUseWidgetDataset?.statisticMode === 'otherDuration'
    ) {
      return (
        <S.TableContainer>
          <S.Table columns={columnsWidgetOther} dataSource={widgetPresentData} />
        </S.TableContainer>
      );
    } else if (paramsUseWidgetDataset?.statisticMode) {
      return (
        <S.CoreDataSetContainer>
          <WidgetCustomTreeTable />
        </S.CoreDataSetContainer>
      );
    }
    return null;
  };

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const settingButtons = [
    {
      icon: <ExportIcon />,
      title: '저장하기',
      isActive: permissions?.exportAble,
      onClick: permissions?.exportAble ? () => setIsOpenExport(true) : undefined,
      disabled: !permissions?.exportAble,
    },
    {
      icon: <ScreenshotIcon />,
      title: '스크린샷',
      onClick: () => copyImageToClipboard(pdfRef.current),
    },
    {
      icon: <TrashIcon />,
      isActive: permissions?.deleteAble,
      title: '모두 삭제',
      onClick: () => onDeleteSection(),
      disabled: !permissions?.deleteAble,
    },
  ];

  return (
    <S.Container>
      <Collapse
        type="detail"
        defaultCollapsed={true}
        title="위젯 데이터셋"
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
        <S.WidgetDataSetContainer className="widget-dataset-container" ref={pdfRef}>
          {renderContent()}
        </S.WidgetDataSetContainer>
      </Collapse>
      <BaseModal
        width={1380}
        footer={null}
        open={isOpenPreviewPdf}
        onCancel={() => setIsOpenPreviewPdf(false)}
        destroyOnClose
        styles={{
          body: {
            overflowX: 'auto',
            height: 600,
          },
        }}
      >
        <PreviewPdfTemplate subTitle="운행 분석" fileNamePrefix={`위젯 데이터셋`}>
          <S.WrapCoreDataSet>
            <S.WidgetDataSetContainer className="widget-dataset-container">
              {renderContent()}
            </S.WidgetDataSetContainer>
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
          onExport={(v) => {
            setIsOpenExport(false);
            if (v.fileType === 'pdf') {
              return setIsOpenPreviewPdf(true);
            }
            return handleDownload(v);
          }}
          onCancel={() => setIsOpenExport(false)}
        />
      </BaseModal>
    </S.Container>
  );
};
