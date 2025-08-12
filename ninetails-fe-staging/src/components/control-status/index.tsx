import { MapContainer } from '@/components/map/index.style';
import BaseNaverMap from '@/components/map/naver-map';
import * as Layout from '@/layouts/admin-layout/index.styles';
import React from 'react';

import Collapse from './collapse';
import ExportLayout from './export-layout';
import * as S from './index.style';
import useControlStatus from './index.utils';
import TimeConfig from './time-config';
import VehicleDetail from './vehicle-detail';
import ZScore from './z-score';

const ControlStatus = () => {
  const {
    map,
    timeOptions,
    isVisibleCondition,
    allStatus,
    areaOptions,
    statistics,
    zScore,
    markers,
    polygons,
    areaPolygons,
    metricInfo,
    metricData,
    params,
    lastUpdated,
    isLoading,
    isError,
    setMap,
    contentRef,
    isSingleVehicle,
    preview,
    detailModal,
    weightRatio,
    onClearAreaPolygons,
    setDetailModal,
    setPreview,
    onScreenExport,
    onToggleAllRoute,
    toggleCondition,
    onChangeParams,
    getCurrentAreaLocation,
  } = useControlStatus();

  return (
    <Layout.Wrapper>
      <S.CustomLeftContent
        hasCollapseBtn
        fixedContent
        width={400}
        extraContent={
          !!detailModal && (
            <VehicleDetail
              setDetailModal={setDetailModal}
              params={params}
              isError={isError}
              isLoading={isLoading}
              metricData={metricData}
            />
          )
        }
      >
        <S.ControlStatusLeft id="control-status-left">
          <S.Condition>
            <S.Title onClick={toggleCondition} open={isVisibleCondition}>
              운행모드
            </S.Title>
            <S.Content open={isVisibleCondition}>
              <S.Collapse items={allStatus} expandIconPosition="end" />
            </S.Content>
          </S.Condition>

          <ZScore
            zScore={zScore}
            weightRatio={weightRatio}
            routeName={params.routeName}
            areaOptions={areaOptions}
            onChangeParams={onChangeParams}
            date={params.date || null}
            isSingleVehicle={isSingleVehicle}
          />

          <Collapse
            defaultCollased
            title={'배차운행'}
            hasTooltip
            tooltip={'이전 10일간의 운행 뎅터를 기준으로 예측한 당일 경로지수가중평균(EWA)을 적용'}
            extraTitle={<S.EcoTitleValue>{metricInfo?.eco_score ?? '--'}점</S.EcoTitleValue>}
          >
            <S.StatusDetail>
              {statistics?.map((item: any, index: number) => (
                <S.StatusDetailItem key={index}>
                  <S.StatusDetailItemTitle>{item.title}</S.StatusDetailItemTitle>
                  <S.StatusDetailItemValue>{item.value}</S.StatusDetailItemValue>
                </S.StatusDetailItem>
              ))}
            </S.StatusDetail>
          </Collapse>
        </S.ControlStatusLeft>
      </S.CustomLeftContent>
      <MapContainer>
        <TimeConfig
          timeOptions={timeOptions}
          onChangeParams={onChangeParams}
          params={params}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />
        <BaseNaverMap
          initMarkers={markers}
          polygons={polygons}
          areaPolygons={areaPolygons}
          onCenterChanged={onClearAreaPolygons}
          map={map}
          setMap={setMap}
          // config={{
          //   center: {
          //     lat: 37.5665,
          //     lng: 126.978,
          //   },
          //   zoom: 14,
          // }}
          hasAllRouteChange={isSingleVehicle}
          hasCurrentLocation={isSingleVehicle}
          activedAllRoute={params.allRoute}
          onToggleAllRoute={onToggleAllRoute}
          onScreenExport={() => setPreview(true)}
          getCurrentLocation={getCurrentAreaLocation}
        />
      </MapContainer>
      {preview && (
        <S.ExportModal
          open={preview}
          closable={false}
          width={733}
          okText="다운로드"
          onOk={async () => {
            await onScreenExport();
            setTimeout(() => {
              setPreview(false);
            }, 1000);
          }}
          onCancel={() => setPreview(false)}
          okButtonProps={{ size: 'small' }}
          cancelButtonProps={{ size: 'small' }}
        >
          <ExportLayout
            weightRatio={weightRatio}
            toggleCondition={toggleCondition}
            isVisibleCondition={isVisibleCondition}
            allStatus={allStatus ?? []}
            lastUpdated={params.date as string | null}
            routeName={params.routeName}
            areaOptions={areaOptions}
            onChangeSelect={onChangeParams}
            markers={markers}
            polygons={polygons}
            areaPolygons={areaPolygons}
            map={map}
            setMap={setMap}
            isSingleVehicle={isSingleVehicle}
            params={params}
            onToggleAllRoute={onToggleAllRoute}
            timeOptions={timeOptions}
            onChangeParams={onChangeParams}
            isLoading={isLoading}
            contentRef={contentRef}
            zScore={zScore}
            metricInfo={metricInfo}
            statistics={statistics}
            metricData={metricData}
          />
        </S.ExportModal>
      )}
    </Layout.Wrapper>
  );
};
export default React.memo(ControlStatus);
