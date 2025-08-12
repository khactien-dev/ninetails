import { BaseButton } from '@/components/common/base-button';
import { DATE_FORMAT } from '@/constants';
import { exportToPDF } from '@/utils';
import dayjs from 'dayjs';
import React, { ReactElement, useRef, useState } from 'react';

import Collapse from '../collapse';
import { AmountData } from '../collect-amount-data';
import { useAnalysisContext } from '../context';
import { DrivingRoute } from '../driving-route';
import { Tabs } from '../left-menu/index.styles';
import * as S from './index.styles';

interface IProps {
  children: ReactElement;
  subTitle: string;
  fileNamePrefix: string;
}

export const PreviewPdfTemplate: React.FC<IProps> = ({ children, subTitle, fileNamePrefix }) => {
  const handleChangeKey = (value: string) => {
    isSetActiveKey(value);
  };
  const [setActiveKey, isSetActiveKey] = useState('1');

  const { params } = useAnalysisContext();

  const itemsData = [
    {
      key: '1',
      label: '합계',
    },
    {
      key: '2',
      label: '차량 평균',
    },
  ];

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const filename = `${fileNamePrefix}_${params?.routeName ?? '000-전체차량'}_${dayjs().format(
    'YYYYMMDD'
  )}`;
  return (
    <>
      <S.WrapDownLoadButton>
        <BaseButton onClick={() => exportToPDF(pdfRef.current, filename)} type="primary">
          DownLoad
        </BaseButton>
      </S.WrapDownLoadButton>

      <S.WrapPdfPreview ref={pdfRef}>
        <S.OverLay />
        <S.WrapTitle>운행 분석</S.WrapTitle>
        <S.WrapSubTitle>
          {dayjs(params?.startDate).format(DATE_FORMAT.DATE_KOREA)} ~{' '}
          {dayjs(params?.endDate).format(DATE_FORMAT.DATE_KOREA)}
        </S.WrapSubTitle>
        <S.WrapSubTitle>{subTitle}</S.WrapSubTitle>

        <S.Select value={params?.routeName ?? '000-전체차량'} />

        <S.WrapLeftContent>
          <S.LeftContentItem>
            <DrivingRoute />
          </S.LeftContentItem>
          <S.LeftContentItem>
            <div style={{ marginTop: 53 }}>
              <Collapse typeTitle={'전체'} title={'수거량 통계'}>
                <Tabs activeKey={setActiveKey} onChange={handleChangeKey} items={itemsData} />
                {setActiveKey === '1' ? (
                  <AmountData tab={'total'} />
                ) : (
                  <AmountData tab={'average'} />
                )}
              </Collapse>
            </div>
          </S.LeftContentItem>
        </S.WrapLeftContent>

        {children}
      </S.WrapPdfPreview>
    </>
  );
};
