import Dropdown from '@/assets/images/svg/icon-dropdown-2.svg';
import IconSearch from '@/assets/images/svg/icon-search-2.svg';
import { BaseForm } from '@/components/common/forms/base-form';
import { BaseSelect } from '@/components/common/selects/base-select';
import CollectionTab from '@/components/illegal-status/collection-tab';
import { MapContainer } from '@/components/map/index.style';
import BaseNaverMap from '@/components/map/naver-map';
import { DATE_FORMAT } from '@/constants';
import { ClassificationCount } from '@/interfaces';
import * as Layout from '@/layouts/admin-layout/index.styles';
import dayjs from 'dayjs';
import React from 'react';

import Calendar from './calendar';
import * as S from './index.style';
import useControlStatus, { DATE_FILTER } from './index.utils';
import TimeConfig from './time-config';

const IllegalStatus = () => {
  const {
    map,
    routeOptions,
    timeOptions,
    markers,
    params,
    isLoading,
    setMap,
    view,
    illegalData,
    dateType,
    collectTime,
    caseData,
    areaPolygons,
    onClearAreaPolygons,
    setView,
    onChangeParams,
    onTimeChange,
    onSubmitChange,
    refetch,
    onChangeRoute,
    setDateType,
  } = useControlStatus();

  const viewData = illegalData?.count?.[view as keyof typeof illegalData.count];

  return (
    <Layout.Wrapper>
      <S.CustomLeftContent hasCollapseBtn fixedContent width={420}>
        <S.IllegalLeft>
          <S.FormFilter>
            <BaseForm.Item name="vehicle_number">
              <BaseSelect
                defaultValue={null}
                options={routeOptions}
                suffixIcon={<Dropdown />}
                onChange={(value: unknown) => onChangeRoute(value as string)}
              />
            </BaseForm.Item>

            <BaseForm.Item name="calendar">
              <Calendar params={params} onTimeChange={onTimeChange} />
            </BaseForm.Item>
            <S.GroupButton>
              {/* <S.TabsFilter defaultActiveKey="1" items={tabsFilter} onChange={onChangeFilter} /> */}
              <S.Button
                $actived={dateType == DATE_FILTER.DAY}
                onClick={() => {
                  setDateType(DATE_FILTER.DAY);
                  onChangeParams({
                    start_date: dayjs().format(DATE_FORMAT.R_BASIC),
                    end_date: dayjs().format(DATE_FORMAT.R_BASIC),
                  });
                }}
              >
                1일
              </S.Button>
              <S.Button
                $actived={dateType == DATE_FILTER.WEEK}
                onClick={() => {
                  setDateType(DATE_FILTER.WEEK);
                  onChangeParams({
                    start_date: dayjs().subtract(6, 'day').format(DATE_FORMAT.R_BASIC),
                    end_date: dayjs().format(DATE_FORMAT.R_BASIC),
                  });
                }}
              >
                1주일
              </S.Button>
              <S.Button
                $actived={dateType == DATE_FILTER.MONTH}
                onClick={() => {
                  setDateType(DATE_FILTER.MONTH);
                  onChangeParams({
                    start_date: dayjs().subtract(29, 'day').format(DATE_FORMAT.R_BASIC),
                    end_date: dayjs().format(DATE_FORMAT.R_BASIC),
                  });
                }}
              >
                1개월
              </S.Button>
              <S.Search onClick={onSubmitChange}>
                <IconSearch />
                검색
              </S.Search>
            </S.GroupButton>
          </S.FormFilter>

          <S.CollectTime>
            <S.CollectTimeTitle>생성 → 수거 소요시간</S.CollectTimeTitle>
            <S.CollectTimeContent>
              {collectTime?.map((item: any, index: number) => (
                <S.CollectTimeContentItem key={index}>
                  <S.CollectTimeContentItemTitle>{item.title}</S.CollectTimeContentItemTitle>
                  <S.CollectTimeContentItemValue>
                    <span>
                      {
                        illegalData?.aggregate_hour[
                          item.value as keyof typeof illegalData.aggregate_hour
                        ]
                      }
                    </span>
                    시간
                  </S.CollectTimeContentItemValue>
                </S.CollectTimeContentItem>
              ))}
            </S.CollectTimeContent>
          </S.CollectTime>

          <CollectionTab illegalData={illegalData} view={view} setView={setView} />

          <S.Case>
            {caseData?.map((item: any, index: number) => (
              <S.CaseItem key={index}>
                <S.CaseItemStt>{item.id}</S.CaseItemStt>
                <S.CaseItemTitle>{item.title}</S.CaseItemTitle>
                <S.CaseItemValue>
                  <span>
                    {viewData?.classifications?.find(
                      (cla: ClassificationCount) => cla.key === item.id
                    )?.count ?? 0}
                  </span>{' '}
                  건
                </S.CaseItemValue>
              </S.CaseItem>
            ))}
          </S.Case>
        </S.IllegalLeft>
      </S.CustomLeftContent>

      <MapContainer>
        <TimeConfig
          timeOptions={timeOptions}
          onChangeParams={onChangeParams}
          params={params}
          lastUpdated={illegalData?.last_updated}
          isLoading={isLoading}
          refetch={refetch}
        />
        <BaseNaverMap
          initMarkers={markers}
          areaPolygons={areaPolygons}
          onCenterChanged={onClearAreaPolygons}
          map={map}
          setMap={setMap}
        />
      </MapContainer>
    </Layout.Wrapper>
  );
};
export default IllegalStatus;
