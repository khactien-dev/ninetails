import QuataBoxActive from '@/assets/images/chart/quatar-box-active.svg';
import QuataBox from '@/assets/images/chart/quatar-box.svg';
import QuestionIcon from '@/assets/images/chart/questionare.svg';
import ErrorIcon from '@/assets/images/svg/notification/error-outline-small.svg';
import SuccessIcon from '@/assets/images/svg/notification/success-small.svg';
import { BaseTooltip } from '@/components/common/base-tooltip';
import { CORE_DATASET_UNIT, ICoreDataSetConfig, ICoreDataTree } from '@/interfaces';
import { ColumnsType } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { omit } from 'lodash';
import { AlignType } from 'rc-table/lib/interface';
import React, { useEffect, useMemo, useState } from 'react';

import * as S from './index.style';

interface ICoreDataItem {
  key: string;
  dispatch_area: string;
  rating: number;
  diagnosis: string;
  average: number;
  layer: number;
  unit: string;
  titleBold: boolean;
  unit_code: CORE_DATASET_UNIT;
  schemaKey: string;
}

const LIMIT = 7;

export const useCustomTreeTable = ({
  dataSource,
  config,
  onSelectRoutes,
  isAbleSelectRoute,
}: {
  dataSource: ICoreDataTree[];
  config: ICoreDataSetConfig | null;
  onSelectRoutes?: (v: string[]) => void;
  isAbleSelectRoute?: boolean;
}) => {
  // widget data set get selected routes here
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const parseDataShowFromOriginal = (v: number, unitCode: CORE_DATASET_UNIT) => {
    const epsilon = 0.000001;
    try {
      switch (unitCode) {
        case CORE_DATASET_UNIT.KILOMETER:
          // original unit is meter
          return parseFloat((v / 1000 + epsilon).toFixed(3));
        case CORE_DATASET_UNIT.MINUTE:
          // original unit is second
          return parseFloat((v / 60 + epsilon).toFixed(3));
        default:
          return parseFloat((v + epsilon).toFixed(3));
      }
    } catch (err) {
      return 'error';
    }
  };

  const hanndleSelectRoutes = (routeName: string) => {
    setSelectedRoutes((prev) => {
      let routes: string[] = [];
      if (prev.includes(routeName)) {
        routes = prev?.filter((item) => item !== routeName);
      } else {
        routes = [...prev, routeName];
      }

      onSelectRoutes && onSelectRoutes(routes);
      return routes;
    });
  };
  // const [clickCount, setClickCount] = useState<number>(0);
  const ratingTooltipTable = useMemo(() => {
    return [
      {
        title: '등급',
        value: null,
      },
      {
        title: 'A',
        value: null,
      },
      {
        title: 'B',
        value: null,
      },
      {
        title: 'C',
        value: null,
      },
      {
        title: 'D',
        value: null,
      },
      {
        title: 'E',
        value: null,
      },
      {
        title: '%',
        value: null,
      },
      {
        title: '최상',
        value: config?.percentageAE,
      },
      {
        title: '상위',
        value: config?.percentageBD,
      },
      {
        title: '중위',
        value: config?.percentageC,
      },
      {
        title: '하위',
        value: config?.percentageBD,
      },
      {
        title: '최하',
        value: config?.percentageAE,
      },
    ];
  }, [config]);

  const fixedColumns: ColumnsType<any> = [
    {
      title: () => <S.BoldText>배차지역</S.BoldText>,
      dataIndex: 'dispatch_area',
      key: 'dispatch_area',
      width: 140,
      render: (value: string, record: ICoreDataItem) => {
        switch (record.layer) {
          case 1:
            return (
              <S.WrapDispatchAreaCell
                onClick={() => {
                  isAbleSelectRoute && hanndleSelectRoutes(record.dispatch_area);
                }}
              >
                <S.WrapQuatarBox>
                  {isAbleSelectRoute && (
                    <>
                      {selectedRoutes?.includes(record?.dispatch_area) ? (
                        <QuataBoxActive />
                      ) : (
                        <QuataBox />
                      )}
                    </>
                  )}
                </S.WrapQuatarBox>
                <S.DispatchAreaCell isBold={record?.titleBold} layer={record.layer}>
                  {value}
                </S.DispatchAreaCell>
                <S.Unit>{record.unit}</S.Unit>
              </S.WrapDispatchAreaCell>
            );
          default:
            return (
              <S.WrapDispatchAreaCellOtherLayer>
                <S.DispatchAreaCell isBold={record?.titleBold} layer={record.layer}>
                  {value}
                </S.DispatchAreaCell>
                <S.Unit>{record.unit}</S.Unit>
              </S.WrapDispatchAreaCellOtherLayer>
            );
        }
      },
    },
    {
      title: () => (
        <S.WrapTableHeader minWith={80}>
          <S.CustomTooltip
            overlayInnerStyle={{
              backgroundColor: 'var(--primary-color)',
              padding: '0.4rem 0rem',
            }}
            content={
              <S.WrapRatingTooltip>
                <S.RatingTooltipTitle>
                  배차 지역의 동선 효율성과 운행 난이도를 평가하 여 부여한 등급. 수거 대비 기타
                  운행의 비중, 수거 거리, 수거 시간, 수거량의 Z점수에 가중치를 적용 하여 합산한
                  결과를 5가지 등급으로 구분
                </S.RatingTooltipTitle>

                <S.Row gutter={[2, 2]}>
                  {ratingTooltipTable.map((item, index) => (
                    <S.Col span={4} key={index}>
                      <S.WrapRatingItems>
                        {item.title}
                        {item.value !== null && <div>{item.value}</div>}
                      </S.WrapRatingItems>
                    </S.Col>
                  ))}
                </S.Row>

                <S.WrapRatingNote>
                  ■<S.RatingNote>[예] B등급: 효율성 및 난이도 차상위 5개 지역</S.RatingNote>
                </S.WrapRatingNote>
                <S.WrapRatingNote>
                  ■<S.RatingNote>§ 표준편차: 배차 지역간 효율성 및 난이도의 차이</S.RatingNote>
                </S.WrapRatingNote>
              </S.WrapRatingTooltip>
            }
          >
            <S.WrapQuestionareIcon className="questionare-icon">
              <QuestionIcon />
            </S.WrapQuestionareIcon>
          </S.CustomTooltip>
          <S.BoldText>등급</S.BoldText>
        </S.WrapTableHeader>
      ),
      dataIndex: 'rating',
      align: 'center',
      render: (value: string, record: ICoreDataItem) => {
        return record?.schemaKey === 'mainData' ? (
          <S.BoldRating>{value ?? '--'}</S.BoldRating>
        ) : (
          value ?? '--'
        );
      },
    },
    {
      title: () => (
        <S.WrapTableHeader minWith={80}>
          <BaseTooltip
            overlayInnerStyle={{
              width: 300,
            }}
            title={() => (
              <>
                <p>배차운행의 평균(EWM) 지표를 T-분석하여, 유의수준</p>
                <p>(P-value)을 벗어난 이상값(anomaly)을 검출합니다.</p>
              </>
            )}
          >
            <S.WrapQuestionareIcon className="questionare-icon">
              <QuestionIcon />
            </S.WrapQuestionareIcon>
          </BaseTooltip>
          <S.BoldText>진단</S.BoldText>
        </S.WrapTableHeader>
      ),
      dataIndex: 'diagnosis',
      align: 'center',
      render: (value: boolean | null) => {
        return (
          <S.WrapDiagnosis>
            {value === null ? '--' : value ? <SuccessIcon /> : <ErrorIcon />}
          </S.WrapDiagnosis>
        );
      },
    },
    {
      title: () => (
        <S.WrapTableHeader minWith={120}>
          <BaseTooltip title="배차 지역별 운행을 종합 평가한 지표이며, 평균 100점 +/- 100점의 표준점수로 표시됩니다. 펼쳤을 때 보이는 하위 지표는 실제 운행의 거리, 시간, 수량 측정값이며, 최근 기록에 더 높은 비중을 반영한 지수가중평균(EWM)입니다.">
            <S.WrapQuestionareIcon className="questionare-icon">
              <QuestionIcon />
            </S.WrapQuestionareIcon>
          </BaseTooltip>
          <S.BoldText>평균</S.BoldText> (EWM)
        </S.WrapTableHeader>
      ),
      dataIndex: 'EWM',
      align: 'center',
      render: (value: number, record: ICoreDataItem) => {
        return (
          <S.WrapCellValue>
            <S.CellValue>
              {value ? parseDataShowFromOriginal(value, record?.unit_code) : '--'}
            </S.CellValue>
          </S.WrapCellValue>
        );
      },
    },
  ];

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(LIMIT);

  const [columnState, setColumState] = useState<ColumnsType<any>>([]);

  const getPage = (): ColumnsType<ICoreDataItem> => {
    const firstRecord = dataSource?.length ? dataSource[0] : null;
    const flexColumns: {
      title: () => React.ReactElement | string;
      dataIndex: string;
      align: AlignType;
      render: (v: number, record: ICoreDataItem) => string | React.ReactElement | number;
    }[] = [];
    if (firstRecord) {
      const removed = omit(firstRecord, [
        'key',
        'dispatch_area',
        'rating',
        'diagnosis',
        'average',
        'layer',
        'unit',
        'titleBold',
        'parent',
        'children',
        'EWM',
        'schemaKey',
        'sectionName',
        'unit_code',
      ]);

      // reverse the days data
      const dataKeys = Object.keys(removed).reverse();
      setTotal(dataKeys.length);

      dataKeys.forEach((item, index) => {
        if (index >= (page - 1) * LIMIT && index + 1 <= page * LIMIT) {
          const diffDays = dayjs().diff(dayjs(item), 'day');
          flexColumns.push({
            title: () => (
              <BaseTooltip title={item}>{diffDays === 0 ? `오늘` : `${diffDays}일 전`}</BaseTooltip>
            ),
            dataIndex: item,
            align: 'center' as AlignType,
            render: (value, record) => (
              <S.WrapCellValue>
                <S.CellValue>
                  {value ? parseDataShowFromOriginal(value, record?.unit_code) : '--'}
                </S.CellValue>
              </S.WrapCellValue>
            ),
          });
        }
      });
    }
    return flexColumns;
  };

  useEffect(() => {
    const flexColumns: ColumnsType<ICoreDataItem> = getPage();
    setColumState([...fixedColumns, ...flexColumns]);
  }, [page, dataSource, selectedRoutes, config]);

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

  return {
    columnState,
    handlePrevPage,
    handleNextPage,
    canNext: total > page * LIMIT,
    canPrev: page > 1,
  };
};
