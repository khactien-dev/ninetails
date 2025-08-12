import IconAlarm from '@/assets/images/svg/icon-alarm.svg';
import IconReload from '@/assets/images/svg/icon-reload.svg';
import IconTime from '@/assets/images/svg/icon-time.svg';
import ProgressBar from '@/components/dashboard/progress-bar';
import LeftContent from '@/layouts/admin-layout/content/left-content';
import { MainFooter } from '@/layouts/admin-layout/footer';
import React from 'react';

import { BaseSelect } from '../common/selects/base-select';
import * as S from './index.styles';
import useDashboard, { ANALYSIS_TIME, ANALYSIS_TIME_KEY, DataCardListItem } from './index.utils';
import ViewConfigs from './view-configs';

const Dashboard: React.FC = () => {
  const {
    loading,
    params,
    cardList,
    tabs,
    tab,
    radios,
    checkboxs,
    dashboardData,
    view,
    userOperationInfo,
    getDatetitle,
    refetch,
    setView,
    handleChangeParams,
    handleChangeTime,
    onChangeTab,
    logoUrl,
  } = useDashboard();

  return (
    <S.TablesWrapper>
      <S.PopoverGlobal />
      <LeftContent width={301}>
        <S.Wrapper>
          <S.LogoWrapper>
            {loading ? <S.LogoLoading active={true} /> : <S.Logo src={logoUrl} />}
          </S.LogoWrapper>
          <S.Location>{userOperationInfo?.organization}</S.Location>
          <S.Info>
            <div>
              <span className={'label'}>수거구</span>
              <span className={'data'}>
                {dashboardData?.totalAnalysisData?.numberOfRouterNow || 0} 개
              </span>
            </div>
            <div>
              <span className={'label'}>등록차량</span>
              <span className={'data'}>
                {dashboardData?.totalAnalysisData?.numberOfRegisterVehicleNow || 0} 대
              </span>
            </div>
            <div>
              <span className={'label'}>배차인원</span>
              <span className={'data'}>
                {dashboardData?.totalAnalysisData?.numberOfStaffNow || 0} 명
              </span>
            </div>
          </S.Info>
        </S.Wrapper>
      </LeftContent>

      <S.WrapHeader>
        <S.Header className={'top'}>
          <div
            style={{
              width: 'fit-content',
              overflowX: 'hidden',
              overflowY: 'hidden',
              minWidth: '350px',
            }}
          >
            <S.WrapTabs
              defaultActiveKey={tab}
              activeKey={tab}
              items={tabs}
              onChange={onChangeTab}
              animated={false}
            />
          </div>

          <S.AnalysisPeriod>
            <IconAlarm />
            분석기간:{' '}
            {ANALYSIS_TIME_KEY[params.analysisTime as keyof typeof ANALYSIS_TIME_KEY] ||
              ANALYSIS_TIME_KEY[ANALYSIS_TIME.TODAY_YESTERDAY]}
          </S.AnalysisPeriod>

          <S.LastUpdate>
            <IconTime />
            Last Updated: {dashboardData?.lastUpdate}
          </S.LastUpdate>

          <S.Form>
            <BaseSelect
              value={params.updateTime}
              onChange={(value) => handleChangeParams({ updateTime: value as number })}
              options={[
                { value: 5000, label: '5초' },
                { value: 10000, label: '10초' },
                { value: 30000, label: '30초' },
                { value: 60000, label: '1분' },
              ]}
            />
          </S.Form>

          <S.Reload onClick={refetch}>
            <IconReload />
          </S.Reload>

          <ViewConfigs
            handleChangeTime={handleChangeTime}
            radios={radios}
            checkboxs={checkboxs}
            analysisTime={params.analysisTime}
            view={view}
            setView={setView}
          />
        </S.Header>

        <S.WrapContent>
          {cardList?.map((item: DataCardListItem) => (
            <S.Card key={item?.key} title={item?.title}>
              <S.Div className={'sub-title'}>{item?.desc}</S.Div>
              <S.Div className={'content'}>
                {item?.type === 'percent' ? (
                  <S.FlexCenter>
                    <ProgressBar
                      value_progress={dashboardData?.analysisData?.[item.key]?.dataNow || 0}
                      unit={item?.unit}
                    />
                    {/* <S.Progress type="circle" percent={item?.yesterday?.value} /> */}
                  </S.FlexCenter>
                ) : (
                  <S.Div className={'content-center'}>
                    <S.Div className={'label'}>
                      {getDatetitle.current}{' '}
                      {dashboardData?.totalAnalysisData?.now?.totalActiveVehicle || 0}/
                      {dashboardData?.totalAnalysisData?.now?.numberOfRegisterVehicle || 0}
                    </S.Div>
                    <S.Div className={'data date'}>
                      {dashboardData?.analysisData?.[item.key]?.dataNow
                        ? `${dashboardData?.analysisData?.[item.key]?.dataNow}${item?.unit}`
                        : '--'}
                    </S.Div>

                    {!loading &&
                      dashboardData?.analysisData?.[item.key]?.dataNow != 0 &&
                      dashboardData?.analysisData?.[item.key]?.dataOld != 0 && (
                        <S.Div className="gap">
                          {dashboardData?.analysisData?.[item.key]?.gap}
                          {item?.unit}
                        </S.Div>
                      )}
                  </S.Div>
                )}
                <S.Div className={'content-bottom'}>
                  <S.Div className={'label'}>{getDatetitle.previous}</S.Div>
                  <S.Div className={'data'}>
                    {dashboardData?.analysisData?.[item.key]?.dataOld
                      ? `${dashboardData?.analysisData?.[item.key]?.dataOld}${item?.unit}`
                      : '--'}
                  </S.Div>
                </S.Div>
              </S.Div>
            </S.Card>
          ))}
        </S.WrapContent>

        <MainFooter isShow={true}></MainFooter>
      </S.WrapHeader>
    </S.TablesWrapper>
  );
};

export default Dashboard;
