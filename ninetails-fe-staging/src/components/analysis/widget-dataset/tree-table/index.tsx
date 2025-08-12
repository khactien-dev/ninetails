import TrashIcon from '@/assets/images/chart/trash.svg';
import IconNext from '@/assets/images/svg/icon-open_a1.svg';
import { IWidgetDataset, IWidgetDatasetCollect } from '@/interfaces';
import { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';

import { useAnalysisContext } from '../../context';
import * as SWidgetDataset from '../tree-table/index.style';
import * as S from './index.style';

export const WidgetCustomTreeTable = () => {
  const { modeMapping, setModeMappings, widgetDatas, paramsUseWidgetDataset } =
    useAnalysisContext();
  const [widgetPresentData, setWidgetPresentData] =
    useState<Array<IWidgetDataset | IWidgetDatasetCollect>>(widgetDatas);

  const LIMIT = 7;
  const unit =
    paramsUseWidgetDataset?.statisticMode === 'collectDistance'
      ? 'km'
      : paramsUseWidgetDataset?.statisticMode === 'collectCount'
      ? '개'
      : '분';
  const getColumnTitle = () => {
    switch (paramsUseWidgetDataset?.statisticMode) {
      case 'collectDistance':
        return '수거 거리';
      case 'collectDuration':
        return '수거 시간';
      case 'collectCount':
        return '수거량';
      default:
        return '수거 시간';
    }
  };

  useEffect(() => {
    setWidgetPresentData(widgetDatas);
  }, [widgetDatas]);

  const getShortString = (value: any, routeName: string): string => {
    const isTotal = modeMapping[routeName] !== 'average';
    if (typeof value === 'object' && value !== null) {
      const selectedValue = isTotal ? value.sum : value.average;
      return typeof selectedValue === 'number'
        ? parseFloat(selectedValue.toFixed(3)).toString()
        : selectedValue;
    }
    if (typeof value === 'number') {
      return parseFloat(value.toFixed(3)).toString();
    }
    return value;
  };

  const handleModeChange = useCallback((routeName: string) => {
    setModeMappings((prev) => ({
      ...prev,
      [routeName]: prev[routeName] === 'average' ? 'total' : 'average',
    }));
  }, []);

  const fixedColumns: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'actions',
      render: (_, record: IWidgetDatasetCollect) => {
        return (
          <SWidgetDataset.BoxIconDelete
            onClick={() =>
              setWidgetPresentData((prev) =>
                prev.filter((item: any) => item?.route_name !== record?.route_name)
              )
            }
          >
            <TrashIcon />
          </SWidgetDataset.BoxIconDelete>
        );
      },
    },
    {
      title: '배차지역',
      dataIndex: 'route_name',
      key: 'route_name',
      render: (v: any, record: IWidgetDatasetCollect) => {
        return (
          <SWidgetDataset.ColInfo>
            <SWidgetDataset.InfoText>{record.route_name}</SWidgetDataset.InfoText>
          </SWidgetDataset.ColInfo>
        );
      },
      width: 150,
    },
    {
      title: () => (
        <SWidgetDataset.WrapTableHeader>{getColumnTitle()}</SWidgetDataset.WrapTableHeader>
      ),
      align: 'center',
      render: (v: any, record: IWidgetDatasetCollect) => {
        const number = getShortString(
          {
            sum: record.totalOfAll,
            average: record.totalOfAllAverage,
          },
          record.route_name
        );

        const parsedNumber =
          paramsUseWidgetDataset?.statisticMode === 'collectDistance' ||
          paramsUseWidgetDataset?.statisticMode === 'collectCount'
            ? number
            : parseFloat((Number(number) / 60).toFixed(3));

        return (
          <SWidgetDataset.InfoReload>
            <SWidgetDataset.Reload onClick={() => handleModeChange(record.route_name)}>
              <SWidgetDataset.TextButton>
                {modeMapping[record.route_name] === 'average' ? '합계' : '평균'}
              </SWidgetDataset.TextButton>
              <SWidgetDataset.ReloadIconStyled />
            </SWidgetDataset.Reload>
            <SWidgetDataset.BoldRating>
              {parsedNumber} {unit}
            </SWidgetDataset.BoldRating>
          </SWidgetDataset.InfoReload>
        );
      },
      width: 200,
    },
  ];

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(LIMIT);

  const getColumnsForData = (data: any) => {
    const dataSpecificColumns = [...fixedColumns];
    const dynamicColumns: ColumnsType<any> = [];

    data.sections.forEach((section: any) => {
      if (section.total !== null && section.total !== undefined) {
        dynamicColumns.push({
          title: section.section_name,
          dataIndex: ['sections', section.section_name],
          key: section.section_name,
          align: 'center' as const,
          render: (value: any, record: any) => {
            const sectionData = record.sections.find(
              (s: any) => s.section_name === section.section_name
            );
            const number = getShortString(
              {
                sum: sectionData.total,
                average: sectionData.average,
              },
              record.route_name
            );
            const parsedNumber =
              paramsUseWidgetDataset?.statisticMode === 'collectDistance' ||
              paramsUseWidgetDataset?.statisticMode === 'collectCount'
                ? number
                : parseFloat((Number(number) / 60).toFixed(3));
            return (
              <div>
                {parsedNumber} {unit}
              </div>
            );
          },
        });
      }
    });

    const totalColumns = [
      ...dataSpecificColumns,
      ...dynamicColumns.slice(0, LIMIT - dataSpecificColumns.length),
    ];
    return totalColumns;
  };

  useEffect(() => {
    if (Array.isArray(widgetDatas)) {
      setTotal(widgetDatas.length);
    }
  }, [widgetDatas]);

  const handleNextPage = () => {
    if (total > page * LIMIT) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <>
      {Array.isArray(widgetPresentData)
        ? widgetPresentData
            .slice((page - 1) * LIMIT, page * LIMIT)
            .map((data: any, index: number) => {
              const columns = getColumnsForData(data);
              return (
                <S.TableContainer key={index}>
                  <S.Table
                    columns={columns}
                    dataSource={[data]}
                    pagination={false}
                    bordered={false}
                    size="middle"
                  />
                  <S.Pagination>
                    <S.PreviousButton onClick={handlePrevPage}>
                      <IconNext />
                    </S.PreviousButton>
                    <S.NextButton onClick={handleNextPage}>
                      <IconNext />
                    </S.NextButton>
                  </S.Pagination>
                </S.TableContainer>
              );
            })
        : null}
    </>
  );
};
